# Release gate checklist

Status: mandatory template once artifacts exist

## Identity and scope

- Release version/channel/source commit/artifact digests recorded.
- Supported Windows and Deadlock builds stated; unknowns/known issues public.
- Feature changes map to wiki IDs, contracts, migrations, tests, and support notes.

## Engineering evidence

- Formatting/lint/unit/contract/integration/failure-injection/fuzz smoke tests pass.
- Installer rollback passes every supported interruption fixture.
- API/database backward compatibility and migration/restore plan pass.
- Performance gates measured on the reference Windows machine.
- Accessibility keyboard/Narrator/NVDA/scaling review passes.

## Security/supply chain

- Dependency vulnerability/license review and SBOM complete.
- Threat/privacy changes reviewed; no unreviewed parser/privilege/network/source surface.
- Artifact provenance, hashes, Windows signature, and signed update metadata independently verified.
- Malware/revocation and update rollback paths tested.

## Operations/product

- Staging publish→scan→catalog→resolve→install→rollback story passes.
- Dashboards/alerts/SLO/error budgets and status/support docs ready.
- Backup restore evidence current.
- Moderator/support/on-call access and escalation staffed.
- Policies/creator rights/source terms/counsel approvals current.

## Approval

Engineering, security/trust, operations, product, and operator/legal go/no-go names, times, evidence links, exceptions/expiry. No approval may be inferred from a green build alone.

