# Modlock status

Last updated: **2026-09-01**

## Current state

Modlock is a greenfield two-part Deadlock mod platform:

1. A website for creator-controlled uploads, showcases, downloads, presets, and packs.
2. A lightweight native Windows utility for transactional installs, profiles, CFG editing, crosshairs, and creator-approved player packs.

The full design-stage documentation baseline is complete. **VERIFIED CURRENT:** product implementation has not started on merged `main`; the repository contains documentation, design contracts/examples, an offline documentation validator, and documentation-only CI. No Modlock application, service, database, migration, provider configuration, deployment, or release is represented or production-proven.

**IMPLEMENTED BUT UNMERGED / SYNTHETIC OR TEST-ONLY:** a separate dirty worktree at `/Users/ahad/Dev/modlock-phase0-contracts` contains a stricter V1 contract/conformance candidate. It is four commits behind current main, unpushed, has no PR, uses metadata-only synthetic controls with no materialized payloads, and overlaps seven canonical files plus the contract source-of-truth layout. Its self-reported green gate is not independent acceptance. See the [project control packet](docs/handoffs/2026-09-01-project-control-packet.md).

## Completed

- Completed pinned September 1 DMM and GameBanana teardowns, GameBanana adapter specification, current snapshot, and explicit clean-room evidence boundary.
- Completed 29 implementation-grade website/desktop feature pages, competitive capability matrix, and requirements traceability.
- Added OpenAPI and nine JSON Schemas plus examples for releases, external references, install plans, profiles, packs, CFG, crosshairs, errors, and fixtures.
- Completed ADRs, ERD/data dictionary, nonfunctional requirements, authorization, UX/accessibility/analytics, risk/ownership/RACI, test/fixture/fuzz/performance/QA plans, and developer handbook.
- Completed threat/privacy design, moderation SOPs, provider-neutral operations/release/recovery runbooks, draft public policies, and player/creator/support guides.
- Added an offline CI documentation gate covering JSON, `$ref` targets, Markdown links/fences, feature completeness/IDs, ADR metadata, required package files, and formatting.
- Prepared send-ready Valve/GameBanana/creator outreach, counsel packet, research plan, Windows host checklist, and exact human dependency map.
- Audited live GitHub/CI, Linear, Graphify, the linked Phase 0 worktree, and BuildLock/Deadlock-Infra boundaries; added a deterministic 50-job dependency queue with evidence gates and exactly one eligible engineering job.

## Current milestone

**[Phase 0 — validation and risk retirement](https://linear.app/shopliftdigital/project/modlock-72fa0f6e1ed8)**

The milestone still aims to prove the native footprint and transactional installer while clarifying Valve and GameBanana boundaries. The immediate gate is contract-candidate review and current-main reconciliation; scaffolding must not start first.

## Next action

Run **exactly one next eligible engineering job**: `MLK-P0-001` / SHO-275, an independent read-only review of the dirty Phase 0 candidate at source-manifest SHA `561c36ecf75137d636969f736d64a34eda19b786bc6a4ba271e7c432679eb5f3`. Require a different-model P0–P2 verdict, full fresh gate, and path-by-path collision/integration manifest. A keep verdict proceeds to deliberate integration; rework requires remediation and fresh re-review; discard routes to a clean current-main replacement plus independent review. Scaffolding stays blocked until one path is integrated, reviewed, accepted, and merged through an authorized lane.

The authoritative dependency order, writer/reviewer split, collision groups, commands, and evidence requirements are in the [deterministic queue](docs/handoffs/2026-09-01-project-control-packet.md#deterministic-local-job-queue).

## Known blockers and open decisions

- Ahad must authorize/send Valve and GameBanana outreach; neither platform has granted a private integration/policy approval.
- Ahad must provide the Windows reference host and approve a sacrificial Deadlock install for credible runtime evidence.
- Counsel must approve operator/jurisdiction-specific public policies and platform/legal interpretations.
- Ahad must recruit pilot creators/players and obtain exact hosting/fixture/artifact consent.
- Legal operator, product-name clearance, signing identity, production accounts, and final business/risk choices remain owner decisions.
- Ahad/portfolio architecture must resolve the canonical Modlock-vs-BuildLock mod registry, shared artifact envelope, and central identity issuer before cross-product implementation.

See [delivery ownership](docs/project/ownership.md), [documentation matrix](docs/project/documentation-matrix.md), [open questions](docs/open-questions.md), and the [current handoff](HANDOFF.md).

Linear execution is seeded in the Shoplift Digital workspace. The mirrored, reconstructable issue index is [docs/linear-backlog.md](docs/linear-backlog.md).
