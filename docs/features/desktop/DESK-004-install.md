# DESK-004 — Install

| Field | Value |
|---|---|
| ID | `DESK-004` |
| Owner | Desktop core/security |
| Phase | Phase 2 |
| Status | In_progress |

## Problem and user stories

Players need one-click convenience without risking an unrecoverable game tree. As a player, I want to review an exact install plan and have Modlock verify, stage, activate, or roll back it transactionally.

## Scope and non-goals

**In scope:** Resolve exact file/variant, confirmation, bounded download, size/hash/signature validation, safe ZIP/raw/split-VPK inspection, staging, conflict plan, journal, activation, verification, receipt, cancellation, recovery.

**Non-goals:** Streaming into the active tree, modifying base `pak01_dir.vpk`, running downloaded code, elevation, or RAR/7z until approved.

## States and primary flow

States are resolving, confirming, downloading, verifying, extracting, planning, journaled, activating, validating, committed, cancelling, failed, and rolled_back. The authoritative sequence follows the desktop technical design transaction steps.

## Errors and offline behavior

Wrong hash/size/host, unsafe paths, malformed VPK, disk full, locked file, antivirus quarantine, game running, or network loss stop safely. Downloaded/imported verified objects may install offline; new remote resolution cannot.

## Permissions

Local user confirms exact plan. Core owns filesystem mutation behind a per-instance OS lock. Server resolution cannot choose arbitrary local paths; UI cannot bypass parser/policy.

## Data and API

Consumes signed planned release/pack resolution contracts and writes objects, inventories, transaction journal, desired profile, receipts, and managed-file digests to local storage.

## Safety, privacy, and accessibility

Bounded streaming, path/reparse defenses, local reinspection, fsynced journal, game-closed check, and reversible writes are mandatory. Progress names stages and offers accessible cancellation without losing recovery state.

## Telemetry

Opt-in stage durations, outcome/error categories, rollback result, bytes buckets, and client/parser versions; never URLs, filenames, paths, or inventory contents.

## Acceptance criteria

- Termination after every mutation step resumes safely or restores the original tree.
- Hash/size/signature/host mismatch prevents activation.
- Unsupported/unsafe archive entries never escape fresh staging.
- Same manifest produces the same active-tree hash and receipt.

## Dependencies and open questions

Current partial evidence: the [synthetic journal proof](../../testing/synthetic-journal-proof.md)
implements only bounded inert-tree activation, locking, validation and recovery.
Its abrupt-termination suite covers the first acceptance criterion for that
single-use scope. Download/host/signature/archive/game and UI criteria remain open.

Core contracts SHO-127, fixtures SHO-124, journal SHO-129, discovery SHO-128, DESK-008/009/013/015. OQ4 controls RAR/7z.
