# Risk register

Status: active  
Last reviewed: 2026-09-01

Scores: probability and impact are 1–5; exposure is their product. Review high exposure (12+) at every milestone.

| ID | Risk | P | I | Exposure | Mitigation / evidence | Trigger | Owner |
|---|---|---:|---:|---:|---|---|---|
| R-001 | Valve disallows or restricts relevant mod behavior | 3 | 5 | 15 | Conservative boundary; outreach; kill switches | Guidance/enforcement/game change | Product/operator |
| R-002 | Game patch breaks search path/config/VPK loading | 5 | 4 | 20 | Build detection, safe mode, semantic patch, fixtures, rollback | New build or digest change | Desktop |
| R-003 | Installer corrupts game/user config | 3 | 5 | 15 | Journal, snapshots, atomic activation, failure injection | Any ambiguous recovery | Desktop/security |
| R-004 | Malicious archive/parser exploit | 4 | 5 | 20 | Limits, isolation, fuzzing, no execution, external review | Crash/findings/new CVE | Security |
| R-005 | GameBanana API/terms change | 4 | 4 | 16 | Written confirmation, adapter, cache, circuit breaker, fallback | Schema/terms/availability change | Platform/product |
| R-006 | Third-party binary changes behind URL | 3 | 5 | 15 | Stable IDs/hashes when possible, fresh local scan, confirmation | Hash mismatch/no immutable identity | Platform/desktop |
| R-007 | Copyright/trademark claims | 4 | 4 | 16 | Rights declarations, attribution, takedown/counter process, counsel | Notice/report/creator dispute | Trust/legal |
| R-008 | Cheat/competitive-advantage content | 4 | 5 | 20 | Effect-based policy, capability scan, review, emergency revoke | Report/new mod technique | Trust/security |
| R-009 | Fake pro/streamer endorsement | 4 | 4 | 16 | Identity separate from exact-version approval/expiry | Dispute/stale source | Trust/product |
| R-010 | Windows app misses footprint promise | 3 | 4 | 12 | Realistic native benchmark and hard gates | Gate failure/reference drift | Desktop/product |
| R-011 | GPL contamination | 2 | 5 | 10 | Clean-room evidence, contributor rules, dependency review | Similar code/provenance uncertainty | Engineering/legal |
| R-012 | Signing/update channel compromise | 2 | 5 | 10 | Offline root/recovery, scoped keys, signed metadata, drills | Key anomaly or unauthorized release | Security/operator |
| R-013 | Account/moderator takeover | 3 | 5 | 15 | Passkeys/MFA, step-up, least privilege, audit, response | Suspicious privileged action | Security |
| R-014 | Data loss/corrupt restore | 2 | 5 | 10 | PITR/versioning/backups/restore drills | Restore test failure | Operations |
| R-015 | Privacy overcollection | 3 | 4 | 12 | Opt-in analytics, minimization, retention/deletion specs | New event/data integration | Product/privacy |
| R-016 | Pilot lacks licensed representative content | 4 | 3 | 12 | Synthetic corpus; creator outreach/consent | Insufficient fixture coverage | Product/operator |
| R-017 | Crosshair/CFG values become stale/unsafe | 5 | 3 | 15 | Build-pinned signed registry, allowlist, expiry, unknown default | Game build/change report | Game data/trust |
| R-018 | Scanner backlog/egress cost overwhelms service | 3 | 3 | 9 | Quotas, direct upload, deduplication, capacity/SLO monitoring | Queue/cost threshold | Platform/operations |
| R-019 | Scope expansion delays reliable core | 4 | 4 | 16 | Phase gates, non-goals, feature IDs, no UI before recovery spine | Unplanned feature enters milestone | Product |
| R-020 | Single-person operational dependency | 4 | 4 | 16 | Runbooks, least privilege, recovery contacts, backups, staged launch | Unavailable owner/incident | Operator |

