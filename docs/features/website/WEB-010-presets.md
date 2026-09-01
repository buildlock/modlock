# WEB-010 — Preset and crosshair publishing

| Field | Value |
|---|---|
| ID | `WEB-010` |
| Owner | Product, trust, and platform |
| Phase | Phase 3 |
| Status | Draft |

## Problem and user stories

Players want current pro/streamer settings without opaque or unsafe CFG bundles. As a player, I want structured, sourced presets and crosshairs with exact verification status so I understand what is endorsed and safe to apply.

## Scope and non-goals

**In scope:** Typed setting/crosshair versions, source evidence, tested game build, risk classes, preview/diff, creator_verified/contributed/community_reported/expired labels, exact-version approval, expiry/revocation, hero tags, and changelog.

**Non-goals:** Arbitrary command scripts, full hardware-specific CFG/video files, automatic endorsement, or unproven live per-hero switching.

## States and primary flow

States are draft, validating, unsupported_keys, needs_review, community_reported, verified, expired, revoked, and published. Values validate against a signed command registry; eligible content passes policy and optional creator approval before publication.

## Errors and offline behavior

Unknown/deprecated/risky keys are rejected or held for review. Expiry changes badge/currentness, not historical provenance. Published pages may be cached; new publication and approval require connectivity.

## Permissions

Authenticated users may submit allowed community reports with public sources; identity owners approve exact versions; trust staff verify/revoke; only allowlisted typed values can publish for automatic desktop application.

## Data and API

Uses cfg_presets/versions/settings, crosshairs/versions, command registry versions, hero tags, source evidence, tested builds, verification approvals, and audit events. Planned gallery/detail/publish/approve/revoke contracts.

## Safety, privacy, and accessibility

Never publish hidden-information, automation, visibility advantage, private attachments, or personal path/device data. Diffs and previews have text equivalents; badges include claim scope and date.

## Telemetry

Validation failures by key/risk, publication/approval/expiry, preset opens, desktop handoff, and unsupported-client outcomes; never collect a user's entire CFG.

## Acceptance criteria

- Public auto-applicable presets contain only client-known allowlisted typed keys.
- Each verification badge resolves to one immutable version digest and approval record.
- Community-reported content is visibly unendorsed, source-cited, and expiry-aware.
- The UI does not promise automatic in-match per-hero switching.

## Dependencies and open questions

Depends on WEB-004/005/011, DESK-010/011, SHO-126/131/133, OQ5/OQ6, and a current-build command registry.

