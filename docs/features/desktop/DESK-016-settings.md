# DESK-016 — Settings and diagnostics

| Field | Value |
|---|---|
| ID | `DESK-016` |
| Owner | Desktop product/core |
| Phase | Phase 2 |
| Status | Draft |

## Problem and user stories

Players need control over storage, update channel, privacy, game instances, logs, and recovery evidence. As a player, I want settings with safe defaults and redacted diagnostics so I can configure and troubleshoot the app without exposing secrets.

## Scope and non-goals

**In scope:** Game/default profile, storage/cache limits, cleanup preview, stable/beta channel, launch/notification/accessibility preferences, telemetry consent, account/session link, version/build/SBOM summary, source health, integrity check, redacted diagnostic export, and reset.

**Non-goals:** Hidden performance toggles, deleting data without preview, editing security hard ceilings, or exporting tokens/CFG/private paths.

## States and primary flow

Settings are loading, saved, dirty, validating, restart_required, applying, and error. Most values save transactionally; risky storage/game changes show consequences. Diagnostics can preview redactions before export.

## Errors and offline behavior

Local settings/diagnostics work offline; account/source checks display last-known state. Invalid paths/limits/channels do not partially apply. Reset preserves user game files and offers scoped choices.

## Permissions

Local user changes local settings. Account/session changes require WEB-005 authorization. Release channel never disables signature verification.

## Data and API

Versioned local settings in SQLite/config, Windows credential storage for tokens, rolling privacy-filtered logs, cache/source health, app/parser/registry versions, and optional account endpoints.

## Safety, privacy, and accessibility

Privacy off by default where required; no raw paths/tokens/CFG/signed URLs in logs. Settings are searchable, keyboard operable, labelled, respect OS contrast/text/motion, and explain restart requirements.

## Telemetry

Consent change, settings validation failures, diagnostic generation, cleanup outcome, and source-health buckets; never export/upload diagnostics without explicit action.

## Acceptance criteria

- Diagnostic preview/export contains no tokens, signed URLs, raw CFG, Steam IDs, or complete local paths.
- Invalid setting changes leave the prior persisted values intact.
- Cache cleanup shows referenced/unreferenced bytes and never removes active/shared objects.
- Telemetry can be declined/revoked without losing core local functionality.

## Dependencies and open questions

Depends on DESK-002/003/013/014/017 and privacy, cache-retention, logging, and support ADRs.

