# Versioning, release, migration, and deprecation policy

Status: proposed  
Last reviewed: 2026-09-01

- Public API and portable schemas use explicit versions; breaking changes require a new major/schema version.
- Desktop uses semantic versioning after `1.0`; pre-1.0 releases still document compatibility impact.
- Hosted mod/pack/preset versions are creator-supplied immutable labels plus internal opaque version IDs; Modlock does not reinterpret creator version ordering without explicit metadata.
- Stable and beta client channels are separate. Stable never installs beta implicitly and no channel silently downgrades.
- API breaking-version support and end dates are announced in advance once public; security emergency exceptions are documented.
- Database changes follow expand/migrate/contract and include restore/rollback evidence.
- Update metadata states minimum supported updater/client and expires. Clients reject rollback/freeze attacks according to the signing design.
- Every release includes changelog, known issues, supported Windows/game builds, migrations, SBOM, signatures/hashes, test evidence, rollback steps, and support status.

