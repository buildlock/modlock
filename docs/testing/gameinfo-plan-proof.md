# Owned gameinfo byte-edit proof

Date: 2026-09-10
Owner: Codex, SHO-128; one independent reviewer
Status: implemented locally; source review and final CI pending

## What is implemented

The [Rust planner](../../crates/modlock-core/src/gameinfo.rs) takes current bytes,
desired presence/absence and an optional prior digest receipt. It parses the
current file, finds exactly one `GameInfo/FileSystem/SearchPaths` scope and
proposes insertion or removal of one exact Modlock-owned block. Original path
order, duplicate unrelated path keys, comments, spelling, sibling fields, BOM,
Unicode and existing line endings remain byte-identical outside the edit.

The proposed entry is `Game "|gameinfo_path|addons/modlock"`, surrounded by exact
versioned begin/end line comments. This is a Modlock prototype namespace, not
a verified current Deadlock mount path. Missing/corrupt/duplicated/relocated
markers, changed owned content and unmarked overlapping paths cause an error.
Unknown structures and unsupported parser syntax also stop planning. Includes,
conditionals and binary/KV3 remain unsupported.

For insertion, the opening search-path brace must end its line and the closing brace must
start its line; compact or commented-brace layouts that cannot be edited by
this rule are refused. New lines use the opening brace's newline style. The
planner inserts a bounded block after that line and removes exactly its complete
canonical marker range. It does not serialize and rewrite the whole document.

`replacement_if_unchanged` checks the supplied bytes against the plan's SHA-256
precondition before returning the candidate. A changed input returns `Drift`;
the caller must re-read and re-plan. A receipt contains only the expected output
digest, never an old file snapshot. A simulated Valve replacement can therefore
be detected and repaired from its new content without restoring old fields.

The module has no filesystem, network, Steam registry or process access. The
tests explicitly apply proposed bytes to their own disposable files. A matching
hash is not a filesystem compare-and-swap, instance authorization, game-stopped
proof or durable transaction. The future production adapter must supply those
separate guarantees before applying a candidate to a real game.

## Source and boundaries

The structural requirements come from Modlock's
[desktop design](../04-desktop-technical-design.md). Public format evidence is
Valve's pinned [KeyValues notes](https://github.com/ValveSoftware/source-sdk-2013/blob/b8cfb12c0e083a2ef5b2f9f9b50f3902fa034474/src/public/tier1/KeyValues.h#L45-L57)
and [Source SDK gameinfo example](https://github.com/ValveSoftware/source-sdk-2013/blob/b8cfb12c0e083a2ef5b2f9f9b50f3902fa034474/game/mod_hl2mp/gameinfo.txt).
These verify structural conventions, ordered repeated path keys, the conventional
path macro and unquoted wildcards. They do not establish current Source 2/Deadlock
compatibility. Fixtures and implementation were authored independently; no DMM
or Valve implementation/file contents were copied into this repository.

Lexical overlap checks conservatively cover case, slash, dot-segment, NFKC and
trailing-dot/space variations under the proposed owned namespace. Microsoft's
[filename rules](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file)
inform the Windows ambiguity guard. This is not a complete engine/filesystem
resolver: different macros, short-name aliases, mounts and hostile filesystem
races require real-instance validation in the production adapter.

Input and output are limited to 1 MiB; existing KeyValues depth/pair/token limits
apply. Inserted indentation is at most 128 bytes. Errors and plan debug output
omit file contents. Paths/receipts are not a new portable/network contract or
cryptographic authorization, and this slice introduces no signing identity.

## Verification and next boundary

The [tests](../../crates/modlock-core/src/gameinfo/tests.rs) cover:

- Exact insert/remove round trips, no duplicate insertion and no-op absence.
- LF, CRLF, mixed endings, BOM, Unicode, comments and repeated original paths.
- Empty supported scopes; unknown/duplicate scopes, nested path objects,
  directives, conditionals and unsupported formatting fail closed.
- Unmarked aliases and corrupt, duplicated or misplaced ownership markers.
- Stale-source rejection and detection of external change with or without a
  surviving owned block.
- Actual owned-file replacement with new fields/paths. Repair preserves the new
  content; an unknown replacement stays byte-identical with its unowned sibling.
- Input/output/recheck limits, every input truncation and deterministic hostile
  byte edits. Every accepted mutation round-trips to the exact unowned input.

Twelve new groups and the full 39-test macOS Rust suite pass locally. Clippy with
warnings denied, formatting and all-target Windows cross-compilation pass.
The fresh Python 3.13.15 gate passes all 28 contract tests and removes its
temporary environment. Dependencies are unchanged from accepted PR7's clean
audit. Pinned Linux/Windows tests and audit remain required in CI before merge.
Owned fixture trees are removed.

Together with accepted [PR7 discovery](steam-discovery-proof.md), this addresses
SHO-128's narrow synthetic discovery, override and semantic repair prototype
cases. Keep the issue In Progress until independent review and CI accept that
combined scope. A real Windows filesystem writer, transaction integration,
game-running checks, current Valve file validation, real game tests and DESK-002/
013 completion remain separate. No real Steam/game path or provider changed.
