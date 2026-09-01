# Modlock status

Last updated: **2026-09-01**

## Current state

Modlock is a greenfield two-part Deadlock mod platform:

1. A website for creator-controlled uploads, showcases, downloads, presets, and packs.
2. A lightweight native Windows utility for transactional installs, profiles, CFG editing, crosshairs, and creator-approved player packs.

The full design-stage documentation baseline is complete. Product implementation has not started. The repository documentation and machine-readable contracts are the authoritative starting context; drafts are not equivalent to legal approval, Windows runtime evidence, or production rehearsal.

## Completed

- Completed pinned September 1 DMM and GameBanana teardowns, GameBanana adapter specification, current snapshot, and explicit clean-room evidence boundary.
- Completed 29 implementation-grade website/desktop feature pages, competitive capability matrix, and requirements traceability.
- Added OpenAPI and nine JSON Schemas plus examples for releases, external references, install plans, profiles, packs, CFG, crosshairs, errors, and fixtures.
- Completed ADRs, ERD/data dictionary, nonfunctional requirements, authorization, UX/accessibility/analytics, risk/ownership/RACI, test/fixture/fuzz/performance/QA plans, and developer handbook.
- Completed threat/privacy design, moderation SOPs, provider-neutral operations/release/recovery runbooks, draft public policies, and player/creator/support guides.
- Added an offline CI documentation gate covering JSON, `$ref` targets, Markdown links/fences, feature completeness/IDs, ADR metadata, required package files, and formatting.
- Prepared send-ready Valve/GameBanana/creator outreach, counsel packet, research plan, Windows host checklist, and exact human dependency map.

## Current milestone

**[Phase 0 — validation and risk retirement](https://linear.app/shopliftdigital/project/modlock-72fa0f6e1ed8)**

The first implementation objective is to prove the native footprint and transactional installer while clarifying Valve and GameBanana boundaries.

## Next action

Start the Phase 0 implementation proof:

1. Scaffold the pinned pnpm/Cargo monorepo and generated-contract workflow.
2. Generate the synthetic/adversarial fixture corpus from the completed catalog/schema.
3. Implement the Rust staging/path-safety/journal/crash-recovery walking slice.
4. Implement Steam fixture discovery and semantic `gameinfo.gi` repair tests.
5. Run native shell/runtime/game evidence on the designated Windows host when Ahad supplies it.

## Known blockers and open decisions

- Ahad must authorize/send Valve and GameBanana outreach; neither platform has granted a private integration/policy approval.
- Ahad must provide the Windows reference host and approve a sacrificial Deadlock install for credible runtime evidence.
- Counsel must approve operator/jurisdiction-specific public policies and platform/legal interpretations.
- Ahad must recruit pilot creators/players and obtain exact hosting/fixture/artifact consent.
- Legal operator, product-name clearance, signing identity, production accounts, and final business/risk choices remain owner decisions.

See [delivery ownership](docs/project/ownership.md), [documentation matrix](docs/project/documentation-matrix.md), [open questions](docs/open-questions.md), and the [current handoff](HANDOFF.md).

Linear execution is seeded in the Shoplift Digital workspace. The mirrored, reconstructable issue index is [docs/linear-backlog.md](docs/linear-backlog.md).
