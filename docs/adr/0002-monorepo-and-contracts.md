# ADR-0002: Monorepo and contract-first spine

- Status: proposed
- Date: 2026-09-01

## Decision

Use one repository with a pnpm/Turborepo TypeScript workspace and a Cargo workspace. Put public/install/profile/pack/CFG contracts in versioned OpenAPI/JSON Schema files independent of any framework. Generate clients/types; never treat generated files as the source of truth.

## Consequences

Web/API/scanner/desktop can evolve in parallel after contracts stabilize. CI must validate schemas and generation drift. Rust core remains usable without JavaScript or network services.

