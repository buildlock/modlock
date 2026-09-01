# Data dictionary

Status: proposed  
Last reviewed: 2026-09-01

All primary keys are opaque sortable IDs. All timestamps are UTC. Tables include `created_at`; mutable tables also include `updated_at` and optimistic versioning where concurrent edits matter.

| Table | Purpose | Critical fields and constraints | Retention/deletion |
|---|---|---|---|
| `users` | Private account | status; display handle; unique normalized handle | Delete/anonymize on request subject to holds |
| `identities` | Login-provider binding | user, provider, unique provider subject; encrypted token metadata only when needed | Revoke/delete with account |
| `creators` | Public individual/team profile | slug, public name, status | Preserve attribution; delist if required |
| `creator_memberships` | Team roles | creator, user, role; unique pair | Audit changes |
| `creator_verifications` | Identity evidence | method, state, reviewer, evidence ref, expiry/revocation | Preserve decision evidence per policy |
| `mods` | Stable catalog identity | creator, slug, title, source kind, status, rating | Delist/revoke; do not reuse slug/id silently |
| `mod_releases` | Immutable version metadata | mod, version, state, compatibility, changelog; unique mod/version | Preserve published history |
| `release_files` | Release variant/file | release, blob/external ref, filename, size, digest, scan state | Immutable after publication |
| `blobs` | Exact stored bytes | unique SHA-256, size, quarantine/public object keys, media type | Lifecycle after all refs/holds expire |
| `scan_reports` | Automated evidence | blob, scanner build, policy version, inventory digest, verdict/findings | Security evidence retention |
| `external_refs` | Third-party identity | provider, remote type/id/file id, canonical URL, observed time/payload digest | Refresh; tombstone removals |
| `licenses` | Rights declaration | SPDX/custom terms, redistribution, source, captured terms digest | Preserve version shown at publication |
| `heroes`, `categories`, `tags` | Taxonomy | canonical key, label, aliases, source snapshot | Version/deprecate; never reuse meaning |
| `compatibility_reports` | Game-build evidence | subject version, build, result, evidence, reporter class | Preserve for reproducibility |
| `cfg_presets` | Stable preset identity | owner, status, verification class | Delist/revoke |
| `cfg_preset_versions` | Immutable typed values | preset, values JSON, registry version, tested build, approval | Preserve version history |
| `crosshairs` | Stable crosshair identity | owner, title, status | Delist/revoke |
| `crosshair_versions` | Immutable typed values | values JSON, preview blob, build, approval | Preserve version history |
| `packs` | Stable collection identity | owner, title, status | Delist/revoke |
| `pack_versions` | Immutable pack manifest | pack, version, manifest digest, approval/expiry | Preserve version history |
| `pack_items` | Referenced content | pack version, source/release/file/variant, required, priority | Immutable with pack version |
| `reports` | User safety/legal intake | reporter optional, target, reason, evidence refs, state | Retain per category/policy |
| `moderation_cases` | Decision workflow | report, assignee, policy code/version, decision, appeal | Preserve audit/legal evidence |
| `takedowns` | Copyright/legal process | claimant contact protected, target, notice/counter-notice, deadlines | Legal retention/hold |
| `audit_events` | Privileged/domain changes | actor, action, target, before/after digests, request ID | Append-only, separate export |
| `download_events` | Privacy-minimized metrics | day bucket, release/source, client major, count | Aggregate quickly; discard raw identifiers |
| `upload_sessions` | Scoped multipart flow | owner, draft release, object key, limits, expiry, completion state | Short TTL after completion/abandonment |
| `jobs` | Durable background work | type, payload ref, idempotency key, lease, attempts, result | Operational TTL after audit summary |

## Migration rules

- Migrations are forward-only in production with an explicit rollback/restore plan.
- Destructive changes use expand/migrate/contract across at least two compatible releases.
- Database constraints enforce immutability/publication invariants; application checks alone are insufficient.
- Long migrations are resumable, observable, and tested on production-sized synthetic data.
- Every migration states privacy/retention impact and whether old clients remain compatible.

