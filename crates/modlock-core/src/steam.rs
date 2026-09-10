//! Read-only discovery in an explicitly supplied, marked synthetic fixture tree.
//! No registry, process, network, broad scan, game launch or mutation operations.

use crate::keyvalues::{self, Entry, Value};
use sha2::{Digest, Sha256};
use std::collections::{BTreeMap, BTreeSet};
use std::fs::{self, File, Metadata};
use std::io::{self, Read};
use std::path::{Component, Path, PathBuf};
use unicode_normalization::UnicodeNormalization;

pub const FIXTURE_MARKER: &[u8] = b"MODLOCK STEAM FIXTURE V1\n";
pub const GAME_MARKER: &[u8] = b"MODLOCK SYNTHETIC GAME EVIDENCE\n";
const MAX_LIBRARIES: usize = 32;
const APP_ID: u64 = 1_422_450;

/// Redacted categories: no paths, personal Steam metadata or file contents.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Error {
    Io(io::ErrorKind),
    Parse(keyvalues::Error),
    Limit,
    Ambiguous,
    InvalidMetadata,
    UnsupportedLayout,
    UnsafePath,
    NotSynthetic,
    MissingGameEvidence,
    Drift,
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Steam fixture discovery: {self:?}")
    }
}

impl std::error::Error for Error {}

impl From<io::Error> for Error {
    fn from(error: io::Error) -> Self {
        Self::Io(error.kind())
    }
}

