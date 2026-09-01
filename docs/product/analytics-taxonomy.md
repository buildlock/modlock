# Analytics and operational event taxonomy

Status: proposed; product analytics disabled by default  
Last reviewed: 2026-09-01

## Rules

- Security/audit/operational telemetry is separate from product analytics.
- Product analytics requires explicit informed opt-in and can be disabled/deleted where applicable.
- Never collect Steam library paths, CFG contents, installed-mod inventory, gameplay logs, IP beyond necessary short-lived abuse/security handling, full external URLs with tokens, or player behavior unrelated to Modlock.
- Prefer aggregate counters and coarse client major/platform/source classes.

## Operational metrics

| Event/metric | Purpose | Allowed dimensions |
|---|---|---|
| `api_request` | Availability/latency | route template, status class, region |
| `source_adapter_result` | External health | source, operation, result class, schema version |
| `scan_job_result` | Scanner capacity/safety | policy/scanner version, verdict, duration bucket |
| `install_resolution_result` | Resolver correctness | subject kind, source kind, result code |
| `security_action` | Audit/incident | actor role, action code, target kind, request ID |

## Optional product events

| Event | Question answered | Forbidden payload |
|---|---|---|
| `catalog_search` | Is search useful? | raw query by default; use privacy-reviewed categories/length |
| `release_plan_viewed` | Do users understand plans? | local inventory/path |
| `install_outcome` | Supported-flow reliability | mod list, CFG, personal Steam identity |
| `rollback_outcome` | Recovery reliability | file contents/path |
| `creator_publish_funnel` | Where do creators fail? | upload bytes, private license text/contact |
| `pack_resolution_outcome` | Source availability/conflict rate | user profile identity |

Event schemas, retention, sampling, consent text, and deletion behavior require privacy review before implementation. Development performance tracing stays local unless explicitly uploaded with a scrubbed diagnostic bundle.

