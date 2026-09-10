# September 10 contract integration

## Provenance and independent disposition

Current-main source base: `1f2ba12999c39b9441ff279635df8db9b0702bec`.
The reviewed documentation intent from PR4 (`71f3692112128df401224da4d356589cdf1ea720`)
is included; its dated audit remains historical. The contract source candidate
came from `/Users/ahad/Dev/modlock-phase0-contracts` at old base
`0a45a899afb7ea97dc7fe032bc809d5312eade65`, without modifying that worktree.

All 52 Git-visible candidate files were captured before review. The ordered
JSON path/SHA-256 capture digest was
`b57c57381b992c7b79ec081ab45864ea48ba49149aee5ec0e6f4e5bdc07a1e4a`.
The old manifest file digest remains
`561c36ecf75137d636969f736d64a34eda19b786bc6a4ba271e7c432679eb5f3`.
Its full gate failed on one missing September 5 handoff and three changed
ledger hashes; those failures are preserved as history, not hidden.

One independent reviewer returned **KEEP foundation; REWORK integration**.
Fresh Python 3.13.15 diagnostics passed all 28 contract tests, 19 Markdown files
and seven syntax files, including the strict URL and pack chronology repairs.
The reviewer found no new validator correctness blocker. This verdict covers
synthetic conformance only, not product or Phase 0 acceptance.

## Path dispositions

| Paths | Disposition |
|---|---|
| `contracts/v1/` | Retain candidate bytes as the sole active V1 data authority. |
| `fixtures/` | Retain synthetic metadata, conformance bundle and exact fixture digests; zero real payloads. |
| `contract_validation.py`, `check_contracts.py` | Retain candidate implementation and semantic checks. |
| `tests/test_contracts.py` | Retain hostile/positive cases; adapt fresh-run and workflow assertions only. |
| `mise.toml`, `requirements-contracts.txt` | Retain exact Python and accepted wheel hashes. |
| `check_source_files.py` | Retain Git-visible inventory and strict JSON; align Markdown hard-break handling with current main. |
| `check_source_manifest.py`, `check_fresh.py` | Capture/verify an explicit per-run snapshot; retain historical verification capability without pinning evolving main to August 31. |
| Old `contracts/openapi`, `schemas`, `examples` | Move intact to `docs/design/2026-09-01-contract-outline/`; label deferred design and preserve references. |
| API/crosshair/error designs | Preserve in that archive; no accepted API/client/runtime replacement is claimed. |
| `scripts/check_docs.py` | Preserve current-main validator, require active schema paths, and continue checking deferred-design references. |
| `.github/workflows/docs.yml` | Preserve checkout v7, the five-minute timeout and protected check name; run all gates with Python 3.13.15, including isolated docs validation. Contract failure therefore fails the protected check. |
| `.gitignore` | Add only Python cache/venv ignores. |
| Root ledgers, contract README, affected documentation links | Reconcile current acceptance and next action; do not replace main with stale candidate prose. |
| August 30/31 and September 5 handoff/manifest records | Preserve dated records as history. |

The selected V1 rules are the candidate's closed-world objects and exact UTC
seconds. The superseded outline's additive fields and broader RFC3339 shapes
are not a second accepted format. No released client consumes either, so this
selection is source integration and does not migrate a deployed API.

## Verification and acceptance

Run `mise exec -- python scripts/check_fresh.py` in the integration branch.
The runner installs only pinned wheel hashes in a unique disposable environment,
prints the current source manifest digest, executes all gates, verifies the
same source bytes again and removes the environment. CI runs this on Linux;
local verification runs on macOS. The integrated local gate passes 28 tests,
138 Markdown files, 37 JSON files, 29 feature pages and 10 ADRs. The full source
inventory contains 188 files and is unchanged across the run. Staged and
unstaged whitespace are checked against HEAD. Final review must bind the source head/tree,
diff and current manifest digest; the PR records those exact values.

The old candidate and dirty main-discovery worktree are preserved. No provider,
credential, signing, download, real mod, Windows or game operation is included.
Final source review and CI precede merge. SHO-275 can close after acceptance;
SHO-127, generated clients, a general resolver, real corpus, installer/journal,
Windows evidence and Phase 0 remain unfinished. The next source step after
merge is a pinned local scaffold, then bounded disposable-tree recovery proof.
