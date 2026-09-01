# Modlock handoff

The current durable checkpoint is:

- [2026-09-01 deterministic project control packet](docs/handoffs/2026-09-01-project-control-packet.md)
- [2026-09-01 complete documentation baseline handoff](docs/handoffs/2026-09-01-main-documentation-baseline.md)
- [2026-08-26 research and architecture handoff](docs/handoffs/2026-08-26-main-research-architecture.md)
- [Modlock Linear project](https://linear.app/shopliftdigital/project/modlock-72fa0f6e1ed8)
- [Linear documentation baseline and owner action queue](https://linear.app/shopliftdigital/document/modlock-documentation-baseline-and-owner-action-queue-3f4fa369309c)

Start with [STATUS.md](STATUS.md), then the project control packet, [documentation control plane](docs/README.md), and [ownership split](docs/project/ownership.md).

Current audit base is `main` commit `1f2ba12999c39b9441ff279635df8db9b0702bec`; the documentation lane is `codex/project-control-packet`. Merged main remains documentation/contracts-only. A separate dirty, unpushed, four-commits-behind worktree at `/Users/ahad/Dev/modlock-phase0-contracts` is **IMPLEMENTED BUT UNMERGED** and **SYNTHETIC OR TEST-ONLY**; do not rebase or merge it mechanically.

Exactly one engineering job is eligible next: `MLK-P0-001` / SHO-275, an independent read-only review of that candidate and its source-manifest SHA `561c36ecf75137d636969f736d64a34eda19b786bc6a4ba271e7c432679eb5f3`. The reviewer must produce a P0–P2 verdict and collision/integration manifest. Keep routes to integration, rework to remediation plus fresh review, and discard to a clean current-main replacement plus independent review; every route blocks monorepo scaffolding until accepted and merged.
