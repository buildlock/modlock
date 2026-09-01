# DESK-007 — Profiles

| Field | Value |
|---|---|
| ID | `DESK-007` |
| Owner | Desktop core/product |
| Phase | Phase 2 |
| Status | Draft |

## Problem and user stories

Players need reproducible mod/config sets for different use cases. As a player, I want named desired-state profiles that switch atomically and preserve exact versions, variants, order, and CFG choices.

## Scope and non-goals

**In scope:** Create/rename/duplicate/delete, entries/enabled state, exact release/file/variant, priority, CFG/crosshair selection, active profile, deterministic tree hash, import/export compatible subset, and switch rollback.

**Non-goals:** Embedding mod bytes in shared profiles, silently resolving latest, or allowing two simultaneous active profiles per game instance.

## States and primary flow

Profiles are valid, incomplete, incompatible, degraded, active, inactive, switching, or failed. Editing produces a desired manifest and diagnostics; activation resolves it, journals a complete sibling tree, and atomically switches.

## Errors and offline behavior

Known downloaded objects switch offline. Missing/revoked/unavailable required entries block with exact diagnostics; optional entries require explicit exclusion. Failed switch restores the prior active profile.

## Permissions

Local user owns profiles. Imported/share-code data is untrusted and previewed before persistence; remote packs cannot mutate a profile without confirmation.

## Data and API

SQLite plus versioned profile manifest with stable entry IDs, exact object hashes, source identities, enabled state, priorities, and CFG selection. Remote resolution is required only for missing objects.

## Safety, privacy, and accessibility

Validate size/schema/reference limits on import. Profiles remain local unless explicitly exported/shared. Reordering/editing/switch status has keyboard alternatives and structured error summaries.

## Telemetry

Opt-in profile count bucket, switch outcome/duration, incomplete reason, and import validation result; never profile contents.

## Acceptance criteria

- Same valid manifest and objects produce the same active-tree hash.
- Failed/interrupted switching restores or resumes to one coherent profile.
- Import never downloads or activates until the user reviews the resolved plan.
- Offline switching succeeds when every required object is local and valid.

## Dependencies and open questions

Depends on DESK-003/004/008/009/010/011/013/014 and SHO-127 profile schema.

