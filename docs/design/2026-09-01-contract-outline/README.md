# Modlock contracts

These September 1 design outlines are historical, unimplemented proposals. They are not accepted V1 data contracts and must not be used for generated clients or runtime validation. The active synthetic foundation is [contracts/v1](../../../contracts/v1/index.json). API, crosshair and error designs remain here for later explicit reconciliation; no service or client consumes them.

## Contents

- `openapi/modlock-v1.openapi.json` — public/catalog/desktop API outline.
- `schemas/release.schema.json` — immutable hosted or linked release metadata.
- `schemas/external-reference.schema.json` — third-party provenance.
- `schemas/install-plan.schema.json` — signed, expiring resolution result.
- `schemas/profile.schema.json` — local portable desired state.
- `schemas/pack.schema.json` — immutable reference-based pack version.
- `schemas/cfg-setting.schema.json` — typed allowlisted CFG command and preset value.
- `schemas/crosshair.schema.json` — structured crosshair preset.
- `schemas/error.schema.json` — stable machine-readable error envelope.
- `schemas/fixture-manifest.schema.json` — licensed/adversarial fixture expectations.

## Compatibility rules

1. Every document declares `schema_version` as a positive integer.
2. Readers reject an unknown higher major/schema version unless the contract explicitly permits partial reading.
3. Additive optional fields are allowed within a schema version; changing meaning, removing fields, or tightening valid values requires a new version.
4. Unknown JSON object properties are rejected for signed/security-sensitive plans and allowed only in explicitly named extension objects.
5. IDs are opaque; clients do not parse meaning from them.
6. Published release and pack versions are immutable.
7. SHA-256 is lower-case hexadecimal over exact downloaded bytes.
8. Timestamps use UTC RFC 3339.
9. Custom extension keys are reverse-domain or product namespaced, for example `extensions.modlock`.

Generated code must include the source contract digest and is never edited manually.
