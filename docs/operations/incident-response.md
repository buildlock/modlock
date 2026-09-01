# Incident response plan

Status: operational draft; operator contacts required before beta  
Last reviewed: 2026-09-01

## Severity

- **SEV-0:** signing/update compromise, active malware distribution, systemic arbitrary file write/RCE, or major credential/data exfiltration.
- **SEV-1:** exploitable account/moderator takeover, widespread corrupt installs, critical source compromise, or serious private-data exposure.
- **SEV-2:** contained security/reliability failure with meaningful user impact.
- **SEV-3:** low-impact defect or attempted abuse without compromise.

## Response

1. Declare severity, incident lead, private coordination channel, timestamp, and evidence-preservation scope.
2. Contain: revoke resolution/download/update metadata, disable adapter/upload/action, rotate scoped credentials, or place service/client in safe mode.
3. Preserve immutable audit/log/object/build/signing evidence without exposing it publicly.
4. Determine affected hashes, releases, users, builds, time range, and whether external notification is required.
5. Eradicate and remediate through reviewed changes; do not destroy evidence.
6. Recover in stages with validation, monitoring, and rollback.
7. Notify users/platforms/authorities according to counsel and policy using plain impact/remediation language.
8. Publish an internal postmortem within 5 business days for SEV-0/1; track actions to closure.

## Required pre-beta contacts

Operator must fill: incident lead, backup lead, security address, legal/privacy contact, hosting escalation, object/database provider escalation, signing-key custodian, Valve/GameBanana contact path, and public status-page owner.

## Evidence hygiene

Do not paste secrets, personal CFGs, complete IP/user identifiers, private reports, or pre-signed URLs into Linear/public docs. Reference restricted evidence IDs and store access logs separately.

