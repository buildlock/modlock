# WEB-009 — Pack publishing

| Field | Value |
|---|---|
| ID | `WEB-009` |
| Owner | Product, platform, and trust |
| Phase | Phase 3 |
| Status | Draft |

## Problem and user stories

Curators and players need reproducible collections without unauthorized rebundling. As a curator, I want to publish a versioned reference manifest so players can review and install the exact authorized files and load-order choices.

## Scope and non-goals

**In scope:** Draft/version, referenced source/release/file/variant, required/optional flag, priority, conflicts/replacements, creator approval state, compatibility, resolution preview, publish/deprecate/revoke, and Grimoire-compatible export subset.

**Non-goals:** Embedding third-party binaries, silently following latest, inheriting player endorsement, or bypassing individual file policy.

## States and primary flow

States are draft, resolving, incomplete, needs_approval, publishable, published, degraded, expired, deprecated, and revoked. The curator selects exact references, resolver checks availability/policy/conflicts, required approvals are recorded per immutable version, then the version publishes.

## Errors and offline behavior

Missing/revoked items mark the pack degraded and block or warn according to required status. A provider outage shows last-known state and prevents a new authoritative resolution. Authoring is online-only.

## Permissions

Owners/maintainers author; referenced mod creators retain their own rights; verified-player artifact approval is exact-version and separately authorized; moderators can delist/revoke.

## Data and API

Uses packs, pack_versions/items, release/external references, variants, priority, approvals, conflicts, compatibility, and audit events. Planned pack CRUD, validate, publish, resolve, approval, and export contracts.

## Safety, privacy, and accessibility

Show every author, host, warning, capability, size, and unresolved conflict before install. Do not expose private approval evidence. Ordered items and validation errors are keyboard reorderable and screen-reader legible.

## Telemetry

Pack publish/resolve outcomes, unavailable-item rate, approval freshness, conflict rate, and install handoff completion; avoid tracking individual users' pack inventories by default.

## Acceptance criteria

- A published pack pins exact immutable identities and never contains mod payload bytes.
- Updating any item requires a new pack version and, where relevant, new approval.
- Resolver blocks revoked/prohibited required items and identifies unavailable optional items.
- Exported profiles preserve attribution and validate against the supported interoperable schema.

## Dependencies and open questions

Depends on WEB-003/004/007/011, DESK-012, SHO-127, SHO-133, GameBanana terms, and the Grimoire compatibility subset decision.

