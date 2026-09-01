# DESK-015 — Deep links

| Field | Value |
|---|---|
| ID | `DESK-015` |
| Owner | Desktop core/platform/security |
| Phase | Phase 2 |
| Status | Draft |

## Problem and user stories

Players need a safe bridge from web/GameBanana pages to the desktop. As a player, I want an Open in Modlock action that identifies an exact release or pack but always lets me review the server-resolved plan before mutation.

## Scope and non-goals

**In scope:** Canonical `modlock://` scheme, release/pack opaque IDs, one-time nonce/state, single-instance forwarding, length/character validation, replay/expiry protection, HTTPS exchange, confirmation, and fallback guidance.

**Non-goals:** Accepting arbitrary URL/hash/path/filename from the link, automatic install on invocation, bearer tokens in URLs, or impersonating another manager scheme.

## States and primary flow

States are received, validating, exchanging, expired, invalid, resolved, confirming, and handed_off. OS passes the URI; one app instance validates grammar; API exchanges opaque state; user sees exact DESK-004/DESK-012 plan.

## Errors and offline behavior

Malformed/oversized/replayed/expired links fail before network or mutation. Offline links cannot resolve unless a future signed self-contained format is explicitly designed; show canonical web fallback/reference ID.

## Permissions

URI invocation is untrusted public input. Server state/ownership/policy and local user confirmation are authoritative. Desktop auth uses separate system-browser PKCE flow.

## Data and API

Consumes one-time resolution state mapped to release/pack IDs and returns signed expiring install plans. Local audit stores only coarse outcome/reference, not bearer state or signed URL.

## Safety, privacy, and accessibility

Strict parser, allowlisted route kinds, replay store, no side effect before review. Confirmation receives focus, reads source/author/warnings, and cannot be bypassed by rapid/repeated invocations.

## Telemetry

Opt-in invocation kind, validation/error category, resolution outcome, and handoff completion; never record full URI/nonces.

## Acceptance criteria

- Link-controlled text cannot choose a local path, download host, hash, or automatic action.
- Nonces are one-time and expired/replayed links cannot resolve.
- Multiple simultaneous invocations serialize safely through one app instance.
- A valid link always shows a complete confirmation plan before DESK-004/012.

## Dependencies and open questions

Depends on WEB-003/009/010, DESK-004/012, WEB-005 for account flows, SHO-125 GameBanana registration, and SHO-127 contracts.

