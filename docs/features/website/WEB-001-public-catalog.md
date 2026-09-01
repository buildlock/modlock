# WEB-001 — Public catalog

| Field | Value |
|---|---|
| ID | `WEB-001` |
| Owner | Product and web/platform |
| Phase | Phase 1 |
| Status | Draft |

## Problem and user stories

Players need a trustworthy starting point that distinguishes first-party hosted releases from linked sources. As a player, I want to browse current mods by category, hero, source, and recency so I can discover relevant content without installing the desktop app.

## Scope and non-goals

**In scope:** Paginated browse feeds, featured/recent/trending views, source and compatibility badges, content-warning controls, creator attribution, and links to mod detail.

**Non-goals:** Personalized recommendation profiles, public comments, social feeds, or treating downloadability as compatibility.

## States and primary flow

States are loading, ready, empty, stale/degraded, filtered-empty, and error. The user opens a server-rendered catalog, changes filters, receives a canonical cursor-paginated result, and opens a result. Stale external records display source age.

## Errors and offline behavior

Source-adapter failures do not hide healthy first-party results. The page identifies unavailable sources and offers retry. The website itself has no offline guarantee beyond cached static shell behavior.

## Permissions

Public read access. NSFW visibility follows account age/consent and jurisdiction policy; delisted or quarantined releases are never exposed through public routes.

## Data and API

Uses mods, releases, creators, heroes, categories, tags, compatibility, source provenance, and scan/publication state. Planned contract: `GET /v1/mods` with opaque cursors and stable filter semantics.

## Safety, privacy, and accessibility

Content warnings precede media. Badges include text, not color alone. Results, filters, pagination, and dynamic counts are keyboard reachable and screen-reader labelled. Browsing does not require cross-site identity tracking.

## Telemetry

Aggregate catalog impressions, filter use, result opens, empty searches, source degradation, and response latency. Do not record full IP/user histories for recommendation profiles.

## Acceptance criteria

- Every card exposes title, creator, source, content rating, current release state, and compatibility state.
- Cursor pagination produces no duplicates or omissions for a stable snapshot.
- A failed GameBanana adapter leaves first-party results usable and visibly marks degradation.
- Keyboard and screen-reader users can operate every filter and identify active filters.

## Dependencies and open questions

Depends on WEB-002, WEB-003, taxonomy contracts, publication state, and source adapters. GameBanana ranking/cache terms remain open under SHO-125 and SHO-132.

