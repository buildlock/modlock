# DESK-009 — Conflict detection

| Field | Value |
|---|---|
| ID | `DESK-009` |
| Owner | Desktop core/security |
| Phase | Phase 2 |
| Status | Draft |

## Problem and user stories

Multiple VPKs can contain the same internal path, causing order-dependent behavior. As a player, I want conflicts identified before activation with the expected winner and evidence so I can adjust order or disable content.

## Scope and non-goals

**In scope:** Normalized VPK path inventory, duplicate path groups, package/entry winner from load order, severity/capability hints, filtering, acknowledgement, and exportable diagnostics.

**Non-goals:** Claiming semantic compatibility from filenames, rendering every Source 2 resource, or auto-merging VPKs.

## States and primary flow

States are scanning, no_conflicts, conflicts_found, malformed, unresolved_order, and acknowledged. On import/install/profile change, inventory compares enabled packages and explains each collision and load-order result before activation.

## Errors and offline behavior

Works offline. Malformed/encrypted/unparseable structures block supported activation rather than assuming no conflict. Large inventories are bounded and cancellable.

## Permissions

Local read/analysis only. Server capability hints never replace local parsing. The user chooses order/disable decisions through DESK-007/008.

## Data and API

Uses immutable object/VPK inventory, normalized internal paths, split relationships, profile priority, and capability hints. Optional hosted scan inventories are attestations, not sole local truth.

## Safety, privacy, and accessibility

Parser is fuzzed and resource bounded; never extract arbitrary resources for preview by default. Conflict tables support grouping, keyboard navigation, and text winner/reason labels.

## Telemetry

Opt-in conflict count/severity buckets, parser errors, and resolution action type; never internal asset paths by default.

## Acceptance criteria

- Fixture packages with duplicate normalized paths identify all participants and deterministic winner.
- Malformed or over-limit VPKs cannot be reported as conflict-free.
- Changing load order updates winners without mutating immutable source objects.
- Conflict UI remains operable for large fixtures and assistive technology.

## Dependencies and open questions

Depends on SHO-124 fixtures, planned `modlock-vpk`, DESK-004/007/008. VPK merge is post-V1 OQ8.

