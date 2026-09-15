# Player guide

Status: pre-release draft  
Last reviewed: 2026-09-01

## Available website preview — 2026-09-13

The [local website](../../apps/web/README.md) browses imported public Deadlock listings from GameBanana. Search by mod, hero, or creator; combine category/hero filters; sort by updates, downloads, or likes. Open a listing to see screenshots, attribution, source permission statements, and the original GameBanana page. On mobile, the filter button reveals categories and heroes.

The catalog shows its last refresh date and distinguishes indexed source entries from published profiles. Modlock does not currently download or install mods. The desktop flow below is planned and is not available in this website preview.

## Before installing

Modlock is unofficial. Review creator/source, exact version, tested game build, content/capability warnings, file/variant, license, conflicts, and the install plan. A scan badge is not a guarantee and Valve compatibility may be unknown.

## Normal flow

1. Install the signed Modlock client from the official operator location and verify publisher/version.
2. Let Modlock discover Steam/Deadlock or validate a manual location.
3. Choose/create a profile.
4. Open a mod/pack, review the full plan, close Deadlock, and confirm.
5. Keep the receipt. Enable/disable or switch profiles only while the game is closed unless explicitly supported.

## After a game patch

Modlock may enter safe mode. Review its dry-run repair; `unknown` compatibility is honest, not necessarily broken. Do not restore an old whole `gameinfo.gi` over Valve's new file.

## Recovery

If a transaction was interrupted, reopen Modlock before manually rearranging files. It will offer completion/rollback based on the journal. Preserve the diagnostic ID. Never run random cleanup scripts or provide support with credentials/full private configs.
