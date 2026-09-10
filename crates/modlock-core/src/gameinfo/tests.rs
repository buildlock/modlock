use super::*;
use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};

fn source() -> String {
    concat!(
        "// Authored synthetic fixture, not a Valve file.\n",
        "GameInfo\n{\n\tgame \"Synthetic é水\"\n\tFileSystem\n\t{\n",
        "\t\tSteamAppId 1422450\n\t\tSearchPaths\n\t\t{\n",
        "\t\t\t// Preserve this comment with its original paths.\n",
        "\t\t\tGame fixture/base/*\n",
        "\t\t\tGame \"fixture/second\"\n",
        "\t\t\tPlatform \"fixture/platform\"\n",
        "\t\t}\n\t}\n\tUnrelated { value \"keep me\" }\n}\n"
    )
    .to_owned()
}

fn apply(
    current: &[u8],
    desired: Presence,
    receipt: Option<&Receipt>,
) -> (Vec<u8>, Receipt, Action) {
    let edit = plan(current, desired, receipt).unwrap();
    (
        edit.replacement_if_unchanged(current).unwrap().to_vec(),
        edit.proposed_receipt(),
        edit.action,
    )
}

#[test]
fn inserts_once_and_removes_only_owned_bytes() {
    let original = source();
    let (added, receipt, action) = apply(original.as_bytes(), Presence::Present, None);
    assert_eq!(action, Action::Insert);
    let expected_block = concat!(
        "\t\t\t// MODLOCK SEARCH PATH BEGIN 1\n",
        "\t\t\tGame\t\"|gameinfo_path|addons/modlock\"\n",
        "\t\t\t// MODLOCK SEARCH PATH END 1\n"
    );
    assert_eq!(
        String::from_utf8(added.clone()).unwrap(),
        original.replace(
            "\t\tSearchPaths\n\t\t{\n",
            &format!("\t\tSearchPaths\n\t\t{{\n{expected_block}")
        )
    );
    let unchanged = plan(&added, Presence::Present, Some(&receipt)).unwrap();
    assert_eq!(unchanged.action, Action::Unchanged);
    assert!(!unchanged.changed_since_receipt);
    assert_eq!(unchanged.before_sha256(), unchanged.after_sha256());
    assert_eq!(unchanged.replacement_if_unchanged(&added).unwrap(), added);
    let (removed, _, action) = apply(&added, Presence::Absent, Some(&receipt));
    assert_eq!(action, Action::Remove);
    assert_eq!(removed, original.as_bytes());
    let absent = plan(&removed, Presence::Absent, None).unwrap();
    assert_eq!(absent.action, Action::Unchanged);
    assert_eq!(absent.replacement_if_unchanged(&removed).unwrap(), removed);
}

#[test]
fn preserves_lf_crlf_mixed_endings_bom_comments_and_unicode() {
    for original in [
        source(),
        source().replace('\n', "\r\n"),
        format!("\u{feff}{}", source()),
        source()
            .replace("\t\t{\n", "\t\t{\r\n")
            .replace("keep me", "new — résumé 水"),
    ] {
        let (added, _, _) = apply(original.as_bytes(), Presence::Present, None);
        let (removed, _, _) = apply(&added, Presence::Absent, None);
        assert_eq!(removed, original.as_bytes());
    }
}

#[test]
fn empty_multiline_search_paths_are_supported() {
    let original = b"GameInfo\n{\n FileSystem\n {\n  SearchPaths {\n  }\n }\n}\n";
    let (added, _, _) = apply(original, Presence::Present, None);
    assert_eq!(apply(&added, Presence::Absent, None).0, original);
}

#[test]
fn refuses_unknown_or_ambiguous_structures() {
    for bad in [
        "GameInfo {}",
        "Other {}",
        "GameInfo {} GameInfo {}",
        "GameInfo { FileSystem {} filesystem {} }",
        "GameInfo { FileSystem { SearchPaths {} searchpaths {} } }",
        "GameInfo { FileSystem { SearchPaths { nested {} } } }",
        "GameInfo { FileSystem { SearchPaths { Game \"\" } } }",
        "GameInfo { FileSystem { SearchPaths { Game x } } }",
        "#base fixture.gi\nGameInfo {}",
        "GameInfo { FileSystem { SearchPaths { Game x [$WIN32] } } }",
    ] {
        assert!(
            plan(bad.as_bytes(), Presence::Present, None).is_err(),
            "{bad}"
        );
    }
    assert!(
        plan(
            source()
                .replace("fixture/second", "broken\\npath")
                .as_bytes(),
            Presence::Present,
            None
        )
        .is_err()
    );
}

