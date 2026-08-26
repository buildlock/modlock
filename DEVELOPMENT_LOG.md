# Development log

## 2026-08-26 — Session 1: ecosystem research and product architecture

- Created the Modlock greenfield workspace.
- Researched the current Deadlock Mod Manager repository, API, release, install behavior, package formats, file paths, and open failure classes.
- Researched GameBanana as the primary identifiable public Deadlock mod source and Grimoire as a second active manager.
- Documented Deadlock configuration/crosshair constraints, community game-data sources, Steam/Valve policy boundaries, hosting provenance, and license implications.
- Defined the website, public API/data model, upload/scanning pipeline, native desktop engine, transaction journal, CFG ownership model, updater, security controls, moderation policy, and phased roadmap.
- Added the first Globalsave checkpoint: status, handoff, open questions, development log, and implementation backlog.

Verification:

- JSON ecosystem snapshot parsed successfully with `jq`.
- Internal documentation targets exist.
- Markdown code fences are balanced.
- Documentation was checked for placeholder markers and accidental sensitive values.

No application code or automated test suite exists yet.

