# WEB-005 — Authentication and accounts

| Field | Value |
|---|---|
| ID | `WEB-005` |
| Owner | Platform and security |
| Phase | Phase 1 |
| Status | Draft |

## Problem and user stories

Creators and staff need secure accounts without forcing login for ordinary browsing. As a user, I want a supported identity method and visible session controls so I can manage my content safely.

## Scope and non-goals

**In scope:** Account creation/login, email/passkey or approved OAuth providers, account linking, short browser sessions, rotating refresh tokens, logout-all, recovery, desktop system-browser PKCE, MFA/step-up for privileged actions.

**Non-goals:** Assuming Steam OAuth approval, putting bearer tokens in custom URLs, or publishing provider identifiers.

## States and primary flow

States are anonymous, authenticating, active, step-up-required, recovery, locked/suspended, and error. The user authenticates through a trusted browser flow; the server binds a provider subject uniquely and issues scoped sessions.

## Errors and offline behavior

Provider outage preserves local desktop anonymous/offline functions but blocks authenticated mutations. Replayed/expired state is rejected. Account-link collisions require recovery, never silent merging.

## Permissions

Capability-based roles include user, creator owner, maintainer, moderator, takedown specialist, and administrator. Server checks are authoritative; UI hiding is not authorization.

## Data and API

Uses users, identities, sessions, recovery challenges, role grants, and audit events. Contracts require PKCE, anti-CSRF state, token rotation/reuse detection, idempotent linking, and session revocation.

## Safety, privacy, and accessibility

Secrets use approved password hashing or passkeys; desktop tokens use Windows credential protection. Minimize scopes. Login/recovery errors do not reveal account existence. All controls work without a mouse or provider pop-up assumptions.

## Telemetry

Security events for login success/failure buckets, token reuse, role/identity changes, recovery, and lockouts; never log tokens, codes, or complete provider payloads.

## Acceptance criteria

- Browsing and permitted downloads work without an account.
- OAuth/PKCE state is single-use, expires, and cannot place a token in a deep link.
- Logout-all invalidates existing refresh sessions.
- Privileged changes require fresh step-up authentication and an immutable audit event.

## Dependencies and open questions

Supports WEB-004/006/007/009/010/011/012 and desktop account linking. Provider and API-language decisions remain open; Steam OAuth is not assumed.

