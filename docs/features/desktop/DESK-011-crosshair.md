# DESK-011 — Crosshair editor

| Field | Value |
|---|---|
| ID | `DESK-011` |
| Owner | Desktop product/core |
| Phase | Phase 3 |
| Status | Draft |

## Problem and user stories

Players want understandable custom crosshairs and hero preferences without unsafe live automation. As a player, I want a visual editor with exact values, share/import, version provenance, and explicit apply.

## Scope and non-goals

**In scope:** Allowlisted crosshair fields/ranges, approximate preview, exact numeric editing, copy/share schema, hosted preset lookup, per-hero preference organization, active-file match, diff/backup, and explicit application.

**Non-goals:** Claiming preview pixel identity, injecting/automating input, or promising automatic arbitrary in-match per-hero switching.

## States and primary flow

States are editing, invalid, previewing, saved, selected_for_hero, active, drifted, unsupported_build, and applying. The user edits/imports values, validates, compares a labelled approximation, saves preferences, and applies through DESK-010.

## Errors and offline behavior

Local editing/saved presets work offline. Unknown/out-of-range values are preserved only in explicit raw import diagnostics, never auto-applied. Network gallery failure leaves local presets available.

## Permissions

Local user controls preferences/application. Hosted presets obey WEB-010 verification and registry policy; remote data cannot write files directly.

## Data and API

Uses crosshair schema/version, validated typed values, hero preferences, tested build, source/approval, preview settings, and active digest. Planned gallery/detail contracts plus local CFG engine.

## Safety, privacy, and accessibility

Preview is labelled approximate and includes numeric/text representation. Color controls provide names/values and contrast cues; all sliders have typed fields and keyboard increments. No gameplay-log monitoring by default.

## Telemetry

Opt-in editor/apply/import outcomes, unsupported keys/build, and gallery handoff; never exact personal crosshair values unless explicitly shared.

## Acceptance criteria

- Invalid/out-of-range values cannot be auto-applied.
- Active state is determined from managed file values/digest, not merely last button click.
- Hero preference does not imply automatic live switching.
- All visual controls have keyboard and screen-reader-accessible numeric equivalents.

## Dependencies and open questions

Depends on DESK-010/014, WEB-010, SHO-131, OQ5, and a current-build validated registry.

