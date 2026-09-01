# DMM clean-room evidence and implementation boundary

**Evidence date:** 2026-09-01  
**Reference project:** Deadlock Mod Manager (DMM)  
**Pinned revision:** [`4626073406a8b99c6e782f3ce509aacc8090cce8`](https://github.com/deadlock-mod-manager/deadlock-mod-manager/tree/4626073406a8b99c6e782f3ce509aacc8090cce8)  
**Reference license:** [GPL-3.0](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/LICENSE.md)  
**Detailed observations:** [Deadlock Mod Manager teardown](./deadlock-mod-manager.md)

This file records the boundary between competitive research and Modlock implementation. It is an engineering control, not legal advice. Counsel should approve the final open-source policy before distribution.

## 1. Rule

Modlock may learn facts, user needs, interoperability constraints, externally observable behavior and failure modes from DMM. Unless Modlock deliberately adopts a GPL-compatible licensing strategy, contributors must not copy or adapt DMM's protected expression or incorporate DMM packages.

The default implementation rule is:

> Write Modlock from Modlock requirements, Valve/GameBanana public contracts, original experiments and independently authored tests. Do not implement while looking at DMM source line by line.

## 2. Evidence reviewed

The research pass reviewed these public materials read-only:

| Evidence | Purpose | Carry-forward classification |
|---|---|---|
| Public repository tree and package manifests | Identify architecture, languages, dependencies and feature breadth. | Facts only. |
| Desktop Rust/TypeScript source | Describe behavioral flows and failure boundaries. | Requirements and black-box test ideas only. |
| Tauri configuration/capabilities | Identify trust surfaces and security questions. | Independent security requirements only. |
| Database/API routers and live OpenAPI | Inventory public HTTP behavior and documentation drift. | Public endpoint facts only; no internal DTO/schema copying. |
| Public documentation | Compare claimed and source-visible features. | Facts, with source links. |
| GitHub releases/API metadata | Pin versions, artifacts and dated counts. | Facts only. |
| Public issues | Build a failure-mode test register. | Problem statements only. |
| GPL and third-party notices | Establish licensing boundary and locate permissive upstreams. | License policy and upstream evaluation list. |

No DMM source file, test, asset, translation, screenshot, binary, marker string or documentation excerpt has been placed in the Modlock implementation tree by this teardown. The teardown uses only short identifiers needed to describe formats, file locations and public endpoints.

## 3. Facts Modlock may rely on

These are functional facts or independently discoverable ecosystem constraints. They still require current verification:

- Deadlock is Steam App ID 1422450.
- Source 2 addons are activated through `gameinfo.gi` search paths and VPK files in addon directories.
- Deadlock CFG files include `autoexec.cfg` and `machine_convars.vcfg` under `game/citadel/cfg`.
- Numeric VPK naming affects load order and one search-path directory has a practical file-count boundary that must be measured.
- Game updates can replace or alter game configuration.
- GameBanana is DMM's primary catalog/source and supports mod-manager deep linking.
- Safe management requires ownership metadata, backups, atomic/staged activation, recovery and reconciliation.
- Mods can contain multiple VPKs, variants, fonts, maps, sounds and hero-specific resources.
- Users need enable/disable, update, uninstall, profiles, ordering, repair and offline behavior.
- Crosshair settings are represented by Deadlock convars; arbitrary per-hero live switching is not proven by DMM.
- Windows file locking, antivirus, disk pressure and interrupted updates are core failure cases.

Whenever possible, Modlock should confirm these facts against Valve behavior, GameBanana documentation, independently created fixture files and black-box game tests—not solely against DMM.

## 4. Material that must not be copied

Without a separate license or an intentional GPL product decision, do not copy or closely adapt:

- Rust, TypeScript, SQL, configuration, build scripts or tests from the DMM repository;
- DMM component hierarchy, screen layouts, icons, illustrations, screenshots or distinctive wording;
- DMM's `.dmm.json` field layout, versioning, marker text, staging-directory names or filename-prefix expression;
- DMM's exact profile/share payload, `.dmodpkg` container design or proprietary/unpublished protocol behavior;
- autoexec/gameinfo marker strings;
- DMM API DTOs, validators, repository classes or database schema;
- issue fixes or algorithms translated line-for-line into another language;
- DMM adaptations of `vpkmerge`, ValveResourceFormat or other permissive upstream projects;
- generated bindings or copied documentation;
- DMM-owned tests, fixtures, malformed samples or golden outputs;
- branding, names, domain language or anything implying affiliation.

Short conventional identifiers such as `autoexec.cfg`, `gameinfo.gi`, VPK filenames, public HTTP paths and Deadlock convar names may be necessary for compatibility. Record why each is technically required and prefer an authoritative game/platform source.

## 5. Independently stated Modlock requirements

The research produces the following problem requirements. These are intentionally independent of DMM's structure:

### Installation safety

- Every downloaded release is immutable and identified by SHA-256 and byte length.
- Untrusted archives/VPKs are inspected in a resource-constrained process before activation.
- The active profile is one complete generation. A replacement generation becomes visible only after validation.
- Every mutation belongs to a durable operation with explicit pre-state, desired state and recovery action.
- Recovery after termination is deterministic: complete the committed activation or restore the previous generation.
- Modlock never modifies the base game's VPK content.
- User/manual files are not claimed or deleted without explicit adoption.

### Shared game files

- Modlock owns a uniquely named block in shared config files and preserves all other bytes as far as the file format permits.
- Every edit captures the original hash, encoding/newline convention, backup and resulting diff.
- A game patch invalidates prior assumptions and moves the client into a repair-required state.
- Mutations that can race the game require the game to be closed.

### Profiles and packs

- A profile records release identity, authorized source, file variant, order, activation state and local compatibility result.
- A pack is a reference manifest, not a redistribution archive.
- Import resolves every item to an authorized immutable release and shows missing/revoked/incompatible items before applying.
- Pack/profile interchange is versioned and documented by Modlock; third-party adapters are isolated.

### Credentials and telemetry

- Long-lived credentials live in an OS credential vault.
- OAuth callbacks never carry or log bearer tokens.
- Telemetry is off by default, resettable, documented and testably silent when disabled.
- A random installation identifier is preferred over a hardware-derived identity.

### Updating

- Desktop update metadata and binaries are signed.
- The updater validates platform, architecture, runtime, channel, version and artifact hash as one contract.
- Key rotation, revocation, failed installation and rollback have rehearsed runbooks.

## 6. Independent implementation workflow

Use this sequence for any feature informed by competitive research:

1. **Researcher records behavior** in this teardown using source links and confidence labels.
2. **Product owner writes a requirement** without DMM names, code structure, schema or wording.
3. **Implementer works from the requirement**, official/public platform documentation and Modlock-owned contracts. The implementer should not consult DMM source during the coding pass.
4. **QA creates original fixtures/tests** from the requirement and observed input/output behavior, not by porting DMM tests.
5. **Reviewer checks provenance** in the pull request: no copied strings, markers, schema shapes, comments, test names or distinctive control flow.
6. **Black-box compatibility testing** compares user-visible outcomes using disposable installations; source similarity is not a goal.
7. **Attribution/license scan** runs before merge and release.

For sensitive subsystems—VPK parsing, pack formats, updater, GameBanana adapters—assign different people to the research and implementation roles when practical.

## 7. Permissive upstream evaluation

DMM's notices mention permissively licensed upstreams including `vpkmerge`, ValveResourceFormat and shadcn/ui. If Modlock wants to use one:

1. evaluate the original upstream repository, not DMM's combined/adapted copy;
2. pin an upstream commit and archive its license text;
3. confirm the relevant files existed under that license at the pinned commit;
4. document modifications and notices in Modlock;
5. run an independent dependency/security review;
6. do not compare or backport DMM-specific changes.

The Deadlock Rich Presence-derived material has no vendored license text in DMM's notice. Do not use that mapping until the original project's license and provenance are independently resolved.

## 8. Provenance fields for Modlock pull requests

Any implementation touching research-informed behavior should state:

```text
Research requirement:
Authoritative platform sources:
Public interoperability facts used:
Third-party code included (repository, commit, license):
DMM source consulted by implementer: no / explain exception
Original tests and fixtures added:
License/provenance review performed by:
```

An exception stating that DMM source was consulted is not automatic rejection, but it requires counsel/maintainer review and a concrete explanation that no protected implementation was copied.

## 9. Compatibility namespaces

Avoid DMM-owned names in new on-disk formats. Modlock should define its own:

- application identifier and protocol scheme;
- operation journal and manifest media types;
- owned CFG/gameinfo markers;
- content-store paths;
- pack/profile schema namespace;
- deep-link and OAuth callback structure;
- log/event vocabulary.

If a future import adapter reads a DMM format, keep it in a quarantined compatibility module with fixture provenance, no DMM writer by default, and a documented legal basis. Do not make DMM's internal file format Modlock's native model.

## 10. Review checklist

Before merging a DMM-informed feature:

- [ ] Requirement is stated in Modlock terms.
- [ ] Official/independent sources are cited where available.
- [ ] No DMM code, tests, docs, UI, assets or translations were copied.
- [ ] No DMM marker, schema or internal identifier became a Modlock default.
- [ ] Any conventional compatibility identifiers are justified.
- [ ] Third-party code comes from its original upstream at a pinned revision.
- [ ] License text and notices are present.
- [ ] Test fixtures were created or licensed for Modlock.
- [ ] Black-box behavior, not source similarity, defines success.
- [ ] Security and privacy requirements are tested.
- [ ] Reviewer signed off on provenance.

## 11. Dated evidence record

| Date | Reference | Action | Result |
|---|---|---|---|
| 2026-09-01 | DMM commit `4626073406a8b99c6e782f3ce509aacc8090cce8` | Read-only architecture and behavior review | Facts and risks recorded in the companion teardown. |
| 2026-09-01 | DMM `v1.1.0` release metadata | Read-only artifact inventory | Stable release pinned; binary not executed. |
| 2026-09-01 | Live DMM OpenAPI | Read-only route inventory | API base/version/routes recorded; security declarations absent. |
| 2026-09-01 | DMM GPL and third-party notices | Read-only license review | Clean-room implementation boundary established. |
| 2026-09-01 | DMM public issues | Read-only failure-mode review | Original Modlock regression requirements derived. |

## 12. Owner decisions still required

These are not research tasks; project ownership or counsel must decide them:

- whether Modlock will remain proprietary, use a permissive license, or accept GPL compatibility;
- whether any DMM interoperability adapter is strategically necessary;
- whether to request a separate commercial/permissive license from DMM maintainers;
- the approved open-source intake and attribution policy;
- whether GameBanana permits Modlock caching, API use, deep linking and/or file mirroring;
- what Valve permits for branding, mod installation, CFG presets and competitive-integrity boundaries.

Until those decisions are made, the conservative rule is independent implementation, no DMM dependency, no DMM-format writer, no file mirroring, and no implication of Valve/GameBanana/DMM affiliation.
