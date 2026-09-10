use super::*;
use std::sync::atomic::{AtomicU64, Ordering};

static SEQUENCE: AtomicU64 = AtomicU64::new(0);

struct Fixture {
    root: PathBuf,
}

impl Fixture {
    fn new() -> Self {
        let unique = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!(
            "modlock-steam-{}-{unique}-{}",
            std::process::id(),
            SEQUENCE.fetch_add(1, Ordering::Relaxed)
        ));
        fs::create_dir(&root).unwrap();
        let fixture = Self { root };
        fixture.write("fixture.identity", FIXTURE_MARKER);
        fixture.write("unowned/sentinel.txt", b"unowned fixture bytes\n");
        fixture.seed_library("Library one", 100);
        fixture.seed_library("Library é水", 200);
        fixture.libraries(&["Library one", "Library é水"]);
        fixture
    }

    fn write(&self, relative: &str, bytes: &[u8]) {
        let target = self.root.join(relative);
        fs::create_dir_all(target.parent().unwrap()).unwrap();
        fs::write(target, bytes).unwrap();
    }

    fn seed_library(&self, name: &str, build: u64) {
        self.write(
            &format!("{name}/steamapps/appmanifest_1422450.acf"),
            manifest(build).as_bytes(),
        );
        for file in ["game/bin/win64/deadlock.exe", "game/citadel/gameinfo.gi"] {
            self.write(
                &format!("{name}/steamapps/common/Deadlock/{file}"),
                GAME_MARKER,
            );
        }
    }

    fn libraries(&self, names: &[&str]) {
        let entries = names
            .iter()
            .enumerate()
            .map(|(index, name)| {
                format!(
                    "{index} {{ path {} apps {{}} }}",
                    quote(self.root.join(name).to_str().unwrap())
                )
            })
            .collect::<Vec<_>>()
            .join("\n");
        self.write(
            "steam/steamapps/libraryfolders.vdf",
            format!("libraryfolders {{\n{entries}\n}}\n").as_bytes(),
        );
    }

    fn snapshot(&self) -> BTreeMap<PathBuf, Vec<u8>> {
        fn walk(root: &Path, current: &Path, result: &mut BTreeMap<PathBuf, Vec<u8>>) {
            for entry in fs::read_dir(current).unwrap() {
                let path = entry.unwrap().path();
                let metadata = fs::symlink_metadata(&path).unwrap();
                if metadata.is_dir() {
                    walk(root, &path, result);
                } else if metadata.is_file() {
                    result.insert(
                        path.strip_prefix(root).unwrap().to_owned(),
                        fs::read(&path).unwrap(),
                    );
                }
            }
        }
        let mut result = BTreeMap::new();
        walk(&self.root, &self.root, &mut result);
        result
    }
}

impl Drop for Fixture {
    fn drop(&mut self) {
        fs::remove_dir_all(&self.root).unwrap();
    }
}

fn quote(value: &str) -> String {
    format!("\"{}\"", value.replace('\\', "\\\\").replace('"', "\\\""))
}

fn manifest(build: u64) -> String {
    format!(
        "// authored metadata only\nAppState {{ appid 1422450 name Deadlock installdir Deadlock buildid {build} InstalledDepots {{ 1422451 {{ manifest 123456789 size 42 }} }} }}"
    )
}

#[test]
fn discovers_multiple_fixture_libraries_without_writes() {
    let fixture = Fixture::new();
    let before = fixture.snapshot();
    let found = discover_fixture(&fixture.root).unwrap();
    assert_eq!(found.len(), 2);
    assert_eq!(
        found
            .iter()
            .map(|game| game.manifest.build_id)
            .collect::<Vec<_>>(),
        [100, 200]
    );
    assert_ne!(found[0].instance_id, found[1].instance_id);
    assert_eq!(
        found[0].manifest.depot_manifests,
        BTreeMap::from([(1422451, 123456789)])
    );
    assert!(found[0].install_root.is_absolute());
    assert_eq!(before, fixture.snapshot());
    assert_eq!(found, discover_fixture(&fixture.root).unwrap());
}

