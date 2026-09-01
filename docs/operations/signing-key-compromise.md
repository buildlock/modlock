# Signing and update-key compromise runbook

Status: design draft; actual key hierarchy/custodians require operator approval  
Last reviewed: 2026-09-01

## Key roles

- Offline/protected root or recovery authority.
- Online targets/update metadata signer with narrow scope and rotation.
- Windows code-signing identity.
- CI artifact provenance signer.

## Response

1. Stop publication/update distribution and preserve CI, key-service, repository, identity, and artifact logs.
2. Determine which key/credential, earliest compromise time, signed versions/hashes, and channels are affected.
3. Revoke/disable compromised credentials through provider and root/recovery mechanisms.
4. Publish new signed trust metadata/advisory through uncompromised channels; prevent rollback/freeze.
5. Rebuild from reviewed source in a clean environment, compare provenance/SBOM, and sign with rotated keys.
6. Notify users with exact affected versions/hashes and offline verification/recovery instructions.
7. Audit account/access paths and rotate adjacent credentials.
8. Resume staged rollout only after independent review and verification from a previously trusted client/root path.

The operator must perform a tabletop and non-production rotation before beta. A key hierarchy that cannot recover from one online key compromise blocks release.

