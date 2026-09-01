# Modlock

Modlock is the working title for a two-part Deadlock mod platform:

1. A website where creators can publish, showcase, and distribute Deadlock mods.
2. A lightweight native Windows utility for safe one-click installs, profiles, CFG editing, crosshairs, and creator-approved player packs.

This repository contains the complete design-stage documentation baseline: current ecosystem teardowns, feature wiki, contracts, architecture, testing, security, policy drafts, operations, support, and durable project controls. The latest research snapshot is dated **2026-09-01**; Deadlock is still changing quickly, so game paths, console variables, third-party APIs, and policy assumptions remain build-pinned evidence rather than permanent guarantees.

Project execution is tracked in the private [Modlock Linear project](https://linear.app/shopliftdigital/project/modlock-72fa0f6e1ed8). The repository remains the authoritative durable context; [the Linear documentation baseline and owner action queue](https://linear.app/shopliftdigital/document/modlock-documentation-baseline-and-owner-action-queue-3f4fa369309c) links back to the versioned documents here.

## Documentation

- [Complete documentation control plane](docs/README.md)
- [Documentation completeness and approval matrix](docs/project/documentation-matrix.md)
- [Codex versus Ahad ownership](docs/project/ownership.md)
- [Executive brief](docs/00-executive-brief.md)
- [Ecosystem and technical research](docs/01-ecosystem-research.md)
- [Product specification](docs/02-product-specification.md)
- [Platform architecture and API](docs/03-platform-architecture.md)
- [Native desktop technical design](docs/04-desktop-technical-design.md)
- [Security, moderation, and legal boundaries](docs/05-security-moderation-legal.md)
- [Delivery roadmap and validation plan](docs/06-roadmap.md)
- [Source register](docs/07-sources.md)
- [Current dated ecosystem snapshot](docs/snapshots/2026-09-01-ecosystem.json)

## Decision summary

- Build a first-party catalog, but integrate GameBanana by reference rather than copying its files.
- Use immutable releases, content hashes, quarantined uploads, archive/VPK inspection, and transactional installs with rollback.
- Represent packs as signed/reference manifests, not redistributed ZIP bundles.
- Build the desktop file/install engine in Rust. Benchmark a WinUI 3 shell plus Rust core against an all-Rust native UI before locking the UI stack.
- Avoid Electron. Treat Tauri as the delivery-speed fallback, not the default, because lightweight native behavior is a core differentiator.
- Use a typed CFG model. Do not distribute arbitrary scripts as “performance presets.”
- Treat pro and streamer presets as opt-in, attributable, versioned, and visibly marked either creator-verified or community-reported.
- Ship per-hero crosshair organization and selection first. Do not promise automatic live switching without a supported, non-injection mechanism.

## Proposed repository layout

```text
apps/
  web/                 # public catalog and creator dashboard
  api/                 # public and desktop API
  scanner/             # isolated upload analysis workers
  desktop/             # native Windows shell
crates/
  modlock-core/        # installer, profiles, CFG, journal, rollback
  modlock-vpk/         # VPK inspection and conflict inventory
packages/
  contracts/           # generated API and manifest contracts
docs/
```

Core data/API contracts and proposed ADRs are committed, but application implementation has not started. Phase 0 now moves into the synthetic fixture, Rust transaction/recovery, source-adapter contract, and Windows benchmark proofs while human-only platform, hardware, legal, and creator approvals proceed.
