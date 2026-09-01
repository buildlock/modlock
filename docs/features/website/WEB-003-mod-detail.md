# WEB-003 — Mod detail

| Field | Value |
|---|---|
| ID | `WEB-003` |
| Owner | Product and web/platform |
| Phase | Phase 1 |
| Status | Draft |

## Problem and user stories

Players need enough provenance and compatibility evidence to make an informed download decision. As a player, I want one canonical page for a mod, its immutable releases, files, risks, and creator so I know exactly what I will install.

## Scope and non-goals

**In scope:** Metadata, creator/source/license, media, content warnings, release history, variants/files, hashes, scan state, compatibility, dependencies/conflicts, changelog, manual download, report, and Open in Modlock.

**Non-goals:** Executing installs in the browser, public comments, or guaranteeing safety solely because a scanner passed.

## States and primary flow

States are public, deprecated, revoked, unavailable-external, degraded, and not-found. The user reviews the latest compatible release, selects a variant/version, sees exact warnings and attribution, then downloads or opens DESK-015.

## Errors and offline behavior

Missing external files remain visible as unavailable with last-known metadata and source link. Revoked releases block new resolution and explain the category of reason without exposing sensitive moderation evidence.

## Permissions

Public users read published history and permitted downloads. Owners see draft controls through WEB-007. Moderators see evidence through WEB-011, not public responses.

## Data and API

Uses mod, release, file, blob/external reference, creator, license, scan report summary, compatibility, dependencies, conflicts, and media. Planned routes: mod detail, releases, release detail, and signed `POST /v1/releases/{id}/resolve`.

## Safety, privacy, and accessibility

Never expose pre-signed URLs before resolution or internal scan evidence. Content warnings gate media. Version/variant selection, tabs, media controls, and warnings are fully labelled and keyboard operable.

## Telemetry

Aggregate page view, version/variant selection, resolve attempts/outcomes, source-unavailable state, and report initiation; exclude signed URLs and identities from public analytics.

## Acceptance criteria

- The page identifies host, author, license, immutable release, file size/hash availability, scan status, and compatibility status.
- Revoked or quarantined files cannot produce a resolution URL.
- External source outage does not erase attribution or last-known release identity.
- Download/open actions remain understandable without color or hover.

## Dependencies and open questions

Depends on WEB-004, WEB-007, WEB-008, WEB-012, DESK-015, and SHO-127 contracts. External file behavior depends on SHO-125/SHO-132.

