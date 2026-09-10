use super::*;
use std::io::{BufRead, BufReader};
use std::process::{Child, Command, Stdio};
use std::sync::{
    atomic::{AtomicU64, Ordering},
    mpsc,
};
use std::time::Duration;

static NEXT: AtomicU64 = AtomicU64::new(0);

struct Fixture {
    parent: PathBuf,
    root: PathBuf,
}

impl Fixture {
    fn new() -> Self {
        let parent = std::env::temp_dir().join(format!(
            "modlock-proof-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        fs::create_dir(&parent).unwrap();
        fs::write(parent.join("unowned.txt"), b"unowned sentinel").unwrap();
        let root = parent.join("sandbox");
        drop(Sandbox::create(&root, old()).unwrap());
        Self { parent, root }
    }

    fn assert_active(&self, desired: &Generation) {
        // Independent byte oracle, rather than reusing the core's hash/scan code.
        let actual: BTreeMap<_, _> = fs::read_dir(self.root.join("active"))
            .unwrap()
            .map(|item| {
                let item = item.unwrap();
                (
                    item.file_name().into_string().unwrap(),
                    fs::read(item.path()).unwrap(),
                )
            })
            .collect();
        assert_eq!(actual, desired.0);
        assert_eq!(
            fs::read(self.parent.join("unowned.txt")).unwrap(),
            b"unowned sentinel"
        );
    }
}

impl Drop for Fixture {
    fn drop(&mut self) {
        fs::remove_dir_all(&self.parent).unwrap();
    }
}

fn generation(files: &[(&str, &str)]) -> Generation {
    Generation::new(
        files
            .iter()
            .map(|(name, body)| (name.to_string(), [PREFIX, body.as_bytes()].concat()))
            .collect(),
    )
    .unwrap()
}

fn old() -> Generation {
    generation(&[
        ("alpha.txt", "old alpha\n"),
        ("removed.txt", "old removed\n"),
    ])
}
fn new() -> Generation {
    generation(&[("alpha.txt", "new alpha\n"), ("beta.txt", "new beta\n")])
}

#[test]
fn sha256_and_deterministic_inventory_bind_exact_bytes() {
    assert_eq!(
        digest(b"abc"),
        "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
    assert_ne!(old().inventory(), new().inventory());
    let reordered = generation(&[
        ("removed.txt", "old removed\n"),
        ("alpha.txt", "old alpha\n"),
    ]);
    assert_eq!(old().inventory(), reordered.inventory());
}

#[cfg(target_os = "linux")]
#[test]
#[ignore = "requires the dedicated 256 KiB tmpfs runner"]
fn real_storage_full_during_staging_restores_original() {
    assert_eq!(std::env::var("MODLOCK_PROOF_ENOSPC").unwrap(), "1");
    assert_eq!(std::env::temp_dir(), PathBuf::from("/proof"));
    let fixture = Fixture::new();
    let bytes = [PREFIX, &vec![b'x'; MAX_FILE_BYTES as usize - PREFIX.len()]].concat();
    let desired = Generation::new(
        (0..8)
            .map(|i| (format!("file{i}.txt"), bytes.clone()))
            .collect(),
    )
    .unwrap();
    let mut sandbox = Sandbox::open(&fixture.root).unwrap();
    let result = sandbox.activate(desired, || false);
    assert!(
        matches!(result, Err(Error::Io(io::ErrorKind::StorageFull))),
        "expected actual ENOSPC, got {result:?}"
    );
    fixture.assert_active(&old());
    assert_eq!(sandbox.recover().unwrap(), Outcome::RolledBack);
}

/// The parent uses OS process termination while the child is paused at an exact
/// boundary. No panic/unwind/drop handler runs in the terminated process.
#[test]
#[ignore = "subprocess entrypoint; exercised by parent tests"]
fn child_process_entry() {
    let root = PathBuf::from(std::env::var_os("MODLOCK_PROOF_ROOT").expect("parent supplies root"));
    let mut sandbox = Sandbox::open(&root).unwrap();
    let mut hook = |point: &str| -> Result<()> {
        println!("BOUNDARY {point}");
        io::stdout().flush().unwrap();
        let mut line = String::new();
        io::stdin().read_line(&mut line).unwrap();
        assert_eq!(line, "continue\n");
        Ok(())
    };
    let result = match std::env::var("MODLOCK_PROOF_MODE").unwrap().as_str() {
        "activate" => sandbox.activate_with(&new(), &mut hook),
        "recover" => sandbox.recover_with(&mut hook),
        "lock" => {
            hook("held:lock").unwrap();
            Ok(Outcome::Unstarted)
        }
        _ => panic!("unknown test mode"),
    };
    println!("OUTCOME {:?}", result.unwrap());
}

struct Process {
    child: Child,
    lines: mpsc::Receiver<String>,
}

impl Process {
    fn start(fixture: &Fixture, mode: &str) -> Self {
        let mut child = Command::new(std::env::current_exe().unwrap())
            .args([
                "--exact",
                "synthetic::tests::child_process_entry",
                "--ignored",
                "--nocapture",
            ])
            .env_clear()
            .env("MODLOCK_PROOF_ROOT", &fixture.root)
            .env("MODLOCK_PROOF_MODE", mode)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .unwrap();
        let stdout = child.stdout.take().unwrap();
        let (send, lines) = mpsc::channel();
        std::thread::spawn(move || {
            for line in BufReader::new(stdout).lines() {
                if send.send(line.unwrap()).is_err() {
                    break;
                }
            }
        });
        Self { child, lines }
    }

    fn line(&mut self) -> String {
        self.lines
            .recv_timeout(Duration::from_secs(15))
            .expect("child progress deadline")
    }

    fn resume(&mut self) {
        self.child
            .stdin
            .as_mut()
            .unwrap()
            .write_all(b"continue\n")
            .unwrap();
    }

    fn kill(&mut self) {
        self.child.kill().unwrap();
        assert!(!self.child.wait().unwrap().success());
    }

    fn until(&mut self, target: &str) {
        loop {
            let line = self.line();
            if let Some(point) = line.strip_prefix("BOUNDARY ") {
                if point == target {
                    return;
                }
                self.resume();
            }
            assert!(!line.starts_with("OUTCOME "), "missing boundary {target}");
        }
    }

    fn all(mut self) -> Vec<String> {
        let mut points = Vec::new();
        loop {
            let line = self.line();
            if let Some(point) = line.strip_prefix("BOUNDARY ") {
                points.push(point.to_string());
                self.resume();
            }
            if line.starts_with("OUTCOME ") {
                break;
            }
        }
        assert!(self.child.wait().unwrap().success());
        points
    }
}

impl Drop for Process {
    fn drop(&mut self) {
        if self.child.try_wait().unwrap().is_none() {
            self.child.kill().unwrap();
            self.child.wait().unwrap();
        }
    }
}

#[test]
fn process_termination_at_every_activation_boundary() {
    let baseline = Fixture::new();
    let points = Process::start(&baseline, "activate").all();
    baseline.assert_active(&new());
    assert!(
        points.len() >= 40,
        "all file create/write/flush and rename boundaries are observed"
    );
    let commit = points
        .iter()
        .position(|p| p == "after:rename:commit.pending:commit.json")
        .unwrap();
    for (index, point) in points.iter().enumerate() {
        let fixture = Fixture::new();
        let mut child = Process::start(&fixture, "activate");
        child.until(point);
        child.kill();
        let mut sandbox = Sandbox::open(&fixture.root).unwrap();
        let outcome = sandbox
            .recover()
            .unwrap_or_else(|e| panic!("recovery at {point}: {e}"));
        if index >= commit {
            assert_eq!(outcome, Outcome::Committed, "{point}");
            fixture.assert_active(&new());
        } else {
            assert_ne!(outcome, Outcome::Committed, "{point}");
            fixture.assert_active(&old());
        }
        assert_eq!(sandbox.recover().unwrap(), outcome, "idempotent at {point}");
    }
    println!(
        "Verified {} abrupt activation-termination boundaries",
        points.len()
    );
}

fn interrupted_activation(fixture: &Fixture) {
    let mut child = Process::start(fixture, "activate");
    child.until("after:rename:staged:active");
    child.kill();
}

#[test]
fn process_termination_during_reverse_order_recovery() {
    let baseline = Fixture::new();
    interrupted_activation(&baseline);
    let points = Process::start(&baseline, "recover").all();
    assert_eq!(points.len(), 6);
    baseline.assert_active(&old());
    for point in &points {
        let fixture = Fixture::new();
        interrupted_activation(&fixture);
        let mut child = Process::start(&fixture, "recover");
        child.until(point);
        child.kill();
        let mut sandbox = Sandbox::open(&fixture.root).unwrap();
        assert_eq!(sandbox.recover().unwrap(), Outcome::RolledBack, "{point}");
        fixture.assert_active(&old());
        assert_eq!(sandbox.recover().unwrap(), Outcome::RolledBack);
    }
}

#[test]
fn os_lock_excludes_a_second_process_and_releases_after_kill() {
    let fixture = Fixture::new();
    let mut child = Process::start(&fixture, "lock");
    child.until("held:lock");
    assert!(matches!(Sandbox::open(&fixture.root), Err(Error::Busy)));
    child.kill();
    assert_eq!(
        Sandbox::open(&fixture.root).unwrap().recover().unwrap(),
        Outcome::Unstarted
    );
}

#[cfg(unix)]
#[test]
fn dropping_sandbox_unlocks_even_while_a_duplicated_descriptor_survives() {
    let fixture = Fixture::new();
    let sandbox = Sandbox::open(&fixture.root).unwrap();
    // POSIX fork/dup shares the same open file description. A parallel process
    // spawn can briefly retain this descriptor until close-on-exec takes effect.
    let inherited = sandbox._lock.try_clone().unwrap();
    drop(sandbox);
    let mut reopened = Sandbox::open(&fixture.root).expect("scope drop must explicitly unlock");
    assert_eq!(reopened.recover().unwrap(), Outcome::Unstarted);
    drop(inherited);
}

#[test]
fn cancellation_at_each_operation_preserves_original_on_recovery() {
    let baseline = Fixture::new();
    let points = Process::start(&baseline, "activate").all();
    let operations = points.iter().filter(|p| p.starts_with("before:")).count();
    for cancel_at in 0..operations {
        let fixture = Fixture::new();
        let mut sandbox = Sandbox::open(&fixture.root).unwrap();
        let mut index = 0;
        let result = sandbox.activate(new(), || {
            let cancel = index == cancel_at;
            index += 1;
            cancel
        });
        assert!(
            matches!(result, Err(Error::Cancelled)),
            "operation {cancel_at}"
        );
        fixture.assert_active(&old());
        assert_ne!(sandbox.recover().unwrap(), Outcome::Committed);
        fixture.assert_active(&old());
    }
}

#[test]
fn injected_storage_and_permission_errors_leave_recoverable_state() {
    for kind in [
        io::ErrorKind::StorageFull,
        io::ErrorKind::PermissionDenied,
        io::ErrorKind::WriteZero,
    ] {
        for fail_at in [
            "before:write:alpha.txt",
            "before:rename:staged:active",
            "before:write:commit.pending",
        ] {
            let fixture = Fixture::new();
            let mut sandbox = Sandbox::open(&fixture.root).unwrap();
            let result = sandbox.activate_with(&new(), &mut |point| {
                if point == fail_at {
                    Err(Error::Io(kind))
                } else {
                    Ok(())
                }
            });
            assert!(matches!(result, Err(Error::Io(actual)) if actual == kind));
            assert_eq!(sandbox.recover().unwrap(), Outcome::RolledBack);
            fixture.assert_active(&old());
        }
    }
}

#[test]
fn tampered_active_or_backup_is_preserved_without_recovery_writes() {
    for directory in ["active", "prior"] {
        let fixture = Fixture::new();
        interrupted_activation(&fixture);
        let path = fixture.root.join(directory).join("alpha.txt");
        fs::write(&path, b"external modification").unwrap();
        let mut sandbox = Sandbox::open(&fixture.root).unwrap();
        assert!(matches!(sandbox.recover(), Err(Error::Drift)));
        assert_eq!(fs::read(&path).unwrap(), b"external modification");
        assert!(!fixture.root.join("staged").exists());
        assert!(fixture.root.join("prior").is_dir());
    }
}

#[test]
fn staged_hash_mismatch_prevents_activation() {
    let fixture = Fixture::new();
    let mut sandbox = Sandbox::open(&fixture.root).unwrap();
    let result = sandbox.activate_with(&new(), &mut |point| {
        if point == "synced:tree-parent" {
            fs::write(fixture.root.join("staged/alpha.txt"), b"bad staged bytes")?;
        }
        Ok(())
    });
    assert!(matches!(result, Err(Error::Drift)));
    assert_eq!(sandbox.recover().unwrap(), Outcome::RolledBack);
    fixture.assert_active(&old());
}

#[test]
fn corrupt_or_unbound_records_fail_closed() {
    for record in ["sandbox.json", "intent.json", "commit.json"] {
        let fixture = Fixture::new();
        Sandbox::open(&fixture.root)
            .unwrap()
            .activate(new(), || false)
            .unwrap();
        let before = fs::read(fixture.root.join("active/alpha.txt")).unwrap();
        fs::write(fixture.root.join(record), b"{truncated").unwrap();
        match Sandbox::open(&fixture.root) {
            Err(Error::InvalidRecord) => (),
            Ok(mut sandbox) => assert!(matches!(sandbox.recover(), Err(Error::InvalidRecord))),
            _ => panic!("unexpected record error"),
        }
        assert_eq!(
            fs::read(fixture.root.join("active/alpha.txt")).unwrap(),
            before
        );
    }
    let fixture = Fixture::new();
    Sandbox::open(&fixture.root)
        .unwrap()
        .activate(new(), || false)
        .unwrap();
    fs::write(
        fixture.root.join("commit.json"),
        encode(&Commit {
            format: FORMAT.into(),
            intent_sha256: "0".repeat(64),
        })
        .unwrap(),
    )
    .unwrap();
    assert!(matches!(
        Sandbox::open(&fixture.root).unwrap().recover(),
        Err(Error::InvalidRecord)
    ));
    fixture.assert_active(&new());
}

#[test]
fn hostile_names_content_and_resource_limits_are_rejected() {
    for name in [
        "../a.txt",
        "/a.txt",
        "C:a.txt",
        "a\\b.txt",
        "a/b.txt",
        "a:stream.txt",
        "a.txt.",
        "CON.txt",
        "con.txt",
        "lpt1.txt",
        "pak01_dir.vpk",
        "gameinfo.gi",
        "Ａ.txt",
        "A.txt",
    ] {
        assert!(
            Generation::new(BTreeMap::from([(name.to_string(), PREFIX.to_vec())])).is_err(),
            "{name}"
        );
    }
    assert!(Generation::new(BTreeMap::from([("a.txt".into(), b"unmarked".to_vec())])).is_err());
    assert!(Generation::new(BTreeMap::from([("a.txt".into(), [PREFIX, b"\0"].concat())])).is_err());
    assert!(Generation::new(BTreeMap::new()).is_err());
    let huge = [PREFIX, &vec![b'x'; MAX_FILE_BYTES as usize]].concat();
    assert!(Generation::new(BTreeMap::from([("a.txt".into(), huge)])).is_err());
    let too_many = (0..33)
        .map(|i| (format!("f{i}.txt"), PREFIX.to_vec()))
        .collect();
    assert!(Generation::new(too_many).is_err());
    let too_large = (0..17)
        .map(|i| {
            (
                format!("f{i}.txt"),
                [PREFIX, &vec![b'x'; MAX_FILE_BYTES as usize - PREFIX.len()]].concat(),
            )
        })
        .collect();
    assert!(Generation::new(too_large).is_err());
}

#[test]
fn existing_roots_unknown_files_and_repeated_activation_are_rejected() {
    let fixture = Fixture::new();
    assert!(Sandbox::create(&fixture.root, old()).is_err());
    fs::write(fixture.root.join("unexpected"), b"retain").unwrap();
    assert!(matches!(Sandbox::open(&fixture.root), Err(Error::Drift)));
    fs::remove_file(fixture.root.join("unexpected")).unwrap();
    let mut sandbox = Sandbox::open(&fixture.root).unwrap();
    assert_eq!(
        sandbox.activate(new(), || false).unwrap(),
        Outcome::Committed
    );
    assert!(matches!(
        sandbox.activate(old(), || false),
        Err(Error::AlreadyUsed)
    ));
    assert_eq!(sandbox.recover().unwrap(), Outcome::Committed);
    fixture.assert_active(&new());
}

#[test]
fn oversized_records_and_unsafe_inventory_are_rejected() {
    let fixture = Fixture::new();
    fs::write(
        fixture.root.join("sandbox.json"),
        vec![b'x'; MAX_RECORD_BYTES as usize + 1],
    )
    .unwrap();
    assert!(matches!(
        Sandbox::open(&fixture.root),
        Err(Error::InvalidInput)
    ));
    for entries in [
        vec![Entry {
            name: "../escape.txt".into(),
            bytes: 1,
            sha256: "0".repeat(64),
        }],
        vec![Entry {
            name: "a.txt".into(),
            bytes: u64::MAX,
            sha256: "0".repeat(64),
        }],
        vec![Entry {
            name: "a.txt".into(),
            bytes: 1,
            sha256: "not-a-digest".into(),
        }],
        vec![old().inventory()[0].clone(), old().inventory()[0].clone()],
    ] {
        assert!(!valid_inventory(&entries));
    }
}

#[cfg(unix)]
#[test]
fn symlinks_special_files_and_hardlinks_fail_before_mutation() {
    use std::os::unix::fs::symlink;
    let fixture = Fixture::new();
    fs::remove_file(fixture.root.join("active/alpha.txt")).unwrap();
    symlink(
        fixture.parent.join("unowned.txt"),
        fixture.root.join("active/alpha.txt"),
    )
    .unwrap();
    assert!(matches!(
        Sandbox::open(&fixture.root)
            .unwrap()
            .activate(new(), || false),
        Err(Error::UnsafePath)
    ));
    assert!(!fixture.root.join("intent.json").exists());
    fs::remove_file(fixture.root.join("active/alpha.txt")).unwrap();
    fs::hard_link(
        fixture.parent.join("unowned.txt"),
        fixture.root.join("active/alpha.txt"),
    )
    .unwrap();
    assert!(matches!(
        Sandbox::open(&fixture.root)
            .unwrap()
            .activate(new(), || false),
        Err(Error::UnsafePath)
    ));
    assert!(!fixture.root.join("intent.json").exists());
    fs::remove_file(fixture.root.join("active/alpha.txt")).unwrap();
    let _socket =
        std::os::unix::net::UnixListener::bind(fixture.root.join("active/alpha.txt")).unwrap();
    assert!(matches!(
        Sandbox::open(&fixture.root)
            .unwrap()
            .activate(new(), || false),
        Err(Error::UnsafePath)
    ));
    assert_eq!(
        fs::read(fixture.parent.join("unowned.txt")).unwrap(),
        b"unowned sentinel"
    );
}

#[cfg(windows)]
#[test]
fn windows_open_file_without_delete_sharing_blocks_activation_safely() {
    use std::os::windows::fs::OpenOptionsExt;
    let fixture = Fixture::new();
    let held = OpenOptions::new()
        .read(true)
        .share_mode(1)
        .open(fixture.root.join("active/alpha.txt"))
        .unwrap();
    let mut sandbox = Sandbox::open(&fixture.root).unwrap();
    assert!(sandbox.activate(new(), || false).is_err());
    drop(held);
    assert_ne!(sandbox.recover().unwrap(), Outcome::Committed);
    fixture.assert_active(&old());
}