#[test]
fn rediscovery_updates_build_snapshot_and_preserves_same_path_identity() {
    let fixture = Fixture::new();
    let before = discover_fixture(&fixture.root).unwrap();
    fixture.write(
        "Library one/steamapps/appmanifest_1422450.acf",
        manifest(300).as_bytes(),
    );
    let after = discover_fixture(&fixture.root).unwrap();
    assert_eq!(after[0].manifest.build_id, 300);
    assert_eq!(before[0].instance_id, after[0].instance_id);
    assert_ne!(before[0].manifest_sha256, after[0].manifest_sha256);
    fs::rename(
        fixture.root.join("Library one/steamapps/common/Deadlock"),
        fixture.root.join("Library one/steamapps/common/Moved"),
    )
    .unwrap();
    assert_eq!(
        discover_fixture(&fixture.root),
        Err(Error::Io(io::ErrorKind::NotFound))
    );
}

#[test]
fn absent_app_is_not_found_and_stale_apps_hint_does_not_hide_manifest() {
    let fixture = Fixture::new();
    // Positive fixtures already have an empty/stale apps hint.
    assert_eq!(discover_fixture(&fixture.root).unwrap().len(), 2);
    for library in ["Library one", "Library é水"] {
        fs::remove_file(
            fixture
                .root
                .join(library)
                .join("steamapps/appmanifest_1422450.acf"),
        )
        .unwrap();
    }
    assert!(discover_fixture(&fixture.root).unwrap().is_empty());
}

#[test]
fn manual_override_requires_fresh_registered_evidence() {
    let fixture = Fixture::new();
    let chosen = fixture.root.join("Library é水/steamapps/common/Deadlock");
    assert_eq!(
        validate_fixture_override(&fixture.root, &chosen)
            .unwrap()
            .manifest
            .build_id,
        200
    );
    assert!(validate_fixture_override(&fixture.root, &fixture.root.join("unowned")).is_err());
    assert_eq!(
        validate_fixture_override(&fixture.root, Path::new("../elsewhere")),
        Err(Error::UnsafePath)
    );
    fixture.write(
        "Library é水/steamapps/appmanifest_1422450.acf",
        manifest(0).as_bytes(),
    );
    assert_eq!(
        validate_fixture_override(&fixture.root, &chosen),
        Err(Error::InvalidMetadata)
    );
}

#[test]
fn rejects_ambiguous_identity_and_unsupported_library_layout() {
    for input in [
        "libraryfolders { 0 { path a path b } }",
        "libraryfolders { 0 { path a PATH b } }",
        "libraryfolders { 0 { path a } 0 { path b } }",
        "libraryfolders { 0 { path a } 00 { path b } }",
        "libraryfolders { 0 a }",
        "libraryfolders {} libraryfolders {}",
    ] {
        assert!(parse_libraries(input.as_bytes()).is_err(), "{input}");
    }
    for change in ["appid 1422450 AppID 1", "appid 1", "appid 14224500"] {
        assert!(parse_manifest(manifest(100).replace("appid 1422450", change).as_bytes()).is_err());
    }
    for change in [
        "buildid 0",
        "buildid -1",
        "buildid 1e2",
        "buildid 18446744073709551616",
    ] {
        assert!(parse_manifest(manifest(100).replace("buildid 100", change).as_bytes()).is_err());
    }
    assert!(
        parse_manifest(
            manifest(100)
                .replace("manifest 123456789", "manifest 1 Manifest 2")
                .as_bytes()
        )
        .is_err()
    );
    let fixture = Fixture::new();
    fixture.libraries(&["Library one", "Library one"]);
    assert_eq!(discover_fixture(&fixture.root), Err(Error::Ambiguous));
}

