# Modlock website

A Next.js website for browsing public Deadlock Mod and Sound submissions from GameBanana. The local website also has persistent accounts, saved mods and notes, member/creator pages, reports, moderation, and browser tools. Desktop installation, game CFG application, uploads and ModPacks remain separate work. Ahad authorized shared-account deployment on September 14, 2026 (Pacific).

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
- `apps/web/data/` is ignored local runtime storage. Shared hosting stores the normalized catalogue in the product database. Refresh is operator-run; no scheduled worker is enabled. Nothing in a normal website request calls GameBanana.

The importer uses an exclusive `ingest.lock` to prevent concurrent writers. A normal exit removes it. After an unclean process termination, verify the importer is no longer running before removing that specific lock file and rerunning the import. Valid checkpoints are reused; do not delete the catalog to retry.

## Website behavior

Home includes a community spotlight drawn from the imported skins, category and hero filters, bounded text search, update/download/like sorting, pagination, and grid/list views. Filter state is encoded in the URL. Details include a screenshot gallery, plain-text description, submitter and contributor credits, source permission statements, refresh date, and a link to the original submission.

The browser receives only listing fields for catalog filtering. Detail text and credits remain server-side until that detail route is requested. Unknown IDs use the 404 page. Image failures have an explicit fallback. Anonymous browsing remains available. Account features use the configured local or shared mode. There is no analytics, binary upload, external mail delivery or install endpoint.

## Verification scope

`tests/gamebanana.test.ts` uses synthetic metadata for provider envelopes, identity/game mismatch, moderation/rating filtering, attribution, HTML-to-text conversion, media host restrictions, response limits, and URL filter state. Live ingestion and browser checks are recorded in the current dated delivery note. The Rust installer proof remains a separate scope.

## Local accounts

The local account stack is Better Auth 1.7.4 and a dedicated PostgreSQL 18.6 container. Configuration rejects non-loopback application origins and database hosts. It uses disposable local identities; hosted accounts use the shared mode below. Use test email addresses and disposable passwords here.

From the repository root:

```sh
pnpm accounts:setup
pnpm db:up
pnpm accounts:migrate
pnpm dev
```

`accounts:setup` creates `apps/web/.env.local` with random credentials, mode 0600, and preserves an existing file. `db:up` binds only `127.0.0.1:54339`. The database belongs to the `modlock-web-local` Compose project and keeps its data in a dedicated named volume. `pnpm db:stop` stops it without deleting data. Do not use `down --volumes` unless you intend to discard this local database.

Register at `/sign-up`. Verification and recovery messages go only to `apps/web/data/mail/` (directory 0700; files 0600). No email is sent. To inspect the latest message for your own test account:

```sh
pnpm accounts:mail your-test@example.test verify
pnpm accounts:mail your-test@example.test reset
```

These commands print a sensitive local link. Open it in the same local preview; do not paste it into a public issue or commit it. Verification links expire after one hour; recovery links expire after 30 minutes. The helper does not delete messages. Outbox files remain until the local operator removes them, including after account deletion.

All required environment keys are generated by setup: `MODLOCK_LOCAL_ACCOUNTS=1`, `MODLOCK_DB_PASSWORD`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=http://127.0.0.1:4310`, and `MODLOCK_MAIL_TRANSPORT=outbox`. Without explicit account enablement the catalog still works and authentication endpoints return 503. Never reuse the local configuration in a deployment. `MODLOCK_OUTBOX_DIRECTORY` accepts an absolute directory only for isolated tests.

Migrations take a PostgreSQL advisory lock, apply Better Auth's schema, and record SHA-256 checksums for numbered domain SQL migrations. Never edit an applied migration: add the next numbered file. The auth migrator currently warns that its own generated `rateLimit.lastRequest` bigint differs from its generic `number` model; this is non-destructive and tested. Do not narrow epoch-millisecond storage to a 32-bit integer to silence the warning.

### Account behavior and limits

- Email verification is required before a session can save data. Passwords are 12–128 characters and hashed by Better Auth. Sessions last up to 12 hours; session caching is disabled so revocation is authoritative. Password reset revokes all sessions; password change revokes other sessions.
- Security settings support display-name changes, TOTP authenticator setup, one-use recovery codes, sign-out elsewhere/everywhere, JSON export and account deletion. OAuth, passkeys, email changes and desktop linking are not activated.
- Profiles are private by default. Public profiles expose only display name, handle, bio and HTTPS website. Imported GameBanana creators remain a separate namespace, with no ownership claim or inferred verification.
- Saved libraries hold up to 1000 listing references and 500-character private notes. Updates compare catalog timestamps with the timestamp when the listing was saved. Unavailable listings remain private tombstones that can be removed.
- Reports accept bounded private text, at most five new reports per minute and 1000 reports per account. Retries and an existing open report of the same reason/listing reuse a stable reference. The website shows the latest 100 reports; account export includes the full bounded history.
- Accounts hold up to 100 named crosshair designs. Deletion cascades profile, sessions, saves, notes and designs. Reports and audit history remain with account links removed; free text is retained, so do not include personal details.
- Database-backed authentication limits use a shared per-path bucket when a trusted client IP cannot be determined. This is conservative for a loopback preview; production proxy/IP policy remains unconfigured. Auth requests accept same-origin JSON up to 16 KiB. Mutation ownership always comes from the verified server session.

