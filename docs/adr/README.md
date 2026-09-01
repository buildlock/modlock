# Architecture decision records

ADRs capture decisions that would be expensive or confusing to rediscover. Status values are `proposed`, `accepted`, `superseded`, or `rejected`.

Audit note (`2026-09-01`): the individual statuses below remain authoritative. The deterministic [project control packet](../handoffs/2026-09-01-project-control-packet.md) does not promote a proposed ADR. Cross-portfolio canonical mod-registry/shared-artifact ownership and the central identity issuer remain open questions [OQ9](../open-questions.md#oq9--portfolio-mod-registry-and-artifact-ownership) and [OQ10](../open-questions.md#oq10--shared-identity-issuer-and-creator-ownership); record accepted outcomes as ADRs before cross-product implementation.

| ADR | Decision | Status |
|---|---|---|
| [0001](0001-product-boundaries.md) | Product and safety boundaries | Accepted |
| [0002](0002-monorepo-and-contracts.md) | Monorepo and contract-first spine | Proposed |
| [0003](0003-desktop-core-and-shell.md) | Rust core and measured native shell | Accepted/Proposed split |
| [0004](0004-immutable-content-and-packs.md) | Immutable releases and reference packs | Accepted |
| [0005](0005-api-and-data-platform.md) | API/data platform baseline | Proposed |
| [0006](0006-upload-scanning.md) | Quarantine and scanner isolation | Accepted |
| [0007](0007-auth-and-identity.md) | Identity and authorization | Proposed |
| [0008](0008-updates-signing-telemetry.md) | Updates, signing, and telemetry | Proposed |
| [0009](0009-gamebanana-adapter.md) | GameBanana adapter boundary | Proposed pending confirmation |
| [0010](0010-clean-room-gpl.md) | GPL clean-room research boundary | Accepted |
