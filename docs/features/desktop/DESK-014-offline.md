# DESK-014 — Offline behavior

| Field | Value |
|---|---|
| ID | `DESK-014` |
| Owner | Desktop core/product |
| Phase | Phase 2 |
| Status | Draft |

## Problem and user stories

A local utility must remain useful when Modlock or third-party services are unavailable. As a player, I want clear local-versus-remote state and core management functions offline so an outage cannot strand my game configuration.

## Scope and non-goals

**In scope:** Local-first startup, freshness labels, cached metadata, library/profile/config/crosshair/repair functions, cached-object installs, queued non-critical refresh, source-specific health, and reconnect.

**Non-goals:** Claiming remote currentness, publishing/authenticating/resolving uncached files offline, or infinite caching of sensitive/signed data.

## States and primary flow

Connectivity is online, offline, limited, source_degraded, or reconnecting. The local library renders first; remote features show last-success time; eligible local actions proceed; reconnect refreshes explicitly or at modest in-session intervals.

## Errors and offline behavior

Network/DNS/TLS/source failures are categorized without blocking local operations. Expired signed resolution URLs are never reused. Retry uses backoff/cancellation and does not create duplicate mutations.

## Permissions

Offline sessions retain only already-established local capabilities. Privileged web/creator/moderation actions and token-sensitive changes require server authorization.

## Data and API

SQLite records cache source, fetched/expiry time, schema/version, last-known-good payload digest, and health. Immutable local objects remain independent of metadata cache.

## Safety, privacy, and accessibility

Never downgrade signature/hash/policy checks to make offline work. Connectivity/freshness uses text and timestamps, not color. Notifications avoid repetitive screen-reader announcements during flapping.

## Telemetry

Operational reconnect/source failure is recorded locally and uploaded only with telemetry consent after recovery; exclude endpoints containing signed state.

## Acceptance criteria

- App opens local library and profiles without waiting for network timeout.
- Cached-object profile switch, CFG edit, repair, and rollback succeed offline.
- Stale data is labelled with source and last-success time and never shown as current.
- Reconnect cannot replay expired resolutions or duplicate prior actions.

## Dependencies and open questions

Cross-cutting dependency for DESK-001/003/004/005/007/010/011/012/013/016/017. Cache retention and revocation TTL require ADRs.

