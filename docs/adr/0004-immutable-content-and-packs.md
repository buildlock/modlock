# ADR-0004: Immutable releases and reference-based packs

- Status: accepted
- Date: 2026-09-01

## Decision

Published hosted release bytes are immutable and content-addressed. A change creates a new release. Packs reference exact source/release/file/variant identities, hashes where available, and deterministic priority; they do not rebundle third-party binaries.

## Consequences

Updates are explicit and auditable. External-source availability can make a pack partially unresolved. Resolution receipts preserve provenance and displayed consent/license state.

