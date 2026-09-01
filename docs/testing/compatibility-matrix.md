# Compatibility matrix

Status: template; live values require Windows/Deadlock test evidence  
Last reviewed: 2026-09-01

## Dimensions

- Windows 11 supported builds/editions, x64, display scaling, filesystem/Steam library layout.
- Deadlock Steam build/depot ID.
- Modlock client/core/schema/CFG-registry version.
- Content shape: raw/split VPK, ZIP, optional RAR/7z, variants, conflicts.
- Steam installation: default/secondary library, moved install, long/Unicode path, locked/protected folder.
- Security software interaction where reproducible and permitted.

## Evidence record

| Test ID | Windows | Deadlock build | Modlock commit | Fixture/profile | Result | Evidence/date |
|---|---|---|---|---|---|---|
| Pending HUM-003/004 | — | — | — | — | Not tested | Windows reference host and sacrificial install required |

`Compatible` applies only to the exact tested dimensions. A new Deadlock build defaults managed content/settings to `unknown` until structural checks and targeted tests pass.

