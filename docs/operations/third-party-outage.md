# Third-party source outage and schema-change runbook

Status: operational draft  
Last reviewed: 2026-09-01

1. Adapter schema validation or health detects availability/rate/schema/redirect failure.
2. Circuit-break the affected operation before corrupt normalized data/install plans are emitted.
3. Continue serving dated last-known-good public metadata when policy permits; label source and freshness.
4. Disable new resolution when file identity, rights, rating, or bytes cannot be verified. Existing local library remains usable offline.
5. Update status page with the named provider and affected operations.
6. Respect retry/backoff/rate instructions; do not amplify the outage.
7. Compare captured sanitized payloads/contracts, update adapter only after review/tests.
8. Re-enable gradually and reconcile removals/changes without silently overwriting immutable Modlock records.

Provider failure must never cause Modlock to mirror unauthorized files, omit attribution, downgrade NSFW/license state, or install bytes without the required confirmation/inspection.

