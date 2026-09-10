use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::BTreeMap;
use std::fs::{self, File, OpenOptions};
use std::io::{self, Read, Write};
use std::path::{Path, PathBuf};

const PREFIX: &[u8] = b"MODLOCK SYNTHETIC\n";
const MAX_FILES: usize = 32;
const MAX_FILE_BYTES: u64 = 64 * 1024;
const MAX_TREE_BYTES: u64 = 1024 * 1024;
const MAX_RECORD_BYTES: u64 = 16 * 1024;
const FORMAT: &str = "modlock-single-use-synthetic-v1";

/// Errors deliberately omit local paths and file contents.
#[derive(Debug)]
pub enum Error {
    Io(io::ErrorKind),
    Busy,
    InvalidInput,
    UnsafePath,
    InvalidRecord,
    Drift,
    AlreadyUsed,
    Cancelled,
    CommittedAfterError(Box<Error>),
    RecoveryRequired {
        activation: Box<Error>,
        recovery: Box<Error>,
    },
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "synthetic transaction: {self:?}")
    }
}

impl std::error::Error for Error {}

impl From<io::Error> for Error {
    fn from(value: io::Error) -> Self {
        Self::Io(value.kind())
    }
}

type Result<T> = std::result::Result<T, Error>;

/// Only flat, portable `.txt` names and explicitly marked synthetic ASCII text.
#[derive(Debug)]
pub struct Generation(BTreeMap<String, Vec<u8>>);

impl Generation {
    pub fn new(files: BTreeMap<String, Vec<u8>>) -> Result<Self> {
        let mut total = 0_u64;
        if files.is_empty() || files.len() > MAX_FILES {
            return Err(Error::InvalidInput);
        }
        for (name, bytes) in &files {
            if !safe_name(name)
                || bytes.len() as u64 > MAX_FILE_BYTES
                || !bytes.starts_with(PREFIX)
                || !bytes
                    .iter()
                    .all(|b| b.is_ascii_graphic() || matches!(b, b' ' | b'\n' | b'\t'))
            {
                return Err(Error::InvalidInput);
            }
            total += bytes.len() as u64;
        }
        if total > MAX_TREE_BYTES {
            return Err(Error::InvalidInput);
        }
        Ok(Self(files))
    }

    fn inventory(&self) -> Inventory {
        self.0
            .iter()
            .map(|(name, bytes)| Entry {
                name: name.clone(),
                bytes: bytes.len() as u64,
                sha256: digest(bytes),
            })
            .collect()
    }
}

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[serde(deny_unknown_fields)]
struct Entry {
    name: String,
    bytes: u64,
    sha256: String,
}

type Inventory = Vec<Entry>;

#[derive(Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
struct Seed {
    format: String,
    initial: Inventory,
}

#[derive(Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
struct Intent {
    format: String,
    before: Inventory,
    after: Inventory,
}

#[derive(Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
struct Commit {
    format: String,
    intent_sha256: String,
}

#[derive(Debug, Eq, PartialEq)]
pub enum Outcome {
    /// No durable intent was published. Original files remain active.
    Unstarted,
    /// Original files are active; the bounded candidate is retained, if present.
    RolledBack,
    /// The entire desired tree is active and its previous tree is retained.
    Committed,
}

/// Holds an OS lock until dropped. Create refuses every existing root, even empty.
/// Opening is only for recovery of a sandbox created by this prototype.
pub struct Sandbox {
    root: PathBuf,
    _lock: File,
    initial: Inventory,
}

impl Sandbox {
    pub fn create(root: &Path, initial: Generation) -> Result<Self> {
        let parent = root.parent().ok_or(Error::UnsafePath)?.canonicalize()?;
        check_dir(&parent)?;
        let name = root.file_name().ok_or(Error::UnsafePath)?;
        let root = parent.join(name);
        // Exclusive creation is the ownership boundary. Never adopt a game tree.
        #[cfg(unix)]
        {
            use std::os::unix::fs::DirBuilderExt;
            fs::DirBuilder::new().mode(0o700).create(&root)?;
        }
        #[cfg(not(unix))]
        fs::create_dir(&root)?;
        let lock = OpenOptions::new()
            .read(true)
            .write(true)
            .create_new(true)
            .open(root.join("lock"))?;
        lock.try_lock().map_err(|_| Error::Busy)?;
        lock.sync_all()?;
        let inventory = initial.inventory();
        let mut no_fault = |_: &str| Ok(());
        materialize(&root.join("active"), &initial, &mut no_fault)?;
        write_new(
            &root.join("sandbox.json"),
            &encode(&Seed {
                format: FORMAT.into(),
                initial: inventory.clone(),
            })?,
            &mut no_fault,
        )?;
        sync_dir(&root)?;
        sync_dir(&parent)?;
        Ok(Self {
            root,
            _lock: lock,
            initial: inventory,
        })
    }

