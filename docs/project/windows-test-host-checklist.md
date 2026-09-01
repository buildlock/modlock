# Windows reference host and sacrificial game-test checklist

Status: ready; requires HUM-003 and HUM-004  
Last reviewed: 2026-09-01

## Reference host record

- Owner/authorized operator and access method.
- Windows edition/build/architecture and update state.
- CPU, RAM, system/storage model/filesystem/free space.
- GPU/display/scaling/power mode.
- Steam client/version, library locations, Deadlock app/build/depot.
- Security/antivirus and relevant accessibility tooling.
- Development runtime/Visual Studio/Windows SDK versions for benchmark builds.

No credentials enter Git or chat. Prefer the user's physical Windows machine for trustworthy footprint measurements; CI/VMs validate compilation/correctness only.

## Sacrificial install approval

- Test Steam account/install is authorized and recoverable/reinstallable.
- Steam Cloud behavior and personal CFG/key files are backed up or excluded.
- Baseline file/tree digests and current game launch are recorded.
- Real mutations begin only after synthetic fixture-tree transaction/rollback passes.
- Game is closed for mutations; no competitive matchmaking/testing with experimental content.
- Modlock never receives account password/session tokens.
- Failed recovery stops testing and preserves evidence before manual repair.

## Benchmark hygiene

Release-like optimized/signed-equivalent builds, identical datasets/core mocks, controlled reboot/cache/power/AV conditions, repeated runs, profiler and raw results, and no competing heavy processes. Record all deviations.

