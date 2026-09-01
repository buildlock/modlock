# Development log

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

Application code is still intentionally absent. The next engineering checkpoint is the contract-generated monorepo plus synthetic fixture and Rust transaction/recovery walking slice.
