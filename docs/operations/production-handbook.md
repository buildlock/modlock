# Production environment and deployment handbook

Status: provider-neutral design; vendor/operator values pending  
Last reviewed: 2026-09-01

## Environment isolation

The current [Steam fixture discovery prototype](../testing/steam-discovery-proof.md)
is read-only and requires an authored synthetic root and inert marker files.
It is not a provider service, production game probe or deployment artifact.
Do not connect this fixture adapter to real Steam paths; the production Windows
filesystem/process boundary requires separate implementation and evidence.

The [gameinfo planner](../testing/gameinfo-plan-proof.md) only returns proposed
bytes after a matching input hash. No production code applies those bytes.
Never substitute that precondition for the required authorized instance, stopped
game, handle-safe transaction, durable journal and post-write verification.

Production, staging, preview, CI, and local use separate databases, object namespaces/accounts, auth clients, email domains, signing/update roles, and credentials. No production database dump or unrestricted credential belongs on a developer workstation.

## Service inventory

- Web application/CDN.
- Catalog/upload/resolve API.
- PostgreSQL primary/PITR/replicas as selected.
- Durable jobs and isolated scanner workers.
- Quarantine and public immutable object storage/CDN.
- Authentication and transactional email.
- Search/cache if introduced.
- Logs/metrics/traces/audit export and status page.
- Update metadata/artifact hosting and protected signing workflow.

## Deployment gates

Infrastructure/config changes are reviewed and declarative. Migrations are backward-compatible and run with explicit pre-deploy evidence. Health checks distinguish liveness/readiness/dependency degradation. Deployments roll out progressively and automatically stop on error-budget/security/health thresholds.

## Secrets and key ownership

| Secret class | Runtime access | Owner/custody |
|---|---|---|
| Database application credential | API/jobs only, least privilege | Platform/operator secret manager |
| Quarantine upload signer | API narrow role | Platform |
| Scanner result credential | Scanner narrow result channel | Security/platform |
| Public promotion/object admin | Publication service only | Restricted operator role |
| Identity/email credentials | Relevant service only | Operator |
| Source API credentials if any | Adapter only | Operator/platform |
| Update targets/signing key | Protected release workflow | Signing custodians |
| Root/recovery key | No routine runtime | Offline/protected custodians |

Document variable names and rotation dates, never values. Emergency access is time-bound, approved, and audited.

## Deployment procedure

1. Confirm source/review/CI/SBOM/migration/contract evidence.
2. Create immutable artifacts and provenance.
3. Deploy database expansion and compatible services to staging.
4. Execute end-to-end publish→resolve path with synthetic data.
5. Deploy canary/preview ring; inspect SLIs/security/audit.
6. Progressively promote; retain last compatible artifacts and rollback plan.
7. Verify public status, source adapters, revocation, upload quarantine, backups, and diagnostics.
8. Record deployment ID, source commit, migration, approver, metrics, and known issues.

## Production access review

Monthly during beta and quarterly thereafter: users/service accounts/roles, MFA/passkeys, inactive access, CI environments, branch rules, cloud federation, signing roles, audit export, backup access, and emergency accounts.
