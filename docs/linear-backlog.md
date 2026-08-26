# Linear seed backlog

This file mirrors the initial Linear project so the project can be reconstructed from Git history if external project state is lost.

- [Modlock Linear project](https://linear.app/shopliftdigital/project/modlock-72fa0f6e1ed8)
- [Research, architecture, and Phase 0 brief](https://linear.app/shopliftdigital/document/modlock-research-architecture-and-phase-0-brief-3f4fa369309c)
- Milestone: `Phase 0 — Validation and risk retirement`

## Priority order

1. [SHO-126 — Establish Valve mod-policy and branding guidance](https://linear.app/shopliftdigital/issue/SHO-126/establish-valve-mod-policy-and-branding-guidance) — document outreach, responses, conservative fallback rules, and product implications.
2. [SHO-125 — Confirm GameBanana API and one-click integration terms](https://linear.app/shopliftdigital/issue/SHO-125/confirm-gamebanana-api-and-one-click-manager-terms) — API/caching/attribution/download behavior, manager registration, and fallback.
3. [SHO-124 — Build the licensed and adversarial mod fixture corpus](https://linear.app/shopliftdigital/issue/SHO-124/build-licensed-and-adversarial-mod-fixture-corpus) — 20–30 representative and malicious ZIP/VPK/RAR/7z samples with rights and expected outcomes.
4. [SHO-127 — Define V1 contracts and manifests](https://linear.app/shopliftdigital/issue/SHO-127/define-v1-api-package-profile-pack-and-cfg-contracts) — hosted release, external reference, install plan, profile, pack, typed CFG setting, and versioning rules.
5. [SHO-129 — Prototype the Rust transaction journal and crash recovery](https://linear.app/shopliftdigital/issue/SHO-129/prototype-rust-transaction-journal-and-crash-recovery) — stage, journal, activate, terminate at every step, recover or roll back.
6. [SHO-128 — Prototype Steam discovery and safe gameinfo patching](https://linear.app/shopliftdigital/issue/SHO-128/prototype-steam-discovery-and-safe-gameinfo-patching) — find app 1422450, patch owned search path, survive a simulated game patch.
7. [SHO-130 — Benchmark native Windows UI options](https://linear.app/shopliftdigital/issue/SHO-130/benchmark-winui-3-rust-against-an-all-rust-native-ui) — WinUI 3 + Rust against all-Rust native UI using production-like work.
8. [SHO-131 — Validate CFG and crosshair command registry](https://linear.app/shopliftdigital/issue/SHO-131/validate-current-build-cfg-and-crosshair-command-registry) — current-build key/range verification, owned-block behavior, persisted-convar conflicts.
9. [SHO-132 — Probe third-party API contracts and establish snapshots](https://linear.app/shopliftdigital/issue/SHO-132/establish-third-party-api-snapshots-and-contract-probes) — GameBanana, DMM API, and deadlock-api schema tests, caching, kill switches.
10. [SHO-133 — Recruit pilot creators and verify content rights](https://linear.app/shopliftdigital/issue/SHO-133/recruit-pilot-creators-and-verify-content-rights) — 3–5 opt-in creators/players, exact-version approval flow, licensed pilot files.

## Phase 0 definition of done

- Desktop UI architecture decision recorded from measurements.
- Transactional install proof survives interruption and patch-reset fixtures.
- Legal/policy go/no-go recorded.
- GameBanana integration path or independent fallback recorded.
- Supported CFG registry captured for a specific Deadlock build.
- Pilot corpus has explicit rights/provenance.
