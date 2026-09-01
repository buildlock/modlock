# Moderator and administrator guide

Status: pre-release operational draft  
Last reviewed: 2026-09-01

Use the least privileged role needed. Moderator, copyright, security, identity-verification, and infrastructure/signing permissions are separate.

- Work exact immutable targets/hashes and policy versions.
- Preserve evidence; reference restricted evidence IDs instead of copying personal/secrets into tickets.
- Explain decisions/action/appeal without revealing scanner exploit details or unrelated reporter identity.
- Emergency block is allowed for credible severe harm and receives prompt second review.
- Never edit scan findings, download counts, historical approvals, or creator bytes to obtain a preferred outcome.
- Escalate active malware/exploitation, legal notices, signing/update anomalies, privacy incidents, and administrator compromise through their runbooks.
- Sign out/revoke sessions after suspected compromise; do not share accounts.

Administrative data fixes use reviewed migrations/scripts with dry-run, target count, backup/rollback, audit ID, and post-verification—not direct production console editing.

