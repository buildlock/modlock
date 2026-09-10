# Modlock status

Last updated: **2026-09-10**

## Current source

Contract PR5 merged as `955a80b83c0c5fcd07b82337ec71a1eb96f7ae54` after
independent acceptance and green local, clean-clone and Linux CI. Post-merge CI
passed. The two SHO-275 defects—malformed HTTPS components and pack chronology—
are corrected; that narrow issue is Done. Superseded documentation PR4 is closed.

`codex/sho-129-journal-proof` adds the first pinned Rust core and a bounded,
single-use synthetic transaction/recovery prototype. Local tests terminate a
separate process at 41 activation boundaries and six reverse-recovery boundaries.
The [proof record](docs/testing/synthetic-journal-proof.md) describes exact scope,
evidence and limitations. Independent review and CI acceptance remain for this
new source; no game or production deployment is implied.

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
no usable player application, API, installer, scanner, real mod corpus, game
mutation or deployment. A developer can run the synthetic Rust journal example
and its fault tests. The contract fixtures contain synthetic
metadata and zero materialized game/mod payloads. Contract acceptance does not
complete Phase 0 or the wider SHO-127 API/client work.

The September 1 documentation baseline remains available: 29 feature designs,
clean-room research, architecture, threat/rights models, test plans, operating
procedures, and owner decision records. These are designs, not runtime evidence.

## Current job and next action

- `MLK-P0-001`: independent candidate review complete; foundation retained.
- `MLK-P0-003/004`: contract integration accepted and merged; post-merge CI passed.
- `SHO-275`: Done for its two contract release blockers.
- `SHO-127`: remains In Progress; API/generated-client adoption and general
  authority resolution are separate unfinished work.
- `SHO-129`: In Progress. Review and verify the bounded synthetic Rust proof;
  wider path/fixture/install-plan/runtime acceptance remains unfinished.
- Only the necessary Rust/toolchain/fixture portions of MLK-P0-005/006/008/009/010
  are combined here. Web/API shells, generators and general installer scope remain.
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
