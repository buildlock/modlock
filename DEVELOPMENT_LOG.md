# Development log

## 2026-09-10 — Plan owned gameinfo edits from current bytes

After PR7 merged with independent acceptance and green PR/main Linux/Windows
CI, implemented the next SHO-128 fixture slice. The pure planner inserts/removes
one exact marked search-path entry, preserves all bytes outside that block,
reports changes since a prior digest receipt and rejects a stale-source recheck.
It stores no historical gameinfo content and performs no filesystem operation.

Twelve local tests cover exact round trips, LF/CRLF/mixed endings, Unicode/BOM,
multiple original path entries, idempotence, corrupt/relocated markers, unknown
structure, namespace aliases, byte/input limits and hostile byte mutations.
Owned filesystem tests simulate a Valve replacement; repair preserves new
fields/paths, and unknown replacement structure remains unchanged. A test caught
unmarked Windows trailing-dot/space aliases; conservative comparison now rejects
them. The parser also accepts unquoted trailing wildcards, as shown by Valve's
public format example, while continuing to reject block-comment tokens.

See the [proof guide](docs/testing/gameinfo-plan-proof.md). This is a byte planner
with an explicit disposable application harness, not the production Windows
transaction adapter, current Deadlock compatibility or a game-running check.
Final independent review and CI remain before source acceptance.

## 2026-09-10 — Read-only Steam fixture discovery

After PR6's independent acceptance and green Linux/Windows PR/main CI, added
the next SHO-128 slice: a bounded KeyValues parser, typed library/app metadata,
multiple-library fixture discovery and fresh manual-selection validation. The
implementation uses Valve's published format notes and authored synthetic tests;
no DMM implementation was copied or translated. The
[discovery guide](docs/testing/steam-discovery-proof.md) records exact limits.

Local macOS checks pass 27 regular tests, including 13 new parser/discovery
groups and the prior journal/crash suite. The original long Unix-socket fixture
exceeded macOS's bind-name limit; the harness now binds a short owned path then
renames its inode into the manifest slot. Discovery rejects that real socket.
Clippy and formatting pass; final source review and Linux/Windows CI remain.
No real Steam file, game process, mutation, provider or network is used by tests.
SHO-129 is Done for its accepted narrow prototype. SHO-128 stays open for
semantic gameinfo repair and the remaining prototype criteria.

## 2026-09-10 — First executable Rust transaction proof

After accepted contract PR5 and green main CI, added only the pinned Cargo core,
inert text fixtures and single-use journal/recovery slice needed for one runnable
experiment. It uses an OS lock, fixed filesystem slots, flushed intent, staged
generation, two-phase directory rename, exact digests and restart recovery.
Errors/cancellation attempt rollback; changed files are preserved with an error.

Local macOS tests pass 41 abrupt activation boundaries and six reverse-recovery
boundaries plus contention, cancellation, corrupt records, path/resource and hash
checks. Pinned Linux/Windows CI, actual Linux storage exhaustion, Windows file
locking and a dependency audit are part of the source gate. The
[proof record](docs/testing/synthetic-journal-proof.md) binds final evidence and
remaining limitations. This does not complete SHO-129, the full scaffold/fixture
jobs, production filesystem adapter, game compatibility or Phase 0.


## 2026-09-10 — Integrate the preserved Phase 0 contract foundation

Independent review retained the old candidate's contract/fixture/validator
foundation and confirmed the two recorded SHO-275 repairs. Fresh diagnostic
checks passed all 28 contract tests, 19 Markdown files and seven Python files.
The old complete gate failed because September 5 handoff edits no longer
matched its August 31 whole-repository manifest. Both old worktrees remain
unchanged; no stale-manifest success is claimed.

This current-main integration selects one active `contracts/v1` authority,
archives the conflicting older schema/API designs, reconciles links and
current ledgers, preserves the current checkout pin and isolated docs gate,
and extends the protected check with pinned contract CI. Source snapshots are captured and verified per
run; the old manifest remains historical. The full integrated fresh gate passes 28 tests, 138 Markdown files, 37 JSON
files, 29 feature pages and 10 ADRs. Final independent review and CI are
recorded with the source PR. No runtime, fixture payload,
provider, game, signing or release action was performed.

