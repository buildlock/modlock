# DESK-003 — Local library

| Field | Value |
|---|---|
| ID | `DESK-003` |
| Owner | Desktop core and Windows shell |
| Phase | Phase 2 |
| Status | Draft |

## Problem and user stories

Players need a fast offline inventory independent of remote catalog availability. As a player, I want to see downloaded, installed, enabled, outdated, unavailable, and damaged items so I can manage local state confidently.

## Scope and non-goals

**In scope:** SQLite inventory, content-addressed objects, extracted inventories, install receipts, status/filter/sort, local import, storage usage, integrity check, and source/provenance display.

**Non-goals:** Treating remote catalog as local truth, scanning the whole PC, or silently deleting unreferenced objects.

## States and primary flow

States include downloaded, installed, enabled, disabled, update_available, unavailable_source, revoked, damaged, and orphaned. The app opens the local database first, renders virtualized results, then optionally refreshes remote metadata.

## Errors and offline behavior

Fully usable offline for known objects/profiles. Database migration/corruption enters read-only recovery and backup/repair, not automatic destructive reset. Missing object bytes are marked damaged.

## Permissions

Local user controls imports/deletion. Remote revocation can block future activation/resolution under policy but does not silently erase local bytes; diagnostics explain options.

## Data and API

SQLite stores objects, sources, releases, receipts, profiles, current/desired state, and cache freshness. Remote bootstrap/catalog/update checks are optional after local render.

## Safety, privacy, and accessibility

Imported content is inspected before activation. Inventory is local and not uploaded without explicit scoped consent. Virtualized lists preserve keyboard focus and expose status text/actions to screen readers.

## Telemetry

Opt-in library size buckets, render latency, integrity outcomes, and action success; never mod inventory content or local paths by default.

## Acceptance criteria

- The local library is interactive before any network catalog request.
- 10,000-item fixture remains within performance/accessibility gates.
- Offline users can inspect, filter, enable/disable known safe objects, and view receipts.
- Missing/corrupt bytes are detected and never represented as healthy.

## Dependencies and open questions

Depends on DESK-002/004/007/014/016, SQLite schema ADR, and SHO-124 fixtures.

