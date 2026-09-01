# WEB-007 — Release management

| Field | Value |
|---|---|
| ID | `WEB-007` |
| Owner | Platform and creator experience |
| Phase | Phase 1 |
| Status | Draft |

## Problem and user stories

Creators need immutable, attributable versions rather than mutable downloads. As a creator, I want to draft, validate, submit, publish, deprecate, or revoke a release so users can resolve an exact artifact and understand its history.

## Scope and non-goals

**In scope:** Version/changelog, variants/files, game-build compatibility, dependencies/conflicts, capabilities, license, scan status, submission, approval, publication, deprecation, revocation, and history.

**Non-goals:** Replacing published bytes, inheriting approval across versions, or silently moving pinned users/packs to latest.

## States and primary flow

The authoritative state machine is draft → uploading → quarantined → scanning → needs_creator_action/needs_moderation/rejected → approved → published → deprecated/revoked. Every transition records actor and reason.

## Errors and offline behavior

Invalid transitions return stable conflict errors. A failed publication retry is idempotent. External-source releases can become unavailable without being erased. Creator mutations require connectivity.

## Permissions

Owners/maintainers edit drafts; only authorized moderation/publishing policy transitions release public availability. Revocation overrides ordinary ownership and requires audit/step-up controls.

## Data and API

Uses mods, releases, files, variants, blobs/external refs, scan reports, licenses, compatibility, capability declarations, and audit events. Planned create/update/submit/publish/deprecate/revoke/detail/resolve contracts use optimistic concurrency.

## Safety, privacy, and accessibility

Only exact clean scan digests can publish. UI distinguishes scan, policy, compatibility, and source availability. Status changes and validation summaries are announced and do not rely on color.

## Telemetry

Time to first release, transition outcomes, creator-action cycles, publication/revocation/deprecation events, and resolution availability; moderation evidence remains outside product analytics.

## Acceptance criteria

- Published file bytes and hashes cannot be edited in place.
- Every public file maps to its exact clean scan report and license/provenance state.
- Replayed submit/publish requests do not create duplicate versions or events.
- Revocation immediately blocks new resolve responses while preserving internal evidence.

## Dependencies and open questions

Depends on WEB-004/005/006/008/011, DESK-004/005, SHO-127 contracts, and source/license policy.

