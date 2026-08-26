# Modlock status

Last updated: **2026-08-26**

## Current state

Modlock is a greenfield two-part Deadlock mod platform:

1. A website for creator-controlled uploads, showcases, downloads, presets, and packs.
2. A lightweight native Windows utility for transactional installs, profiles, CFG editing, crosshairs, and creator-approved player packs.

The initial ecosystem and technical deep dive is complete. Product implementation has not started. The documentation in this repository is the authoritative starting context.

## Completed

- Mapped Deadlock Mod Manager, Grimoire, GameBanana, community APIs, VPK/install behavior, CFG paths, and crosshair constraints.
- Documented product scope, platform/API architecture, desktop install engine, security/moderation/legal boundaries, and delivery roadmap.
- Recorded a dated ecosystem snapshot with inspected revisions and live counts.
- Established the key product constraints: reference-based packs, clean-room incumbent research, typed CFG presets, creator-verification semantics, and no promise of automatic live per-hero crosshair switching.

## Current milestone

**[Phase 0 — validation and risk retirement](https://linear.app/shopliftdigital/project/modlock-72fa0f6e1ed8)**

The first implementation objective is to prove the native footprint and transactional installer while clarifying Valve and GameBanana boundaries.

## Next action

Start the Phase 0 technical foundation:

1. Create a licensed/adversarial 20–30 mod fixture corpus.
2. Define the install-plan, hosted-release, profile, pack, and typed-CFG contracts.
3. Implement the Rust transaction journal and crash-recovery harness.
4. Benchmark WinUI 3 + Rust versus an all-Rust native UI using one realistic screen/workload.

## Known blockers and open decisions

- No confirmed authoritative public Deadlock mod policy.
- GameBanana API and one-click-manager terms require direct confirmation.
- Native UI stack is intentionally not locked until measured.
- Automatic live per-hero custom crosshair switching is unproven.
- Pilot creators/players and redistribution rights are not yet secured.

See [open questions](docs/open-questions.md) and the [current handoff](HANDOFF.md).

Linear execution is seeded in the Shoplift Digital workspace. The mirrored, reconstructable issue index is [docs/linear-backlog.md](docs/linear-backlog.md).
