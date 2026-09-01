# WEB-004 — Creator profile

| Field | Value |
|---|---|
| ID | `WEB-004` |
| Owner | Product and trust/web |
| Phase | Phase 1 |
| Status | Draft |

## Problem and user stories

Creators need authoritative attribution and players need to distinguish identity verification from artifact endorsement. As a creator, I want a controlled public profile and team roles so my releases and approvals are attributable.

## Scope and non-goals

**In scope:** Public name/bio/links, identity state, team maintainers, published mods, exact-version pack/preset approvals, donation links, and revoked/expired badge semantics.

**Non-goals:** Treating login as verification, implying sponsorship, public private-provider IDs, or direct messaging.

## States and primary flow

States are unverified, pending, verified, expired, revoked, suspended, and not-found. An owner creates a profile, proves control through an approved method, adds maintainers, and separately approves exact artifact versions.

## Errors and offline behavior

Failed verification never changes public state. Expired or revoked verification remains historically auditable but loses current badges. The public page may serve cached data with freshness metadata during provider outages.

## Permissions

Public read; authenticated owner manages profile; maintainers receive scoped capabilities; trust staff approve/revoke verification. High-risk changes require step-up authentication.

## Data and API

Uses users, identities, creators, creator_verifications, team roles, mods, and artifact approvals. Planned creator/profile and verification endpoints must separate private evidence from public claims.

## Safety, privacy, and accessibility

Provider subject IDs, contact details, and private verification evidence are never public. Badge text includes claim scope and expiry. Role/verification forms have labelled errors and predictable focus.

## Telemetry

Verification initiation/completion, role changes, approval/revocation, and profile publication as audit events; public analytics use aggregate profile views only.

## Acceptance criteria

- Identity verification and exact artifact approval are stored and displayed as different claims.
- A new pack/preset version does not inherit the previous version's approval.
- Revocation removes promotional badges without deleting historical audit evidence.
- Owners can export/delete eligible account data without exposing team members' private data.

## Dependencies and open questions

Depends on WEB-005, WEB-007, WEB-009, WEB-010, WEB-011, SHO-133, and the player/streamer consent policy in OQ6.

