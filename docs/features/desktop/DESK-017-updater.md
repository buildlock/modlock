# DESK-017 — Signed updater

| Field | Value |
|---|---|
| ID | `DESK-017` |
| Owner | Windows shell/release engineering/security |
| Phase | Phase 2 |
| Status | Draft |

## Problem and user stories

Players need trustworthy app updates that do not require a resident agent or leave a broken client. As a player, I want signed stable/beta updates with clear release notes, deferred installation, and recovery.

## Scope and non-goals

**In scope:** Explicit/in-session check, signed expiring metadata, channel, minimum updater, size/hash, rollback protection, bounded download, staging, install-after-exit bootstrapper, atomic replacement/recovery, release notes, and manual package fallback.

**Non-goals:** Background service after close, unsigned/downgrade updates, certificate pinning, or using mod-content signing keys for application releases.

## States and primary flow

States are idle, checking, current, available, downloading, verified, ready_to_install, installing, recovering, complete, and failed. Client verifies metadata, downloads/stages payload, verifies hash/signature, exits, bootstrapper replaces atomically, and new client confirms health.

## Errors and offline behavior

Offline leaves current app functional and labels last check. Expired metadata, signature/hash mismatch, disk full, interrupted download/install, or failed health check never executes unverified bytes and invokes recovery/manual guidance.

## Permissions

Release pipeline signs; client verifies embedded trust roots. Local user controls channel/timing. Updater obtains only permissions needed for the chosen install scope and never weakens checks on request.

## Data and API

Signed update metadata includes version/channel/minimum updater/size/SHA-256/expiry/rollback counter/release URL. Local state tracks staged digest, prior version, attempt, and health acknowledgement.

## Safety, privacy, and accessibility

Separate least-privilege signing credentials, offline root recovery, SBOM/provenance, and compromise/revocation procedure are release gates. Progress/restart timing/release notes are accessible and user controlled.

## Telemetry

Opt-in check/download/install/health outcomes, versions/channels, and error categories; no machine identity beyond abuse-resistant coarse installation token if approved.

## Acceptance criteria

- Unsigned, expired, wrong-hash, wrong-channel, or rollback metadata cannot stage/execute.
- Interruption at every replacement step recovers old or verified new client.
- Closing Modlock leaves no updater/background process except the bounded user-approved replacement operation.
- Update UI supports keyboard/screen reader and never forces restart without consent.

## Dependencies and open questions

Depends on DESK-014/016, UI/packaging ADR SHO-130, code-signing ownership, SBOM/release CI, and pre-beta compromise drill.