impl From<keyvalues::Error> for Error {
    fn from(error: keyvalues::Error) -> Self {
        Self::Parse(error)
    }
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Library {
    pub index: u32,
    /// Untrusted metadata, not a path authorized for filesystem access.
    pub path: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AppManifest {
    pub install_directory: String,
    pub build_id: u64,
    pub depot_manifests: BTreeMap<u64, u64>,
}

/// The result proves only synthetic evidence at a read-only snapshot.
/// It cannot authorize installation or imply the real game is stopped.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FixtureInstall {
    pub instance_id: String,
    pub library_index: u32,
    pub library_root: PathBuf,
    pub install_root: PathBuf,
    pub manifest_sha256: String,
    pub manifest: AppManifest,
}

/// Current object-form fixtures only. Legacy string-form libraries fail closed.
/// `apps` is a hint, so discovery checks the manifest even when that hint is stale.
pub fn parse_libraries(bytes: &[u8]) -> Result<Vec<Library>, Error> {
    let entries = keyvalues::parse(bytes)?;
    let root = root_object(&entries, "libraryfolders")?;
    let mut result = Vec::new();
    let mut indices = BTreeSet::new();
    for entry in root {
        // Steam may add non-library metadata. It cannot supply a path or identity.
        if !entry.key.bytes().all(|b| b.is_ascii_digit()) {
            continue;
        }
        let index = decimal(&entry.key)?;
        let index = u32::try_from(index).map_err(|_| Error::InvalidMetadata)?;
        if !indices.insert(index) {
            return Err(Error::Ambiguous);
        }
        if result.len() >= MAX_LIBRARIES {
            return Err(Error::Limit);
        }
        let Value::Object(fields) = &entry.value else {
            return Err(Error::UnsupportedLayout);
        };
        unique(fields)?;
        let path = text(fields, "path")?.to_owned();
        if path.is_empty() || path.chars().any(char::is_control) {
            return Err(Error::UnsafePath);
        }
        result.push(Library { index, path });
    }
    result.sort_by_key(|library| library.index);
    Ok(result)
}

pub fn parse_manifest(bytes: &[u8]) -> Result<AppManifest, Error> {
    let entries = keyvalues::parse(bytes)?;
    let root = root_object(&entries, "AppState")?;
    if decimal(text(root, "appid")?)? != APP_ID {
        return Err(Error::InvalidMetadata);
    }
    let install_directory = text(root, "installdir")?.to_owned();
    if !safe_component(&install_directory) {
        return Err(Error::UnsafePath);
    }
    let build_id = decimal(text(root, "buildid")?)?;
    if build_id == 0 {
        return Err(Error::InvalidMetadata);
    }
    let depots = object(root, "InstalledDepots")?;
    unique(depots)?;
    if depots.is_empty() || depots.len() > 128 {
        return Err(Error::InvalidMetadata);
    }
    let mut depot_manifests = BTreeMap::new();
    for depot in depots {
        let id = decimal(&depot.key)?;
        let Value::Object(fields) = &depot.value else {
            return Err(Error::InvalidMetadata);
        };
        unique(fields)?;
        let manifest = decimal(text(fields, "manifest")?)?;
        if id == 0 || manifest == 0 || depot_manifests.insert(id, manifest).is_some() {
            return Err(Error::InvalidMetadata);
        }
    }
    Ok(AppManifest {
        install_directory,
        build_id,
        depot_manifests,
    })
}

/// `root/steam/steamapps/libraryfolders.vdf` and every named library must be
/// inside the supplied absolute fixture root. Every game-evidence file must
/// contain GAME_MARKER exactly. Real installations are intentionally rejected.
/// The caller owns this static fixture tree; hostile concurrent ancestor/handle
/// substitution requires a future production filesystem adapter.
pub fn discover_fixture(root: &Path) -> Result<Vec<FixtureInstall>, Error> {
    let tree = FixtureRoot::open(root)?;
    if tree.read(Path::new("fixture.identity"))? != FIXTURE_MARKER {
        return Err(Error::NotSynthetic);
    }
    let library_bytes = tree.read(Path::new("steam/steamapps/libraryfolders.vdf"))?;
    let libraries = parse_libraries(&library_bytes)?;
    let mut seen = BTreeSet::new();
    let mut installs = Vec::new();
    for library in libraries {
        let native = Path::new(&library.path);
        if !local_absolute(native) {
            return Err(Error::UnsafePath);
        }
        let relative = native.strip_prefix(root).map_err(|_| Error::UnsafePath)?;
        let library_root = tree.checked(relative)?;
        if !fs::metadata(&library_root)?.is_dir() {
            return Err(Error::UnsafePath);
        }
        // Reject aliases before any app manifest reads.
        let identity = library_root
            .to_str()
            .ok_or(Error::UnsafePath)?
            .to_lowercase();
        if !seen.insert(identity) {
            return Err(Error::Ambiguous);
        }
        let manifest_path = relative.join("steamapps/appmanifest_1422450.acf");
        let manifest_bytes = match tree.read(&manifest_path) {
            Err(Error::Io(io::ErrorKind::NotFound)) => continue,
            other => other?,
        };
        let manifest = parse_manifest(&manifest_bytes)?;
        let install_relative = relative
            .join("steamapps/common")
            .join(&manifest.install_directory);
        let install_root = tree.checked(&install_relative)?;
        if !fs::metadata(&install_root)?.is_dir() {
            return Err(Error::MissingGameEvidence);
        }
        // These are explicitly synthetic oracles, not signatures of current Valve files.
        for evidence in ["game/bin/win64/deadlock.exe", "game/citadel/gameinfo.gi"] {
            match tree.read(&install_relative.join(evidence)) {
                Ok(bytes) if bytes == GAME_MARKER => {}
                Err(Error::Io(io::ErrorKind::NotFound)) | Ok(_) => {
                    return Err(Error::MissingGameEvidence);
                }
                Err(error) => return Err(error),
            }
        }
        if tree.read(&manifest_path)? != manifest_bytes {
            return Err(Error::Drift);
        }
        let instance_id = digest(install_root.to_str().ok_or(Error::UnsafePath)?.as_bytes());
        installs.push(FixtureInstall {
            instance_id,
            library_index: library.index,
            library_root,
            install_root,
            manifest_sha256: digest(&manifest_bytes),
            manifest,
        });
    }
    if tree.read(Path::new("steam/steamapps/libraryfolders.vdf"))? != library_bytes {
        return Err(Error::Drift);
    }
    Ok(installs)
}

/// A manual selection must still resolve to a freshly validated registered
/// fixture candidate. It cannot bypass the manifest or game-evidence checks.
pub fn validate_fixture_override(root: &Path, selected: &Path) -> Result<FixtureInstall, Error> {
    if !local_absolute(selected) {
        return Err(Error::UnsafePath);
    }
    let relative = selected.strip_prefix(root).map_err(|_| Error::UnsafePath)?;
    let canonical = FixtureRoot::open(root)?.checked(relative)?;
    discover_fixture(root)?
        .into_iter()
        .find(|install| install.install_root == canonical)
        .ok_or(Error::InvalidMetadata)
}

fn digest(bytes: &[u8]) -> String {
    Sha256::digest(bytes)
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn unique(entries: &[Entry]) -> Result<(), Error> {
    let mut keys = BTreeSet::new();
    for entry in entries {
        if !keys.insert(entry.key.to_ascii_lowercase()) {
            return Err(Error::Ambiguous);
        }
    }
    Ok(())
}

fn root_object<'a>(entries: &'a [Entry], name: &str) -> Result<&'a [Entry], Error> {
    if entries.len() != 1 || !entries[0].key.eq_ignore_ascii_case(name) {
        return Err(Error::InvalidMetadata);
    }
    let Value::Object(fields) = &entries[0].value else {
        return Err(Error::InvalidMetadata);
    };
    unique(fields)?;
    Ok(fields)
}

fn value<'a>(entries: &'a [Entry], name: &str) -> Result<&'a Value, Error> {
    entries
        .iter()
        .find(|entry| entry.key.eq_ignore_ascii_case(name))
        .map(|entry| &entry.value)
        .ok_or(Error::InvalidMetadata)
}

fn text<'a>(entries: &'a [Entry], name: &str) -> Result<&'a str, Error> {
    match value(entries, name)? {
        Value::Text(text) => Ok(text),
        _ => Err(Error::InvalidMetadata),
    }
}