#[test]
fn refuses_unmarked_overlapping_namespace_without_adopting_it() {
    for path in [
        OWNED_TARGET,
        "|GAMEINFO_PATH|ADDONS/MODLOCK",
        "|gameinfo_path|addons/./modlock",
        "|gameinfo_path|addons/x/../modlock",
        "|gameinfo_path|addons/modlock/*",
        "|gameinfo_path|addons/modlock/subfolder",
        "|gameinfo_path|addons/ｍｏｄｌｏｃｋ",
        "|gameinfo_path|addons/modlock.",
        "|gameinfo_path|addons/modlock ",
        "|gameinfo_path|addons./modlock",
    ] {
        let original = source().replace("fixture/second", path);
        assert!(
            matches!(
                plan(original.as_bytes(), Presence::Present, None),
                Err(Error::OwnershipConflict)
            ),
            "{path}"
        );
        assert!(plan(original.as_bytes(), Presence::Absent, None).is_err());
    }
}

#[test]
fn corrupt_or_relocated_markers_never_remove_unknown_content() {
    let (added, _, _) = apply(source().as_bytes(), Presence::Present, None);
    let added = String::from_utf8(added).unwrap();
    for bad in [
        added.replace(BEGIN, "// missing beginning"),
        added.replace(END, "// missing end"),
        added.replace("BEGIN 1", "BEGIN 2"),
        added.replace("SEARCH PATH", "search path"),
        added.replace(OWNED_TARGET, "fixture/unowned"),
        added.replace(
            "\t\t\tGame\t",
            "\t\t\t// unexpected user comment\n\t\t\tGame\t",
        ),
        added.replace("\t\t\tGame\t", "\t\t\tgame\t"),
        added.replace("Synthetic é水", "Synthetic MODLOCK SEARCH PATH"),
    ] {
        assert!(plan(bad.as_bytes(), Presence::Present, None).is_err());
        assert!(plan(bad.as_bytes(), Presence::Absent, None).is_err());
    }
    let block = render_block("\t\t\t", "\n");
    let duplicate = added.replace(&block, &format!("{block}{block}"));
    assert!(plan(duplicate.as_bytes(), Presence::Absent, None).is_err());
    let outside = format!("{}{}", block, source());
    assert!(plan(outside.as_bytes(), Presence::Present, None).is_err());
    let relocated = source().replace("\t\tSearchPaths", &format!("{block}\t\tSearchPaths"));
    assert!(plan(relocated.as_bytes(), Presence::Absent, None).is_err());
}

#[test]
fn a_plan_rejects_source_drift_before_providing_replacement_bytes() {
    let original = source();
    let edit = plan(original.as_bytes(), Presence::Present, None).unwrap();
    let newer = original.replace("Synthetic é水", "Simulated Valve replacement");
    assert_eq!(
        edit.replacement_if_unchanged(newer.as_bytes()),
        Err(Error::Drift)
    );
    assert!(!format!("{edit:?}").contains("keep me"));
}

#[test]
fn preserves_new_content_when_owned_block_survives_a_replacement() {
    let (added, receipt, _) = apply(source().as_bytes(), Presence::Present, None);
    let newer = String::from_utf8(added)
        .unwrap()
        .replace("keep me", "new setting from simulated Valve patch");
    let edit = plan(newer.as_bytes(), Presence::Present, Some(&receipt)).unwrap();
    assert!(edit.changed_since_receipt);
    assert_eq!(edit.action, Action::Unchanged);
    assert_eq!(
        edit.replacement_if_unchanged(newer.as_bytes()).unwrap(),
        newer.as_bytes()
    );
    let removed = apply(newer.as_bytes(), Presence::Absent, Some(&receipt)).0;
    assert_eq!(
        removed,
        source()
            .replace("keep me", "new setting from simulated Valve patch")
            .as_bytes()
    );
}

#[test]
fn output_growth_and_input_size_are_bounded() {
    let base = source();
    let nearly_full = format!(
        "//{}\n{base}",
        "x".repeat(keyvalues::MAX_INPUT_BYTES - base.len() - 8)
    );
    assert!(matches!(
        plan(nearly_full.as_bytes(), Presence::Present, None),
        Err(Error::Limit)
    ));
    assert!(
        plan(
            &vec![b' '; keyvalues::MAX_INPUT_BYTES + 1],
            Presence::Present,
            None
        )
        .is_err()
    );
}

