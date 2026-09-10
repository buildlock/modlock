# Modlock handoff

## Current resume action

Review and verify `codex/sho-129-journal-proof` against protected main
`955a80b83c0c5fcd07b82337ec71a1eb96f7ae54`. It combines the pinned Rust scaffold
with a bounded synthetic transaction/recovery proof. Read its
[proof record](docs/testing/synthetic-journal-proof.md) before extending scope.
The exact source, independent verdict and CI remain the source acceptance gate.

The legacy worktree `/Users/ahad/Dev/modlock-phase0-contracts` and its old-base
uncommitted files were preserved byte for byte. Initial independent review
retained its synthetic contract foundation and required deliberate integration.
The separate `/Users/ahad/Dev/modlock` worktree and dirty restart pointer were
also preserved. Do not reset, clean, stash or mechanically rebase either.

## Accepted scope and remaining work

PR5's URL and pack chronology corrections passed final independent review,
fresh behavioral checks and PR/main CI. SHO-275 is Done; superseded PR4 is closed.
The integration selected `contracts/v1` as the sole active data shape,
retains old OpenAPI/crosshair/error outlines as deferred design, preserves the
modern protected documentation check and extends it with hash-locked contract
CI. All 28 integrated tests and the full documentation gate pass locally. Fresh runs capture
and verify their own source snapshot; the August 31 manifest is historical.

The [integration record](docs/handoffs/2026-09-10-contract-integration.md) lists
path dispositions and evidence. No service, player installer, scanner,
cryptographic trust, rights-cleared payload, game proof or deployment exists.
The current branch adds a synthetic journal only: fresh roots, inert text, fixed
slots, one transaction, OS lock, flushed intent, digest validation and reverse
recovery. Candidate/backup trees remain bounded inspection evidence. It is not
the production filesystem adapter or an install-plan client.
SHO-127, SHO-129 and Phase 0 remain incomplete. Windows game/reference-host,
power-loss, provider and rights acceptance remain separate.

## Read next

1. [Current status](STATUS.md)
2. [Contract rules and verification](contracts/README.md)
3. [Current integration record](docs/handoffs/2026-09-10-contract-integration.md)
4. [Synthetic journal proof and commands](docs/testing/synthetic-journal-proof.md)
5. [Documentation control plane](docs/README.md)
6. [September 1 control packet](docs/handoffs/2026-09-01-project-control-packet.md)
7. [Ownership and human dependencies](docs/project/ownership.md)

Historical candidate handoffs and the August 31 manifest remain dated records;
their old paths, local-green claims, branch state and next-action wording are
not current source acceptance or authority. No live/game/provider action is
implied by this source merge.
