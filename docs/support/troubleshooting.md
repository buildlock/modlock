# Troubleshooting and known failure classes

Status: pre-release draft  
Last reviewed: 2026-09-01

| Symptom | Safe first action | Do not do |
|---|---|---|
| Game is running | Close it normally and retry | Force writes into active files |
| Deadlock not found | Verify Steam library/app 1422450 and choose validated location | Select an arbitrary `citadel` folder |
| Hash/scan failure | Redownload from canonical source; report exact error ID | Disable integrity checks |
| External source unavailable | Retry later/check source status; local installed copy remains | Download an unverified mirror |
| Conflict warning | Inspect paths/load order or disable one entry | Assume popularity means compatibility |
| Patch/reset warning | Use dry-run repair and current file | Copy an old full `gameinfo.gi` blindly |
| Incomplete transaction | Reopen Modlock and recover/rollback | Delete journal/staging manually first |
| Locked/disk-full/AV failure | Free space/close processes; preserve quarantine event; retry rollback | Exclude broad Steam/user directories from security tools |
| CFG values do not apply | Check owned block/persisted-convar warning and game-build support | Replace full configs from strangers |
| Wrong crosshair | Verify active preset and game hero-specific default behavior | Use injection/input automation |

Support should ask for the transaction/error ID and a user-previewed redacted diagnostic bundle. Any instruction that disables signatures, hashes, scanning, antivirus broadly, path validation, or rollback is invalid.