### Local moderation

Enable TOTP on an existing, verified local test account, then assign its explicit role:

```sh
pnpm accounts:staff your-test@example.test moderator
pnpm accounts:staff your-test@example.test revoke
```

The CLI records the operator grant/revocation and ends existing sessions. Sign in again with the authenticator, then use the moderation link from the account page. `/moderation` rejects ordinary members and staff without MFA. Decisions require a session created in the last five minutes; sign out and sign in again when prompted. The role, session and MFA state are rechecked under database locks for each write. Both available staff roles have only the implemented local review capability; no public role-management endpoint exists.

A review can change status, leave a response visible to the reporter, and hide or restore the listing on this Modlock preview. Optimistic timestamps reject stale decisions; each accepted decision appends an audit event. The queue omits reporter email and pages through 25 reports at a time. Visibility changes affect current website reads and subsequent navigation, not already-open browser snapshots. There is no GameBanana notification, uploaded-asset revocation, scan evidence, appeals implementation, or external audit sink.

## Browser tools

- `/tools/crosshair`: bounded original preview editor, background comparison, account saves, strict JSON import/export and explicit share links. The link encodes the design in a URL fragment; it is not a public database publication. The [crosshair design contract](../../contracts/web/v1/crosshair-design.schema.json) requires `gameValidated: false`. Preview pixels are not game console values, and no CFG is generated/applied until a current-build command registry is verified.
- `/tools/keyvalues`: browser-local UTF-8 parsing, 1 MiB input, 8192 pairs, 16 levels, 4096-character tokens. It follows Modlock's own strict text subset and preserves ordered duplicate pairs. Binary/KV3 input, includes, conditionals, block comments and unknown escapes fail explicitly.
- `/tools/vpk`: reads a VPK v1/v2 header and at most 8 MiB of directory metadata, up to 50,000 entries. It bounds embedded ranges and reports unsafe/duplicate paths. No extraction, payload scan, CRC calculation, signature validation or external archive read occurs. Synthetic fixtures contain inert text only.

## Repeatable verification

```sh
pnpm test:web
pnpm test:accounts
pnpm build
pnpm test:http
```

`test:web` covers importer filtering, hostile metadata/URLs, parser bounds and web contracts. `test:accounts` creates a uniquely named local database and private temporary outbox, then tests verification, recovery replay, CSRF/body limits, identity isolation, report duplication/rates, crosshair ownership, MFA/recovery codes, session revocation, moderation authorization/concurrency and deletion. It removes only its own generated database/outbox. The PostgreSQL user needs `CREATEDB` for these tests.

`test:http` starts the built Next.js app on a temporary loopback port with another uniquely named database/outbox. It checks actual HTTP registration/verification, protected pages, cookie attributes, versioned data export, staff isolation, sign-out and deletion. It shuts down its own server and removes its own test data. An existing preview can keep running on 4310. CI runs these checks with the pinned local PostgreSQL service; it does not deploy anything.

The dated [website parity record](../../docs/product/website-parity-2026-09-13.md) distinguishes delivered local flows from remaining public identity, mail, desktop/game and hosting work.

## Shared hosting

Use `MODLOCK_ACCOUNT_MODE=shared`, exact `MODLOCK_ORIGIN`, `PORTFOLIO_ISSUER`,
a distinct `PORTFOLIO_CLIENT_SECRET` and `DATABASE_URL` for the dedicated
`modlock` product database on the private network. Do not enable local accounts
in this mode. Node 24.19.0 / pnpm 10.33.0 build the site with a frozen lockfile.
Run `pnpm --filter @modlock/web accounts:migrate:shared` before deployment;
`pnpm --filter @modlock/web start` listens on the Railway PORT.

Publish a complete validated normalized catalogue with
`pnpm --filter @modlock/web catalog:publish -- /absolute/path/catalog.json`
or pass `--stdin`. The publisher replaces one database snapshot atomically;
normal requests never call the source provider. `/api/health` checks the product
schema. Publishing a catalogue is a separate readiness check from schema health.

BuildLock controls account names, bio, credentials, verification, Steam linking
and security. Modlock stores saved mods, notes, crosshairs, reports and profile
opt-in under the canonical account ID. It stores no shared password or email.
Public profiles recheck central visibility and canonical username on every read.
Shared moderation remains disabled until scoped staff/MFA integration exists.

The account security page exports product data and offers explicit removal.
Removal revokes the current product token, cascades personal product rows and
removes reporter references from retained reports. If revocation or deletion
fails, the page reports failure. This is not permanent account closure; signing
in again can recreate the minimal projection. Remove product data before
requesting central account deletion if you want both removed. Global deletion
immediately denies access/public visibility but has no automatic product purge.

`node scripts/check-shared-accounts.ts` from the web directory creates a fresh
loopback database, runs migration and shared-profile/removal regressions, then
removes that captured fixture. Do not point tests at production.
