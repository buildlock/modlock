# Ecosystem and technical research

## Research scope and confidence

This report combines live API observations, public repositories, current releases, official Steam material, community documentation, and source inspection performed on 2026-08-26. Labels used below:

- **Confirmed:** visible in current source, API output, or an authoritative page.
- **Observed:** reproduced in a dated snapshot but not guaranteed as a contract.
- **Inference:** a design conclusion from multiple observations.
- **Unknown:** must be validated with the platform owner or during a game build test.

Deadlock is in early development. Any concrete path, convar, package behavior, or catalog count is a dated implementation fact rather than a permanent platform guarantee.

## Deadlock Mod Manager (DMM)

### Current implementation

DMM's current public repository is a pnpm/Turborepo monorepo. Its desktop client uses Tauri 2, Rust, React, and TypeScript. Its service layer uses Bun, Hono/oRPC, PostgreSQL/Drizzle, and Redis. The repository also contains auth, website, bot, documentation, mirroring, game-data, and package-format projects.

The inspected revision was `db775912eb2ced35ab94c38082c1fa374f243e18` from 2026-08-24. Its declared license is GPL-3.0. This matters: behavior can inform clean-room requirements, but GPL implementation code cannot simply be incorporated into a closed-source Modlock client.

Current feature surface found in the repository includes:

- Mod discovery, installation, updates, and batch update.
- Profiles and load order.
- Crosshair browsing/generation.
- Autoexec editing and a command library.
- Skins, backups, VPK inspection, server browser, player statistics, and Discord presence.
- Mod creation/foundry utilities.

The latest public release observed was v1.1.0, published 2026-08-01. Its Windows setup asset was about 23 MB and showed roughly 230,000 downloads at observation time. GitHub showed roughly 426 stars, 71 forks, and 61 open issues. Release and repository counts are volatile and should not be used as market-size claims.

### Install behavior

The source recognizes ZIP, RAR, 7z, and raw VPK inputs. Its extraction code explicitly checks unsafe paths and links. A normal install ultimately places content under Deadlock's addons search path and gives enabled VPKs ordered names such as `pak01_dir.vpk`, `pak02_dir.vpk`, and so on. Disabled/original names and install state are recorded in a `.dmm.json` manifest.

Observed relevant game locations:

```text
Steam app id:                         1422450
Game search-path file:                game/citadel/gameinfo.gi
Default managed add-ons:              game/citadel/addons/
Autoexec:                             game/citadel/cfg/autoexec.cfg
Persisted machine convars:            game/citadel/cfg/machine_convars.vcfg
Steam Cloud personal key settings:    userdata/<steamid>/1422450/remote/cfg/citadelkeys_personal.lst
```

The manager backs up and edits `gameinfo.gi` to add a `citadel/addons` search path. Profiles can use profile-specific paths. Patches can replace this file, so a manager must detect rather than assume its marker remains present.

### Current pain signals

Open issues are not product facts by themselves, but they expose useful failure classes: crashes or corruption after a vanilla reset, large raw VPK freezes, download-node fallback, patches resetting `gameinfo.gi`, portable packaging, configuration support, profile load-order persistence, batch downloads, and the effective numbered-VPK ceiling. Modlock should turn these into fixtures and acceptance tests rather than marketing comparisons.

DMM is broader than the requested product. That breadth is a competitive advantage, but also supports a focused positioning for a smaller, safer client.

### API

DMM operates a public API. The current OpenAPI document is at `https://api.deadlockmods.app/docs/openapi.json`; the working base observed in source and live calls is `https://api.deadlockmods.app/api`.

Notable current route groups include:

```text
GET  /health, /stats, /status, /version, /releases
GET  /v1/mods, /v1/mods/{id}, /v1/mods/{id}/download
GET  /v2/mods, /v2/mods/{id}, /v2/mods/{id}/download
POST /v2/mods/check-updates
GET  /v2/profiles, /v2/profiles/{id}
GET  /v2/crosshairs and detail/download/like routes
GET  /announcements, /fileservers, /servers, /relays
      report, auth, dashboard, VPK-analysis, and utility routes
```

Observed `/api/v2/mods` behavior was an approximately 8.8 MB, unpaginated response containing 8,031 records, of which 8,001 had a downloadable file. The same snapshot contained 227 published crosshairs. `/api/stats` reported different aggregate totals, consistent with caching or differing definitions. The API is valuable for interoperability research, but its unpaginated payload, current documentation drift, and lack of a negotiated service commitment make it unsuitable as Modlock's permanent source of truth.

## Where Deadlock mods are hosted

### GameBanana — primary public source

GameBanana game ID `20948` is the dominant identifiable public catalog. DMM currently consumes GameBanana's `apiv11` surface, including submission indexes, profile/download pages, featured entries, and top submissions. A dated query returned 3,678 Mod records and 3,570 Sound records. Those sections can overlap conceptually and the web hub uses different counts, so these values are not a unique-mod total.

A GameBanana download page exposes files, submitter instructions, license content, donations, and supported manager metadata. Deadlock Mod Manager is registered as a remote-install-capable manager. Files are served through GameBanana's file infrastructure.

GameBanana also publishes a legacy/Core API and documentation, but the exact `apiv11` endpoints used by current tools are not presented as a durable Modlock contract. Build an adapter with caching, schema validation, retry/backoff, contract monitoring, and a kill switch. Ask GameBanana about API and 1-click manager terms before launch.

Recommended catalog modes:

| Provenance | Storage | Product behavior |
|---|---|---|
| `modlock-hosted` | Modlock quarantine then first-party object storage/CDN | Full release and scanning workflow. |
| `gamebanana-linked` | GameBanana file infrastructure | Preserve creator, license, source page, and file identity; resolve at install time. |
| `external-linked` | Author-approved external host such as GitHub | Require explicit authorization and stable hashes; never imply Modlock hosts it. |

