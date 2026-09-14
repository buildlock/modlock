# Modlock website

A Next.js website for browsing public Deadlock Mod and Sound submissions from GameBanana. This is the first usable web slice; desktop installation, CFG editing, accounts, uploads, and ModPacks are future work.

## Run locally

Use Node 24.19.0 and pnpm 10.33.0 from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm ingest --details=120
pnpm dev
```

Open <http://127.0.0.1:4310>. The initial import walks both game indexes and enriches up to 120 eligible profiles. It is deliberately paced and may take several minutes. The website explains when no snapshot exists. A missing snapshot never produces invented listings.

```sh
pnpm test:web
pnpm typecheck
pnpm build
pnpm --filter @modlock/web start
```

## Ingestion and storage

The importer uses only `https://gamebanana.com/apiv11/Mod/Index`, `Sound/Index`, and the corresponding submission `ProfilePage` endpoints for game 20948. It downloads JSON metadata, not mod binaries. Images remain on GameBanana's image host; the website does not proxy or cache them.

- Requests start at least 1.05 seconds apart, one at a time. A request has a 15-second timeout and an 8 MiB expanded body limit. Temporary network, 429, and 5xx failures receive at most two retries. No credentials or cookies are sent; redirects are rejected.
- Pages have at most 50 entries. The default cap is 120 pages per model. `--pages=200` raises that bounded cap; an incomplete walk cannot replace a catalog. GameBanana has no snapshot token, so a walk is not an immutable source snapshot.
- `--details=120` bounds per-run profile enrichment. Repeating the command retains fresh, unchanged public profiles and advances through remaining entries. Larger bounded values are supported up to 10,000. `pending` is explicit; an index count never means all profiles have been imported.
- Index checkpoints expire after 10 minutes. Profile checkpoints expire after 24 hours and are keyed by source identity and modification timestamp. Only normalized metadata is retained; raw profiles, contact details, donation data, binaries, and download URLs are not stored.
- Only public, non-obsolete, unrated index entries with files can enter profile checking. Profiles must explicitly report public visibility and false private/withheld/trashed flags. Any content-rating record, malformed rating field, missing attribution, or identity mismatch blocks publication. This is source-state filtering, not a malware scan or compatibility verdict.
- Source profiles omit the content-ratings field when unrated; acceptance requires the index's explicit `false` flag plus the independently checked public profile. The observed API also labels JSON as `text/html`; the bounded response is parsed strictly as JSON and never rendered as HTML.
- A complete index pass and zero profile errors are required before an atomic rename replaces `apps/web/data/gamebanana/catalog.json`. Failures retain the last successful website snapshot. Restricted or absent entries are omitted from the next publication, without asserting why a source disappeared. This does not provide immediate takedown synchronization.
- `apps/web/data/` is ignored local runtime storage. No database or scheduled worker is deployed. A hosted service will need persistent storage and an operator-selected refresh schedule. Nothing in a normal website request calls GameBanana.

The importer uses an exclusive `ingest.lock` to prevent concurrent writers. A normal exit removes it. After an unclean process termination, verify the importer is no longer running before removing that specific lock file and rerunning the import. Valid checkpoints are reused; do not delete the catalog to retry.

## Website behavior

Home includes a community spotlight drawn from the imported skins, category and hero filters, bounded text search, update/download/like sorting, pagination, and grid/list views. Filter state is encoded in the URL. Details include a screenshot gallery, plain-text description, submitter and contributor credits, source permission statements, refresh date, and a link to the original submission.

The browser receives only listing fields for catalog filtering. Detail text and credits remain server-side until that detail route is requested. Unknown IDs use the 404 page. Image failures have an explicit fallback. The site has no sign-in, analytics, user-data upload, or install endpoint.

## Verification scope

`tests/gamebanana.test.ts` uses synthetic metadata for provider envelopes, identity/game mismatch, moderation/rating filtering, attribution, HTML-to-text conversion, media host restrictions, response limits, and URL filter state. Live ingestion and browser checks are recorded in the current dated delivery note. The Rust installer proof remains a separate scope.
