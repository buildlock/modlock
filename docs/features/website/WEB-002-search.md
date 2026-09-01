# WEB-002 — Search and filters

| Field | Value |
|---|---|
| ID | `WEB-002` |
| Owner | Web/platform |
| Phase | Phase 1 |
| Status | Draft |

## Problem and user stories

Players need to find a known mod or narrow a large catalog reliably. As a player, I want typo-tolerant search and composable filters so I can locate safe, compatible content quickly.

## Scope and non-goals

**In scope:** Text query, hero/category/tag/source/content-rating/compatibility filters, sort, canonical URL state, cursor pagination, empty-state suggestions, and safe query limits.

**Non-goals:** Opaque personalized ranking, paid placement disguised as relevance, or searching private drafts.

## States and primary flow

States are idle, querying, ready, filtered-empty, degraded, and error. Query/filter changes update the URL; submitted state is shareable and back/forward navigation restores it. Search ranks exact title/creator matches before fuzzy text signals.

## Errors and offline behavior

Invalid filters are ignored with a visible notice; expensive queries are bounded. On search-service failure, users may fall back to recent catalog results. There is no guaranteed offline web search.

## Permissions

Public search sees only public records. Owners and moderators use separate authorized endpoints for drafts or hidden records.

## Data and API

Planned `GET /v1/mods?query=&hero=&category=&source=&sort=&cursor=`. Search documents carry immutable IDs and publication state; stale indexes must be prevented from resolving revoked content.

## Safety, privacy, and accessibility

Queries are treated as untrusted input and never reflected unsafely. Recent searches remain local unless the user opts into account sync. Announce result counts and filter changes without stealing focus.

## Telemetry

Aggregate query latency, no-result rate, filter combinations, and result selection. Hash or bucket query text for analytics; retain raw queries only under a documented short operational window.

## Acceptance criteria

- URL state reproduces the same query and filters.
- Revoked/private records never appear even if the search index is stale.
- Unsupported filter values return a stable validation response rather than a server error.
- Search, clear, filter chips, and result count work with keyboard and screen readers.

## Dependencies and open questions

Depends on WEB-001, catalog taxonomy, and planned search/index infrastructure. Ranking and retention policy require an ADR.

