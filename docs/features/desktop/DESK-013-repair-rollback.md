# DESK-013 — Repair and rollback

| Field | Value |
|---|---|
| ID | `DESK-013` |
| Owner | Desktop core/security |
| Phase | Phase 2 |
| Status | In_progress |

## Problem and user stories

Patches, interruptions, antivirus, disk failure, or external edits can leave managed state inconsistent. As a player, I want Modlock to diagnose exact drift and recover to a coherent current or previous state without overwriting new Valve/user content.

## Scope and non-goals

**In scope:** Startup incomplete-journal recovery, integrity/digest scan, game-build/`gameinfo.gi` drift, dry-run repair, owned-marker patch, active-tree rebuild, backup list, rollback, verification, and exportable redacted diagnostics.

**Non-goals:** Restoring an entire stale `gameinfo.gi` over a patch, repairing base game VPKs, guessing after parse failure, or deleting unknown files.

## States and primary flow

States are healthy, scan_required, drift_detected, incomplete_transaction, safe_mode, repair_planned, repairing, repaired, rollback_available, rolled_back, and manual_action. Startup resolves journals first; diagnostics compare desired/current/owned state; user reviews repair/rollback; transaction verifies outcome.

## Errors and offline behavior

Fully offline. Locked files/game running/disk full/parser changes stop safely. If semantic patching is impossible, remain in safe mode and direct the user to Steam verification/manual guidance.

## Permissions

Local user confirms ordinary repair/rollback. Automatic startup may complete only an already-journaled safe recovery; no remote trigger and no elevation.

## Data and API

Uses fsynced journals, managed-file before/after digests, bounded backups, desired/current profile trees, build metadata, receipts, and repair results. No remote dependency.

## Safety, privacy, and accessibility

Never touch unowned base packages; patch the latest semantic `gameinfo.gi` minimally. Diagnostics redact paths/config. Diff, safe-mode explanation, recommended action, and results are accessible text with focus management.

## Telemetry

Opt-in drift/failure category, repair/rollback outcome and duration, journal stage, and build/parser versions; no file content or full paths.

## Acceptance criteria

- Process termination at every journal step recovers to committed new or intact prior state.
- Patch-replaced `gameinfo.gi` is semantically patched without restoring stale Valve content.
- Unknown/unowned modifications are never silently deleted or overwritten.
- Rollback re-verifies target digests and leaves an auditable local result.

## Dependencies and open questions

Current partial evidence: the [synthetic journal proof](../../testing/synthetic-journal-proof.md)
tests abrupt termination during activation and reverse recovery, exact digests,
and preservation of changed files. It covers only fresh inert text trees;
gameinfo semantics, repeated transactions, production path races and UI remain open.

Tracked by SHO-128/129; depends on DESK-002/004/005/006/007/010/016 and SHO-124 fault fixtures.
