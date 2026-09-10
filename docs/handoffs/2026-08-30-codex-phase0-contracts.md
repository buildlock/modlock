# Modlock Phase 0 contract-foundation handoff

- Original checkpoint date: **2026-08-30**
- Hostile-review correction date: **2026-08-31**
- Worktree: `/Users/ahad/Dev/modlock-phase0-contracts`
- Branch: `codex/phase0-contracts`
- Base and current HEAD: `0a45a899afb7ea97dc7fe032bc809d5312eade65`
- Upstream: none
- State: source changes are intentionally uncommitted and unpushed for independent review

## Objective

Implement the next unblocked source-only Phase 0 slice:

- `SHO-127`: establish the V1 machine-contract and conformance foundation.
- `SHO-124`: add only a synthetic, zero-payload manifest/control scaffold.

## Proven scope

- Draft 2020-12 schemas cover hosted immutable releases, external references, install plans, desired-state profiles, reference-only packs, typed CFG settings, CFG registries, and the synthetic fixture control manifest.
- Every contract has exact `schema_version: 1` and `contract` discriminators. Every object schema is closed with `additionalProperties: false`.
- Hosted release records require creator, license, provenance, authoritative rights, exact object SHA-256, and exact-digest scan attestations. Published records reject unknown redistribution/modification/third-party-asset state and require clean scans, tested builds, and coherent creation/scan/publication evidence.
- External records remain source-only and retain provider/creator/license/provenance identity. GameBanana identity pins the authoritative host. Ready use requires authoritative tested-build evidence, exact filename/media/target/size/digest, a clean bound scan, installable resolution, and no unknown install-relevant rights.
- `ready` install plans require `tested` compatibility and bind every mutation-relevant fact to source authority. Direct release requests are release-pure; mixed sources require a pack. Plans retain Windows-safe targets/filenames, staging, journal/validation/rollback requirements, game-closed mutation, base-VPK protection, block reasons, and bounded revocation evidence.
- A mandatory five-document synthetic graph binds the fixture's one hosted and one external authority record to the ready plan, profile, and reference-only pack, including exact source/build/fact/rights and pack publication/evidence-lifetime checks. It is not a general multi-source runtime resolver; downstream use must version/generalize it.
- Packs use deterministic content/version digests; item, source, variant, conflict, or order drift invalidates approval. Creator, community, revoked, and expired evidence all binds the exact version; terminal records preserve attribution/evidence, expiry, transition time, and reason. Ready requests require a published pack with active evidence covering the whole plan lifetime.
- CFG values are typed and range-checked; safe string/enum values reject controls, separators, escapes, and script-like scalars, and V1 has no arbitrary regex field. V1 requires `auto_apply: false` until a cryptographically verified exact allowlist exists. Registry state is only `draft`, `signature-present-unverified`, or `revoked`; signature bytes have algorithm-specific encoding rules and an exact `not-verified` marker. There is no cryptographic trust, and signature-present payloads fail closed on floats until canonical decimals are designed.
- Strict JSON rejects duplicate keys, `NaN`, infinities, and floating overflow. Explicit local format checks deterministically reject invalid calendar/times and malformed/NFKC-netloc URLs without exceptions. Conservative Windows paths reject every NFKC-changing form plus controls, reserved characters/device aliases, traversal, and case-normalized hosted collisions. Revocation chronology is validated across every V1 lifecycle that exposes revocation.
- Seven positive synthetic fixtures, 79 machine-readable exact single-document cases, 27 exact authority-graph cases, and 26 test methods pass. The complete symlink-free fixture tree parses as metadata; the `SHO-124` scaffold still has 13 planned controls and zero payloads.

## Exact changed files

Modified:

- `.github/workflows/docs.yml`
- `.gitignore`
- `DEVELOPMENT_LOG.md`
- `HANDOFF.md`
- `README.md`
- `STATUS.md`
- `docs/06-roadmap.md`
- `docs/linear-backlog.md`
- `docs/handoffs/2026-08-26-main-research-architecture.md`

Added:

- `contracts/README.md`
- `contracts/v1/index.json`
- `contracts/v1/schemas/common.schema.json`
- `contracts/v1/schemas/hosted-release.schema.json`
- `contracts/v1/schemas/external-reference.schema.json`
- `contracts/v1/schemas/install-plan.schema.json`
- `contracts/v1/schemas/profile.schema.json`
- `contracts/v1/schemas/pack.schema.json`
- `contracts/v1/schemas/cfg-setting.schema.json`
- `contracts/v1/schemas/cfg-registry.schema.json`
- `contracts/v1/schemas/fixture-corpus.schema.json`
- `fixtures/README.md`
- `fixtures/corpus-manifest.v1.json`
- `fixtures/contracts/conformance.v1.json`
- `fixtures/contracts/valid/hosted-release.json`
- `fixtures/contracts/valid/external-reference.json`
- `fixtures/contracts/valid/install-plan.json`
- `fixtures/contracts/valid/profile.json`
- `fixtures/contracts/valid/pack.json`
- `fixtures/contracts/valid/cfg-setting.json`
- `fixtures/contracts/valid/cfg-registry.json`
- `requirements-contracts.txt`
- `mise.toml`
- `scripts/check_contracts.py`
- `scripts/check_fresh.py`
- `scripts/check_source_manifest.py`
- `scripts/check_source_files.py`
- `scripts/contract_validation.py`
- `tests/test_contracts.py`
- `docs/handoffs/2026-08-30-codex-phase0-contracts.md`
- `docs/handoffs/2026-08-31-phase0-contracts-source-manifest.sha256`

