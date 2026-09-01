# Feature wiki

This wiki is the implementation contract for Modlock product behavior. The broader product and architecture documents explain why the system exists; these pages define what each major feature must do.

All features are currently **draft** because product implementation has not started. A feature becomes `validated` only when its open product and policy questions are resolved, and `implemented` only when its linked acceptance tests pass.

## Metadata and state conventions

| Field | Meaning |
|---|---|
| ID | Stable requirement identifier; never reuse an ID for a different feature. |
| Owner | Accountable workstream, not necessarily one individual. |
| Phase | Earliest roadmap phase in which the feature is expected. |
| Status | `draft`, `validated`, `in_progress`, `implemented`, or `retired`. |

Shared runtime states are `loading`, `ready`, `empty`, `degraded`, `blocked`, and `error`. Mutating flows also use `confirming`, `in_progress`, `cancelling`, `committed`, and `rolled_back`. Every implementation must make degraded and unknown states visible instead of presenting stale or unverified data as current.

## Website

| ID | Feature | Phase | Status |
|---|---|---|---|
| WEB-001 | [Public catalog](website/WEB-001-public-catalog.md) | 1 | Draft |
| WEB-002 | [Search and filters](website/WEB-002-search.md) | 1 | Draft |
| WEB-003 | [Mod detail](website/WEB-003-mod-detail.md) | 1 | Draft |
| WEB-004 | [Creator profile](website/WEB-004-creator-profile.md) | 1 | Draft |
| WEB-005 | [Authentication and accounts](website/WEB-005-auth.md) | 1 | Draft |
| WEB-006 | [Upload](website/WEB-006-upload.md) | 1 | Draft |
| WEB-007 | [Release management](website/WEB-007-release-management.md) | 1 | Draft |
| WEB-008 | [Media management](website/WEB-008-media.md) | 1 | Draft |
| WEB-009 | [Pack publishing](website/WEB-009-packs.md) | 3 | Draft |
| WEB-010 | [Preset and crosshair publishing](website/WEB-010-presets.md) | 3 | Draft |
| WEB-011 | [Moderation console](website/WEB-011-moderation.md) | 1 | Draft |
| WEB-012 | [Reporting and appeals](website/WEB-012-reporting.md) | 1 | Draft |

## Desktop

| ID | Feature | Phase | Status |
|---|---|---|---|
| DESK-001 | [Onboarding](desktop/DESK-001-onboarding.md) | 2 | Draft |
| DESK-002 | [Game discovery](desktop/DESK-002-game-discovery.md) | 2 | Draft |
| DESK-003 | [Local library](desktop/DESK-003-library.md) | 2 | Draft |
| DESK-004 | [Install](desktop/DESK-004-install.md) | 2 | Draft |
| DESK-005 | [Update](desktop/DESK-005-update.md) | 2 | Draft |
| DESK-006 | [Uninstall](desktop/DESK-006-uninstall.md) | 2 | Draft |
| DESK-007 | [Profiles](desktop/DESK-007-profiles.md) | 2 | Draft |
| DESK-008 | [Load order](desktop/DESK-008-load-order.md) | 2 | Draft |
| DESK-009 | [Conflict detection](desktop/DESK-009-conflicts.md) | 2 | Draft |
| DESK-010 | [CFG editor](desktop/DESK-010-cfg-editor.md) | 3 | Draft |
| DESK-011 | [Crosshair editor](desktop/DESK-011-crosshair.md) | 3 | Draft |
| DESK-012 | [Pack install](desktop/DESK-012-packs.md) | 3 | Draft |
| DESK-013 | [Repair and rollback](desktop/DESK-013-repair-rollback.md) | 2 | Draft |
| DESK-014 | [Offline behavior](desktop/DESK-014-offline.md) | 2 | Draft |
| DESK-015 | [Deep links](desktop/DESK-015-deep-links.md) | 2 | Draft |
| DESK-016 | [Settings and diagnostics](desktop/DESK-016-settings.md) | 2 | Draft |
| DESK-017 | [Signed updater](desktop/DESK-017-updater.md) | 2 | Draft |

## Supporting documents

- [Competitive capability matrix](../product/competitive-matrix.md)
- [Requirements traceability](../product/requirements-traceability.md)
- [Product specification](../02-product-specification.md)
- [Platform architecture](../03-platform-architecture.md)
- [Desktop technical design](../04-desktop-technical-design.md)
- [Security, moderation, and legal boundaries](../05-security-moderation-legal.md)

