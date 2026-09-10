# Error catalog

> Deferred API or real-corpus design. Current synthetic conformance is governed
> by [contracts/v1](../../contracts/README.md); archived outline schemas are
> not a second active format.


Status: initial stable namespace  
Last reviewed: 2026-09-01

Errors are represented by `docs/design/2026-09-01-contract-outline/schemas/error.schema.json`. Codes are machine-stable; messages are actionable/localizable. Security-sensitive details stay in restricted logs keyed by `request_id`.

| Namespace/examples | Meaning and client behavior |
|---|---|
| `VALIDATION_INVALID`, `VALIDATION_LIMIT` | Fix request/input; do not retry unchanged |
| `AUTH_REQUIRED`, `AUTH_EXPIRED`, `FORBIDDEN_ACTION` | Sign in/refresh or explain missing permission; no blind retry |
| `NOT_FOUND_*`, `GONE_REVOKED` | Missing versus intentionally unavailable/revoked are distinct |
| `CONFLICT_STATE`, `CONFLICT_VERSION` | Refresh exact state and show conflict resolution |
| `RATE_LIMITED` | Honor retry metadata; do not fan out |
| `SOURCE_UNAVAILABLE`, `SOURCE_SCHEMA_CHANGED`, `SOURCE_FILE_CHANGED` | Name external source; use safe stale/offline behavior; never silently substitute bytes |
| `SCAN_PENDING`, `SCAN_REJECTED`, `POLICY_BLOCKED` | Explain state/action/appeal without leaking exploit signatures |
| `PLAN_EXPIRED`, `PLAN_SIGNATURE_INVALID`, `PLAN_REPLAYED` | Refetch or stop; never install |
| `DOWNLOAD_INTEGRITY_FAILED` | Delete staged partial, stop, report source/file identity |
| `ARCHIVE_*`, `VPK_*` | Reject/stage safely and identify class/fixture-compatible diagnostic |
| `GAME_RUNNING`, `GAME_PATH_CHANGED`, `GAME_PATCH_UNKNOWN` | Wait/re-discover/safe-mode repair |
| `JOURNAL_RECOVERY_REQUIRED`, `ROLLBACK_FAILED` | Recovery UI takes priority; preserve evidence and prohibit new mutation |
| `CFG_OWNERSHIP_CORRUPT`, `CFG_EXTERNAL_CHANGE` | Stop and show diff/backup options |
| `INTERNAL_UNEXPECTED` | No unsafe retry; provide request/diagnostic ID |

Desktop domain errors may share these namespaces but are local typed values, not necessarily HTTP responses.

