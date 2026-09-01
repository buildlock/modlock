# DESK-008 — Load order

| Field | Value |
|---|---|
| ID | `DESK-008` |
| Owner | Desktop core/product |
| Phase | Phase 2 |
| Status | Draft |

## Problem and user stories

VPK order can determine which conflicting asset wins. As a player, I want explicit, stable priority controls and a generated-order preview so profile behavior is understandable and reproducible.

## Scope and non-goals

**In scope:** Integer priority, accessible reorder controls, stable immutable-ID tie break, generated VPK names/order, capacity warnings, conflict consequence preview, and deterministic persistence.

**Non-goals:** Implicit order based on download time, silent conflict resolution, or VPK merging in V1.

## States and primary flow

States are ordered, tied, over_capacity, conflict_affected, dirty, validating, and applied. The user reorders enabled entries; resolver computes deterministic sequence and conflict winners; activation occurs only through a profile transaction.

## Errors and offline behavior

Fully offline. Invalid priorities, missing entries, capacity limits, or inconsistent split packages block application with remediation. Cancellation leaves the current active order unchanged.

## Permissions

Local user edits profile order. Imported pack order is a proposal and cannot override local state without review.

## Data and API

Profile entries store explicit priority; resolver sorts by priority then immutable entry ID and generates active filenames. No remote API.

## Safety, privacy, and accessibility

Order changes never rename immutable source objects directly. Provide move up/down/to-position controls and conflict outcome text; drag-and-drop is optional enhancement only.

## Telemetry

Opt-in reorder count, capacity warning, conflict-affected activation, and validation failures; no entry names.

## Acceptance criteria

- Re-resolving identical profile data always yields identical order/names/tree hash.
- Ties use the documented stable tie-break and are visibly identified.
- Conflict winners update before apply and match the activated result.
- Every drag operation has a keyboard/screen-reader equivalent.

## Dependencies and open questions

Depends on DESK-007/009/013 and VPK inventory. OQ8 keeps merging out of V1.

