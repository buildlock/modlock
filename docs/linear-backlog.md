# Linear seed backlog

This file mirrors the initial Linear project so the project can be reconstructed from Git history if external project state is lost.

## Priority order

1. **Establish Valve mod-policy and branding guidance** — document outreach, responses, conservative fallback rules, and product implications.
2. **Confirm GameBanana API and one-click integration terms** — API/caching/attribution/download behavior, manager registration, and fallback.
3. **Build the licensed and adversarial mod fixture corpus** — 20–30 representative and malicious ZIP/VPK/RAR/7z samples with rights and expected outcomes.
4. **Define V1 contracts and manifests** — hosted release, external reference, install plan, profile, pack, typed CFG setting, and versioning rules.
5. **Prototype the Rust transaction journal and crash recovery** — stage, journal, activate, terminate at every step, recover or roll back.
6. **Prototype Steam discovery and safe gameinfo patching** — find app 1422450, patch owned search path, survive a simulated game patch.
7. **Benchmark native Windows UI options** — WinUI 3 + Rust against all-Rust native UI using production-like work.
8. **Validate CFG and crosshair command registry** — current-build key/range verification, owned-block behavior, persisted-convar conflicts.
9. **Probe third-party API contracts and establish snapshots** — GameBanana, DMM API, and deadlock-api schema tests, caching, kill switches.
10. **Recruit pilot creators and verify content rights** — 3–5 opt-in creators/players, exact-version approval flow, licensed pilot files.

## Phase 0 definition of done

- Desktop UI architecture decision recorded from measurements.
- Transactional install proof survives interruption and patch-reset fixtures.
- Legal/policy go/no-go recorded.
- GameBanana integration path or independent fallback recorded.
- Supported CFG registry captured for a specific Deadlock build.
- Pilot corpus has explicit rights/provenance.

