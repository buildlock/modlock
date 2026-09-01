# Backup, restore, and disaster recovery

Status: provider-neutral design  
Last reviewed: 2026-09-01

## Proposed objectives

| Data | RPO | RTO | Protection |
|---|---:|---:|---|
| PostgreSQL catalog/identity/moderation | 15 minutes | 4 hours | PITR + daily encrypted snapshot + separate account/region copy |
| Public immutable blobs | Near zero after publish | 8 hours | Object versioning/replication + digest inventory |
| Quarantine | 24 hours acceptable before publish | 24 hours | Lifecycle/versioning; creator can reupload |
| Signing metadata/root recovery | Zero | 4 hours | Offline/protected redundant custody |
| Audit/security evidence | 15 minutes | 8 hours | Append export to separate restricted destination |
| Search/cache/derived media | Rebuildable | 24 hours | Rebuild from source database/blobs |

Final objectives require owner/vendor approval.

## Restore drill

Quarterly before/after launch cadence as appropriate:

1. Restore database to an isolated account/environment and validate migrations/invariants/counts.
2. Reconcile every public blob reference and digest; find orphan/missing/mismatched objects.
3. Rebuild search/derived media and validate a catalog→resolve flow.
4. Verify revoked/private/quarantine access policies remain closed.
5. Verify audit continuity and signing metadata without using production signing keys.
6. Record achieved RPO/RTO, failures, owner, and remediation deadline.

Backups are not considered valid until restore evidence passes. Production credentials and customer data never enter developer machines during drills.

