# Website accounts and feature parity

Owner: Codex, assigned by Ahad on 2026-09-13 (America/Los_Angeles).

## Direction

Ahad accepted the initial visual direction and requested user accounts and the remaining Deadlock Mod Manager capabilities. **Do not deploy until the product is complete.** Continue the website first under the earlier scope; desktop installation, CFG editing and creator ModPacks remain later unless Ahad brings them forward.

The September 1 [competitor matrix](competitive-matrix.md) and [behavioral teardown](../teardowns/deadlock-mod-manager.md) remain the baseline. A fresh September 14 UTC public website check confirms browsing, sign-in, source-attributed mod details, transparency/status/help links, and a Tools menu with VPK Analyzer, KeyValues Parser and Crosshair Generator. The [published feature guide](https://docs.deadlockmods.app/using-mod-manager/features) mixes website and desktop capabilities and explicitly contains upcoming features. A claimed feature is not evidence of reliable runtime behavior.

## Delivery checklist

| User flow | Current state | Acceptance |
|---|---|---|
| Catalog, filters, details and galleries | Local implementation, draft PR9; local checks passed | Real metadata, source attribution, responsive controls, failure-preserving import |
| Accounts and recovery | Implemented locally; integration and browser verification passed | Persistent registration/login, verified email flow, recovery, session revocation, password change and deletion |
| Personal library | Implemented locally; persistence and ownership tested | Authenticated save/remove, private saved notes and update awareness, persisted across sessions |
| Creator and member profiles | Implemented locally; opt-in public-field isolation tested | Source creators and Modlock members remain distinct; opt-in public profile, bounded name/bio/links, no inferred verification |
| Reporting and local moderation | Implemented locally; reporter browser flow and staff integration tests passed | Private stable report reference, duplicate protection, owner-scoped status, staff authorization and audit trail |
| Crosshair web tools | Preview studio implemented locally; no game commands or verified presets | Original bounded editor and preview, explicit game-validation status, saved/shared artifacts under a versioned contract |
| KeyValues and VPK inspection | Implemented browser-local metadata tools; adversarial synthetic tests passed | Local file processing, strict limits, read-only results, no game-file mutation or uploads |
| Help, privacy and service status | Implemented for actual local behavior | Accurate implemented behavior, real local catalog health, clear account-data controls |
| Complete metadata enrichment | In progress | Profile checks separate from index discovery; retry/checkpoint behavior preserves valid publication |
| Desktop, CFG application, ModPacks, updater, Foundry, game presence and servers | Deferred desktop scope | Separate bounded milestones and Windows/game verification |
| Hosting, public accounts, mail/OAuth providers and cross-product identity | On hold | Owner-directed deployment phase; shared identity decision remains OQ10 |

## Implementation boundary

The local account implementation uses the MIT-licensed Better Auth library and a dedicated loopback PostgreSQL database. Verification/recovery messages go only to a private local outbox. There is no external mail delivery or provider account creation. Accounts use local opaque identities; they do not establish portfolio identity, creator verification, or third-party ownership. Database state and secrets remain outside Git. Public deployment is rejected by this local configuration.

All domain mutations must derive the account from the validated server session, validate input, enforce ownership, and use database constraints/transactions. Catalog browsing remains anonymous. Product-specific records stay private by default. Imported GameBanana authors cannot be claimed by choosing a matching display name.

Use the [clean-room implementation rules](../teardowns/dmm-clean-room-evidence.md): implement Modlock requirements independently; do not copy DMM source, layouts, protocols, tests or assets.

## Evidence

The local implementation remains unmerged on draft PR9. The full product is not complete and deployment remains on hold.

- `pnpm test:web`: 25 passing tests covering the existing provider adapter plus KeyValues/VPK adversarial inputs, strict crosshair JSON, redirect bounds and local-only account configuration.
- `pnpm test:accounts`: 14 passing tests (including the parent test) against a newly created disposable PostgreSQL database. Covers verification and replay, recovery and replay, session revocation, MFA and backup-code replay, account/library/profile/report/design isolation, database-backed rate limits, staff/MFA/freshness enforcement, stale moderation writes, hide/restore/auditing and deletion.
- `pnpm build`: optimized Next.js build and TypeScript checks passed. `pnpm test:http` passed against that built server with an independent database and loopback port; it exercises protected pages, HTTP registration/verification, cookie attributes, contract-validated private export including 101 reports and saved notes/designs, staff denial, sign-out and deletion.
- Browser: a disposable local account registered and verified through the actual Next.js route; edited and published its synthetic member profile; saved a real catalog listing and private note; submitted a clearly marked synthetic report and confirmed its private history; changed crosshair geometry using the keyboard and saved a named design. Valid/invalid design import, copied share links and hash changes passed. KeyValues preserved duplicate keys and showed malformed-input errors; VPK inspection reported the expected synthetic directory, unsafe path and case-insensitive duplicate, with working entry filtering.
- Responsive browser checks covered account/profile, security, library, crosshair, VPK and creator pages, including 390px and 320px widths without document overflow. Creator search returned the expected matching author and linked their source-attributed catalog. The normal browser viewport was restored. The single synthetic browser account, its explicit test report, matching outbox message and inert VPK fixture were removed after verification.
- The first browser pass caught Next.js normalizing request URLs to `localhost`; the adapter now validates incoming Host and Origin and canonicalizes the internal URL before calling auth. A regression test covers this adapter boundary. Shared crosshair hash changes and accessible slider labels were also corrected during browser testing.
- The 1000-profile enrichment run preserved the previous 619-listing snapshot after one transient empty GameBanana response. The bounded retry completed at **2026-09-14 07:51:27 UTC**: **1612 published listings**, **7722 indexed entries**, **5487 pending profiles**, **623 excluded**, **zero profile errors**, 155 index pages. Valid checkpoints were reused. A direct metadata check of the failing endpoint had also returned a normal 7359-byte JSON response. No filtering or failure-preservation rule was weakened.

Final source checks ran on September 14 UTC. The draft PR's checks tab is the current remote CI record; earlier green runs do not cover later commits. No merge, provider activation or deployment is implied by these results. The next website action is another bounded metadata-enrichment batch, then the next unfinished website milestone from the checklist; desktop/game work remains deferred.

## Remaining scope

Public mail/OAuth/passkey providers, shared identity, native desktop behavior, current-game validation, installs, profiles/load order, ModPacks, upload/release scanning, verified creator presets, Foundry/presence/server integration and deployment remain separate unfinished work. The website tools provide local inspection and design exchange, not game compatibility or file-safety attestations. Public role/case policy, external audit retention and appeals remain unimplemented.

## Sources and implementation provenance

- [DMM public feature guide](https://docs.deadlockmods.app/using-mod-manager/features) and its public website navigation supplied the feature checklist, not implementation code.
- [Better Auth installation](https://better-auth.com/docs/installation), [email/password](https://better-auth.com/docs/authentication/email-password), [Next.js integration](https://better-auth.com/docs/integrations/next), [sessions](https://better-auth.com/docs/concepts/session-management) and [rate limits](https://better-auth.com/docs/concepts/rate-limit) informed the pinned library integration.
- KeyValues uses Modlock's own existing Rust parser semantics as a bounded browser adaptation. VPK follows the public directory format documented by the [Valve Developer Community](https://developer.valvesoftware.com/wiki/VPK_(file_format)) and the [Source 2 VPK format research](https://www.source2.wiki/FileFormats/vpk). The Valve page returned HTTP 403 during this refresh; the format research and synthetic tests supplied current implementation evidence. No DMM parser/source was copied.
- [PostgreSQL support policy](https://www.postgresql.org/support/versioning/) and the official image establish the selected PostgreSQL 18.6 local runtime. No hosted provider was activated.
