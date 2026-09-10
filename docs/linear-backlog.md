# Linear seed backlog

This file mirrors the Linear project and its evidence-backed reconciliation so the project can be reconstructed from Git history if external state is lost. SHO-275, SHO-129 and SHO-128 were rechecked September 10, 2026 after PR5/6 merged; other issue rows retain their dated audit. Issue state is not implementation evidence.

- [Modlock Linear project](https://linear.app/shopliftdigital/project/modlock-72fa0f6e1ed8)
- [Documentation baseline and owner action queue](https://linear.app/shopliftdigital/document/modlock-documentation-baseline-and-owner-action-queue-3f4fa369309c)
- Milestone: `Phase 0 — Validation and risk retirement`

## Live issue mirror and reconciliation

All issues were unassigned at audit time.

| Issue | Live state | Dependency/evidence state | Required reconciliation |
|---|---|---|---|
| [SHO-275 — Fix both independent release blockers](https://linear.app/shopliftdigital/issue/SHO-275/sho-127a-fix-both-independent-release-blockers) | Done | PR5 accepted and merged as 955a80b8; post-merge CI passed. | Complete only for the two recorded synthetic contract defects. |
| [SHO-127 — Define V1 contracts and manifests](https://linear.app/shopliftdigital/issue/SHO-127/define-v1-api-package-profile-pack-and-cfg-contracts) | In Progress | Contract foundation accepted; API/client and general resolver work remain unfinished. | Keep broader scope open; do not hold independent synthetic core proof on the unfinished API work. |
| [SHO-129 — Prototype Rust journal/recovery](https://linear.app/shopliftdigital/issue/SHO-129/prototype-rust-transaction-journal-and-crash-recovery) | Done | PR6 accepted and merged; all PR/main Linux/Windows checks passed. | Narrow single-use prototype criteria only; production filesystem adapter, repeated transactions and game installer remain open. |
| [SHO-124 — Licensed/adversarial fixture corpus](https://linear.app/shopliftdigital/issue/SHO-124/build-licensed-and-adversarial-mod-fixture-corpus) | Backlog | Candidate has 13 metadata-only controls and zero materialized payloads. | Keep Backlog; split synthetic materialization from rights-cleared real fixtures during execution. |
| [SHO-125 — GameBanana terms](https://linear.app/shopliftdigital/issue/SHO-125/confirm-gamebanana-api-and-one-click-manager-terms) | Backlog | Public technical audit complete; written terms/manager confirmation absent. | Keep Backlog until HUM-002 authorizes outreach; use outbound-link fallback. |
| [SHO-126 — Valve guidance](https://linear.app/shopliftdigital/issue/SHO-126/establish-valve-mod-policy-and-branding-guidance) | Backlog | Outreach packet exists; no authorization/response. | Keep Backlog until HUM-001 authorizes send; retain conservative fallback. |
| [SHO-128 — Steam discovery/gameinfo](https://linear.app/shopliftdigital/issue/SHO-128/prototype-steam-discovery-and-safe-gameinfo-patching) | In Progress | PR7 discovery accepted with all PR/main CI; owned gameinfo byte planner now covers simulated replacement and unknown-structure refusal. | Review this source and combined narrow fixture criteria; production writer, real instance/game-running validation and Phase 0 remain open. |
| [SHO-130 — Native Windows UI benchmark](https://linear.app/shopliftdigital/issue/SHO-130/benchmark-winui-3-rust-against-an-all-rust-native-ui) | Backlog | No Windows/runtime evidence. | Keep Backlog; repair stale ADR attachment to `docs/adr/0003-desktop-core-and-shell.md`. |
| [SHO-131 — CFG/crosshair registry](https://linear.app/shopliftdigital/issue/SHO-131/validate-current-build-cfg-and-crosshair-command-registry) | Backlog | No current-build Windows/game proof. | Keep Backlog until HUM-003/004 evidence lane is authorized. |
| [SHO-132 — Third-party contract probes](https://linear.app/shopliftdigital/issue/SHO-132/establish-third-party-api-snapshots-and-contract-probes) | Backlog | Dated manual evidence exists; automated replay/probes absent. | Keep Backlog until scaffold; execute bounded `MLK-P0-014`. |
| [SHO-133 — Pilot creators/rights](https://linear.app/shopliftdigital/issue/SHO-133/recruit-pilot-creators-and-verify-content-rights) | Backlog | No participants, exact-version consent, or rights evidence. | Keep Backlog until HUM-006 supplies participants/authority. |

## Deterministic priority

1. **CURRENT:** review and verify the SHO-128 owned gameinfo byte planner on accepted PR7.
2. Preserve the wider unfinished workspace, fixture, production path/installer and API/client scope explicitly.
3. Extend the smallest useful fixture-backed path/journal/discovery/parser behavior after source acceptance.
4. Owner-authorized Valve/GameBanana/Windows/pilot and portfolio-architecture lanes may run in their separate collision groups.

The [September 1 project control packet](handoffs/2026-09-01-project-control-packet.md#deterministic-local-job-queue) retains its historical 50-job planning scope. Current status and the proof record document the bounded combined source slice; this is not 50 completed deliveries. Create future Linear tickets just in time rather than as a stale batch.

## Phase 0 definition of done

- Desktop UI architecture decision recorded from measurements.
- Transactional install proof survives interruption and patch-reset fixtures.
- Legal/policy go/no-go recorded.
- GameBanana integration path or independent fallback recorded.
- Supported CFG registry captured for a specific Deadlock build.
- Pilot corpus has explicit rights/provenance.
