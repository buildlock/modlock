//! Pure byte-edit planning for one explicitly owned search-path block.
//! This does not read/write a file, detect a running game, or authorize mutation.

use crate::keyvalues::{self, Entry, Value};
use sha2::{Digest, Sha256};
use std::ops::Range;
use unicode_normalization::UnicodeNormalization;

pub const OWNED_TARGET: &str = "|gameinfo_path|addons/modlock";
const MARKER_PREFIX: &str = "MODLOCK SEARCH PATH";
const BEGIN: &str = "// MODLOCK SEARCH PATH BEGIN 1";
const END: &str = "// MODLOCK SEARCH PATH END 1";

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Presence {
    Present,
    Absent,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Action {
    Insert,
    Remove,
    Unchanged,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Error {
    Parse(keyvalues::Error),
    UnknownStructure,
    OwnershipConflict,
    Limit,
    Drift,
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "gameinfo plan: {self:?}")
    }
}

impl std::error::Error for Error {}

impl From<keyvalues::Error> for Error {
    fn from(error: keyvalues::Error) -> Self {
        Self::Parse(error)
    }
}

/// A caller may retain this only after it has applied and verified the proposal.
/// It stores no old file contents and is not proof or authority for a disk write.
#[derive(Clone, Debug)]
pub struct Receipt {
    expected_sha256: String,
}

pub struct Plan {
    pub action: Action,
    pub changed_since_receipt: bool,
    before_sha256: String,
    after_sha256: String,
    replacement: Vec<u8>,
}

impl std::fmt::Debug for Plan {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Plan")
            .field("action", &self.action)
            .field("changed_since_receipt", &self.changed_since_receipt)
            .field("before_sha256", &self.before_sha256)
            .field("after_sha256", &self.after_sha256)
            .field("replacement_bytes", &self.replacement.len())
            .finish()
    }
}

impl Plan {
    /// Compare again before passing bytes to a separately authorized transaction
    /// adapter. This is a byte precondition, not an atomic filesystem CAS.
    pub fn replacement_if_unchanged(&self, current: &[u8]) -> Result<&[u8], Error> {
        if current.len() > keyvalues::MAX_INPUT_BYTES {
            return Err(Error::Limit);
        }
        if digest(current) != self.before_sha256 {
            return Err(Error::Drift);
        }
        Ok(&self.replacement)
    }

    pub fn before_sha256(&self) -> &str {
        &self.before_sha256
    }
    pub fn after_sha256(&self) -> &str {
        &self.after_sha256
    }
    pub fn proposed_receipt(&self) -> Receipt {
        Receipt {
            expected_sha256: self.after_sha256.clone(),
        }
    }
}

/// Reconcile the latest bytes; never restore a whole historical gameinfo file.
/// Only GameInfo/FileSystem/SearchPaths with scalar paths is supported. The
/// insertion rule requires the opening brace to end its line and the closing
/// brace to start its line.
/// Existing comments, order, unknown sibling fields and mixed EOLs are retained.
pub fn plan(current: &[u8], desired: Presence, previous: Option<&Receipt>) -> Result<Plan, Error> {
    let entries = keyvalues::parse(current)?;
    let input = std::str::from_utf8(current).map_err(|_| Error::UnknownStructure)?;
    if entries.len() != 1 || !entries[0].key.eq_ignore_ascii_case("GameInfo") {
        return Err(Error::UnknownStructure);
    }
    let root = children(&entries[0])?;
    let filesystem = unique_named(root, "FileSystem")?;
    let search = unique_named(children(filesystem)?, "SearchPaths")?;
    let paths = children(search)?;
    for path in paths {
        let Value::Text(value) = &path.value else {
            return Err(Error::UnknownStructure);
        };
        if value.is_empty() || value.chars().any(char::is_control) {
            return Err(Error::UnknownStructure);
        }
    }

    let owned = owned_block(input)?;
    if let Some(block) = &owned {
        if block.start <= search.value_span.start || block.end > search.value_span.end - 1 {
            return Err(Error::OwnershipConflict);
        }
        let overlapping: Vec<_> = paths
            .iter()
            .filter(|path| intersects(&path.span, block))
            .collect();
        if overlapping.len() != 1
            || !block_contains(block, &overlapping[0].span)
            || overlapping[0].key != "Game"
            || overlapping[0].value != Value::Text(OWNED_TARGET.to_owned())
        {
            return Err(Error::OwnershipConflict);
        }
    }
    for path in paths {
        let Value::Text(value) = &path.value else {
            unreachable!()
        };
        if overlaps_owned_namespace(value)
            && !owned
                .as_ref()
                .is_some_and(|block| block_contains(block, &path.span))
        {
            return Err(Error::OwnershipConflict);
        }
    }

    let (action, replacement) = match (desired, owned) {
        (Presence::Present, None) => {
            let (position, indent, newline) = insertion_point(input, search)?;
            let block = render_block(&indent, newline);
            if current.len().saturating_add(block.len()) > keyvalues::MAX_INPUT_BYTES {
                return Err(Error::Limit);
            }
            let bytes = [&current[..position], block.as_bytes(), &current[position..]].concat();
            // Generated comments/strings must still leave one parseable document.
            keyvalues::parse(&bytes)?;
            (Action::Insert, bytes)
        }
        (Presence::Absent, Some(block)) => (
            Action::Remove,
            [&current[..block.start], &current[block.end..]].concat(),
        ),
        _ => (Action::Unchanged, current.to_vec()),
    };
    let before_sha256 = digest(current);
    let after_sha256 = digest(&replacement);
    Ok(Plan {
        action,
        changed_since_receipt: previous
            .is_some_and(|receipt| receipt.expected_sha256 != before_sha256),
        before_sha256,
        after_sha256,
        replacement,
    })
}

