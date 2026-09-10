# Modlock V1 contract foundation

This directory is the source-only foundation for `SHO-127`. It defines closed-world JSON Schema contracts without choosing an API implementation language, UI stack, database, provider, or installer runtime.

## Contract rules

- Every top-level document declares `schema_version: 1` and an exact `contract` discriminator.
- Every object is closed with `additionalProperties: false`; unknown fields and unknown versions are rejected.
- Contract JSON is loaded with duplicate-key and non-finite-number rejection. `NaN`, positive/negative infinity, and floating-point overflow are invalid JSON inputs for this foundation.
- All V1 timestamps use an exact UTC `YYYY-MM-DDTHH:MM:SSZ` form with real calendar/time values; leap seconds, `24:00`, year zero, oversized years, and malformed values fail as deterministic schema violations. HTTPS URLs and hostnames use local total validators that reject malformed/NFKC-changing authority syntax without raising exceptions.
- SHA-256 values are lowercase, 64-character hexadecimal strings. A digest is the identity of exact bytes, never a mutable URL or filename.
- Hosted releases require creator attribution, provenance, rights state, immutable object digests, and exact-digest scan attestations before `published` is valid. Published records reject unknown redistribution, modification, or third-party-asset state and require coherent creation/scan/publication timestamps plus tested-build evidence.
- External references remain `source-only`; they never imply rehosting rights. Exact provider identity is retained, and GameBanana records pin `gamebanana.com` as the authoritative host. A ready-plan reference additionally requires authoritative tested-build evidence, filename, media type, target kind, exact size/digest, clean scan state, and no unknown install-relevant rights.
- A `ready` install plan requires `tested` build compatibility, exact authoritative source facts, safe relative targets under an explicit Modlock-owned root, staging, a durable journal, validation, and rollback. Direct release requests contain only that release; mixed sources require a pack request. Blocked plans record canonical reasons, and revoked plans retain bounded revocation evidence. These are plan invariants only; no installer or journal runtime is implemented here.
- Profiles and packs contain references, authoritative rights digests, and exact artifact digests, never embedded mod payloads or self-asserted item attribution/rights. Entries and set-like arrays use deterministic ordering.
- CFG settings are typed and evidence-bearing. V1 requires `auto_apply: false` for every setting until a cryptographically verified exact allowlist exists; command-name denylisting is not an activation boundary. Manual typed values remain representable. String/enum values reject controls, command separators, quoting/escape syntax, and script-like scalar values; arbitrary regex is not a V1 field.

## Canonical digests and authority graph

The V1 digest algorithm accepts a conservative JSON subset: ASCII object keys, no floating-point values, integers only in the interoperable `-(2^53-1)` through `2^53-1` range, UTF-8 encoding, lexicographically sorted keys, and compact separators. SHA-256 is computed over those exact bytes. This is a deliberately documented JCS-compatible subset, not a claim that every RFC 8785 value is supported.

- A source rights digest is the canonical SHA-256 of the complete authoritative source document's `rights` object.
- A pack `version_sha256` covers exactly `schema_version`, `contract`, `pack_id`, `pack_version_id`, `version`, `creator`, `provenance`, `rights_scope`, `embedded_payloads`, and `items`. Lifecycle `state` and `approval` are envelopes, not content. Active and terminal approval records preserve and bind `approved_version_sha256`; changing an item, source, variant, conflict set, or order invalidates the stored version digest.
- A CFG registry `registry_sha256` covers exactly `schema_version`, `contract`, `registry_id`, `registry_version`, `game`, and `settings`. State, signature, and revocation are excluded so revocation can preserve historical evidence. V1 exposes only `draft`, `signature-present-unverified`, and `revoked`; every signature explicitly carries `verification_state: not-verified`. Signature-present payloads containing floating-point JSON fail closed until a cross-language canonical decimal encoding is selected, while safe typed decimal settings remain valid as standalone/draft manual contracts.
- Cross-document graph validation is mandatory for the exact five-document hosted/external/install/profile/pack synthetic conformance bundle. It resolves the fixture's one hosted authority record and one external authority record; binds source IDs, exact artifact/rights/source facts and tested build; checks source/pack lifecycle, exact pack content digest, and evidence coverage for the full plan lifetime; and enforces direct-release purity. It is not a general multi-source runtime resolver; downstream adoption must version and generalize that authority lookup deliberately.

Ed25519 signature bytes use canonical base64 of the raw 64-byte form. ECDSA P-256/SHA-256 bytes use canonical base64 of minimally encoded ASN.1 DER `r,s`. These are signature-present records only: the slice validates payload digest and byte encoding, not key identity or cryptographic authenticity. High-S/tiny-float questions are non-activating because there is no trusted signature or auto-apply state.

All contract, target, source, and artifact filename paths use conservative Windows-safe rules. Any NFKC-changing form is rejected before classification, as are normalized absolute/drive/UNC/alternate-stream traversal, controls and format characters, `< > " | ? *`, trailing spaces/dots, `COM0`/`LPT0` through `COM9`/`LPT9`, and legacy/Unicode device aliases. Hosted source paths must also be unique after NFKC/case normalization.

The schema index is [`v1/index.json`](v1/index.json). Human-readable examples under [`../fixtures/contracts/valid`](../fixtures/contracts/valid) use reserved `fixture_` identities, `.invalid` URLs, and synthetic metadata only.

## Verification

Install the exact repository toolchain from [`mise.toml`](../mise.toml), then invoke the tracked fresh-check runner:

```text
mise install
mise exec -- python scripts/check_fresh.py
```

The runner asserts Python 3.13.15, refuses the repository `.venv`, creates a unique temporary venv, installs only accepted hash-locked wheels, captures a current source manifest, runs dependency/source/contract/document/syntax/diff gates, verifies that the source bytes remained unchanged, and removes the temporary environment. The printed manifest digest identifies this run; independent review and CI bind it to the source commit. The August 31 manifest remains historical and is not a gate against evolving main. The contract check validates the schemas, closed-world lint, every positive fixture, the exact synthetic graph, hostile mutations, and the complete symlink-free strict-JSON fixture inventory.

## Boundary

This checkpoint does not implement OpenAPI routes, an API service, database models, downloads, archive/VPK parsing, RAR/7z support, Steam discovery, installation, transaction journals, CFG mutation, cryptographic signing/verification, or provider integration. Those remain separate tickets and proof gates.

## Superseded design outlines

The [September 1 API/schema/example outline](../docs/design/2026-09-01-contract-outline/README.md) is retained as historical design. Its overlapping release, plan, profile, pack and CFG formats are superseded by `v1/`; its API, crosshair and error shapes remain deferred. No generated client or runtime may treat that archive as the V1 contract authority.
