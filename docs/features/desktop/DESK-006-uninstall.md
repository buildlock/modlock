# DESK-006 — Uninstall

| Field | Value |
|---|---|
| ID | `DESK-006` |
| Owner | Desktop core |
| Phase | Phase 2 |
| Status | Draft |

## Problem and user stories

Players need to remove a mod without deleting shared objects, unrelated files, or rollback history accidentally. As a player, I want to understand profile references and choose deactivation, profile removal, or full local cleanup.

## Scope and non-goals

**In scope:** Impact preview, remove from one/all profiles, active-tree rebuild, shared reference counting, optional safe object garbage collection, receipt/history preservation, and rollback.

**Non-goals:** Deleting unknown files, removing another manager's content, or silently purging shared/downloaded objects.

## States and primary flow

States are installed, referenced, confirming, deactivating, removed_from_profile, locally_retained, garbage_collectable, deleted, and rolled_back. The user selects scope, reviews dependencies/shared references, and commits a desired-state transaction.

## Errors and offline behavior

Works offline. Locked files/game running/disk errors preserve original state or roll back. Unknown/unowned files block deletion and are reported for manual review.

## Permissions

Local user only; no remote source can trigger uninstall. Filesystem deletion is limited to paths and digests owned by a valid receipt/journal.

## Data and API

Uses profiles, entries, objects, reference counts, install receipts, active tree, journal, and backups. No remote API is required.

## Safety, privacy, and accessibility

Exact deletion plan, ownership validation, recoverable transaction, and shared-reference checks are mandatory. Confirmation distinguishes “remove from profile” from “delete downloaded bytes” in text.

## Telemetry

Opt-in outcome/error category and cleanup bytes bucket; no mod identity or path by default.

## Acceptance criteria

- Uninstall deletes only files whose ownership/digest is proven by Modlock state.
- Shared objects remain until no profile/history policy references them and the user approves cleanup.
- Failure during active-tree rebuild restores the previous active state.
- Full operation works offline and with keyboard/screen reader.

## Dependencies and open questions

Depends on DESK-003/007/013 and local retention/garbage-collection ADR.

