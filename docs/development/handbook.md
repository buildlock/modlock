# Development handbook

Status: proposed until the code skeleton lands  
Last reviewed: 2026-09-01

## Planned toolchain

- Git and GitHub pull requests.
- `mise` for pinned developer tools.
- Node.js LTS and `pnpm` for web/API/contracts tooling.
- Turborepo for TypeScript workspace task orchestration.
- Stable Rust with `rustfmt`, Clippy, Cargo nextest, audit/deny, and fuzz tooling.
- PostgreSQL for platform state; local container or an approved development database.
- `just` as the discoverable cross-language command surface.
- Windows 11 + Visual Studio/Windows SDK for native shell work.

Exact versions must be pinned in repository configuration, not copied from this prose, when scaffolding begins.

## Proposed commands

```text
just bootstrap          install/check pinned tools and dependencies
just doctor             report versions, auth presence, and local service health without secret values
just fmt                format all source and contracts
just lint               static checks, Clippy, contract lint
just test               unit/contract tests
just test-integration   disposable Postgres/object/scanner/core tests
just docs               validate docs, schemas, links, traceability
just dev-web            start web/API dependencies
just build              production builds for supported host
just windows-ci         dispatch/describe Windows compile tests
```

## Environment classes

| Class | Purpose | Data/credential rule |
|---|---|---|
| Local | Developer workstation and disposable fixtures | Synthetic data; `.env` ignored; secrets via approved local store |
| CI | Pull request checks | Least-privilege ephemeral credentials; no production data |
| Preview | Web/API review deployments | Isolated database/bucket; non-production identity configuration |
| Staging | Release candidate and operations drills | Production-like synthetic/pilot data; separate keys |
| Production | Public service | Protected operator-owned accounts, audited access, no developer local keys |

Variable names will live in `.env.example`; values never enter Git, handoffs, logs, issue descriptions, or memory.

## Repository shape

```text
apps/web                 public site and creator/moderator UI
apps/api                 catalog/upload/resolve API
apps/scanner             isolated job entrypoint
apps/desktop             selected native Windows shell
crates/modlock-core      platform-independent desktop core
crates/modlock-vpk       safe VPK inventory/conflict library
packages/contracts       generated language bindings
contracts               source OpenAPI/JSON Schemas
fixtures                 generated and rights-manifested test inputs
docs                     product, architecture, operations, and evidence
```

## Coding rules

- Make invalid domain states unrepresentable where practical.
- Parse untrusted data with explicit byte/time/depth/count limits.
- No network/filesystem work on UI threads.
- No stringly typed security or state-machine decisions.
- Use structured errors with stable codes; user messages do not expose secrets/paths.
- Clock, random, network, and filesystem behavior are injectable for deterministic tests.
- Database/domain transitions are idempotent and audited.
- Log only what operations need; redact tokens, URLs with signatures, personal paths, identities, and content.

## CI gates

Documentation/contracts; formatting/lint; unit/property tests; dependency/license policy; secret scan; generated-code drift; database migration compatibility; Windows and Linux compilation where applicable; integration and fuzz smoke tests; SBOM/artifact signing for releases.