fn digest(bytes: &[u8]) -> String {
    Sha256::digest(bytes)
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn children(entry: &Entry) -> Result<&[Entry], Error> {
    match &entry.value {
        Value::Object(children) => Ok(children),
        _ => Err(Error::UnknownStructure),
    }
}

fn unique_named<'a>(entries: &'a [Entry], name: &str) -> Result<&'a Entry, Error> {
    let mut selected = entries
        .iter()
        .filter(|entry| entry.key.eq_ignore_ascii_case(name));
    let result = selected.next().ok_or(Error::UnknownStructure)?;
    if selected.next().is_some() {
        return Err(Error::UnknownStructure);
    }
    Ok(result)
}

fn block_contains(outer: &Range<usize>, inner: &Range<usize>) -> bool {
    outer.start <= inner.start && inner.end <= outer.end
}

fn intersects(a: &Range<usize>, b: &Range<usize>) -> bool {
    a.start < b.end && b.start < a.end
}

fn owned_block(input: &str) -> Result<Option<Range<usize>>, Error> {
    let mentions = input.to_ascii_uppercase().matches(MARKER_PREFIX).count();
    if mentions == 0 {
        return Ok(None);
    }
    if mentions != 2 {
        return Err(Error::OwnershipConflict);
    }
    let mut start = None;
    let mut end = None;
    let mut offset = 0;
    let mut indent = "";
    let mut newline = "";
    for line in input.split_inclusive('\n') {
        let content = line.trim_end_matches(['\r', '\n']);
        let trimmed = content.trim_start_matches([' ', '\t']);
        if trimmed == BEGIN {
            if start.replace(offset).is_some() {
                return Err(Error::OwnershipConflict);
            }
            indent = &content[..content.len() - trimmed.len()];
            newline = if line.ends_with("\r\n") {
                "\r\n"
            } else if line.ends_with('\n') {
                "\n"
            } else {
                return Err(Error::OwnershipConflict);
            };
        }
        if trimmed == END && end.replace(offset + line.len()).is_some() {
            return Err(Error::OwnershipConflict);
        }
        offset += line.len();
    }
    let (Some(start), Some(end)) = (start, end) else {
        return Err(Error::OwnershipConflict);
    };
    if start >= end || indent.len() > 128 || input[start..end] != render_block(indent, newline) {
        return Err(Error::OwnershipConflict);
    }
    Ok(Some(start..end))
}

fn render_block(indent: &str, newline: &str) -> String {
    format!(
        "{indent}{BEGIN}{newline}{indent}Game\t\"{OWNED_TARGET}\"{newline}{indent}{END}{newline}"
    )
}

fn insertion_point<'a>(input: &'a str, search: &Entry) -> Result<(usize, String, &'a str), Error> {
    let open = search.value_span.start;
    let close = search.value_span.end - 1;
    let line_end = input[open + 1..close]
        .find('\n')
        .map(|index| open + 1 + index)
        .ok_or(Error::UnknownStructure)?;
    if !input[open + 1..line_end]
        .bytes()
        .all(|byte| matches!(byte, b' ' | b'\t' | b'\r'))
    {
        return Err(Error::UnknownStructure);
    }
    let close_line = input[..close].rfind('\n').map_or(0, |index| index + 1);
    let indent = &input[close_line..close];
    if indent.len() > 127 || !indent.bytes().all(|byte| matches!(byte, b' ' | b'\t')) {
        return Err(Error::UnknownStructure);
    }
    let newline = if input.as_bytes()[line_end - 1] == b'\r' {
        "\r\n"
    } else {
        "\n"
    };
    Ok((line_end + 1, format!("{indent}\t"), newline))
}

fn overlaps_owned_namespace(value: &str) -> bool {
    let normalized = value
        .nfkc()
        .collect::<String>()
        .replace('\\', "/")
        .to_ascii_lowercase();
    let Some(relative) = normalized.strip_prefix("|gameinfo_path|") else {
        return false;
    };
    let mut parts = Vec::new();
    for part in relative.split('/') {
        match part {
            "" | "." => {}
            ".." => {
                parts.pop();
            }
            other => parts.push(other.trim_end_matches([' ', '.'])),
        }
    }
    parts.len() >= 2 && parts[0] == "addons" && parts[1] == "modlock"
}

#[cfg(test)]
mod tests;
