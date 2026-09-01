# Release, signing, updater, and rollback runbook

Status: design draft; operator credentials/hardware required  
Last reviewed: 2026-09-01

## Release candidate evidence

- Source commit and clean/reviewed repository state.
- CI/test/fuzz/security/accessibility/performance results.
- Migration and backward-compatibility evidence.
- SBOM, dependency/license/vulnerability review.
- Reproducible/provenance record and artifact SHA-256.
- Windows signature verification on clean reference machines.
- Signed update metadata with version/channel/minimum updater/size/hash/expiry.
- Changelog, supported game/Windows builds, known issues, rollback/support plan.

## Staged rollout

Internal → invited beta cohort → percentage rings → stable. Stop on security issue, rollback/recovery failure, crash/error-budget breach, signature/update anomaly, or game-patch incompatibility. Stable users never receive beta unless opted in.

## Rollback

Do not silently serve an older vulnerable binary. Publish signed metadata directing clients to a fixed/new version or disabling the affected feature/channel. Database changes must remain compatible or restore through the documented migration/backup plan. Record why, affected versions, decision owner, and user remediation.

## Signing ceremony

Two-person review for stable release inputs; protected environment; no general-purpose browser/email session; verify commit, workflow provenance, artifact hash/SBOM/test evidence; sign; independently verify from a clean machine; publish; retain restricted audit. Exact key custody requires HUM-007/HUM-009.