    pub fn open(root: &Path) -> Result<Self> {
        check_dir(root)?;
        let root = root.canonicalize()?;
        check_file(&root.join("lock"))?;
        let lock = OpenOptions::new()
            .read(true)
            .write(true)
            .open(root.join("lock"))?;
        lock.try_lock().map_err(|_| Error::Busy)?;
        let seed: Seed = decode(&read_bounded(&root.join("sandbox.json"), MAX_RECORD_BYTES)?)?;
        if seed.format != FORMAT || !valid_inventory(&seed.initial) {
            return Err(Error::InvalidRecord);
        }
        let sandbox = Self {
            root,
            _lock: lock,
            initial: seed.initial,
        };
        sandbox.check_layout()?;
        Ok(sandbox)
    }

    /// One activation per sandbox. Errors trigger recovery immediately; failures
    /// in recovery preserve the journal for the next launch and return explicitly.
    /// Cancellation is checked before each filesystem operation; once committed,
    /// cancellation cannot change the outcome of that commit.
    pub fn activate(
        &mut self,
        desired: Generation,
        mut cancelled: impl FnMut() -> bool,
    ) -> Result<Outcome> {
        self.preflight()?;
        let result = self.start_with(&desired, &mut |point| {
            if point.starts_with("before:") && cancelled() {
                Err(Error::Cancelled)
            } else {
                Ok(())
            }
        });
        match result {
            Ok(outcome) => Ok(outcome),
            Err(activation) => match self.recover() {
                Ok(Outcome::Committed) => Err(Error::CommittedAfterError(Box::new(activation))),
                Ok(_) => Err(activation),
                Err(recovery) => Err(Error::RecoveryRequired {
                    activation: Box::new(activation),
                    recovery: Box::new(recovery),
                }),
            },
        }
    }

    /// Recovery runs under the same lock and never overwrites drifted/unknown data.
    pub fn recover(&mut self) -> Result<Outcome> {
        self.recover_with(&mut |_| Ok(()))
    }

    fn preflight(&self) -> Result<()> {
        self.check_layout()?;
        for name in [
            "intent.pending",
            "intent.json",
            "commit.pending",
            "commit.json",
            "staged",
            "prior",
        ] {
            if exists(&self.root.join(name))? {
                return Err(Error::AlreadyUsed);
            }
        }
        verify(&self.root.join("active"), &self.initial)?;
        Ok(())
    }

    #[cfg(test)]
    fn activate_with(
        &mut self,
        desired: &Generation,
        hook: &mut impl FnMut(&str) -> Result<()>,
    ) -> Result<Outcome> {
        self.preflight()?;
        self.start_with(desired, hook)
    }

    fn start_with(
        &mut self,
        desired: &Generation,
        hook: &mut impl FnMut(&str) -> Result<()>,
    ) -> Result<Outcome> {
        let intent = Intent {
            format: FORMAT.into(),
            before: self.initial.clone(),
            after: desired.inventory(),
        };
        let bytes = encode(&intent)?;
        self.publish("intent", &bytes, hook)?;
        materialize(&self.root.join("staged"), desired, hook)?;
        verify(&self.root.join("staged"), &intent.after)?;
        verify(&self.root.join("active"), &intent.before)?;
        self.rename("active", "prior", hook)?;
        self.rename("staged", "active", hook)?;
        verify(&self.root.join("active"), &intent.after)?;
        verify(&self.root.join("prior"), &intent.before)?;
        // Commit publication is the only decision to retain the desired tree.
        let commit = encode(&Commit {
            format: FORMAT.into(),
            intent_sha256: digest(&bytes),
        })?;
        self.publish("commit", &commit, hook)?;
        Ok(Outcome::Committed)
    }

