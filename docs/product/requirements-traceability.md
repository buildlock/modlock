# Requirements traceability

This matrix connects stable feature IDs to planned implementation boundaries, machine-readable contracts, current Linear discovery work, and minimum automated test suites. The [active synthetic contract foundation](../../contracts/README.md) covers hosted releases, external references, install plans, profiles, packs, CFG settings, unverified registries and metadata-only fixtures. API, crosshair and error shapes remain deferred design, with no generated client or runtime acceptance. Contract/test names in the tables that are not present in that index remain intentionally planned extension contracts rather than broken links.

## Website

| Feature | Primary components | Planned contracts | Existing Linear foundation | Minimum planned tests |
|---|---|---|---|---|
| [WEB-001](../features/website/WEB-001-public-catalog.md) Public catalog | `apps/web`, `apps/api`, source adapters | `catalog.openapi.yaml`, `mod.schema.json`, `source-provenance.schema.json` | SHO-125, SHO-127, SHO-132 | `catalog-pagination`, `catalog-degraded-source`, `catalog-a11y` |
| [WEB-002](../features/website/WEB-002-search.md) Search | `apps/web`, `apps/api`, search index | `catalog.openapi.yaml`, `search-query.schema.json`, `api-error.schema.json` | SHO-127, SHO-132 | `search-filter-contract`, `search-stale-revocation`, `search-a11y` |
| [WEB-003](../features/website/WEB-003-mod-detail.md) Mod detail | `apps/web`, `apps/api` | `mod.schema.json`, `release.schema.json`, `install-plan.schema.json` | SHO-125, SHO-127, SHO-132 | `mod-detail-visibility`, `release-resolve-policy`, `external-outage` |
| [WEB-004](../features/website/WEB-004-creator-profile.md) Creator profile | `apps/web`, `apps/api`, trust service | `creator.schema.json`, `verification.schema.json`, `approval.schema.json` | SHO-127, SHO-133 | `identity-vs-approval`, `team-rbac`, `verification-expiry` |
| [WEB-005](../features/website/WEB-005-auth.md) Authentication | `apps/web`, `apps/api`, desktop auth bridge | `auth.openapi.yaml`, `session.schema.json`, `role.schema.json` | SHO-127 | `oauth-pkce-replay`, `refresh-rotation`, `rbac-step-up`, `auth-a11y` |
| [WEB-006](../features/website/WEB-006-upload.md) Upload | `apps/web`, `apps/api`, `apps/scanner`, blob store/queue | `upload.openapi.yaml`, `upload-session.schema.json`, `scan-report.schema.json` | SHO-124, SHO-127 | `multipart-resume`, `upload-idempotency`, `quarantine-isolation`, `malicious-corpus` |
| [WEB-007](../features/website/WEB-007-release-management.md) Releases | `apps/web`, `apps/api`, moderation | `release.schema.json`, `publication-state.schema.json`, `install-plan.schema.json` | SHO-124, SHO-127 | `release-state-machine`, `immutable-published-bytes`, `revocation-resolution` |
| [WEB-008](../features/website/WEB-008-media.md) Media | `apps/web`, `apps/api`, media scanner, blob/CDN | `media.schema.json`, `media-upload.openapi.yaml` | SHO-124, SHO-127 | `media-reencode`, `metadata-strip`, `content-gating`, `media-a11y` |
| [WEB-009](../features/website/WEB-009-packs.md) Pack publishing | `apps/web`, `apps/api`, pack resolver | `pack.schema.json`, `pack-resolve.openapi.yaml`, `approval.schema.json` | SHO-125, SHO-127, SHO-133 | `pack-reference-only`, `pack-version-immutability`, `pack-degraded-resolution`, `grimoire-export` |
| [WEB-010](../features/website/WEB-010-presets.md) Preset publishing | `apps/web`, `apps/api`, trust service, game data | `cfg-setting.schema.json`, `preset.schema.json`, `crosshair.schema.json` | SHO-126, SHO-127, SHO-131, SHO-133 | `preset-allowlist`, `approval-version-binding`, `expiry-labels`, `preset-diff-a11y` |
| [WEB-011](../features/website/WEB-011-moderation.md) Moderation | moderator web, API, scanner evidence, audit sink | `moderation.openapi.yaml`, `case.schema.json`, `audit-event.schema.json` | SHO-124, SHO-126, SHO-127 | `moderation-rbac`, `concurrent-action`, `immediate-revocation`, `audit-immutability` |
| [WEB-012](../features/website/WEB-012-reporting.md) Reporting | `apps/web`, `apps/api`, moderation/notification | `report.openapi.yaml`, `report.schema.json`, `appeal.schema.json` | SHO-126, SHO-127 | `report-idempotency`, `queue-routing`, `evidence-privacy`, `report-form-a11y` |

