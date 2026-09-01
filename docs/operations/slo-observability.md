# Service levels and observability

Status: proposed beta objectives  
Last reviewed: 2026-09-01

| Journey | SLI | Initial objective |
|---|---|---|
| Public catalog | Successful eligible requests / total | 99.9% monthly |
| Install resolution | Valid non-policy-failed plans / eligible requests | 99.9% monthly |
| Hosted download | CDN/object successful bytes/requests | 99.95% monthly |
| Upload completion | Accepted quarantine completion / valid attempts | 99.5% monthly |
| Scan latency | Time quarantine complete → decision | 95% under 10 minutes |
| Revocation propagation | Decision → resolver/client metadata block | 99% under 5 minutes |

Third-party availability is reported separately and does not hide behind Modlock service availability.

## Signals

- RED metrics for API/routes; saturation and lease age for queues/workers.
- Source-adapter schema, rate, latency, stale age, and circuit state.
- Object/storage errors, scan verdict/limit classes, DB pool/query/migration health.
- Auth privileged failures, moderation/revocation propagation, update metadata age/signature failures.
- Desktop performance measured locally/release labs; opt-in aggregate reliability only after privacy approval.

## Alerting

Page only on actionable user/security/SLO threats: signed metadata invalid/expired, revocation failure, quarantine exposure, severe auth anomaly, DB/storage unavailability, sustained resolver/error-budget burn, or scanner backlog beyond safety threshold. Ticket lower-severity trends.

Logs/traces/metrics use stable request/job/resolution IDs and allowlisted fields. Dashboards must distinguish Modlock, provider, and client/game failures.

