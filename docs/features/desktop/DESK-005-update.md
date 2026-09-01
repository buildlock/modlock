# DESK-005 — Update

| Field | Value |
|---|---|
| ID | `DESK-005` |
| Owner | Desktop core |
| Phase | Phase 2 |
| Status | Draft |

## Problem and user stories

Players need to know when a mod has a new immutable release without losing pinned profiles or rollback ability. As a player, I want to review a version diff and update one or many mods transactionally.

## Scope and non-goals

**In scope:** Explicit update check, pinned/unpinned behavior, changelog/compatibility/variant/conflict diff, batch planning, download reuse, profile migration preview, transaction, receipt, and rollback.

**Non-goals:** Silent updates, automatically changing pack-pinned versions, or equating a newer release with compatibility.

## States and primary flow

States are current, checking, update_available, pinned, incompatible, unavailable, confirming, updating, committed, and rolled_back. Refresh fetches metadata; the user selects releases, reviews aggregate consequences, and DESK-004 applies one desired-state transaction.

## Errors and offline behavior

Offline shows last check time and permits no claim of currentness. Partial batch download does not partially activate. Revoked current versions display policy state and safe options without silently deleting bytes.

## Permissions

Local user controls updates. Pack/version pins override general “latest” settings. Server metadata cannot force install or activation.

## Data and API

Uses local receipts/profile references plus planned release update/check and resolve contracts. Records previous/new digests and profile impacts for rollback.

## Safety, privacy, and accessibility

Re-run all install checks for new bytes; show capability, conflict, source, and content-warning changes. Batch review is a structured accessible list with per-item include/exclude.

## Telemetry

Opt-in check latency, update available/accepted/outcome, batch size bucket, rollback, and incompatibility category; exclude exact inventory.

## Acceptance criteria

- Pinned entries and immutable pack versions never move without explicit user action.
- A failed batch update leaves the previously active profile intact.
- Update review exposes changed variants, permissions/capabilities, conflicts, and compatibility.
- Offline/stale metadata never displays “up to date” without last-checked context.

## Dependencies and open questions

Depends on DESK-003/004/007/009/013/014 and WEB-007 release semantics.

