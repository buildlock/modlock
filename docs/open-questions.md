# Open questions

Each question has an owner/workstream and a decision deadline. Decisions should be captured in an ADR or an updated architecture document rather than disappearing into chat.

## OQ1 — Valve policy and branding

- **Question:** Which Deadlock modification surfaces and categories does Valve currently tolerate, and what branding/anti-cheat constraints apply?
- **Owner:** Product/legal.
- **Deadline:** End of Phase 0.
- **Default if unanswered:** Conservative hosted-content policy; no injection, automation, visibility advantage, or implied Valve endorsement.

## OQ2 — GameBanana integration contract

- **Question:** What API, caching, attribution, download-resolution, and registered-manager requirements apply to Modlock?
- **Owner:** Platform/product.
- **Deadline:** End of Phase 0.
- **Default if unanswered:** First-party hosted catalog only, with ordinary outbound source links rather than one-click linked installs.

## OQ3 — Native Windows shell

- **Question:** Does WinUI 3 + Rust core or an all-Rust native UI best meet footprint, accessibility, packaging, polish, and delivery-speed requirements?
- **Owner:** Desktop.
- **Deadline:** End of Phase 0.
- **Decision evidence:** Same realistic catalog/library screen, SQLite load, thumbnails, progress events, deep link, updater bootstrap, and signed package measured on the reference PC.

## OQ4 — RAR and 7z at launch

- **Question:** Can maintained, redistributable archive support meet the sandbox and malicious-corpus requirements?
- **Owner:** Desktop/security.
- **Deadline:** Mid Phase 2.
- **Default if unanswered:** Launch with ZIP and raw/split VPK only.

## OQ5 — Automatic per-hero crosshair switching

- **Question:** Is there a supported, non-injection, non-input-automation method to load arbitrary crosshair values when the active hero changes?
- **Owner:** Desktop/game research.
- **Deadline:** Evidence-driven; not required for V1.
- **Default if unanswered:** Per-hero organization plus explicit pre-launch/user-triggered activation.

## OQ6 — Player/streamer verification

- **Question:** Which identity, exact-version approval, expiry, delegation, and revocation workflow is acceptable to pilot creators?
- **Owner:** Product/trust and safety.
- **Deadline:** Before Phase 3.
- **Default if unanswered:** Community-reported artifacts only, clearly unendorsed and source-cited.

## OQ7 — API implementation language

- **Question:** Should the catalog API begin in TypeScript/Hono or Rust?
- **Owner:** Platform.
- **Deadline:** Start of Phase 1.
- **Decision evidence:** Team expertise, generated-contract ergonomics, deployment profile, and scanner boundary.

## OQ8 — VPK merging

- **Question:** Is merging sufficiently demanded and can it be deterministic, attributable, debuggable, and reversible?
- **Owner:** Desktop/product.
- **Deadline:** Post V1.
- **Default if unanswered:** Expose conflicts and deterministic load order without merging.

## OQ9 — Portfolio mod registry and artifact ownership

- **Question:** Which repository is canonical for mod identities/releases, and which shared artifact/version fields let BuildLock present a setup while Modlock alone resolves and installs its mod/config references?
- **Owner:** Ahad/portfolio architecture with Deadlock-Infra, BuildLock, and Modlock maintainers.
- **Deadline:** Before physical Modlock schema, cross-product package adoption, or BuildLock Setup Hub mod-registry work.
- **Decision evidence:** Accepted cross-repo ADR/equivalent, one canonical authority map, compatibility fixture for artifact root/version/creator/catalogue snapshot/game patch IDs, and effective package-access proof.
- **Default if unanswered:** Modlock is canonical for mod metadata/releases/binaries/scans/packs; BuildLock may render a projection/deep link only. No direct table coupling or second BuildLock mod registry.

## OQ10 — Shared identity issuer and creator ownership

- **Question:** Which service issues portfolio accounts/sessions and canonical creator IDs, and how does Modlock request consent-bound scopes without building a second identity system?
- **Owner:** Ahad/legal operator and portfolio architecture/security.
- **Deadline:** Before public accounts, creator verification, cross-product linking, or production auth-provider selection.
- **Decision evidence:** Accepted identity ADR, issuer/session ownership, stable creator-ID contract, consent/scope model, authorization-negative tests, privacy review, and migration impact.
- **Default if unanswered:** Use synthetic/local opaque identities for development only; no public account, verified creator, cross-product join, or production identity claim.
