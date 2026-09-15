# Modlock website-first delivery

Date: 2026-09-13 (America/Los_Angeles)

Owner: Codex, delegated by Ahad

## Owner direction

Ahad assigned Modlock to Codex, then clarified the immediate deliverable: the website and ingestion of GameBanana mods for Deadlock. Build and verify that experience first. ModPacks follow as one-click installation and the desktop app develop. This replaces the older queue's website-before-installer prohibition for this web scope; it does not declare the installer proofs complete.

## This delivery

- Next.js website in `apps/web`: catalog, text search, category/hero filters, three sorts, pagination, grid/list display, URL filter state, detail routes, screenshots, creator/contributor attribution, source permissions, and source links.
- A paced, bounded Mod/Sound metadata importer with full index traversal, profile enrichment, source-state filtering, retries, resumable checkpoints, and atomic publication to local runtime storage.
- GameBanana serves mod files and imagery. Browsing works from the last successful local catalog without upstream requests per page view.
- This is source work and a local preview. There is no production deployment, scheduled ingestion, desktop application, install capability, or claim of verified game compatibility.

## Acceptance for this slice

1. Live GameBanana data supplies all displayed mod listings; no example mods or fabricated statistics.
2. A player can search, combine category/hero filters, change sort, navigate pages, open a mod, inspect its attribution, and follow its canonical source link.
3. Restricted, rated, malformed, wrong-game, and identity-mismatched source data cannot produce ordinary public listings.
4. A failed or capped import preserves the preceding published snapshot; discovery and profile-enrichment counts remain separate.
5. The built website renders at desktop and mobile widths and offers keyboard-operable controls and image/error fallbacks.
6. A fresh checkout can install dependencies, import metadata, build, and run using the commands in the [web README](../../apps/web/README.md).

## Verified local delivery

The live import published at `2026-09-14T05:13:08.661Z` (September 13 in Los Angeles). Both Mod and Sound indexes reached their final page: 155 pages, 7,714 unique source identities, 120 public profiles published, 6,977 awaiting profile checks, and 617 excluded. There were zero profile errors. The source reported 7,718 records across the moving indexes; four duplicate identities were deduplicated during traversal. These figures describe this dated pass, not a complete immutable source snapshot.

The capped-import fault check (`--pages=1 --details=1`) exited unsuccessfully as intended and preserved the existing catalog byte-for-byte. Its SHA-256 remained `fc28eb60c4ed74ae317d7066c0b2971531badeddbba7ff57d9bac71ace7acb82`. Runtime catalog and checkpoint files remain ignored by Git.

The production build and TypeScript check pass. The 17 automated web tests cover metadata filtering, parsing, request bounds, and URL state; the repository documentation/contract gate also passes. Browser checks verified real images, combined search/category/hero/sort filters, clearing an empty search, pagination, list display, detail attribution/source links, gallery selection, and restoration of filters after browser-back navigation. Desktop layout was checked at 1,440 pixels; mobile filters and layout were checked at 390 and 320 pixels with no horizontal document overflow.

Current lifecycle: **IMPLEMENTED BUT UNMERGED**. Run the local preview with the [web runbook](../../apps/web/README.md). Hosting, persistent hosted storage, and a production refresh schedule remain the next website milestone.

## Next product milestones

After the catalog experience is accepted, complete persistent hosted ingestion and deployment for the website. Then deliver a small desktop vertical slice: discover the local game, preview one exact mod installation, back up affected content, apply through the Rust core, and restore it. Bring the CFG editor into that working app with typed values, preserved user content, a before/after diff, and backup/restore.

ModPacks then combine exact mod references and an approved CFG into one reproducible setup. Initial creator targets provided by Ahad are Eido, Crayon_FPS, Lomein, DeathyDL, and Parzelion. These are target names only: no supplied mod lists, CFGs, permission records, or endorsements exist in this delivery. Do not present invented preferences as theirs.

The Rust core remains independent of the eventual desktop shell. The earlier WinUI/all-Rust comparison is a planning input, not a prerequisite for delivering the catalog. Select the desktop shell when beginning the install vertical slice, based on development effort and measured Windows behavior.
