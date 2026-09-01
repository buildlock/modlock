# Nonfunctional requirements

Status: binding design targets; measurements begin with implementation  
Last reviewed: 2026-09-01

| ID | Requirement |
|---|---|
| NFR-001 | Every supported game/config mutation is journaled, deterministic, validated, and recoverable after interruption. |
| NFR-002 | Untrusted inputs have explicit byte/count/depth/time/memory/path/network limits and never execute. |
| NFR-003 | Desktop is unprivileged, leaves no process after close, and meets the documented launch/memory/CPU/package gates. |
| NFR-004 | Local library/profile/config/recovery remains usable offline after required objects are present. |
| NFR-005 | Public collections are bounded cursor pages; clients never require a monolithic third-party catalog payload. |
| NFR-006 | Published hosted versions and exact approval records are immutable and content-digested. |
| NFR-007 | External outages/schema changes fail visibly and cannot drop license/rating/provenance/integrity checks. |
| NFR-008 | Website meets WCAG 2.2 AA; desktop supports keyboard, Windows UI Automation/screen readers, scaling, contrast, and reduced motion. |
| NFR-009 | Privacy defaults minimize collection; product analytics are off by default; diagnostics are previewed/consented/scrubbed. |
| NFR-010 | Privileged/publication/revocation/signing actions are least-privilege, step-up protected where appropriate, and audited. |
| NFR-011 | Service SLOs, backup/RPO/RTO, revocation propagation, and security incident targets are measured and drilled before beta. |
| NFR-012 | Contracts, database, updater, and client changes have explicit compatibility/versioning/migration/deprecation behavior. |
| NFR-013 | Logs/errors are actionable but exclude secrets, signed URLs, personal paths/configs, and unnecessary identity/content. |
| NFR-014 | Build/release artifacts have pinned dependencies, SBOM, provenance, signatures/hashes, and a compromise recovery path. |