fn object<'a>(entries: &'a [Entry], name: &str) -> Result<&'a [Entry], Error> {
    match value(entries, name)? {
        Value::Object(fields) => Ok(fields),
        _ => Err(Error::InvalidMetadata),
    }
}

fn decimal(text: &str) -> Result<u64, Error> {
    if text.is_empty()
        || !text.bytes().all(|b| b.is_ascii_digit())
        || (text.len() > 1 && text.starts_with('0'))
    {
        return Err(Error::InvalidMetadata);
    }
    text.parse().map_err(|_| Error::InvalidMetadata)
}

fn safe_component(value: &str) -> bool {
    if value.is_empty()
        || value.len() > 240
        || value.ends_with([' ', '.'])
        || matches!(value, "." | "..")
        || value.nfkc().ne(value.chars())
        || !value
            .chars()
            .all(|c| c.is_alphanumeric() || " _-.()".contains(c))
    {
        return false;
    }
    let stem = value.split('.').next().unwrap_or("").to_ascii_uppercase();
    !matches!(stem.as_str(), "CON" | "PRN" | "AUX" | "NUL" | "CLOCK$")
        && !(stem.len() == 4
            && (stem.starts_with("COM") || stem.starts_with("LPT"))
            && stem.as_bytes()[3].is_ascii_digit())
}

fn local_absolute(path: &Path) -> bool {
    if !path.is_absolute() {
        return false;
    }
    let Some(spelling) = path.to_str() else {
        return false;
    };
    if spelling.starts_with("//")
        || spelling.starts_with("\\\\")
        || spelling.chars().any(char::is_control)
    {
        return false;
    }
    #[cfg(windows)]
    let tail = spelling.get(3..).unwrap_or("");
    #[cfg(not(windows))]
    let tail = {
        if spelling.contains('\\') {
            return false;
        }
        spelling.strip_prefix('/').unwrap_or("")
    };
    if tail
        .split(['/', '\\'])
        .any(|part| part.is_empty() || matches!(part, "." | ".."))
    {
        return false;
    }
    path.components().all(|part| match part {
        Component::Prefix(prefix) => matches!(prefix.kind(), std::path::Prefix::Disk(_)),
        Component::RootDir | Component::Normal(_) => true,
        _ => false,
    })
}

struct FixtureRoot {
    canonical: PathBuf,
}

impl FixtureRoot {
    fn open(root: &Path) -> Result<Self, Error> {
        if !local_absolute(root) {
            return Err(Error::UnsafePath);
        }
        let metadata = fs::symlink_metadata(root)?;
        if !metadata.is_dir() || linked(&metadata) {
            return Err(Error::UnsafePath);
        }
        Ok(Self {
            canonical: fs::canonicalize(root)?,
        })
    }

    fn checked(&self, relative: &Path) -> Result<PathBuf, Error> {
        let mut path = self.canonical.clone();
        for part in relative.components() {
            let Component::Normal(name) = part else {
                return Err(Error::UnsafePath);
            };
            if !name.to_str().is_some_and(safe_component) {
                return Err(Error::UnsafePath);
            }
            path.push(name);
            let metadata = fs::symlink_metadata(&path)?;
            if linked(&metadata) || !(metadata.is_file() || metadata.is_dir()) {
                return Err(Error::UnsafePath);
            }
        }
        let canonical = fs::canonicalize(&path)?;
        if !canonical.starts_with(&self.canonical) {
            return Err(Error::UnsafePath);
        }
        Ok(canonical)
    }

    fn read(&self, relative: &Path) -> Result<Vec<u8>, Error> {
        let path = self.checked(relative)?;
        let mut file = File::open(&path)?;
        let before = file.metadata()?;
        if !before.is_file() || linked(&before) {
            return Err(Error::UnsafePath);
        }
        if before.len() > keyvalues::MAX_INPUT_BYTES as u64 {
            return Err(Error::Limit);
        }
        let mut bytes = Vec::new();
        (&mut file)
            .take(keyvalues::MAX_INPUT_BYTES as u64 + 1)
            .read_to_end(&mut bytes)?;
        let after = file.metadata()?;
        if bytes.len() > keyvalues::MAX_INPUT_BYTES {
            return Err(Error::Limit);
        }
        if before.len() != bytes.len() as u64
            || before.len() != after.len()
            || before.modified()? != after.modified()?
        {
            return Err(Error::Drift);
        }
        Ok(bytes)
    }
}

fn linked(metadata: &Metadata) -> bool {
    if metadata.file_type().is_symlink() {
        return true;
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::MetadataExt;
        if metadata.is_file() && metadata.nlink() != 1 {
            return true;
        }
    }
    #[cfg(windows)]
    {
        use std::os::windows::fs::MetadataExt;
        if metadata.file_attributes() & 0x400 != 0 {
            return true;
        }
    }
    false
}

#[cfg(test)]
mod tests;
