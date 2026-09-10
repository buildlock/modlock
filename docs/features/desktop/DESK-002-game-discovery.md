# DESK-002 — Game discovery

| Field | Value |
|---|---|
| ID | `DESK-002` |
| Owner | Desktop core |
| Phase | Phase 2 |
| Status | Draft |

## Problem and user stories

Deadlock may live in any Steam library. As a player, I want Modlock to find and validate each installation so operations target the intended game build safely.

## Scope and non-goals

**In scope:** Steam registry location, real VDF parsing, appmanifest 1422450 lookup, canonicalized install roots, expected-file validation, build/depot metadata, multiple instances, validated manual override, and game-running detection.

**Non-goals:** Broad disk scanning, guessing from folder names, unsupported network/device paths, or changing Steam configuration.

## States and primary flow

States are scanning, found, multiple_found, not_found, invalid, moved, patch_changed, and game_running. Discovery reads Steam metadata, validates candidates, assigns stable local instance IDs, and lets the user choose a default.

## Errors and offline behavior

Works offline. Malformed VDF/ACF, inaccessible folders, stale manifests, or moved libraries return specific repair guidance. Last-known instances remain recorded but never treated as valid without recheck.

## Permissions

Read-only discovery. Later mutations require an exclusive per-instance lock and validated ownership/path; no elevation.

## Data and API

Stores canonical root, Steam library identity, appmanifest/build/depot metadata, validation time, managed-file digests, and default selection in SQLite. No remote API.

## Safety, privacy, and accessibility

Reject UNC/device/reparse ambiguity by default, handle Unicode/long paths, and never transmit local paths. Present multiple instances by safe human labels and build details; discovery progress/errors are announced.

## Telemetry

Opt-in outcome/error buckets, number-of-instances bucket, and duration; never paths, Windows user names, or Steam identity.

## Acceptance criteria

- Finds valid app 1422450 installs across multiple fixture libraries with a real VDF parser.
- Rejects lookalike, moved, UNC/device, and malformed candidates without writes.
- Detects the running game before any unsafe mutation.
- Re-discovery updates build/path state without losing profile associations silently.

## Dependencies and open questions

Accepted PR7's [synthetic discovery proof](../../testing/steam-discovery-proof.md) implements
bounded KeyValues parsing, multiple registered fixture libraries, app/build/depot
metadata, fresh override validation and missing/moved/lookalike rejection without
writes. Independent review and all PR/main Linux/Windows checks passed. Tests use authored
metadata and exact inert evidence markers; current Valve file compatibility,
Steam registry lookup, persistent associations and game-running detection are
not implemented or inferred. This feature remains incomplete.

Tracked by SHO-128; supports DESK-001/004/007/013. Network-library support is explicitly deferred.
