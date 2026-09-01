# ADR-0005: API and data platform baseline

- Status: proposed
- Date: 2026-09-01

## Decision

Begin with Next.js for the public web experience, a TypeScript/Hono API, PostgreSQL, a PostgreSQL-backed durable job queue, and provider-neutral S3-compatible blob storage/CDN. Scanner and untrusted file parsing run in isolated Rust workers.

## Alternatives

An all-Rust API remains viable if the walking skeleton shows a material reliability/operations advantage without slowing product iteration. Redis is deferred until measured queue/cache needs justify it.