## 2026-08-26 — Session 1: ecosystem research and product architecture

- Created the Modlock greenfield workspace.
- Researched the current Deadlock Mod Manager repository, API, release, install behavior, package formats, file paths, and open failure classes.
- Researched GameBanana as the primary identifiable public Deadlock mod source and Grimoire as a second active manager.
- Documented Deadlock configuration/crosshair constraints, community game-data sources, Steam/Valve policy boundaries, hosting provenance, and license implications.
- Defined the website, public API/data model, upload/scanning pipeline, native desktop engine, transaction journal, CFG ownership model, updater, security controls, moderation policy, and phased roadmap.
- Added the first Globalsave checkpoint: status, handoff, open questions, development log, and implementation backlog.
- Published the checkpoint to the private `ahadify/modlock` GitHub repository.
- Created the Shoplift Digital Modlock Linear project, Phase 0 milestone, project brief, and ten prioritized seed issues.

Verification:

- JSON ecosystem snapshot parsed successfully with `jq`.
- Internal documentation targets exist.
- Markdown code fences are balanced.
- Documentation was checked for placeholder markers and accidental sensitive values.

No application code or automated test suite exists yet.

## 2026-09-01 — Session 2: complete documentation baseline

- Completed current, pinned Deadlock Mod Manager and GameBanana teardown/evidence dossiers and refreshed the dated ecosystem snapshot.
- Created a 29-page feature wiki, competitive matrix, and requirements traceability.
- Added implementation-neutral OpenAPI/JSON Schema contracts and examples.
- Added ten ADRs, ERD/data dictionary, architecture/NFR/authorization, product strategy, UX/accessibility, analytics, and risk/project controls.
- Added master test/fixture/fuzz/performance/compatibility/QA plans, developer/contribution/versioning guidance, and project agent instructions.
- Added formal threat/privacy design, moderation/verification/takedown SOPs, operations/release/security/backup/source-outage runbooks, draft policies, and player/creator/support guides.
- Separated Codex-owned work from ten human-only dependencies and prepared outreach, research, counsel, consent, and Windows-host packets.
- Expanded offline documentation CI to validate JSON, contract references, internal links, fences, features, ADRs, package completeness, and formatting.

Application code was still intentionally absent. At that checkpoint, the planned next work was a contract-generated monorepo plus synthetic fixtures and a Rust transaction/recovery walking slice; Session 3 supersedes that ordering after discovering the unmerged candidate.

## 2026-09-01 — Session 3: deterministic portfolio orchestration audit

- Audited the exact repository tree, instructions, worktrees, current remote/default branch, GitHub protection/PR/CI state, Linear project/issues/comments/dependencies, and a live Graphify index/query at current main `1f2ba129...`.
- Recorded that merged main remains documentation/contracts-only and has no product runtime, migrations, deployment, providers, or production evidence.
- Identified `/Users/ahad/Dev/modlock-phase0-contracts` as a dirty, unpushed, four-commits-behind **IMPLEMENTED BUT UNMERGED** contract/conformance candidate with **SYNTHETIC OR TEST-ONLY** fixtures, an unverified self-reported gate, seven exact canonical-file collisions, and a competing contract layout.
- Audited BuildLock and Deadlock-Infra boundaries. Recorded Modlock as canonical owner of mod metadata/releases, binary quarantine/scanning, resolution, and local installation/recovery; BuildLock may consume presentation projections but must not own a second mod registry. Shared artifact identity and central account/creator issuance remain target-state decisions.
- Added the dated project control packet with all 29 feature states, separate readiness dimensions, a deterministic 50-job queue, writer/reviewer separation, commands, evidence gates, parallel/collision groups, ten owner decisions, and Linear reconciliation.
- Changed the next checkpoint: independent read-only SHO-275/candidate review and deliberate current-main integration now precede scaffolding.

No runtime code, candidate-worktree source, Linear state, provider, credential, production system, migration, deployment, permission, GitHub setting, or merge was changed.
