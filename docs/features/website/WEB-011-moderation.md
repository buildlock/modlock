# WEB-011 — Moderation console

| Field | Value |
|---|---|
| ID | `WEB-011` |
| Owner | Trust and safety/security |
| Phase | Phase 1 |
| Status | Draft |

## Problem and user stories

Public uploads require consistent decisions, evidence preservation, and rapid revocation. As a moderator, I want scoped queues and immutable evidence so I can act safely without being able to rewrite scanner results.

## Scope and non-goals

**In scope:** Queues for uploads, scans, identity, NSFW, reports, malware, takedowns, appeals; assignment; evidence; allow/reject/restrict/delist/revoke; hash blocks; notes; escalation; audit trail.

**Non-goals:** Direct blob/hash/scan editing, exposing sensitive evidence publicly, or using one broad administrator role for every action.

## States and primary flow

Cases are open, assigned, waiting_on_creator, escalated, actioned, appealed, resolved, or retained. Staff claim a case, review immutable evidence and policy version, select a reasoned action, trigger immediate resolution controls, and record notifications/appeal path.

## Errors and offline behavior

Actions use idempotency and optimistic concurrency; stale decisions require refresh. Emergency revocation is fail-closed and auditable. Console is unavailable offline and never caches unrestricted evidence on unmanaged devices.

## Permissions

Separate capabilities for ordinary moderation, malware, identity verification, takedown/legal, appeals, and administration. Step-up authentication applies to overrides, verification, revocation, and role changes.

## Data and API

Uses moderation_cases, reports, targets, evidence references, scan reports, policy versions, decisions, appeals, hash blocks, notifications, and immutable audit events. Planned queue/detail/assign/action/escalate/appeal routes.

## Safety, privacy, and accessibility

Least privilege, redaction, secure evidence links, no raw secrets, and protected staff identities where appropriate. Dense tables support keyboard navigation, filters, accessible status labels, and confirmation of destructive actions.

## Telemetry

Queue age, time to action, reversal/appeal rate, action categories, access denials, high-risk action alerts, and audit export health; evidence content is excluded from product analytics.

## Acceptance criteria

- No moderator can alter a scan attestation, original hash, or uploaded bytes.
- Revocation prevents new API resolution immediately and produces an audit event.
- Concurrent case actions cannot silently overwrite one another.
- Every action records actor, capability, policy version, reason, target, timestamp, and appeal state.

## Dependencies and open questions

Depends on WEB-005/006/007/008/012, security/legal policy, incident runbooks, and approved role matrix before beta.

