# FEATURE-ID — Feature name

| Field | Value |
|---|---|
| ID | `FEATURE-ID` |
| Owner | Workstream |
| Phase | Phase N |
| Status | Draft |

## Problem and user stories

State the user problem, followed by testable stories in “As a … I want … so that …” form.

## Scope and non-goals

**In scope:** Define the smallest complete behavior.

**Non-goals:** Identify adjacent behavior this feature must not absorb.

## States and primary flow

List visible states and the normal sequence, including confirmation and completion for mutations.

## Errors and offline behavior

Define failure, stale-data, retry, cancellation, and offline behavior. Never collapse `unknown` into success.

## Permissions

List public, authenticated, ownership, and privileged capabilities. Server authorization is authoritative.

## Data and API

Name entities, contract operations, idempotency/versioning requirements, and local state where relevant. Planned contracts must be labelled planned.

## Safety, privacy, and accessibility

Define security/trust boundaries, minimum data collection, keyboard/screen-reader behavior, focus, announcements, and non-color cues.

## Telemetry

List privacy-minimized product and operational events. Do not include local paths, CFG contents, tokens, or signed URLs.

## Acceptance criteria

- Use observable, automatable outcomes.
- Cover the happy path, denial, error, retry/offline, and accessibility behavior.

## Dependencies and open questions

Link feature IDs, Linear work, architecture decisions, policy decisions, and unresolved external contracts.

