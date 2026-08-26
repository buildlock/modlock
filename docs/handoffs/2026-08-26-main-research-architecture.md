# Modlock research and architecture handoff

Date: **2026-08-26**  
Branch: `main`  
State: documentation/research checkpoint; implementation has not started

External checkpoint:

- Private repository: `https://github.com/ahadify/modlock`
- Linear project: `https://linear.app/shopliftdigital/project/modlock-72fa0f6e1ed8`
- Linear project brief: `https://linear.app/shopliftdigital/document/modlock-research-architecture-and-phase-0-brief-3f4fa369309c`

## Objective

Build Modlock as two connected products:

1. A creator-controlled Deadlock mod website for uploads, downloads, showcases, presets, and packs.
2. A lightweight optimized native Windows mod utility with one-click installs, profiles, CFG editing, crosshairs, and verified player/streamer packs.

## Authoritative context

Read in this order:

1. [`STATUS.md`](../../STATUS.md)
2. [`docs/00-executive-brief.md`](../00-executive-brief.md)
3. [`docs/02-product-specification.md`](../02-product-specification.md)
4. [`docs/04-desktop-technical-design.md`](../04-desktop-technical-design.md)
5. [`docs/06-roadmap.md`](../06-roadmap.md)
6. [`docs/open-questions.md`](../open-questions.md)

The remaining documents contain the ecosystem evidence, platform/API design, trust boundaries, source register, and dated data snapshot.

## Decisions already made

- Working product name is Modlock.
- Modlock-hosted, GameBanana-linked, and external-linked content retain distinct provenance.
- Third-party binaries are not silently mirrored.
- Packs are immutable reference manifests, not redistributed ZIP bundles.
- Published first-party releases are immutable and content-hashed.
- The desktop install engine is written in Rust and independent of its UI shell.
- Electron is not a candidate for the lightweight brief; Tauri is a fallback.
- WinUI 3 + Rust and an all-Rust native UI must be measured before the final choice.
- Every install/game-file change uses staging, a durable journal, validation, and rollback.
- Public CFG presets contain validated typed settings, not whole arbitrary config files.
- Player/streamer verification applies to an exact version and can expire or be revoked.
- V1 does not promise automatic live per-hero crosshair switching.
- V1 does not execute downloaded code, inject into the game, automate input, or distribute competitive advantages.

## Important research facts

- Steam app ID is 1422450.
- Observed managed paths include `game/citadel/gameinfo.gi`, `game/citadel/addons`, `game/citadel/cfg/autoexec.cfg`, and `game/citadel/cfg/machine_convars.vcfg`.
- GameBanana game ID 20948 is the dominant identifiable public catalog/source.
- Current DMM is GPL-3.0 and uses Tauri/Rust/React; clean-room implementation is required for incompatible licensing.
- Grimoire is MIT/Electron and documents a reference-based `.modprofile.json` format worth interoperating with.
- No authoritative public Valve Deadlock mod policy was found.
- Community and third-party APIs are useful inputs, not Modlock's permanent source of truth.

## Exact next action

Create the Phase 0 fixture-and-contract foundation before building polished UI:

1. Establish a separately licensed fixture repository/directory with representative and adversarial samples.
2. Write JSON Schema/OpenAPI contracts for hosted release, external ref, install plan, profile, pack, and typed CFG registry.
3. Implement `modlock-core` staging/path-safety/journal primitives with a crash-recovery test harness.
4. In parallel, build the two native UI benchmark shells against the same mocked core events and library dataset.

## Do not do yet

- Do not scaffold an Electron client.
- Do not copy DMM GPL code.
- Do not rehost GameBanana/Discord files without authorization.
- Do not build automatic live crosshair switching around process injection or simulated console input.
- Do not write an installer that copies directly into the active addons directory.
- Do not accept arbitrary executable/script payloads as normal mods.

## Verification at checkpoint

- Ecosystem snapshot is valid JSON.
- All documentation index targets exist.
- Markdown fences are balanced.
- No secrets or credentials are stored in the repository.
- No app code/tests exist yet; verification is documentation-only.
