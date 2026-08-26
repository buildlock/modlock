# Delivery roadmap and validation plan

The estimates below assume a small experienced team with product/design, web/backend, Windows/Rust, and moderation/operations coverage. They are sequencing ranges, not a fixed commitment.

## Phase 0 — validation and risk retirement (2–3 weeks)

### Product and policy

- Contact Valve for mod/branding/anti-cheat guidance.
- Contact GameBanana about API use, attribution, caching, deep linking, and registered 1-click manager integration.
- Retain counsel for hosting terms, copyright/takedown, privacy, NSFW, and player/streamer endorsements.
- Interview 8–12 creators and 15–20 players across current managers.
- Recruit 3–5 creators/players willing to approve a pilot preset or pack.

### Technical spikes

- Build a 20–30 item licensed fixture corpus: raw/split VPK, ZIP/RAR/7z, variants, audio, HUD, multi-file, conflicts, malformed/adversarial samples.
- Prove safe Steam discovery and marker-based `gameinfo.gi` patch/repair on a sacrificial fixture install.
- Implement the install journal skeleton and interruption tests before UI work.
- Benchmark WinUI 3 + Rust core versus all-Rust native UI using the same realistic screen and workload.
- Probe and snapshot GameBanana/DMM/deadlock-api schemas with automated contract tests.
- Verify every proposed CFG/crosshair key against the current game build.
- Investigate supported crosshair reload behavior; record automatic per-hero switching as feasible, unsafe, or unsupported.

### Exit criteria

- Written architecture decision record for desktop UI/packaging.
- Legal/policy go/no-go and a conservative content matrix.
- GameBanana integration path or a launch plan that does not depend on it.
- Install/rollback proof under process termination and patch-reset fixtures.
- Performance prototype meets the gates or the gates/positioning are consciously revised.

## Phase 1 — platform MVP (6–8 weeks)

- Accounts, creator profiles, ownership/team roles.
- Mods, immutable releases, variants, media, taxonomy, provenance, licenses.
- Direct quarantine upload and isolated scan pipeline.
- Public browse/search/detail/download pages.
- Creator dashboard and scan feedback.
- Moderator queue, reports, revoke/delist, audit events.
- Object storage/CDN and signed install resolution.
- GameBanana linked-record adapter if approved.
- OpenAPI contracts and generated clients.

Exit: a creator can safely publish a licensed mod, a moderator can control it, and a user can download the exact immutable artifact with provenance and scan state.

## Phase 2 — desktop core alpha (8–10 weeks)

- Chosen native shell, accessibility baseline, signed dev packaging.
- Steam/game discovery and local SQLite/content-addressed library.
- Safe ZIP/raw/split-VPK ingestion; RAR/7z only when sandboxing/licensing are ready.
- One-click protocol and authenticated install-resolution flow.
- Transactional install, enable/disable, uninstall, repair, backup, and rollback.
- Profiles, deterministic load order, variants, conflict inventory.
- Patch/build detection and safe repair.
- Offline library and error diagnostics.
- Signed updater prototype and release SBOM.

Exit: internal alpha passes the install fixture matrix and performance gates with no unrecoverable mutation.

## Phase 3 — configuration, crosshairs, and packs (4–6 weeks)

- Typed command registry and CFG owned-block editor.
- Raw advanced editor, diff, backup timeline, restore.
- Crosshair editor/preview, sharing, per-hero preferences, explicit activation.
- Player/streamer identity and exact-version approval workflow.
- CFG preset and crosshair galleries.
- Reference-based pack authoring/resolution/install receipts.
- Import/export of the compatible Grimoire profile subset plus `extensions.modlock`.
- Creator consent, expiry, and revocation UI.

Exit: a verified pilot creator can approve an exact pack/preset version and a player can understand and install it without bundled redistribution.

## Phase 4 — hardening and limited beta (4–6 weeks)

