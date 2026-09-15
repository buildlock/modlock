# Modlock handoff

## 2026-09-15: Shared-account deployment candidate

Deploy the reviewed source to modlock.fps.live, publish the validated catalogue snapshot and verify sign-in plus saved-library readback. See `apps/web/README.md`.

## Resume website work — 2026-09-14

Codex owns the Modlock website and GameBanana ingestion under Ahad’s explicit assignment. Use `/Users/ahad/Dev/.worktrees/modlock-web`, branch `codex/modlock-web-modpacks`, draft PR9. Read the [website parity record](docs/product/website-parity-2026-09-13.md) and [web README](apps/web/README.md). Preserve the earlier dirty worktrees. **Do not deploy until Ahad's product-completion condition and deployment direction are satisfied.**

The local slice now includes accounts, recovery/MFA, private saved mods/notes, member and creator profiles, reporting/moderation and web tools. Secrets/outbox/catalog files remain ignored. A dedicated Compose PostgreSQL instance binds `127.0.0.1:54339`; setup, migration, staff, mail and test commands are documented in the web README. No external email or provider account was created. Account IDs are local; OQ10 shared identity remains unresolved for public activation.

The web crosshair contract is preview-only and cannot activate game commands. Desktop installation, CFG application and creator ModPacks remain deferred; uploaded content/scanner/provider operations are separate unfinished work. Check the parity record for completed browser evidence, CI status, the latest metadata-import result and the exact next action.

## Historical resume action — 2026-09-10

Review and verify `codex/sho-128-gameinfo-plan` against protected main
`dc3a96b80ead8add2b857ebf4c522cdf4b91994d`. PR7's bounded discovery source passed
independent review and all PR/main Linux/Windows checks. This next slice plans
one owned gameinfo block against current bytes, retains unowned content and
rejects stale-source application. Read the
[gameinfo guide](docs/testing/gameinfo-plan-proof.md) before extending scope.
The exact source, one independent verdict and CI remain its acceptance gate.
Assess SHO-128's combined narrow fixture prototype criteria after acceptance;
production filesystem/process/game proof remains separate. No real Steam/game
operation or general installer integration is selected.

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
Accepted PR6 adds a synthetic journal: fresh roots, inert text, fixed
slots, one transaction, OS lock, flushed intent, digest validation and reverse
recovery. Candidate/backup trees remain bounded inspection evidence. It is not
the production filesystem adapter or an install-plan client.
PR6 passed final independent review and all PR/main Linux/Windows CI; SHO-129
is Done for its narrow prototype. SHO-127, SHO-128 and Phase 0 remain incomplete. Windows game/reference-host,
power-loss, provider and rights acceptance remain separate.

## Read next

1. [Current status](STATUS.md)
2. [Contract rules and verification](contracts/README.md)
3. [Current integration record](docs/handoffs/2026-09-10-contract-integration.md)
4. [Synthetic journal proof and commands](docs/testing/synthetic-journal-proof.md)
5. [Steam fixture discovery and parser limits](docs/testing/steam-discovery-proof.md)
6. [Owned gameinfo byte planning](docs/testing/gameinfo-plan-proof.md)
7. [Documentation control plane](docs/README.md)
8. [September 1 control packet](docs/handoffs/2026-09-01-project-control-packet.md)
9. [Ownership and human dependencies](docs/project/ownership.md)

Historical candidate handoffs and the August 31 manifest remain dated records;
their old paths, local-green claims, branch state and next-action wording are
not current source acceptance or authority. No live/game/provider action is
implied by this source merge.
