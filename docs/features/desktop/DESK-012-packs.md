# DESK-012 — Pack install

| Field | Value |
|---|---|
| ID | `DESK-012` |
| Owner | Desktop core/product |
| Phase | Phase 3 |
| Status | Draft |

## Problem and user stories

Players need one-click collections without hiding authors, unavailable items, conflicts, or redistribution. As a player, I want to resolve a versioned reference pack into an exact reviewable plan and install it transactionally.

## Scope and non-goals

**In scope:** Import/open pack version, schema/size validation, exact item resolution, required/optional handling, author/host/size/warning display, variants, priority/conflicts, user substitutions/exclusions, profile creation/update, receipt, and compatible Grimoire import.

**Non-goals:** Bundled payload ZIPs, silently following latest, bypassing individual scan/policy, or implying creator/player endorsement beyond exact approval state.

## States and primary flow

States are resolving, complete, degraded, blocked, confirming, downloading, installing, committed, and rolled_back. The app validates manifest, resolves every item, presents aggregate and per-item consequences, then uses one DESK-004 desired-state transaction.

## Errors and offline behavior

Fully local imported packs can preview offline; only locally cached exact objects can install. Missing/revoked required entries block; optional entries require visible exclusion. Provider failure retains last-known identities but not a fresh successful resolution.

## Permissions

Local user must confirm. Pack authors cannot grant file rights or override source policy. Imported extension fields are ignored unless namespaced/supported.

## Data and API

Consumes pack version/resolve contracts and Grimoire-compatible reference subset; produces profile manifest, per-item resolutions, object refs, conflicts, substitutions, and receipt.

## Safety, privacy, and accessibility

Enforce schema/decompressed share-code limits, allowed providers, exact hashes when available, and local reinspection. Large review lists expose headings, required/optional labels, and accessible inclusion controls.

## Telemetry

Opt-in resolve/install outcome, unavailable required/optional counts, provider failures, conflict/substitution rate; do not upload local resulting inventory.

## Acceptance criteria

- No item downloads or activates before complete plan review and confirmation.
- Revoked/prohibited required entries prevent install; excluded optional items appear in receipt.
- Same immutable pack version and choices produce the same profile manifest.
- Imported data cannot specify arbitrary URLs, local paths, executable steps, or unknown automatic extensions.

## Dependencies and open questions

Depends on WEB-009, DESK-004/007/008/009/013/014/015, SHO-125/127, and Grimoire subset ADR.

