# ADR-0011: bounded durable catalogue refresh

- Status: accepted
- Date: 2026-09-16

Source review and required PR/main checks passed for PR12. The hourly worker is
active; its first real run and clean termination were verified on September 16.
The [Infra activation record](https://github.com/buildlock/deadlock-infra/pull/116)
owns exact provider IDs, permissions, resource/cost evidence and rollback.

## Context

The first importer dropped previously valid profiles when they aged past 24
hours and exceeded a small detail budget. Repeating a daily batch could revisit
the same index prefix rather than finish enrichment. The owner approved ongoing
catalogue enrichment and automatic refresh after the website deployment.

## Decision

Use the same refresh engine for the local command and a separate scheduled
worker. Fully traverse both game indexes before changing publication. Queue
eligible profiles by oldest attempt time, persisting both successes and failures.
Fresh excluded profiles also get a 24-hour check interval. A failed row advances
in the queue; restarts resume from durable normalized checkpoints.

Retain a previously validated profile only while the complete current index
still explicitly permits it, its modification timestamp is unchanged, and its
actual profile check is less than seven days old. Preserve that check date.
Changed, restricted, ambiguous and omitted entries are withheld. Restriction
invalidates older cached approval. Missing entries are withdrawn without claiming
confirmed deletion; this is stricter publication behavior than the planned
adapter's two-signal source-deletion classification. Profile errors are counted,
not silently reported as success. Index and individual profile freshness differ.

One dedicated PostgreSQL session lock covers the run and publication. Each
attempt is durable; final snapshot replacement and checkpoint pruning are one
transaction. A process or connection failure releases the lock. A concurrent
invocation skips. Manual publication takes the same lock and rejects an older
snapshot. The cron login can update only catalogue tables, not account data.

Initial runtime target: one hourly run, 300 profiles, 120 pages per model,
one request at a time spaced at least 1.05 seconds apart, 15-second request
limits, two retries, five consecutive profile failures opening the circuit,
1,000 total HTTP attempts and a 20-minute run deadline. Bounds are 10,000 index
entries, 128 KiB per normalized profile checkpoint, 96 MiB of loaded checkpoints
and a 64 MiB publication. These are Modlock's limits, not provider guarantees.
Provider rate/cache permission questions from ADR-0009 remain unresolved;
this integration does not claim provider approval or a partnership.

The worker has no ingress or persistent volume and receives no sign-in secret.
`MODLOCK_CATALOG_REFRESH_ENABLED=0` is the kill switch. Migrations run through
the web release under the existing product owner; the worker cannot migrate.
The exact Railway target, resource and cost ceilings, source, dedicated grants,
rollback and first bounded-run result are recorded in Infra ADR-0019.
Normal page loads remain independent of the provider.

Regression evidence covers repeat-batch retention/fairness, negative results,
changed revisions, source withdrawals, failed walks, seven-day expiry, storage
failure, circuits and index/profile races. Disposable PostgreSQL checks cover
migration replay, lock recovery, durable checkpoints, atomic rollback and denied
account-table reads. See the [web runbook](../../apps/web/README.md) and
[current status](../../STATUS.md) for checks and activation.

The complete current index is reconciled before loading active checkpoints, so obsolete rows left by an interrupted replacement do not block recovery at entry or byte limits. The seven-day profile ceiling is also applied when serving pages, including during a prolonged index outage. The raw last publication remains intact for recovery.
