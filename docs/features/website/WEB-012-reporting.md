# WEB-012 — Reporting and appeals

| Field | Value |
|---|---|
| ID | `WEB-012` |
| Owner | Trust and safety/product |
| Phase | Phase 1 |
| Status | Draft |

## Problem and user stories

Users, creators, and rightsholders need clear ways to report malware, cheating, IP infringement, impersonation, and unsafe content. As a reporter, I want acknowledgement and a scoped evidence path without exposing myself publicly.

## Scope and non-goals

**In scope:** Target/reason selection, evidence, contact/privacy choices, abuse controls, acknowledgement, status where lawful, emergency malware path, copyright/takedown intake, creator appeals, and moderator handoff.

**Non-goals:** Public accusation feeds, automatic guilt from report volume, or presenting this product flow as legal advice.

## States and primary flow

Reports are submitted, triaged, needs_information, linked/duplicate, escalated, actioned, closed, or appealed. The reporter chooses a precise target/reason, submits bounded evidence, receives a reference, and the system routes by policy/severity.

## Errors and offline behavior

Submission is idempotent and protects drafts from accidental duplication. Malware emergency paths degrade to a published security contact if the form fails. Reporting requires connectivity.

## Permissions

Public reporting may be allowed with rate/abuse controls; authenticated reporters receive limited status. Only appropriate staff see contact/evidence. Appeals require target ownership or authorized standing.

## Data and API

Uses reports, targets, reason taxonomy, reporter/contact, evidence references, moderation case links, status, notifications, retention/legal hold, and audit events. Planned submit/status/add-information/appeal contracts.

## Safety, privacy, and accessibility

Minimize reporter identity, strip unsafe media metadata, scan attachments, separate legal notices, and document retention. Forms expose clear labels, error summaries, focus management, and non-CAPTCHA accessible abuse controls.

## Telemetry

Report counts by category/severity, duplicate/abuse rate, response times, action/appeal outcomes, and form failures. Never expose reporter identities in product analytics.

## Acceptance criteria

- A valid report returns a stable reference without revealing staff or other reporter data.
- Duplicate/replayed submissions do not inflate enforcement signals.
- Malware and legal categories reach separate authorized queues with correct urgency.
- Reporter evidence is private, scanned, retention-controlled, and accessible only by capability.

## Dependencies and open questions

Depends on WEB-003/004/005/011, approved policies, legal contact/workflows, notification provider, and abuse/rate-limit ADR.