    fn recover_with(&mut self, hook: &mut impl FnMut(&str) -> Result<()>) -> Result<Outcome> {
        self.check_layout()?;
        let intent_path = self.root.join("intent.json");
        if !exists(&intent_path)? {
            for name in ["staged", "prior", "commit.json", "commit.pending"] {
                if exists(&self.root.join(name))? {
                    return Err(Error::InvalidRecord);
                }
            }
            verify(&self.root.join("active"), &self.initial)?;
            return Ok(Outcome::Unstarted);
        }
        let bytes = read_bounded(&intent_path, MAX_RECORD_BYTES)?;
        let intent: Intent = decode(&bytes)?;
        if intent.format != FORMAT
            || intent.before != self.initial
            || !valid_inventory(&intent.after)
        {
            return Err(Error::InvalidRecord);
        }
        let active = self.root.join("active");
        let staged = self.root.join("staged");
        let prior = self.root.join("prior");
        if exists(&self.root.join("commit.json"))? {
            let commit: Commit = decode(&read_bounded(
                &self.root.join("commit.json"),
                MAX_RECORD_BYTES,
            )?)?;
            if commit.format != FORMAT || commit.intent_sha256 != digest(&bytes) || exists(&staged)?
            {
                return Err(Error::InvalidRecord);
            }
            verify(&active, &intent.after)?;
            verify(&prior, &intent.before)?;
            return Ok(Outcome::Committed);
        }
        if exists(&prior)? {
            // Validate every tree before moving anything. Unknown edits need a human.
            verify(&prior, &intent.before)?;
            if exists(&active)? {
                if exists(&staged)? {
                    return Err(Error::Drift);
                }
                verify(&active, &intent.after)?;
                self.rename("active", "staged", hook)?;
            } else if exists(&staged)? {
                verify(&staged, &intent.after)?;
            } else {
                return Err(Error::Drift);
            }
            self.rename("prior", "active", hook)?;
        }
        verify(&active, &intent.before)?;
        // An interrupted materialization can leave a partial candidate. It is
        // never activated, deleted or rewritten by recovery; retain for inspection.
        if exists(&staged)? {
            scan(&staged)?;
        }
        Ok(Outcome::RolledBack)
    }

    fn publish(
        &self,
        name: &str,
        bytes: &[u8],
        hook: &mut impl FnMut(&str) -> Result<()>,
    ) -> Result<()> {
        let pending = format!("{name}.pending");
        write_new(&self.root.join(&pending), bytes, hook)?;
        self.rename(&pending, &format!("{name}.json"), hook)
    }

    fn rename(
        &self,
        from: &str,
        to: &str,
        hook: &mut impl FnMut(&str) -> Result<()>,
    ) -> Result<()> {
        let name = format!("rename:{from}:{to}");
        hook(&format!("before:{name}"))?;
        if exists(&self.root.join(to))? {
            return Err(Error::Drift);
        }
        fs::rename(self.root.join(from), self.root.join(to))?;
        hook(&format!("after:{name}"))?;
        sync_dir(&self.root)?;
        hook(&format!("synced:{name}"))
    }

    fn check_layout(&self) -> Result<()> {
        check_dir(&self.root)?;
        let allowed = [
            "lock",
            "sandbox.json",
            "intent.pending",
            "intent.json",
            "commit.pending",
            "commit.json",
            "active",
            "staged",
            "prior",
        ];
        let mut count = 0;
        for item in fs::read_dir(&self.root)? {
            let item = item?;
            count += 1;
            let name = item.file_name();
            let name = name.to_str().ok_or(Error::UnsafePath)?;
            if count > allowed.len() || !allowed.contains(&name) {
                return Err(Error::Drift);
            }
            if ["active", "staged", "prior"].contains(&name) {
                check_dir(&item.path())?;
            } else {
                check_file(&item.path())?;
            }
        }
        Ok(())
    }
}

fn safe_name(name: &str) -> bool {
    let Some(stem) = name.strip_suffix(".txt") else {
        return false;
    };
    !stem.is_empty()
        && stem.len() <= 32
        && stem.as_bytes()[0].is_ascii_lowercase()
        && stem
            .bytes()
            .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'_' || b == b'-')
        && ![
            "con", "prn", "aux", "nul", "com1", "com2", "com3", "com4", "com5", "com6", "com7",
            "com8", "com9", "lpt1", "lpt2", "lpt3", "lpt4", "lpt5", "lpt6", "lpt7", "lpt8", "lpt9",
        ]
        .contains(&stem)
}

fn valid_inventory(entries: &Inventory) -> bool {
    !entries.is_empty()
        && entries.len() <= MAX_FILES
        && entries.windows(2).all(|pair| pair[0].name < pair[1].name)
        && entries.iter().all(|e| {
            safe_name(&e.name)
                && e.bytes <= MAX_FILE_BYTES
                && e.sha256.len() == 64
                && e.sha256
                    .bytes()
                    .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
        })
        && entries.iter().map(|e| e.bytes).sum::<u64>() <= MAX_TREE_BYTES
}