#[test]
fn rejects_unsafe_install_components_and_library_paths() {
    for name in [
        "../Deadlock",
        "C:\\Deadlock",
        "\\\\host\\share",
        "//host/share",
        "x:y",
        "NUL.txt",
        "COM0",
        "LPT9.txt",
        "ＣＯＮ",
        "COM².txt",
        "Deadlock.",
        "Deadlock ",
        "a\u{200b}b",
        "a/b",
        "a\\b",
        "e\u{301}",
    ] {
        assert!(
            parse_manifest(
                manifest(100)
                    .replace(
                        "installdir Deadlock",
                        &format!("installdir {}", quote(name))
                    )
                    .as_bytes()
            )
            .is_err(),
            "{name}"
        );
    }
    let fixture = Fixture::new();
    for name in [
        "../outside",
        "Library one/../Library one",
        "Library one/./",
        "Library one//",
    ] {
        fixture.libraries(&[name]);
        assert_eq!(
            discover_fixture(&fixture.root),
            Err(Error::UnsafePath),
            "{name}"
        );
    }
    for path in [
        "//host/share",
        "\\\\host\\share",
        "\\\\?\\C:\\device",
        "C:relative",
    ] {
        fixture.write(
            "steam/steamapps/libraryfolders.vdf",
            format!("libraryfolders {{ 0 {{ path {} }} }}", quote(path)).as_bytes(),
        );
        assert_eq!(discover_fixture(&fixture.root), Err(Error::UnsafePath));
    }
}

#[test]
fn refuses_unmarked_roots_wrong_game_bytes_and_oversized_files() {
    let fixture = Fixture::new();
    fixture.write("fixture.identity", b"not a synthetic tree");
    assert_eq!(discover_fixture(&fixture.root), Err(Error::NotSynthetic));
    fixture.write("fixture.identity", FIXTURE_MARKER);
    fixture.write(
        "Library one/steamapps/common/Deadlock/game/bin/win64/deadlock.exe",
        b"lookalike executable",
    );
    assert_eq!(
        discover_fixture(&fixture.root),
        Err(Error::MissingGameEvidence)
    );
    fixture.write(
        "Library one/steamapps/appmanifest_1422450.acf",
        &vec![b' '; keyvalues::MAX_INPUT_BYTES + 1],
    );
    assert_eq!(discover_fixture(&fixture.root), Err(Error::Limit));
    let entries = (0..=MAX_LIBRARIES)
        .map(|index| format!("{index} {{ path x }}"))
        .collect::<Vec<_>>()
        .join(" ");
    assert_eq!(
        parse_libraries(format!("libraryfolders {{ {entries} }}").as_bytes()),
        Err(Error::Limit)
    );
}

#[cfg(unix)]
#[test]
fn rejects_links_hardlinks_and_special_files_without_following_them() {
    use std::os::unix::fs::symlink;
    use std::os::unix::net::UnixListener;
    let fixture = Fixture::new();
    let manifest = fixture
        .root
        .join("Library one/steamapps/appmanifest_1422450.acf");
    fs::remove_file(&manifest).unwrap();
    symlink(fixture.root.join("unowned/sentinel.txt"), &manifest).unwrap();
    assert_eq!(discover_fixture(&fixture.root), Err(Error::UnsafePath));
    fs::remove_file(&manifest).unwrap();
    fs::hard_link(fixture.root.join("unowned/sentinel.txt"), &manifest).unwrap();
    assert_eq!(discover_fixture(&fixture.root), Err(Error::UnsafePath));
    fs::remove_file(&manifest).unwrap();
    // macOS limits the bind address length; move the owned socket inode into
    // the longer manifest slot after binding, before invoking discovery.
    let socket_path = fixture.root.join("s");
    let socket = UnixListener::bind(&socket_path).unwrap();
    fs::rename(socket_path, &manifest).unwrap();
    assert_eq!(discover_fixture(&fixture.root), Err(Error::UnsafePath));
    drop(socket);
    fs::remove_file(&manifest).unwrap();
    symlink(fixture.root.join("Library é水"), fixture.root.join("alias")).unwrap();
    fixture.libraries(&["alias"]);
    assert_eq!(discover_fixture(&fixture.root), Err(Error::UnsafePath));
}

#[cfg(windows)]
#[test]
fn rejects_windows_directory_junction() {
    let fixture = Fixture::new();
    let alias = fixture.root.join("alias");
    let target = fixture.root.join("Library one");
    let result = std::process::Command::new("cmd")
        .args(["/D", "/C", "mklink", "/J"])
        .arg(&alias)
        .arg(&target)
        .output()
        .unwrap();
    assert!(result.status.success(), "junction fixture creation failed");
    fixture.libraries(&["alias"]);
    assert_eq!(discover_fixture(&fixture.root), Err(Error::UnsafePath));
    fs::remove_dir(alias).unwrap();
}
