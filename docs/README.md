# Modlock documentation control plane

Contract integration updated: **2026-09-10**

The first executable core slice is the [synthetic journal proof](testing/synthetic-journal-proof.md).
It is a bounded developer experiment; source acceptance and remaining game/runtime
work are tracked in [current status](../STATUS.md).

This page is the entry point for product, engineering, trust, operations, support, and evidence documentation. The repository contains a complete design baseline, not a finished product. Policy, moderation, and operations documents marked draft have **not** been approved by counsel or proven against production systems. Windows/game behavior remains provisional until the required Windows and sacrificial-install evidence is attached.

See the [September 10 integration record](handoffs/2026-09-10-contract-integration.md) and [current status](../STATUS.md) for source acceptance and the next job. The [September 1 control packet](handoffs/2026-09-01-project-control-packet.md) retains its dated audit and planning graph. See the [documentation completeness matrix](project/documentation-matrix.md) for the status and remaining approval/evidence boundary of each package. See [delivery ownership](project/ownership.md) before assigning a human dependency.

## Start by audience

| Audience | Start here | Then read |
|---|---|---|
| Owner/product lead | [Project control packet](handoffs/2026-09-01-project-control-packet.md), [executive brief](00-executive-brief.md), [strategy](product/strategy.md), [roadmap](06-roadmap.md) | [Decision checklist](project/decision-checklist.md), [ownership](project/ownership.md), [risk register](project/risk-register.md), [open questions](open-questions.md) |
| Product/design | [Product specification](02-product-specification.md), [feature wiki](features/README.md) | [Personas/journeys](product/personas-and-journeys.md), [content taxonomy](product/content-taxonomy.md), [information architecture](design/information-architecture.md), [design baseline](design/design-system-baseline.md), [accessibility](design/accessibility.md), [traceability](product/requirements-traceability.md) |
| Web/platform engineer | [Platform architecture](03-platform-architecture.md), [contracts](../contracts/README.md) | [NFRs](architecture/nonfunctional-requirements.md), [authorization matrix](architecture/authorization-matrix.md), [API policy](api/versioning-and-deprecation.md), [data model](data/erd.md), [data dictionary](data/data-dictionary.md), [ADRs](adr/README.md) |
| Windows/Rust engineer | [Desktop technical design](04-desktop-technical-design.md), [desktop features](features/README.md#desktop) | [Test strategy](testing/test-strategy.md), [fixture catalog](testing/fixture-catalog.md), [DMM clean-room boundary](teardowns/dmm-clean-room-evidence.md) |
| Security/trust/legal | [Security boundary](05-security-moderation-legal.md), [threat model](security/threat-model.md) | [Policy drafts](policies/README.md), [moderation procedures](#moderation-and-trust-operations), [retention](privacy/data-retention.md), [SECURITY.md](../SECURITY.md) |
| Operations/release | [Production handbook](operations/production-handbook.md), [incident response](operations/incident-response.md) | [SLOs](operations/slo-observability.md), [backup/DR](operations/backup-disaster-recovery.md), [release signing](operations/release-signing-updater.md), [status/support](operations/status-and-support.md) |
| Support/creator success | [Player guide](support/player-guide.md), [creator guide](support/creator-publishing-guide.md) | [Troubleshooting](support/troubleshooting.md), [authoring](support/pack-and-preset-authoring.md), [migration](support/migration-import.md), [moderator guide](support/moderator-admin-guide.md) |
| Research/reviewer | [Ecosystem research](01-ecosystem-research.md), [source register](07-sources.md) | [DMM teardown](teardowns/deadlock-mod-manager.md), [GameBanana teardown](teardowns/gamebanana.md), [competitive matrix](product/competitive-matrix.md), [current snapshot](snapshots/2026-09-01-ecosystem.json) |

## Start by build stage

### Phase 0 — decisions, contracts, and proof

- Project control: [deterministic control packet](handoffs/2026-09-01-project-control-packet.md), [ownership](project/ownership.md), [decision checklist](project/decision-checklist.md), [risk register](project/risk-register.md), [outreach packets](project/outreach-packets.md), [Windows test-host checklist](project/windows-test-host-checklist.md), [counsel packet](project/counsel-review-packet.md), [open questions](open-questions.md), and [Linear mirror](linear-backlog.md).
- Human research: [interview plan](research/interview-plan.md) and [pilot recruitment checklist](research/pilot-recruitment-checklist.md).
- Research: [ecosystem](01-ecosystem-research.md), [DMM teardown](teardowns/deadlock-mod-manager.md), [clean-room log](teardowns/dmm-clean-room-evidence.md), [GameBanana teardown](teardowns/gamebanana.md), and [GameBanana adapter](integrations/gamebanana-adapter.md).
- Architecture: [platform](03-platform-architecture.md), [desktop](04-desktop-technical-design.md), [ADRs](adr/README.md), [contracts](../contracts/README.md), [ERD](data/erd.md), and [data dictionary](data/data-dictionary.md).
- Proof plan: [test strategy](testing/test-strategy.md), [fixture catalog](testing/fixture-catalog.md), [compatibility matrix](testing/compatibility-matrix.md), [fuzzing](testing/fuzzing-plan.md), [performance](testing/performance-plan.md), [QA/UAT](testing/qa-uat-plan.md), [accessibility](design/accessibility.md), and [requirements traceability](product/requirements-traceability.md).

Phase 0 is not complete until the human dependencies in [ownership](project/ownership.md) and the Windows/game evidence in the [completeness matrix](project/documentation-matrix.md) are closed or explicitly deferred with the safe default.

### Phase 1 — website/platform MVP

- Requirements: [WEB-001–WEB-012](features/README.md#website), [product specification](02-product-specification.md), and [information architecture](design/information-architecture.md).
- Deferred API design: [OpenAPI](design/2026-09-01-contract-outline/openapi/modlock-v1.openapi.json), release/external/error schemas, [API policy](api/versioning-and-deprecation.md), and [data model](data/erd.md).
- Trust boundary: upload/scanner ADR, threat model, moderation drafts, policy drafts, and retention design. Draft public policies require operator values and counsel before public accounts/uploads.

### Phase 2 — desktop core alpha

- Requirements: [DESK-001–DESK-009 and DESK-013–DESK-017](features/README.md#desktop).
- Core contracts: install plan, release, profile, error, and fixture schemas.
- Gates: Windows UI/footprint evidence, Steam discovery, crash-recovery proof, adversarial fixtures, updater/signing proof, and accessibility evidence.

### Phase 3 — CFG, crosshairs, and packs

- Requirements: [WEB-009](features/website/WEB-009-packs.md), [WEB-010](features/website/WEB-010-presets.md), [DESK-010](features/desktop/DESK-010-cfg-editor.md), [DESK-011](features/desktop/DESK-011-crosshair.md), and [DESK-012](features/desktop/DESK-012-packs.md).
- Contracts: pack, profile, CFG setting, and crosshair schemas.
- Human gates: current-build Windows/game validation and exact-version creator/player consent.

### Before public beta

- Obtain counsel/operator approval for every item in [draft policies](policies/README.md), takedown, verification, privacy/retention, and moderation procedures.
- Populate provider/account/contact/key values and rehearse every [operations runbook](#operations-and-release-runbooks).
- Complete Windows compatibility, performance, accessibility, updater, parser, transaction, backup/restore, malware, and incident evidence from the [test strategy](testing/test-strategy.md).
- Publish accurate support documents only after the implemented UI and recovery behavior match them.

## Complete artifact inventory

### Project and durable context

- Repository entry points: [root README](../README.md), [AGENTS](../AGENTS.md), [STATUS](../STATUS.md), [HANDOFF](../HANDOFF.md), [development log](../DEVELOPMENT_LOG.md), [CHANGELOG](../CHANGELOG.md), [CONTRIBUTING](../CONTRIBUTING.md), and [SECURITY](../SECURITY.md).
- Core package: [executive brief](00-executive-brief.md), [ecosystem research](01-ecosystem-research.md), [product specification](02-product-specification.md), [platform architecture](03-platform-architecture.md), [desktop design](04-desktop-technical-design.md), [security/legal boundary](05-security-moderation-legal.md), [roadmap](06-roadmap.md), and [sources](07-sources.md).
- Project controls: [ownership](project/ownership.md), [RACI](project/raci.md), [decision checklist](project/decision-checklist.md), [outreach packets](project/outreach-packets.md), [Windows test-host checklist](project/windows-test-host-checklist.md), [counsel review packet](project/counsel-review-packet.md), [risk register](project/risk-register.md), [glossary](project/glossary.md), [open questions](open-questions.md), and [Linear backlog mirror](linear-backlog.md).
- Research execution: [interview plan](research/interview-plan.md) and [pilot recruitment checklist](research/pilot-recruitment-checklist.md).
- Current checkpoint: [September 10 integration](handoffs/2026-09-10-contract-integration.md). Dated planning graph: [September 1 control packet](handoffs/2026-09-01-project-control-packet.md). Supporting baseline: [2026-09-01 complete documentation handoff](handoffs/2026-09-01-main-documentation-baseline.md). Historical checkpoint: [2026-08-26 research/architecture handoff](handoffs/2026-08-26-main-research-architecture.md).

### Architecture decision records

- [ADR index](adr/README.md)
- [ADR-0001 Product/safety boundaries](adr/0001-product-boundaries.md)
- [ADR-0002 Monorepo/contracts](adr/0002-monorepo-and-contracts.md)
- [ADR-0003 Desktop core/shell](adr/0003-desktop-core-and-shell.md)
- [ADR-0004 Immutable content/packs](adr/0004-immutable-content-and-packs.md)
- [ADR-0005 API/data platform](adr/0005-api-and-data-platform.md)
- [ADR-0006 Upload scanning](adr/0006-upload-scanning.md)
- [ADR-0007 Auth/identity](adr/0007-auth-and-identity.md)
- [ADR-0008 Updates/signing/telemetry](adr/0008-updates-signing-telemetry.md)
- [ADR-0009 GameBanana adapter](adr/0009-gamebanana-adapter.md)
- [ADR-0010 GPL clean-room boundary](adr/0010-clean-room-gpl.md)

### Contracts and data

- [Active contract rules](../contracts/README.md) and [V1 schema index](../contracts/v1/index.json).
- Active JSON Schemas: [hosted release](../contracts/v1/schemas/hosted-release.schema.json), [external reference](../contracts/v1/schemas/external-reference.schema.json), [install plan](../contracts/v1/schemas/install-plan.schema.json), [profile](../contracts/v1/schemas/profile.schema.json), [pack](../contracts/v1/schemas/pack.schema.json), [CFG setting](../contracts/v1/schemas/cfg-setting.schema.json), [unverified CFG registry](../contracts/v1/schemas/cfg-registry.schema.json), and [synthetic fixture corpus](../contracts/v1/schemas/fixture-corpus.schema.json).
- Positive and hostile [synthetic conformance fixtures](../fixtures/README.md); no real game or mod payloads.
- [Deferred September 1 API/crosshair/error outline and superseded examples](design/2026-09-01-contract-outline/README.md); excluded from active generation/validation.
- [Nonfunctional requirements](architecture/nonfunctional-requirements.md), [authorization matrix](architecture/authorization-matrix.md), [API versioning/errors/pagination/deprecation](api/versioning-and-deprecation.md), [error catalog](api/error-catalog.md), [ERD](data/erd.md), and [data dictionary](data/data-dictionary.md).

### Product and design

- [Product strategy](product/strategy.md), [personas and journeys](product/personas-and-journeys.md), [content taxonomy/capabilities](product/content-taxonomy.md), [competitive matrix](product/competitive-matrix.md), [requirements traceability](product/requirements-traceability.md), and [analytics taxonomy](product/analytics-taxonomy.md).
- [Information architecture](design/information-architecture.md), [design-system baseline](design/design-system-baseline.md), [accessibility requirements](design/accessibility.md), and [content/localization baseline](content-style-localization.md).
- [Development handbook](development/handbook.md) and [versioning/release policy](development/versioning-release-policy.md).

### Feature wiki

- Control: [feature index](features/README.md) and [feature template](features/_template.md).
- Website: [WEB-001 Catalog](features/website/WEB-001-public-catalog.md), [WEB-002 Search](features/website/WEB-002-search.md), [WEB-003 Mod detail](features/website/WEB-003-mod-detail.md), [WEB-004 Creator profile](features/website/WEB-004-creator-profile.md), [WEB-005 Auth](features/website/WEB-005-auth.md), [WEB-006 Upload](features/website/WEB-006-upload.md), [WEB-007 Releases](features/website/WEB-007-release-management.md), [WEB-008 Media](features/website/WEB-008-media.md), [WEB-009 Packs](features/website/WEB-009-packs.md), [WEB-010 Presets](features/website/WEB-010-presets.md), [WEB-011 Moderation](features/website/WEB-011-moderation.md), and [WEB-012 Reporting](features/website/WEB-012-reporting.md).
- Desktop: [DESK-001 Onboarding](features/desktop/DESK-001-onboarding.md), [DESK-002 Discovery](features/desktop/DESK-002-game-discovery.md), [DESK-003 Library](features/desktop/DESK-003-library.md), [DESK-004 Install](features/desktop/DESK-004-install.md), [DESK-005 Update](features/desktop/DESK-005-update.md), [DESK-006 Uninstall](features/desktop/DESK-006-uninstall.md), [DESK-007 Profiles](features/desktop/DESK-007-profiles.md), [DESK-008 Load order](features/desktop/DESK-008-load-order.md), [DESK-009 Conflicts](features/desktop/DESK-009-conflicts.md), [DESK-010 CFG](features/desktop/DESK-010-cfg-editor.md), [DESK-011 Crosshair](features/desktop/DESK-011-crosshair.md), [DESK-012 Packs](features/desktop/DESK-012-packs.md), [DESK-013 Repair/rollback](features/desktop/DESK-013-repair-rollback.md), [DESK-014 Offline](features/desktop/DESK-014-offline.md), [DESK-015 Deep links](features/desktop/DESK-015-deep-links.md), [DESK-016 Settings](features/desktop/DESK-016-settings.md), and [DESK-017 Updater](features/desktop/DESK-017-updater.md).

### Research, teardowns, and integrations

- [DMM teardown](teardowns/deadlock-mod-manager.md), [DMM clean-room evidence](teardowns/dmm-clean-room-evidence.md), [GameBanana teardown](teardowns/gamebanana.md), and [GameBanana adapter specification](integrations/gamebanana-adapter.md).
- [Ecosystem research](01-ecosystem-research.md), [source register](07-sources.md), [original 2026-08-26 snapshot](snapshots/2026-08-26-ecosystem.json), and [refreshed 2026-09-01 snapshot](snapshots/2026-09-01-ecosystem.json).

### Security, privacy, and public policy drafts

- [Security boundary](05-security-moderation-legal.md), [formal threat model](security/threat-model.md), [privacy review checklist](security/privacy-review-checklist.md), [SECURITY.md](../SECURITY.md), and [data retention](privacy/data-retention.md).
- [Policy-package warning/index](policies/README.md), [Terms draft](policies/terms-draft.md), [Privacy draft](policies/privacy-draft.md), [Content Policy draft](policies/content-policy-draft.md), [Creator Terms draft](policies/creator-terms-draft.md), [verified-artifact consent draft](policies/verified-artifact-consent-draft.md), and [community-guidelines draft](policies/community-guidelines-draft.md).

### Moderation and trust operations

- [Moderation SOP](moderation/sop.md), [takedown and appeals](moderation/takedown-and-appeals.md), and [creator/player verification SOP](moderation/verification-sop.md).

### Operations and release runbooks

- [Production handbook](operations/production-handbook.md), [SLO/observability](operations/slo-observability.md), [status/support escalation](operations/status-and-support.md), and [backup/disaster recovery](operations/backup-disaster-recovery.md).
- [Incident response](operations/incident-response.md), [malware revocation](operations/malware-revocation.md), [third-party outage](operations/third-party-outage.md), [release/signing/updater](operations/release-signing-updater.md), and [signing-key compromise](operations/signing-key-compromise.md).
- [Release-gate checklist](release/release-gate-checklist.md).

### Testing and support

- [Master test strategy](testing/test-strategy.md), [fixture catalog/rights manifest](testing/fixture-catalog.md), [compatibility matrix](testing/compatibility-matrix.md), [fuzzing plan](testing/fuzzing-plan.md), [performance plan](testing/performance-plan.md), and [QA/UAT plan](testing/qa-uat-plan.md).
- [Player guide](support/player-guide.md), [creator publishing guide](support/creator-publishing-guide.md), [pack/preset authoring](support/pack-and-preset-authoring.md), [migration/import](support/migration-import.md), [troubleshooting](support/troubleshooting.md), and [moderator/admin guide](support/moderator-admin-guide.md).

## Status discipline

- `complete-design` means the design artifact is sufficiently specified to guide implementation. It does **not** mean implemented, runtime-proven, legally approved, or production-ready.
- `draft-needs-owner/counsel` means a named operator choice, external authorization, identity, consent, or qualified legal review is still required.
- `evidence-needs-Windows` means the design exists but native/game/runtime evidence cannot be credibly completed in the current macOS-only context.
- `future-implementation` means the artifact describes a system, runbook, or support surface that must be populated, exercised, or reconciled with the eventual implementation.

Never upgrade a document status merely because it is detailed. Attach the required decision, test result, approval, or rehearsal evidence and update [documentation-matrix.md](project/documentation-matrix.md).
