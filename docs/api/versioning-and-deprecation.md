# API versioning, errors, pagination, and deprecation

> Deferred API or real-corpus design. Current synthetic conformance is governed
> by [contracts/v1](../../contracts/README.md); archived outline schemas are
> not a second active format.


Status: proposed contract policy  
Last reviewed: 2026-09-01

- Base major path is `/v1`; portable schemas also declare `schema_version`.
- Collections use opaque cursor pagination with bounded `limit`; no unpaginated catalog endpoint.
- Error responses conform to `docs/design/2026-09-01-contract-outline/schemas/error.schema.json`; stable codes drive client behavior while messages are human-facing.
- Write operations support idempotency keys where retry could duplicate state.
- Security-sensitive resolve/upload URLs expire and are never cached as public metadata.
- Responses use explicit cache policy and ETag/conditional behavior where safe.
- Breaking changes receive a new major version. Additive optional fields may land within a version.
- Once public, deprecation announces replacement, affected operations, sunset date, migration examples, and support window through headers/docs/status/changelog.
- Emergency removal may override notice for malware/legal/platform safety; document the reason and client failure mode.
- Third-party adapter schemas are internal versioned contracts and can circuit-break independently of the public API.

## Error classes

`VALIDATION_*`, `AUTH_*`, `FORBIDDEN_*`, `NOT_FOUND_*`, `CONFLICT_*`, `GONE_*`, `RATE_LIMITED`, `SOURCE_*`, `SCAN_*`, `POLICY_*`, `PLAN_*`, `COMPATIBILITY_*`, and `INTERNAL_*`. Clients retry only when the envelope and operation semantics permit it.