Do not copy GameBanana or Discord binaries into Modlock storage without a license or the rightsholder's permission.

### Other sources

- **Discord:** creators often share files and support in communities, but messages and attachments are ephemeral. Do not scrape private servers or treat attachment URLs as durable catalog infrastructure.
- **GitHub Releases:** appropriate for open-source utilities and some author-published mods when the repository and license are explicit.
- **Creator-owned storage:** acceptable through an external-linked record if the creator authorizes it and immutable checksums are recorded.
- **Nexus Mods:** no clearly active Deadlock-specific catalog was confirmed in this research; search results frequently refer to the unrelated game *Battlestar Galactica Deadlock*.

## Grimoire

Grimoire is an active MIT-licensed manager. The inspected revision was `cc61247e1ac43f1ad2ca4b53621d766f23123bd4` from 2026-08-25, with source version 1.28.0. Its architecture is Electron 35, React 19, SQLite, Three.js, and native archive tools. An older public tools page listed Windows packages around 184 MB, illustrating why Electron is a poor fit for Modlock's strict footprint goal.

Relevant capabilities include GameBanana one-click install, offline library behavior, hero organization, profiles, variants, conflict resolution, and VPK merging.

### Open profile format

Grimoire documents a useful `.modprofile.json` reference format and an `mp1:` compressed share code. Profiles reference submission/file identities rather than embedding binaries, include priority and variant details, and support an extension object. It also documents size and parsing safety rules.

Modlock should import/export this format where compatible and add namespaced data under `extensions.modlock`, rather than creating an isolated pack ecosystem. Modlock's own server-side pack records may contain richer provenance, immutable release hashes, compatibility status, and creator approval, but the portable export should remain reference-based.

### VPK merging

Grimoire's MIT-licensed VPK merge work demonstrates a way around load-count limits and supports explicit collision policies. Merging adds substantial correctness risk and makes attribution/debugging harder. Modlock should initially expose conflicts and deterministic load order, then evaluate merging as a later opt-in feature with extensive fixtures.

## VPK and archive model

VPK is Valve's Source/Source 2 package format. A package commonly has a directory file ending `_dir.vpk` and can have numbered companion chunks. Deadlock cosmetic/audio/UI mods are often delivered as one or more VPKs inside a conventional archive.

The installer must not treat an archive as trusted. It needs limits for compressed size, expanded size, file count, path depth, and nesting; it must reject absolute paths, `..` traversal, symlinks, hardlinks, device names, alternate data streams, and executable payloads in normal mod types. VPK parsing should inventory contained paths and identify collisions before activation.

## CFG and crosshair behavior

### CFG ownership

Deadlock configuration is spread across generated and user-controlled files. A complete `gameinfo.gi`, `video.txt`, or machine convar file from another PC is not a safe preset. Sources disagree on boolean forms, old performance settings can be invalid, and display files contain hardware/resolution identifiers.

Modlock should store CFG presets as typed settings, render only supported commands, and edit owned marker blocks in user files. It should never replace full files just to apply a preset. It must back up before writing and reconcile `machine_convars.vcfg` when a persisted convar conflicts with a managed autoexec setting.

Known crosshair-related convars found in current manager implementations include:

```text
citadel_crosshair_color_r
citadel_crosshair_color_g
citadel_crosshair_color_b
citadel_crosshair_pip_border
citadel_crosshair_pip_gap_static
citadel_crosshair_pip_opacity
citadel_crosshair_pip_width
citadel_crosshair_pip_height
citadel_crosshair_pip_gap
citadel_crosshair_dot_opacity
citadel_crosshair_dot_outline_opacity
citadel_crosshair_disable_hero_specific_crosshairs
```

These names and valid ranges must be probed against the target game build before being enabled in a release.

### Per-character crosshairs

The game has hero-specific default reticles, but research did not confirm a supported built-in mapping from each hero to an arbitrary custom crosshair. Current managers primarily apply one global set of crosshair convars. A read-only live hero signal may be inferred from `console.log`, but detection is not the same as having a supported method to apply new values in a running competitive game.

V1 should therefore support:

- A preset library tagged by hero and creator/player.
- A saved preferred crosshair for each hero.
- Explicit activation before launch or a user-triggered CFG selection flow.
- Clear state showing which preset is currently applied.

Automatic live switching moves out of experimental status only if a supported reload/command path is proven without process injection, game-memory access, simulated console input, or anti-cheat risk.

## Community game-data API

`deadlock-api.com` is an open, community-run service with an OpenAPI document and MIT-licensed implementation. It provides heroes/items/assets, match/player statistics, leaderboards, patch notes, and related game data. It is useful for canonical hero identifiers, imagery, player lookup, and game-build context. It does not establish the truth of a player's CFG or mod pack.

Modlock should maintain a pinned game-data snapshot for each release, refresh in the background when the app is open, and tolerate API failure. There is no confirmed official Valve mod-catalog API.

## Authentication note

Valve documents Steam OAuth for approved partners and scoped permissions; access should not be assumed. Conventional Steam OpenID, Discord OAuth, email/passkey, or another supported identity provider can authenticate a normal Modlock account. Any Steam Web API key stays server-side. Identity login is distinct from a verified public player/creator endorsement.

## Strategic conclusion

The market does not need a third generic wrapper around the same unpaginated catalog. Modlock's defensible system is the combination of:

1. creator-controlled, immutable hosting and provenance;
2. a small native client with no resident background service;
3. transactional installs and visible conflict/rollback behavior;
4. safe typed configuration rather than copied CFG bundles; and
5. genuinely opt-in, versioned player presets and packs.
