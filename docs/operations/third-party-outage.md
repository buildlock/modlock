# Third-party source outage and schema-change runbook

Status: operational draft  
Last reviewed: 2026-09-01

## Current catalogue refresher — 2026-09-16

Follow the [web runbook](../../apps/web/README.md). An incomplete index or storage
failure preserves the published snapshot. A complete index can withdraw restricted
or absent entries even if another profile fails. Unchanged public profiles retain
their original check date for at most seven days; failed and unchecked profiles
remain queued. Five consecutive profile failures end that run's enrichment.

The worker is disabled unless `MODLOCK_CATALOG_REFRESH_ENABLED=1`. Stop an active
run and disable that flag to pause it; keep publication and checkpoints. Confirm
current activation in [STATUS](../../STATUS.md). A broken database session
releases the worker lock automatically. The local file importer retains an
exclusive lockfile: verify the process is gone before removing its specific
stale lock. Do not delete the catalogue, weaken filtering, or increase request
rates to clear a backlog. A source-index timestamp older than two hours during
scheduled operation calls for log/provider inspection.

## Planned service operation

1. Adapter schema validation or health detects availability/rate/schema/redirect failure.
2. Circuit-break the affected operation before corrupt normalized data/install plans are emitted.
3. Continue serving dated last-known-good public metadata when policy permits; label source and freshness.
4. Disable new resolution when file identity, rights, rating, or bytes cannot be verified. Existing local library remains usable offline.
5. Update status page with the named provider and affected operations.
6. Respect retry/backoff/rate instructions; do not amplify the outage.
7. Compare captured sanitized payloads/contracts, update adapter only after review/tests.
8. Re-enable gradually and reconcile removals/changes without silently overwriting immutable Modlock records.

Provider failure must never cause Modlock to mirror unauthorized files, omit attribution, downgrade NSFW/license state, or install bytes without the required confirmation/inspection.
