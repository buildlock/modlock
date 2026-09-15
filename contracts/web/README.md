# Local website exchange contracts

These closed JSON Schema documents are authoritative for the local website only. They do not replace the installer contracts in `../v1` or activate any archived game-setting design.

- [Crosshair preview design](v1/crosshair-design.schema.json): `contract: modlock.crosshair-design`, `schema_version: 1`, bounded pixel geometry/color/opacity, and mandatory `gameValidated: false`. There are no game commands, creator claims, signatures or tested-build fields. Strict text import rejects duplicate keys, unknown fields/versions and documents above 4 KiB. Share links put this document in the URL fragment; saving it to an account remains private.
- [Personal-data export](v1/personal-data.schema.json): `format: modlock-personal-data`, `version: 1`; explicitly enumerated profile, account, saved-mod, report and crosshair fields. Dates serialize as ISO date-time strings. Maximum arrays match the enforced account caps: 1000 saved mods, 1000 reports and 100 designs. Password hashes, session tokens, MFA secrets/recovery codes and staff grants are absent.

The web runtime loads these schemas directly. The personal-data validator bundles its external crosshair reference from the original schema at runtime. TypeScript interfaces are ordinary application types, not manually edited generated clients. Parser/contract tests and the built-server export test live in `apps/web/tests`. Unknown versions are rejected rather than migrated implicitly.
