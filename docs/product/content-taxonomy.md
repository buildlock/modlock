# Content taxonomy and capability model

Status: proposed  
Last reviewed: 2026-09-01

## Presentation categories

Cosmetic skins/models, weapons, abilities/effects, HUD/UI, audio/music/voice, maps/practice, accessibility, quality-of-life/fixes, configuration, crosshair, and other. Categories aid discovery and never determine safety by themselves.

## Orthogonal tags

Hero, content type, source, creator, game build, language, variant, dependency, compatibility evidence, content rating, verification, and install target.

## Capabilities

Scanner-inferred/creator-declared capabilities use namespaced stable keys, for example:

- `vpk.cosmetic.model`, `vpk.audio`, `vpk.hud`, `vpk.map`.
- `cfg.crosshair`, `cfg.performance`, `cfg.input`, `cfg.unknown`.
- `target.gameinfo-search-path`, `target.autoexec`, `target.machine-convars`.
- `payload.executable`, `payload.script`, `payload.link`, which are normally rejected.

Uploader declarations can increase review context but never lower an inferred risk. Unknown capability fails to review/confirmation rather than cosmetic.

## State badges

Source provenance, scan state, policy state, compatibility evidence, identity/artifact verification, license/redistribution, content rating, and availability are separate badges. Never collapse them into one “verified/safe” mark.

