# Modlock status

Last updated: **2026-09-10**

## Current source

`codex/sho-127-contract-integration` brings the previously uncommitted Phase 0
contract foundation onto current main. Independent review chose **KEEP the
foundation; REWORK integration** after fresh contract tests passed. The two
SHO-275 defects—malformed HTTPS components and pack chronology—are corrected.
The full integrated fresh gate passes all 28 tests, 138 Markdown files, 37 JSON
files, 29 feature pages and 10 ADRs. Final integration review and CI remain
before this source merges.

The one active contract authority is [contracts/v1](contracts/v1/index.json):
closed-world schemas, conservative UTC/URL/Windows-path validation, typed CFG
values with auto-apply disabled, exact-digest source rights, and a five-document
synthetic authority graph. Signature records are explicitly unverified. The
[older API/schema outlines](docs/design/2026-09-01-contract-outline/README.md)
are deferred design, excluded from active contract validation and generation.

The historical August 31 manifest and old candidate worktree remain preserved.
Fresh checks capture and verify the current source inventory around each run;
they do not require evolving main to match a historical snapshot.

## What exists for users

Modlock remains a planned creator website and native Windows utility. There is
no usable application, API, installer, scanner, transaction journal, real mod
corpus, game mutation or deployment. The contract fixtures contain synthetic
metadata and zero materialized game/mod payloads. Contract acceptance does not
complete Phase 0 or the wider SHO-127 API/client work.

The September 1 documentation baseline remains available: 29 feature designs,
clean-room research, architecture, threat/rights models, test plans, operating
procedures, and owner decision records. These are designs, not runtime evidence.

## Current job and next action

- `MLK-P0-001`: independent candidate review complete; foundation retained.
- `MLK-P0-003`: deliberate current-main integration prepared in this branch.
- `MLK-P0-004`: independent integration review and fresh CI remain.
- `SHO-275`: await integration acceptance before closing the release blockers.
- `SHO-127`: remains In Progress; API/generated-client adoption and general
  authority resolution are separate unfinished work.
- After accepted source merge, `MLK-P0-005` may scaffold the pinned local
  workspace. Journal/recovery work uses only disposable synthetic trees.
- `SHO-124`, `SHO-129`, Windows proof and Phase 0 remain incomplete.

See the [integration record](docs/handoffs/2026-09-10-contract-integration.md)
for exact source provenance and path dispositions. The September 1 control
packet remains a dated planning record; this status and the current handoff
supersede its initial candidate-review pointer.

## Owner and external gates

- Ahad must authorize any Valve/GameBanana outreach; no private permission or
  current-build compatibility is established by local source tests.
- A designated Windows reference host and separately approved sacrificial game
  install are required for native/game evidence.
- Real fixtures, redistribution, pilots and creator approval require exact
  rights/consent records. Current fixtures contain no third-party payload.
- Counsel, legal operator, signing identity, provider accounts and production
  release decisions remain outside this source integration.
- Shared identity/registry ownership choices remain with the portfolio owner.

[Open questions](docs/open-questions.md), [ownership](docs/project/ownership.md),
[Linear backlog](docs/linear-backlog.md), and [handoff](HANDOFF.md) remain the
entry points for those decisions. No provider or game action occurred here.