## Exact source hashes

[`2026-08-31-phase0-contracts-source-manifest.sha256`](2026-08-31-phase0-contracts-source-manifest.sha256) records the SHA-256 of every tracked or non-ignored untracked repository file except the manifest itself, avoiding a self-hash cycle. The fresh runner checks exact path-set parity, canonical ordering, regular-file/symlink safety, and every digest. The seven positive fixture hashes are also embedded in and verified against `fixtures/corpus-manifest.v1.json`.

## Verification

Required environment:

```text
mise install
mise exec -- python scripts/check_fresh.py
```

Results:

- Strict source parsing/inventory and complete source-manifest parity passed for the final tracked/untracked non-ignored repository file set; exact aggregate/manifest digests are recorded with the final freeze evidence.
- Contract conformance passed: 26 unittest methods, seven positive contract fixtures, the exact five-document synthetic authority graph, eight unknown-version rejections, eight unknown-root-field rejections, 79 exact single-document mutations, 27 exact graph mutations, strict/total formats, path/filename, source/build/fact/rights, pack/lifecycle/evidence, unverified registry encoding, and complete corpus controls.
- Documentation validation passed for 18 Markdown files.
- `pip check` reported `No broken requirements found.`
- Python byte-compilation passed for `scripts/` and `tests/`.
- `git diff --check` passed.
- Fixture inventory found only the exact expected JSON/Markdown files, checked symlinks before resolution, and strictly parsed all JSON content.
- The tracked runner proved an unrelated repository `.venv` cannot select the gate interpreter, asserted exact `mise.toml` CPython 3.13.15, created a unique temporary venv, installed only accepted macOS arm64 wheel hashes, ran every gate, and removed the temporary environment. The Ubuntu x64 CPython 3.13 path has its separate pinned `rpds-py` wheel and the same five universal wheels. System Python 3.9.6 is neither a supported toolchain nor a security gate.
- The original `/Users/ahad/Dev/modlock` checkout remained clean on `main` at the exact base commit.

The CI workflow preserves the branch-protected job display name exactly as `Validate documentation`, pins Ubuntu 24.04, maintained CPython 3.13.15, the setup action commit, and accepted dependency wheel hashes, then invokes the same fresh runner. The same exact Python is pinned locally through `mise.toml`, with separate accepted Ubuntu x64 and macOS arm64 wheels. This improves integrity/repeatability but is not a bit-for-bit reproducible environment because the hosted runner image and local OS/tool manager remain mutable.

## Explicit boundaries

- No UI or API implementation language was selected.
- No provider was contacted and no live third-party API or source was queried.
- No real mods, Deadlock/Valve files, provider responses, archives, VPKs, executable bytes, or third-party assets were downloaded or added.
- Synthetic metadata is restricted to internal conformance and marked repository-license-pending; this slice does not make a licensing decision for the owner.
- RAR/7z entries are metadata-only future support gates. No RAR/7z dependency or support was added.
- No archive/VPK parser, installer, transaction journal/runtime, Steam/game discovery, `gameinfo.gi` patcher, CFG writer, database, API service, generated client, cryptographic signing/verification operation, general multi-source resolver, UI, deployment, or external mutation was implemented.
- `SHO-127` remains in progress pending independent review and downstream adoption. `SHO-124` remains incomplete pending a separately rights-reviewed real/synthetic payload corpus. Phase 0 remains incomplete.

## Owner decisions and blockers

No new owner decision blocks this source slice. Before any trusted registry/auto-apply adoption, the owner must choose a key inventory, cryptographic verification rules, exact allowlist, and a cross-language canonical decimal representation if float-valued signature payloads are required; V1 exposes none of that trust. Before runtime adoption, the one-hosted/one-external conformance graph must be generalized and versioned. Existing owner decisions remain open: Valve policy/branding, GameBanana terms, UI stack, RAR/7z support, current-build CFG verification, creator approvals/rights, and automatic per-hero switching.

## Exact next action

Independently review the schemas and semantic invariants. If accepted, commit this bounded source-only checkpoint, deliberately synchronize `SHO-127`/`SHO-124` status in Linear, then use the approved contracts to scope the separate `SHO-129` Rust journal/recovery proof against disposable synthetic trees.
