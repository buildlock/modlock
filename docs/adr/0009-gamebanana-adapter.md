# ADR-0009: GameBanana adapter boundary

- Status: proposed pending written confirmation
- Date: 2026-09-01

## Decision

Represent GameBanana content as linked external records retaining canonical submission/file IDs, creator, license, source page, donation, and content-rating metadata. Resolve downloads from the authorized source at install time; do not mirror binaries without permission.

The adapter uses schema validation, caching, contract probes, retry/backoff, circuit breaking, last-known-good metadata, and a kill switch.

## Consequences

GameBanana outages and removals remain visible source failures rather than corrupt Modlock releases. Exact API, cache, attribution, and one-click requirements remain an external approval gate.

