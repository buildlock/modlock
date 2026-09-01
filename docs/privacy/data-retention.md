# Data retention, deletion, export, and legal holds

Status: proposed; counsel/operator values required  
Last reviewed: 2026-09-01

| Data | Proposed default | Deletion/export behavior |
|---|---|---|
| Account/profile | Account life + short recovery window | Export public/private account fields; anonymize/delete unless hold |
| Auth/session records | Short security window | Revoke immediately; delete on schedule |
| Published release/pack/preset metadata | Indefinite attribution/history while service operates | Delist; preserve minimal historical/license/audit record |
| Public hosted blobs | While referenced/authorized + dispute window | Remove access/lifecycle after refs and holds expire |
| Quarantine/rejected uploads | 30 days unless security/legal evidence | Creator may reupload; earlier delete request subject to hold |
| Scan reports/inventories | Life of public file + security window | Preserve minimized evidence; no public raw findings |
| Raw operational logs | 14–30 days | Not user export unless legally required; strict access |
| Aggregated operational metrics | 13 months or approved shorter | Non-identifying aggregate |
| Optional product analytics | Short approved window | Consent withdrawal and eligible deletion |
| Reports/moderation | Category/severity-specific, proposed 2–5 years | Restricted export; protect other parties/legal evidence |
| Takedown/legal hold | Required legal period | Hold overrides ordinary deletion; access logged |
| Audit events | Proposed 2 years; critical signing/publication longer | Append-only/minimized; restricted access |

Final periods and legal bases depend on jurisdiction/providers. Implement retention as tested jobs/storage lifecycle rules with hold exclusions and audit reports, not a prose promise. Account deletion produces a dry-run explaining public attribution, held evidence, external links, and irreversible effects.