fn digest(bytes: &[u8]) -> String {
    Sha256::digest(bytes)
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn encode(value: &impl Serialize) -> Result<Vec<u8>> {
    let bytes = serde_json::to_vec(value).map_err(|_| Error::InvalidRecord)?;
    if bytes.len() as u64 > MAX_RECORD_BYTES {
        return Err(Error::InvalidRecord);
    }
    Ok(bytes)
}

fn decode<T: serde::de::DeserializeOwned>(bytes: &[u8]) -> Result<T> {
    serde_json::from_slice(bytes).map_err(|_| Error::InvalidRecord)
}

fn exists(path: &Path) -> Result<bool> {
    match fs::symlink_metadata(path) {
        Ok(_) => Ok(true),
        Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(false),
        Err(e) => Err(e.into()),
    }
}

fn check_kind(path: &Path, directory: bool) -> Result<()> {
    let meta = fs::symlink_metadata(path)?;
    if meta.file_type().is_symlink()
        || (directory && !meta.is_dir())
        || (!directory && !meta.is_file())
    {
        return Err(Error::UnsafePath);
    }
    #[cfg(windows)]
    {
        use std::os::windows::fs::MetadataExt;
        if meta.file_attributes() & 0x400 != 0 {
            return Err(Error::UnsafePath);
        }
    }
    #[cfg(unix)]
    if !directory {
        use std::os::unix::fs::MetadataExt;
        if meta.nlink() != 1 {
            return Err(Error::UnsafePath);
        }
    }
    Ok(())
}

fn check_dir(path: &Path) -> Result<()> {
    check_kind(path, true)
}
fn check_file(path: &Path) -> Result<()> {
    check_kind(path, false)
}

fn read_bounded(path: &Path, limit: u64) -> Result<Vec<u8>> {
    check_file(path)?;
    let file = File::open(path)?;
    if file.metadata()?.len() > limit {
        return Err(Error::InvalidInput);
    }
    let mut bytes = Vec::new();
    file.take(limit + 1).read_to_end(&mut bytes)?;
    if bytes.len() as u64 > limit {
        return Err(Error::InvalidInput);
    }
    Ok(bytes)
}

fn scan(path: &Path) -> Result<Inventory> {
    check_dir(path)?;
    let mut entries = Vec::new();
    let mut total = 0_u64;
    for item in fs::read_dir(path)? {
        let item = item?;
        let name = item
            .file_name()
            .into_string()
            .map_err(|_| Error::UnsafePath)?;
        if entries.len() >= MAX_FILES || !safe_name(&name) {
            return Err(Error::UnsafePath);
        }
        let bytes = read_bounded(&item.path(), MAX_FILE_BYTES)?;
        total += bytes.len() as u64;
        if total > MAX_TREE_BYTES {
            return Err(Error::InvalidInput);
        }
        entries.push(Entry {
            name,
            bytes: bytes.len() as u64,
            sha256: digest(&bytes),
        });
    }
    entries.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(entries)
}

fn verify(path: &Path, expected: &Inventory) -> Result<()> {
    if scan(path)? != *expected {
        return Err(Error::Drift);
    }
    Ok(())
}

fn write_new(path: &Path, bytes: &[u8], hook: &mut impl FnMut(&str) -> Result<()>) -> Result<()> {
    let name = path
        .file_name()
        .and_then(|s| s.to_str())
        .ok_or(Error::UnsafePath)?;
    hook(&format!("before:create:{name}"))?;
    let mut file = OpenOptions::new().write(true).create_new(true).open(path)?;
    hook(&format!("after:create:{name}"))?;
    hook(&format!("before:write:{name}"))?;
    file.write_all(bytes)?;
    hook(&format!("after:write:{name}"))?;
    hook(&format!("before:sync:{name}"))?;
    file.sync_all()?;
    hook(&format!("after:sync:{name}"))?;
    Ok(())
}

fn materialize(
    path: &Path,
    generation: &Generation,
    hook: &mut impl FnMut(&str) -> Result<()>,
) -> Result<()> {
    hook("before:create:tree")?;
    fs::create_dir(path)?;
    hook("after:create:tree")?;
    for (name, bytes) in &generation.0 {
        write_new(&path.join(name), bytes, hook)?;
    }
    hook("before:sync:tree")?;
    sync_dir(path)?;
    hook("after:sync:tree")?;
    sync_dir(path.parent().ok_or(Error::UnsafePath)?)?;
    hook("synced:tree-parent")
}

fn sync_dir(path: &Path) -> Result<()> {
    #[cfg(unix)]
    File::open(path)?.sync_all()?;
    // Windows coverage is process-termination recovery, not power-loss durability.
    // A production adapter must add and prove appropriate Windows volume semantics.
    #[cfg(not(unix))]
    let _ = path;
    Ok(())
}

#[cfg(test)]
mod tests;