- Parser fuzzing, external security review, dependency/SBOM gates.
- Signing-key and updater compromise drills.
- Database/object restore and malware revocation drills.
- Slow/offline/third-party outage behavior.
- Accessibility, localization readiness, privacy review.
- Performance profiling at 10,000 library/catalog items.
- Terms/policy/takedown launch operations.
- Invite-only beta, staged updater rings, rollback monitoring.

## Later candidates

- VPK merge with explicit collision policies and reversible artifacts.
- Supported live crosshair switching if the Phase 0 proof is safe.
- Creator analytics with privacy-preserving counts.
- Delta updates and peer-independent download optimization.
- Additional source adapters after explicit agreements.
- Curated accessibility packs.

## Workstreams and ownership

| Workstream | Deliverables |
|---|---|
| Product/design | Information architecture, install/conflict/diff UX, creator/verification flows, accessibility. |
| Platform | Catalog, auth, releases, uploads, storage, search, adapters, API contracts. |
| Trust & safety | Scanner, moderation, policies, takedowns, identity/approval, incident response. |
| Desktop core | Discovery, local DB/store, parser, resolver, journal, filesystem transactions, CFG. |
| Windows shell | Native UI, accessibility, deep links, packaging, updater, performance. |
| Developer experience | Monorepo, fixtures, CI, generated contracts, release signing, observability. |

The website and desktop foundations can run in parallel after the manifest/API contracts and install invariants are agreed. The UI must not outrun the recovery engine.

## Decision log to resolve

| Decision | Deadline | Evidence required |
|---|---|---|
| WinUI 3 + Rust vs all-Rust UI | End Phase 0 | Measured reference workload, accessibility, packaging, team velocity. |
| API implementation language | Start Phase 1 | Team expertise, contract generation, scanner boundary, deployment profile. |
| Object/CDN provider | Start Phase 1 | Malware quarantine isolation, egress, signed URLs, lifecycle, legal support. |
| RAR/7z at launch | Mid Phase 2 | Safe maintained dependency, licensing, sandbox and corpus results. |
| GameBanana integration | End Phase 0 | Written/clear terms, API behavior, attribution, one-click process. |
| Public community-reported presets | Before Phase 3 | Impersonation/currentness policy and sourcing UX. |
| Automatic per-hero switching | Post proof only | Supported non-injection activation, game-build tests, policy/anti-cheat review. |
| VPK merging | Post V1 | Conflict correctness, license review, deterministic rebuild/rollback, user demand. |

## Quality and success metrics

### Desktop correctness

- Successful installs above 99% for supported inputs.
- 100% successful rollback in the interruption/failure test matrix.
- Zero modification of unowned base game packages.
- Crash-free sessions at or above 99.9% during beta.
- Repair success after supported patch-reset fixtures above 99%.

### Performance

- Cold launch, idle memory/CPU, installer size, and streaming memory gates from the executive brief.
- Local library interactive before network catalog fetch.
- No UI-thread disk/network/archive work.

### Trust

- 100% of public hosted files have immutable digest, provenance/license state, and scan attestation.
- Malware revocation reaches API resolution immediately and clients on next refresh/open.
- 100% of verified badges map to an exact approval record and version digest.
- Takedown/security response targets are measured and published internally.

### Product

- Install-plan completion and rollback rates.
- Pack resolution rate, including unavailable external items.
- Creator first-release completion time and scan-finding resolution.
- Preset/pack re-verification freshness.
- Retained active users measured without invasive background telemetry.

## First ten implementation tickets after Phase 0

1. Define OpenAPI/JSON Schemas for hosted release, external reference, install plan, profile, pack, and typed CFG setting.
2. Create the adversarial and representative fixture repository with rights metadata.
3. Implement Rust path normalization, safe staging primitives, and fuzz targets.
4. Implement journal state machine and crash-recovery harness.
5. Implement Steam/Deadlock instance discovery against fixtures.
6. Implement raw/split VPK inventory and collision model.
7. Scaffold PostgreSQL release/provenance/blob/scan invariants.
8. Build direct-to-quarantine upload plus idempotent scan job.
9. Build native shell around local library and transaction progress events.
10. Establish code-signing/updater test keys, SBOM generation, and staged CI artifacts.
