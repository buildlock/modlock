# Documentation completeness matrix

> September 10 source update: the [active V1 foundation](../../contracts/README.md)
> now has executable synthetic conformance. The API/schema/example outlines linked
> below remain archived design; API generation, runtime and real-corpus proof are
> still unfinished. See the [integration record](../handoffs/2026-09-10-contract-integration.md).


Last reviewed: **2026-09-01**  
Owner of this matrix: project documentation/control plane

This matrix describes documentation readiness, not software readiness. No item labelled `complete-design` should be read as implemented, production-rehearsed, approved by Valve/GameBanana, or approved by counsel. The exhaustive file-by-file inventory is in [docs/README.md](../README.md).

## Status vocabulary

| Status | Meaning |
|---|---|
| `complete-design` | Sufficiently specified as a design/evidence baseline; implementation and runtime proof may still be absent. |
| `draft-needs-owner/counsel` | Cannot be finalized without an operator decision, external authorization, identity/consent, or qualified legal review. |
| `evidence-needs-Windows` | Design exists, but native Windows/Deadlock/runtime evidence is required. |
| `future-implementation` | Describes future code, infrastructure, runbook rehearsal, or UI and must be reconciled with what is actually built. |

Human dependencies use the authoritative `HUM-001`–`HUM-010` definitions in [delivery ownership](ownership.md#ahad-owned-decisions-and-actions). `None` means no current human-only dependency to complete the document design; it does not mean the described software exists.

## Control, research, and product baseline

| Artifact/package | Build stage | Status | Remaining evidence or approval boundary | Human dependency |
|---|---|---|---|---|
| [Documentation control plane](../README.md) and this matrix | All | `complete-design` | Keep synchronized when artifacts/status change. | None |
| [Deterministic project control packet](../handoffs/2026-09-01-project-control-packet.md) | Current orchestration | `complete-design` | Live evidence is dated; packet branch/PR/CI must be accepted before it becomes merged authority. It does not make product source ready. | HUM-007, HUM-008, HUM-010 for named owner decisions |
| Root [README](../../README.md), [STATUS](../../STATUS.md), [HANDOFF](../../HANDOFF.md), and [development log](../../DEVELOPMENT_LOG.md) | All | `complete-design` | Status/handoff dates must be refreshed at each checkpoint. | None |
| [Executive brief](../00-executive-brief.md) | Phase 0 | `complete-design` | Revisit positioning after interviews and Windows benchmark. | HUM-003, HUM-006, HUM-008 |
| [Ecosystem research](../01-ecosystem-research.md) and [source register](../07-sources.md) | Phase 0 | `complete-design` | Dated facts require periodic refresh; absence of public policy is not approval. | HUM-001, HUM-002 |
| [2026-08-26](../snapshots/2026-08-26-ecosystem.json) and [2026-09-01](../snapshots/2026-09-01-ecosystem.json) ecosystem snapshots | Phase 0 | `complete-design` | Dated evidence only; never present counts as current. | None |
| [Product specification](../02-product-specification.md) | Phase 0 | `complete-design` | Business/NSFW/telemetry/brand choices remain defaults. | HUM-008 |
| [Product strategy](../product/strategy.md) | Phase 0 | `complete-design` | Validate positioning and outcomes through interviews and measured native proof. | HUM-003, HUM-006, HUM-008 |
| [Personas and journeys](../product/personas-and-journeys.md) | Phase 0 | `draft-needs-owner/counsel` | Research hypotheses require planned creator/player interviews and vocabulary validation. | HUM-006 |
| [Interview plan](../research/interview-plan.md) and [pilot recruitment checklist](../research/pilot-recruitment-checklist.md) | Phase 0 | `draft-needs-owner/counsel` | Plans are ready; recruitment, consent, sessions, and recorded evidence require human participants/authority. | HUM-006 |
| [Content taxonomy/capability model](../product/content-taxonomy.md) | Phase 0–1 | `complete-design` | Validate taxonomy against pilot corpus; owner decides NSFW/community boundaries. | HUM-006, HUM-008 |
| [Competitive matrix](../product/competitive-matrix.md) | Phase 0 | `complete-design` | Runtime comparison needs controlled Windows measurements. | HUM-003, HUM-004 |
| [Requirements traceability](../product/requirements-traceability.md) | All | `complete-design` | Convert planned contract/test names to implemented links as code lands. | None |
| [Roadmap](../06-roadmap.md) and [Linear mirror](../linear-backlog.md) | All | `complete-design` | Estimates and issue state require active owner review/sync. | HUM-010 |
| [Open questions](../open-questions.md) | Phase 0–3 | `draft-needs-owner/counsel` | Close with ADR/policy/evidence, not chat-only answers. | HUM-001, HUM-002, HUM-003, HUM-005, HUM-006, HUM-008 |
| [Risk register](risk-register.md) | All | `complete-design` | Review high-exposure risks at every milestone and attach evidence. | HUM-010 |
| [Project glossary](glossary.md) | All | `complete-design` | Keep terminology aligned with contracts, UI, policy and support prose. | None |
| [Workstream RACI](raci.md) | All | `draft-needs-owner/counsel` | Replace role labels with named primary/backup owners and escalation contacts before beta. | HUM-007, HUM-010 |
| [Delivery ownership](ownership.md) | All | `complete-design` | Update when authority/accounts/hardware change. | None |
| [Owner decision checklist](decision-checklist.md) | Phase 0/beta | `draft-needs-owner/counsel` | Owner answers must become ADRs/policy values. | HUM-007, HUM-008, HUM-010 |
| [Outreach packets](outreach-packets.md) | Phase 0 | `draft-needs-owner/counsel` | Send/authorize from a truthful operator identity and record responses. | HUM-001, HUM-002 |
| [Windows reference host checklist](windows-test-host-checklist.md) | Phase 0–beta | `evidence-needs-Windows` | Host and sacrificial-install record must be populated before native/game claims. | HUM-003, HUM-004 |
| [Counsel review packet](counsel-review-packet.md) | Before public accounts/uploads | `draft-needs-owner/counsel` | Packet is prepared; operator/jurisdiction and qualified counsel review remain. | HUM-005, HUM-007, HUM-008 |
| [Historical research handoff](../handoffs/2026-08-26-main-research-architecture.md) | Historical | `complete-design` | Preserve as a dated checkpoint; current STATUS supersedes it. | None |
| [Documentation-baseline handoff](../handoffs/2026-09-01-main-documentation-baseline.md) | Supporting checkpoint | `complete-design` | The deterministic packet supersedes its next-work ordering but not its artifact evidence. | None |

## Architecture, contracts, data, and development

| Artifact/package | Build stage | Status | Remaining evidence or approval boundary | Human dependency |
|---|---|---|---|---|
| [Platform architecture](../03-platform-architecture.md) | Phase 0–1 | `complete-design` | Vendor selection/walking skeleton remain future; canonical mod/artifact ownership and identity issuer are unresolved OQ9/OQ10 decisions. | HUM-007, HUM-008, HUM-009 |
| [Nonfunctional requirements](../architecture/nonfunctional-requirements.md) | All | `complete-design` | Attach measurements and release evidence as implementation lands. | HUM-003, HUM-004, HUM-010 |
| [Authorization matrix](../architecture/authorization-matrix.md) | Phase 0–1 | `draft-needs-owner/counsel` | Finalize operator roles, break-glass custody, legal/security separation and test it server-side. | HUM-005, HUM-007, HUM-010 |
| [Desktop technical design](../04-desktop-technical-design.md) | Phase 0–2 | `evidence-needs-Windows` | Shell benchmark, filesystem semantics, Steam/game, antivirus, updater, and footprint proof. | HUM-003, HUM-004 |
| Accepted ADRs [0001](../adr/0001-product-boundaries.md), [0004](../adr/0004-immutable-content-and-packs.md), [0006](../adr/0006-upload-scanning.md), and [0010](../adr/0010-clean-room-gpl.md) | Phase 0 | `complete-design` | Re-open only with contrary policy/legal/security evidence. | HUM-005 for legal interpretation only |
| [ADR-0002 monorepo/contracts](../adr/0002-monorepo-and-contracts.md) | Phase 0 | `future-implementation` | Validate when the code skeleton and generators land. | None |
| [ADR-0003 desktop core/shell](../adr/0003-desktop-core-and-shell.md) | Phase 0 | `evidence-needs-Windows` | Rust core accepted; shell remains benchmark-gated. | HUM-003 |
| Proposed ADRs [0005 API/data](../adr/0005-api-and-data-platform.md), [0007 auth](../adr/0007-auth-and-identity.md), and [0008 signing/telemetry](../adr/0008-updates-signing-telemetry.md) | Phase 0–2 | `draft-needs-owner/counsel` | Vendor/operator/telemetry/signing decisions and account ownership. | HUM-007, HUM-008, HUM-009 |
| [ADR-0009 GameBanana adapter](../adr/0009-gamebanana-adapter.md) | Phase 0–1 | `draft-needs-owner/counsel` | Written GameBanana confirmation or independent fallback. | HUM-002 |
| [ADR index](../adr/README.md) | All | `complete-design` | Keep individual statuses authoritative. | None |
| [Contract rules](../../contracts/README.md), [OpenAPI v1](../design/2026-09-01-contract-outline/openapi/modlock-v1.openapi.json), and release/external/install/profile/pack/CFG/crosshair/error/fixture JSON Schemas | Phase 0–3 | `complete-design` | Add generated clients, compatibility tests, and source digests when code lands. | None |
| Local `/Users/ahad/Dev/modlock-phase0-contracts` candidate | Phase 0 | `future-implementation` | **IMPLEMENTED BUT UNMERGED / SYNTHETIC OR TEST-ONLY:** independently review source-manifest SHA `561c36...`, reconcile seven canonical collisions and one contract authority; no runtime or real payload proof. | None; reviewer assignment required |
| Release/install/profile/pack/crosshair/fixture [contract examples](../design/2026-09-01-contract-outline/examples/release.example.json) | Phase 0–3 | `complete-design` | Keep every example schema-valid and add negative/compatibility fixtures. | None |
| [API versioning/deprecation](../api/versioning-and-deprecation.md) and [error catalog](../api/error-catalog.md) | Phase 0–1 | `complete-design` | Enforce through CI, generated clients, and compatibility tests. | None |
| [ERD](../data/erd.md) and [data dictionary](../data/data-dictionary.md) | Phase 0–1 | `complete-design` | Translate to migrations/constraints and validate retention behavior. | HUM-005, HUM-008 for final retention/business values |
| [Development handbook](../development/handbook.md), root [CONTRIBUTING](../../CONTRIBUTING.md), and [versioning/release policy](../development/versioning-release-policy.md) | Phase 0–2 | `future-implementation` | Replace planned commands/tool versions with verified bootstrap/CI/release flows. | HUM-007 for license/contribution ownership |

## Feature and design package

| Artifact/package | Build stage | Status | Remaining evidence or approval boundary | Human dependency |
|---|---|---|---|---|
| [Feature control/index/template](../features/README.md) | All | `complete-design` | Feature status moves only with acceptance evidence. | None |
| Website core [WEB-001–WEB-008](../features/README.md#website) | Phase 1 | `complete-design` | Implement API/UI and mapped tests; external source behavior remains adapter-gated. | HUM-002 where GameBanana-backed |
| Trust website [WEB-011–WEB-012](../features/README.md#website) | Phase 1 | `draft-needs-owner/counsel` | Operational roles, policy wording, legal intake, contacts, response targets. | HUM-005, HUM-007, HUM-008 |
| Pack/preset website [WEB-009–WEB-010](../features/README.md#website) | Phase 3 | `draft-needs-owner/counsel` | Exact-version consent, external rights, community-reporting decision, game-build validation. | HUM-005, HUM-006, HUM-008 |
| Desktop core [DESK-001–DESK-009](../features/README.md#desktop) | Phase 2 | `evidence-needs-Windows` | Native UI, Steam discovery, VPK/install/profile/load-order/conflict and performance evidence. | HUM-003, HUM-004 |
| CFG/crosshair [DESK-010–DESK-011](../features/README.md#desktop) | Phase 3 | `evidence-needs-Windows` | Current-build command/range, file ownership, persisted-convar, and safe activation proof. | HUM-003, HUM-004, HUM-001 |
| Desktop packs [DESK-012](../features/desktop/DESK-012-packs.md) | Phase 3 | `future-implementation` | Resolver/import implementation and cross-provider fixture proof. | HUM-002, HUM-006 |
| Recovery/offline/deep links/settings/updater [DESK-013–DESK-017](../features/README.md#desktop) | Phase 2 | `evidence-needs-Windows` | Failure injection, protocol registration, credential vault, packaging/signing/update recovery. | HUM-003, HUM-004, HUM-007, HUM-009 |
| [Information architecture](../design/information-architecture.md) and [design-system baseline](../design/design-system-baseline.md) | Phase 1–3 | `complete-design` | Validate with implemented prototypes and usability testing. | HUM-006 for pilot feedback |
| [Accessibility requirements](../design/accessibility.md) | Phase 1–beta | `evidence-needs-Windows` | Web audits plus Windows UI Automation/screen-reader/scaling evidence. | HUM-003 |
| [Content/localization baseline](../content-style-localization.md) | Phase 1–later | `complete-design` | Build localization pipeline and validate public terminology. | HUM-005 for legal terminology |
| [Analytics taxonomy](../product/analytics-taxonomy.md) | Phase 1–beta | `draft-needs-owner/counsel` | Final telemetry default, legal basis/consent, retention, vendor, and privacy UI. | HUM-005, HUM-008, HUM-009 |

## Teardowns, integrations, and evidence

| Artifact/package | Build stage | Status | Remaining evidence or approval boundary | Human dependency |
|---|---|---|---|---|
| [DMM teardown](../teardowns/deadlock-mod-manager.md) | Phase 0 | `evidence-needs-Windows` | Source/live audit is deep; stable Windows binary/runtime/network/footprint behavior not exercised. | HUM-003, HUM-004 |
| [DMM clean-room evidence](../teardowns/dmm-clean-room-evidence.md) | Phase 0–implementation | `complete-design` | Maintain independent requirements/tests and log any new reference observations. | HUM-007 for final Modlock license; HUM-005 if counsel review requested |
| [GameBanana teardown](../teardowns/gamebanana.md) | Phase 0 | `draft-needs-owner/counsel` | Technical public audit complete; terms, rate, caching, attribution, bulk sync, registration, and SLA need written confirmation. | HUM-002 |
| [GameBanana adapter spec](../integrations/gamebanana-adapter.md) | Phase 0–1 | `draft-needs-owner/counsel` | Implement only within confirmed terms or safe outbound-link fallback. | HUM-002 |

## Security, privacy, policy, and moderation

| Artifact/package | Build stage | Status | Remaining evidence or approval boundary | Human dependency |
|---|---|---|---|---|
| [Security/legal design boundary](../05-security-moderation-legal.md) | Phase 0–beta | `complete-design` | Engineering baseline only; explicitly not legal advice. | HUM-005 |
| [Formal threat model](../security/threat-model.md), [privacy review checklist](../security/privacy-review-checklist.md), and root [SECURITY](../../SECURITY.md) | Phase 0–beta | `future-implementation` | Validate against actual architecture; complete feature/privacy reviews, external review, and staffed disclosure channel before beta. | HUM-005, HUM-007, HUM-010 |
| [Data retention/deletion/export](../privacy/data-retention.md) | Phase 1–beta | `draft-needs-owner/counsel` | Operator/jurisdiction/legal bases/providers/exact periods/legal holds. | HUM-005, HUM-007, HUM-008 |
| [Policy index](../policies/README.md), [Terms](../policies/terms-draft.md), [Privacy](../policies/privacy-draft.md), [Content Policy](../policies/content-policy-draft.md), [Creator Terms](../policies/creator-terms-draft.md), [consent](../policies/verified-artifact-consent-draft.md), and [community guidelines](../policies/community-guidelines-draft.md) | Before public accounts/uploads | `draft-needs-owner/counsel` | Not final legal documents; fill operator/jurisdiction/contact/age/provider/business values and obtain counsel approval. | HUM-005, HUM-006, HUM-007, HUM-008 |
| [Moderation SOP](../moderation/sop.md), [takedown/appeals](../moderation/takedown-and-appeals.md), and [verification SOP](../moderation/verification-sop.md) | Phase 1–beta | `draft-needs-owner/counsel` | Counsel/operator approval, staffed roles, contacts, targets, training, and tabletop evidence. | HUM-005, HUM-006, HUM-007, HUM-010 |

## Operations, testing, and support

| Artifact/package | Build stage | Status | Remaining evidence or approval boundary | Human dependency |
|---|---|---|---|---|
| [Master test strategy](../testing/test-strategy.md) | Phase 0–beta | `complete-design` | Implement harnesses/CI and attach environment/test artifacts. | HUM-003, HUM-004 for Windows/game layers |
| [Fixture catalog/rights manifest](../testing/fixture-catalog.md) | Phase 0 | `draft-needs-owner/counsel` | Generate synthetic corpus; real mod corpus needs explicit rights/creator permission. | HUM-004, HUM-006 |
| [Compatibility matrix](../testing/compatibility-matrix.md) and [performance plan](../testing/performance-plan.md) | Phase 0–beta | `evidence-needs-Windows` | Populate reference hardware/game/client/AV/filesystem rows and measured results. | HUM-003, HUM-004 |
| [Fuzzing plan](../testing/fuzzing-plan.md) | Phase 0–beta | `future-implementation` | Implement continuous fuzz targets, corpus retention and release gates. | None |
| [QA/UAT plan](../testing/qa-uat-plan.md) | Alpha–beta | `future-implementation` | Execute against implemented features with representative pilot users and attach results. | HUM-003, HUM-004, HUM-006, HUM-010 |
| [Production handbook](../operations/production-handbook.md), [SLO/observability](../operations/slo-observability.md), [status/support](../operations/status-and-support.md), and [backup/DR](../operations/backup-disaster-recovery.md) | Phase 1–beta | `future-implementation` | Populate vendors/accounts/contacts; deploy dashboards/backups and prove restore/SLO behavior. | HUM-007, HUM-009, HUM-010 |
| [Incident response](../operations/incident-response.md), [malware revocation](../operations/malware-revocation.md), and [third-party outage](../operations/third-party-outage.md) | Before beta | `future-implementation` | Staff roles/contact tree, implement kill switches, and complete tabletop drills. | HUM-002, HUM-007, HUM-009, HUM-010 |
| [Release/signing/updater](../operations/release-signing-updater.md) and [signing compromise](../operations/signing-key-compromise.md) | Phase 2–beta | `evidence-needs-Windows` | Legal signing identity, credentials/custodians, Windows packages, offline recovery, and compromise drill. | HUM-003, HUM-007, HUM-009, HUM-010 |
| [Release-gate checklist](../release/release-gate-checklist.md) | Every release | `draft-needs-owner/counsel` | Populate objective evidence, counsel/operator decisions and final go/no-go for each candidate. | HUM-005, HUM-007, HUM-010 |
| [Player](../support/player-guide.md), [creator](../support/creator-publishing-guide.md), [authoring](../support/pack-and-preset-authoring.md), [migration](../support/migration-import.md), [troubleshooting](../support/troubleshooting.md), and [moderator/admin](../support/moderator-admin-guide.md) guides | Alpha–beta | `future-implementation` | Reconcile labels/screens/actions with implemented product; user test and staff training. | HUM-006, HUM-007, HUM-010 |

## Human dependency map

The authoritative explanation and approval boundary for each ID is [docs/project/ownership.md](ownership.md#ahad-owned-decisions-and-actions). This table shows where the outstanding dependency lands in the documentation package.

| Dependency | Documentation affected | Closure evidence |
|---|---|---|
| `HUM-001` Valve outreach | Open questions, product boundaries, CFG/crosshair, content policy, risk register | Authorized/sent outreach record and response, or recorded owner acceptance of conservative fallback |
| `HUM-002` GameBanana outreach | Teardown, adapter ADR/spec, catalog/deep-link/pack features, outage runbook | Written terms/registration answer or ADR choosing outbound-link-only fallback |
| `HUM-003` Windows 11 hardware | Desktop design/features, DMM runtime audit, accessibility, test strategy, signing/updater | Recorded reference hardware plus benchmark/compatibility/test evidence |
| `HUM-004` Sacrificial Deadlock install | Discovery/install/repair/CFG/crosshair fixtures and runtime tests | Explicit scope/backup acceptance plus current-build test artifacts |
| `HUM-005` Qualified counsel | Policies, retention/privacy, takedown, moderation, branding, licensing interpretation | Counsel-reviewed version, jurisdiction/operator values, approval/change record |
| `HUM-006` Pilot creators/players | Fixture rights, creator profiles, verified packs/presets, consent, guides/usability | Signed/recorded exact-version rights and approval evidence; pilot feedback |
| `HUM-007` Legal operator/signing identity | Policies, SECURITY/support contacts, auth/vendor ADRs, release/signing, contributions | Operator/contact/jurisdiction/signing identity committed without secrets |
| `HUM-008` Business/risk choices | Decision checklist, product spec, NSFW, donations, telemetry, retention, policy boundaries | Owner decisions captured in ADRs/policies |
| `HUM-009` Production credentials | Provider handbook, auth/storage/email, observability, backups, signing/update | Operator-owned accounts/roles configured; secret names only in docs; restore/signing proof |
| `HUM-010` Release go/no-go | Roadmap, risk register, operations drills, policy gates, support readiness | Signed milestone checklist with linked objective evidence |

## Update rule

When an artifact changes status:

1. Attach the decision, counsel review, Windows result, implementation link, or rehearsal evidence that justifies the change.
2. Update the artifact's own header/status first.
3. Update this matrix and [docs/README.md](../README.md) in the same pull request.
4. Update [STATUS](../../STATUS.md), Linear, or the handoff only when the project state—not merely the prose—actually changed.
