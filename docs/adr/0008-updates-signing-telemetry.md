# ADR-0008: Updates, signing, and telemetry

- Status: proposed
- Date: 2026-09-01

## Decision

Ship organization-signed Windows binaries and signed, expiring update metadata with hash, size, channel, minimum updater, and rollback protection. The app leaves no process running after close. Product analytics are off by default; necessary operational/security events are minimized and documented.

## Consequences

The operator must own protected signing credentials and a compromise/recovery procedure. Performance measurements do not depend on production user surveillance.

