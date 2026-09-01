# Modlock complete documentation baseline handoff

Date: **2026-09-01**  
Branch: `main`  
State: design documentation/contracts complete; application implementation not started

## Outcome

The earlier discovery package has been expanded into a complete design-stage corpus: pinned competitor/source teardowns, feature wiki, traceability, contracts, ADRs, data model, testing, development, UX, security/privacy, moderation, policies, operations/release, support, ownership, and CI controls.

Start at [docs/README.md](../README.md). The [documentation matrix](../project/documentation-matrix.md) states whether each artifact is complete design, requires owner/counsel approval, requires Windows evidence, or awaits implementation.

## Codex-owned work completed

- Current DMM teardown and GPL clean-room evidence.
- Current GameBanana teardown, defensive adapter specification, and 2026-09-01 snapshot.
- Twenty-nine implementation-grade feature pages, competitive matrix, and requirements traceability.
- OpenAPI plus core release/external/install/profile/pack/CFG/crosshair/error/fixture schemas and examples.
- ADRs, ERD/data dictionary, NFRs, authorization, product/UX/accessibility/analytics, risk/RACI/glossary.
- Test/fixture/fuzz/performance/compatibility/QA, developer/contribution/versioning, and release gates.
- Threat/privacy, moderation/verification/takedown, operations/signing/revocation/incident/backup/source outage, policy drafts, and support guides.
- Human ownership map and prepared outreach/counsel/research/consent/Windows packets.
- Offline documentation/contract structural CI.

## Human-only dependencies

Use [docs/project/ownership.md](../project/ownership.md) as the authoritative split. In order:

1. Authorize/send Valve and GameBanana outreach (`HUM-001`, `HUM-002`).
2. Provide a Windows 11 reference host and sacrificial Deadlock install scope (`HUM-003`, `HUM-004`).
3. Name the legal operator/jurisdiction and engage counsel (`HUM-005`, `HUM-007`).
4. Recruit/consent pilot creators and players (`HUM-006`).
5. Approve business/risk defaults, production credential ownership, and release gates (`HUM-008`–`HUM-010`).

## Exact next engineering action

1. Scaffold the pinned Cargo/pnpm monorepo and contract code-generation/check workflow.
2. Generate rights-manifested synthetic/adversarial fixtures.
3. Implement `modlock-core` path/staging/journal state machine.
4. Prove process termination at every mutation boundary yields committed desired state or recoverable prior state.
5. Add Steam fixture discovery and semantic owned search-path repair.

No polished catalog/native UI should outrun that recovery spine.

## Verification

- Documentation validator passes all Markdown, JSON, links, fences, contract refs, feature IDs/sections, ADR metadata, required package files, and formatting.
- All contract/example/snapshot JSON parses.
- Git diff whitespace validation passes.
- External runtime/legal/platform approvals are deliberately not represented as complete.

