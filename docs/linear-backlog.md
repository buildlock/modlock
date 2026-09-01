# Linear seed backlog

This file mirrors the Linear project and its evidence-backed reconciliation so the project can be reconstructed from Git history if external state is lost. Live status was audited `2026-09-01T01:28:24-07:00`; issue state is not implementation evidence.

- [Modlock Linear project](https://linear.app/shopliftdigital/project/modlock-72fa0f6e1ed8)
- [Documentation baseline and owner action queue](https://linear.app/shopliftdigital/document/modlock-documentation-baseline-and-owner-action-queue-3f4fa369309c)
- Milestone: `Phase 0 — Validation and risk retirement`

## Live issue mirror and reconciliation

All issues were unassigned at audit time.

| Issue | Live state | Dependency/evidence state | Required reconciliation |
|---|---|---|---|
| [SHO-275 — Fix both independent release blockers](https://linear.app/shopliftdigital/issue/SHO-275/sho-127a-fix-both-independent-release-blockers) | In Progress | Blocks SHO-127. Writer reports local completion in dirty/unpushed worktree; independent acceptance absent. | Move to `In Review` only when a different reviewer claims `MLK-P0-001`; add Phase 0 milestone and reviewer. Never mark Done from the self-report. |
| [SHO-127 — Define V1 contracts and manifests](https://linear.app/shopliftdigital/issue/SHO-127/define-v1-api-package-profile-pack-and-cfg-contracts) | In Progress | Correctly blocked by SHO-275. Current main and candidate have competing contract layouts. | Keep blocked through review, deliberate integration, independent exact-head review, CI, and authorized merge. |
| [SHO-129 — Prototype Rust journal/recovery](https://linear.app/shopliftdigital/issue/SHO-129/prototype-rust-transaction-journal-and-crash-recovery) | Backlog | Merely related to SHO-127/275; no Rust/runtime exists on main. | Add formal `blockedBy SHO-127`; do not start before accepted contracts/scaffold/fixtures. |
| [SHO-124 — Licensed/adversarial fixture corpus](https://linear.app/shopliftdigital/issue/SHO-124/build-licensed-and-adversarial-mod-fixture-corpus) | Backlog | Candidate has 13 metadata-only controls and zero materialized payloads. | Keep Backlog; split synthetic materialization from rights-cleared real fixtures during execution. |
| [SHO-125 — GameBanana terms](https://linear.app/shopliftdigital/issue/SHO-125/confirm-gamebanana-api-and-one-click-manager-terms) | Backlog | Public technical audit complete; written terms/manager confirmation absent. | Keep Backlog until HUM-002 authorizes outreach; use outbound-link fallback. |
| [SHO-126 — Valve guidance](https://linear.app/shopliftdigital/issue/SHO-126/establish-valve-mod-policy-and-branding-guidance) | Backlog | Outreach packet exists; no authorization/response. | Keep Backlog until HUM-001 authorizes send; retain conservative fallback. |
| [SHO-128 — Steam discovery/gameinfo](https://linear.app/shopliftdigital/issue/SHO-128/prototype-steam-discovery-and-safe-gameinfo-patching) | Backlog | Design/fixtures plan only; no parser or prototype. | Keep Backlog; execute `MLK-P0-011` then `MLK-P0-012`. |
| [SHO-130 — Native Windows UI benchmark](https://linear.app/shopliftdigital/issue/SHO-130/benchmark-winui-3-rust-against-an-all-rust-native-ui) | Backlog | No Windows/runtime evidence. | Keep Backlog; repair stale ADR attachment to `docs/adr/0003-desktop-core-and-shell.md`. |
| [SHO-131 — CFG/crosshair registry](https://linear.app/shopliftdigital/issue/SHO-131/validate-current-build-cfg-and-crosshair-command-registry) | Backlog | No current-build Windows/game proof. | Keep Backlog until HUM-003/004 evidence lane is authorized. |
| [SHO-132 — Third-party contract probes](https://linear.app/shopliftdigital/issue/SHO-132/establish-third-party-api-snapshots-and-contract-probes) | Backlog | Dated manual evidence exists; automated replay/probes absent. | Keep Backlog until scaffold; execute bounded `MLK-P0-014`. |
| [SHO-133 — Pilot creators/rights](https://linear.app/shopliftdigital/issue/SHO-133/recruit-pilot-creators-and-verify-content-rights) | Backlog | No participants, exact-version consent, or rights evidence. | Keep Backlog until HUM-006 supplies participants/authority. |

## Deterministic priority

1. **NEXT ELIGIBLE:** `MLK-P0-001` / SHO-275 independent read-only candidate review.
2. Follow the verdict: conditional candidate remediation plus fresh review, or a clean current-main replacement plus independent review after discard.
3. SHO-127/275 current-main contract reconciliation and separate integration review/CI.
4. Scaffold pinned toolchains/workspaces/product CI.
5. Materialize synthetic fixtures, then path/staging, journal, recovery, discovery, and parser proofs.
6. Owner-authorized Valve/GameBanana/Windows/pilot and portfolio-architecture lanes may run in their separate collision groups.

The complete 50-job scheduling and execution contract is the [project control packet](handoffs/2026-09-01-project-control-packet.md#deterministic-local-job-queue). Create future Linear tickets just in time rather than as a stale batch.

## Phase 0 definition of done

- Desktop UI architecture decision recorded from measurements.
- Transactional install proof survives interruption and patch-reset fixtures.
- Legal/policy go/no-go recorded.
- GameBanana integration path or independent fallback recorded.
- Supported CFG registry captured for a specific Deadlock build.
- Pilot corpus has explicit rights/provenance.