#[test]
fn recheck_bounds_and_hostile_byte_edits_preserve_unowned_bytes() {
    let original = source().into_bytes();
    let edit = plan(&original, Presence::Present, None).unwrap();
    assert_eq!(
        edit.replacement_if_unchanged(&vec![b' '; keyvalues::MAX_INPUT_BYTES + 1]),
        Err(Error::Limit)
    );
    for end in 0..=original.len() {
        let _ = plan(&original[..end], Presence::Present, None);
    }
    for position in 0..original.len() {
        for byte in [0, b'}', b'/', b'\n', b'"', 0xff] {
            let mut changed = original.clone();
            changed[position] = byte;
            if let Ok(edit) = plan(&changed, Presence::Present, None) {
                let candidate = edit.replacement_if_unchanged(&changed).unwrap();
                let removed = apply(candidate, Presence::Absent, None).0;
                assert_eq!(removed, changed);
            }
        }
    }
}

static SEQUENCE: AtomicU64 = AtomicU64::new(0);

struct Fixture {
    root: PathBuf,
}

impl Fixture {
    fn new() -> Self {
        let time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!(
            "modlock-gameinfo-{}-{time}-{}",
            std::process::id(),
            SEQUENCE.fetch_add(1, Ordering::Relaxed)
        ));
        fs::create_dir(&root).unwrap();
        fs::write(root.join("gameinfo.gi"), source()).unwrap();
        fs::write(root.join("unowned.txt"), b"untouched sibling fixture\n").unwrap();
        Self { root }
    }

    fn snapshot(&self) -> BTreeMap<String, Vec<u8>> {
        ["gameinfo.gi", "unowned.txt"]
            .into_iter()
            .map(|name| (name.to_owned(), fs::read(self.root.join(name)).unwrap()))
            .collect()
    }
}

impl Drop for Fixture {
    fn drop(&mut self) {
        fs::remove_dir_all(&self.root).unwrap();
    }
}

#[test]
fn simulated_valve_file_replacement_is_repaired_from_latest_fixture_bytes() {
    let fixture = Fixture::new();
    let gameinfo = fixture.root.join("gameinfo.gi");
    let before = fixture.snapshot();
    let initial = fs::read(&gameinfo).unwrap();
    let (added, receipt, _) = apply(&initial, Presence::Present, None);
    fs::write(&gameinfo, added).unwrap();
    // Replace the whole fixture: old fields disappear and new fields/paths arrive.
    let replacement = source()
        .replace(
            "Unrelated { value \"keep me\" }",
            "NewValveField { patch \"synthetic update 2\" }",
        )
        .replace("fixture/second", "fixture/new-content");
    fs::write(&gameinfo, &replacement).unwrap();
    let latest = fs::read(&gameinfo).unwrap();
    let repair = plan(&latest, Presence::Present, Some(&receipt)).unwrap();
    assert!(repair.changed_since_receipt);
    assert_eq!(repair.action, Action::Insert);
    fs::write(
        &gameinfo,
        repair
            .replacement_if_unchanged(&fs::read(&gameinfo).unwrap())
            .unwrap(),
    )
    .unwrap();
    let repaired = fs::read(&gameinfo).unwrap();
    assert!(!String::from_utf8_lossy(&repaired).contains("keep me"));
    assert!(String::from_utf8_lossy(&repaired).contains("synthetic update 2"));
    let restored_unowned = apply(
        &repaired,
        Presence::Absent,
        Some(&repair.proposed_receipt()),
    )
    .0;
    assert_eq!(restored_unowned, replacement.as_bytes());
    let after = fixture.snapshot();
    assert_eq!(before["unowned.txt"], after["unowned.txt"]);
    // The core planned bytes only. These explicit writes belong to this owned
    // test harness and do not constitute a production transaction adapter.
}

#[test]
fn replacement_with_unknown_structure_stays_byte_identical() {
    let fixture = Fixture::new();
    let gameinfo = fixture.root.join("gameinfo.gi");
    let receipt = apply(&fs::read(&gameinfo).unwrap(), Presence::Present, None).1;
    fs::write(&gameinfo, b"GameInfo { FutureLayout { NewPaths x } }\n").unwrap();
    let before = fixture.snapshot();
    assert!(plan(&before["gameinfo.gi"], Presence::Present, Some(&receipt)).is_err());
    assert_eq!(before, fixture.snapshot());
}
