# DESK-010 — CFG editor

| Field | Value |
|---|---|
| ID | `DESK-010` |
| Owner | Desktop core/product/security |
| Phase | Phase 3 |
| Status | Draft |

## Problem and user stories

Players need safe config editing without copied full-file presets destroying unrelated or machine-specific values. As a player, I want typed settings, advanced text editing, exact diffs, owned blocks, backups, and restore.

## Scope and non-goals

**In scope:** Signed typed command registry, search/forms, raw advanced editor, risk labels, syntax validation, before/after diff, owned marker block, backup timeline, external-edit detection, allowlisted machine-convar reconciliation, and restore.

**Non-goals:** Replacing full `video.txt`/`gameinfo.gi`, applying unknown public commands, live writes unless proven safe, or competitive-risk hosted presets.

## States and primary flow

States are clean, edited, invalid, externally_changed, unsupported_key, risky, confirming, writing, verified, and restored. Read current encoding/lines, validate/render, show exact diff, ensure game closed, back up, atomically replace, then re-read/verify.

## Errors and offline behavior

All local editing works offline with the shipped registry. Duplicate/corrupt markers, cloud-sync race, parse error, game running, file lock, or write mismatch block safe apply. Registry freshness is visible.

## Permissions

Local user edits their config. Public presets may set only known allowed keys. Advanced raw mode requires explicit warning but retains backup/diff protections.

## Data and API

Uses local config bytes/digests/backups, owned structured settings, registry version/build/source/risk, and selected hosted preset IDs. Registry/preset updates are signed planned contracts.

## Safety, privacy, and accessibility

Never upload config contents or paths without explicit diagnostic consent. Preserve non-owned bytes, encoding, and line endings. Diff, risk, range errors, and restore timeline have non-visual text and keyboard operation.

## Telemetry

Opt-in action/outcome, validation category, risk-class usage, backup/restore, and registry version; never key values or raw CFG text.

## Acceptance criteria

- Applying a typed preset changes only the owned block/explicit allowlisted persisted key.
- External edits and duplicate/corrupt markers block overwrite with recovery guidance.
- Unknown/unsupported public keys are never automatically written.
- Restore reproduces the selected backup digest and preserves unrelated current content according to chosen mode.

## Dependencies and open questions

Tracked by SHO-131; depends on DESK-002/007/011/013/014 and WEB-010. Current-build validation and OQ5 remain prerequisites for live behavior.