## Desktop

| Feature | Primary components | Planned contracts | Existing Linear foundation | Minimum planned tests |
|---|---|---|---|---|
| [DESK-001](../features/desktop/DESK-001-onboarding.md) Onboarding | `apps/desktop`, `crates/modlock-core` | `local-settings.schema.json`, `game-instance.schema.json` | SHO-126, SHO-128, SHO-130 | `onboarding-offline`, `onboarding-no-write`, `onboarding-resume`, `onboarding-a11y` |
| [DESK-002](../features/desktop/DESK-002-game-discovery.md) Discovery | `crates/modlock-core`, Windows filesystem adapter | `game-instance.schema.json` | SHO-128 | `steam-multilibrary-fixtures`, `invalid-paths`, `game-running`, `moved-install` |
| [DESK-003](../features/desktop/DESK-003-library.md) Library | desktop shell, core, SQLite/object store | `local-library.schema.json`, `desktop-bootstrap.schema.json` | SHO-124, SHO-127, SHO-130 | `library-offline-first`, `library-10k-performance`, `object-integrity`, `library-a11y` |
| [DESK-004](../features/desktop/DESK-004-install.md) Install | `crates/modlock-core`, `crates/modlock-vpk`, source client | `install-plan.schema.json`, `hosted-release.schema.json`, `journal.schema.json` | SHO-124, SHO-127, SHO-128, SHO-129 | `terminate-every-step`, `archive-adversarial`, `hash-host-signature`, `deterministic-tree` |
| [DESK-005](../features/desktop/DESK-005-update.md) Update | core resolver/installer, catalog client | `update-check.schema.json`, `install-plan.schema.json` | SHO-127, SHO-129, SHO-132 | `pinned-version`, `batch-atomicity`, `update-diff`, `stale-currentness` |
| [DESK-006](../features/desktop/DESK-006-uninstall.md) Uninstall | core profile/object store/journal | `profile.schema.json`, `journal.schema.json`, `receipt.schema.json` | SHO-124, SHO-129 | `owned-files-only`, `shared-object-retention`, `uninstall-interruption`, `uninstall-offline` |
| [DESK-007](../features/desktop/DESK-007-profiles.md) Profiles | core resolver, SQLite, desktop shell | `profile.schema.json`, `grimoire-profile.schema.json` | SHO-127, SHO-129 | `profile-determinism`, `switch-interruption`, `import-limits`, `profile-offline` |
| [DESK-008](../features/desktop/DESK-008-load-order.md) Load order | core profile resolver, desktop shell | `profile.schema.json`, `conflict-report.schema.json` | SHO-124, SHO-127 | `stable-tie-break`, `order-capacity`, `winner-refresh`, `reorder-a11y` |
| [DESK-009](../features/desktop/DESK-009-conflicts.md) Conflicts | `crates/modlock-vpk`, profile resolver | `vpk-inventory.schema.json`, `conflict-report.schema.json` | SHO-124, SHO-127 | `duplicate-path-fixtures`, `malformed-not-clean`, `large-inventory`, `conflict-a11y` |
| [DESK-010](../features/desktop/DESK-010-cfg-editor.md) CFG editor | core CFG engine, desktop shell | `cfg-setting.schema.json`, `command-registry.schema.json`, `cfg-preset.schema.json` | SHO-127, SHO-131 | `owned-block-preservation`, `external-edit-race`, `unknown-key-denial`, `backup-restore` |
| [DESK-011](../features/desktop/DESK-011-crosshair.md) Crosshair | core CFG engine, preview UI | `crosshair.schema.json`, `command-registry.schema.json` | SHO-126, SHO-131 | `crosshair-ranges`, `active-drift`, `hero-preference-manual`, `crosshair-a11y` |
| [DESK-012](../features/desktop/DESK-012-packs.md) Pack install | pack resolver, core installer/profile, source adapters | `pack.schema.json`, `pack-resolution.schema.json`, `profile.schema.json` | SHO-125, SHO-127, SHO-129 | `pack-no-payload`, `required-revoked`, `optional-receipt`, `import-untrusted` |
| [DESK-013](../features/desktop/DESK-013-repair-rollback.md) Repair/rollback | core journal/discovery/CFG/filesystem | `journal.schema.json`, `repair-plan.schema.json`, `diagnostic.schema.json` | SHO-124, SHO-128, SHO-129 | `terminate-every-step`, `patch-reset-gameinfo`, `unowned-preservation`, `rollback-digest` |
| [DESK-014](../features/desktop/DESK-014-offline.md) Offline | core cache/library/source client | `cache-record.schema.json`, `source-health.schema.json` | SHO-127, SHO-132 | `startup-network-timeout`, `local-actions-offline`, `freshness-label`, `reconnect-no-replay` |
| [DESK-015](../features/desktop/DESK-015-deep-links.md) Deep links | Windows shell, core parser, API resolution | `deep-link-state.schema.json`, `install-plan.schema.json` | SHO-125, SHO-127, SHO-130 | `deep-link-fuzz`, `nonce-replay`, `single-instance`, `confirmation-required` |
| [DESK-016](../features/desktop/DESK-016-settings.md) Settings/diagnostics | desktop shell, core, credentials/logging | `local-settings.schema.json`, `diagnostic.schema.json`, `source-health.schema.json` | SHO-127, SHO-130, SHO-132 | `settings-atomic`, `diagnostic-redaction`, `cache-cleanup`, `settings-a11y` |
| [DESK-017](../features/desktop/DESK-017-updater.md) Updater | Windows shell/bootstrapper, release CI | `update-metadata.schema.json` | SHO-130 | `metadata-signature`, `rollback-counter`, `replacement-interruption`, `no-resident-agent` |

## Cross-cutting gates

| Gate | Applies to | Evidence required |
|---|---|---|
| Contract compatibility | All networked and imported features | OpenAPI/JSON Schema validation, generated clients, backward/forward fixture tests |
| Authorization | WEB-004–012 and desktop account linking | Deny-by-default role matrix, step-up tests, immutable audit events |
| Untrusted parsing | WEB-006/008 and DESK-004/007/009/012/015/017 | Limits, adversarial fixtures, fuzzing, time/memory ceilings, parser version evidence |
| Reversible mutation | DESK-004–013 and DESK-017 | Fault injection after every mutation, fsynced journal, prior/new digest verification |
| Offline honesty | All desktop features | Local-first tests, explicit freshness, no weakened signature/policy checks |
| Accessibility | Every UI feature | Keyboard, screen reader, focus, high contrast, scale, non-color state evidence |
| Privacy | Every feature | Data inventory/retention, redacted logs, telemetry consent and negative tests |

## Maintenance rule

A Linear implementation issue must cite its feature ID. A pull request that changes externally visible behavior must update the feature page, its contract, and the mapped tests together. A feature cannot become `implemented` until every acceptance criterion has evidence and unresolved safety/policy questions are either closed or explicitly deferred with a safe default.
