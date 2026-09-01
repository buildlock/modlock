# Data model and ERD

Status: proposed logical model  
Last reviewed: 2026-09-01

```mermaid
erDiagram
    USERS ||--o{ IDENTITIES : authenticates
    USERS ||--o{ CREATOR_MEMBERSHIPS : joins
    CREATORS ||--o{ CREATOR_MEMBERSHIPS : has
    CREATORS ||--o{ CREATOR_VERIFICATIONS : verifies
    CREATORS ||--o{ MODS : owns
    MODS ||--o{ MOD_RELEASES : versions
    MOD_RELEASES ||--o{ RELEASE_FILES : contains
    BLOBS ||--o{ RELEASE_FILES : backs
    BLOBS ||--o{ SCAN_REPORTS : analyzed_by
    MODS ||--o{ EXTERNAL_REFS : links
    MOD_RELEASES ||--o{ COMPATIBILITY_REPORTS : tested_by
    CREATORS ||--o{ CFG_PRESETS : owns
    CFG_PRESETS ||--o{ CFG_PRESET_VERSIONS : versions
    CREATORS ||--o{ CROSSHAIRS : owns
    CROSSHAIRS ||--o{ CROSSHAIR_VERSIONS : versions
    CREATORS ||--o{ PACKS : owns
    PACKS ||--o{ PACK_VERSIONS : versions
    PACK_VERSIONS ||--o{ PACK_ITEMS : contains
    MOD_RELEASES ||--o{ PACK_ITEMS : references
    USERS ||--o{ REPORTS : submits
    REPORTS ||--o| MODERATION_CASES : opens
    USERS ||--o{ AUDIT_EVENTS : acts
```

## Invariants

1. Public release bytes and their blob digest never change.
2. One public hosted file has exactly one clean/approved scan attestation for the same blob and required scanner-policy version.
3. External references never imply redistribution rights.
4. Pack items reference immutable release/file identities or explicit third-party identities; no payload bytes live in a pack.
5. Artifact approval applies to one immutable preset/pack version, not an owner forever.
6. Revocation prevents new resolution but preserves evidence and audit history.
7. User authentication identity is private; public creator identity is a separate entity.
8. Hard deletion is prohibited for published/security/legal evidence until retention policy permits it.

## Lifecycle model

- Draft entities may be edited and deleted by owners.
- Submitted releases become immutable in identity and are state-transitioned through quarantine/scanning/moderation.
- Published records may be deprecated or revoked, not rewritten.
- User deletion anonymizes eligible personal account fields while retaining minimized legal/security/audit records according to the approved retention schedule.
- Third-party snapshots retain a payload digest and observation time, not necessarily the entire upstream response indefinitely.

