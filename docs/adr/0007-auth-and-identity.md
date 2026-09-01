# ADR-0007: Authentication, identity, and verification

- Status: proposed
- Date: 2026-09-01

## Decision

Use standards-based web authentication with passkey/email or an approved provider; desktop authorization uses the system browser with OAuth/OIDC PKCE. Steam/Discord identities may be linked but are not assumed to prove artifact endorsement. Verification of a public person and approval of an exact preset/pack version are separate records.

## Consequences

Steam OAuth partner access is not assumed. Tokens never travel in custom-protocol URLs. Privileged actions require step-up authentication and immutable audit events.

