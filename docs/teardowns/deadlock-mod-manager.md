# Deadlock Mod Manager teardown

**Evidence date:** 2026-09-01  
**Repository:** [`deadlock-mod-manager/deadlock-mod-manager`](https://github.com/deadlock-mod-manager/deadlock-mod-manager)  
**Pinned source revision:** [`4626073406a8b99c6e782f3ce509aacc8090cce8`](https://github.com/deadlock-mod-manager/deadlock-mod-manager/tree/4626073406a8b99c6e782f3ce509aacc8090cce8) (committed 2026-08-31)  
**Latest stable release observed:** [`v1.1.0`](https://github.com/deadlock-mod-manager/deadlock-mod-manager/releases/tag/v1.1.0), published 2026-08-01  
**License:** [GNU GPL-3.0](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/LICENSE.md)  
**Live API schema inspected:** [`https://api.deadlockmods.app/docs/openapi.json`](https://api.deadlockmods.app/docs/openapi.json), reporting API version `2.0.0` and base `https://api.deadlockmods.app/api`

This is a clean-room behavioral and architectural study for Modlock. It is not a code port, compatibility promise, security certification, or substitute for running DMM on Windows. The companion [clean-room evidence log](./dmm-clean-room-evidence.md) defines what may and may not be carried into Modlock.

## 1. Evidence language and scope

Every material claim uses one of these states:

| State | Meaning |
|---|---|
| **Confirmed — source** | Directly present in the pinned public source or configuration. |
| **Confirmed — live** | Directly observed from a public service or release endpoint on the evidence date. |
| **Observed — issue** | Reported in a public issue. It may be user-, platform-, or version-specific and is not independently reproduced here. |
| **Inference** | Reasonable conclusion from multiple source facts, explicitly not proven at runtime. |
| **Unknown** | Requires maintainer clarification or a controlled Windows/runtime experiment. |

The audit included the public monorepo, release metadata, repository issues, checked-in documentation, live OpenAPI document, and selected live metadata endpoints. It did **not** install the stable Windows binary, intercept traffic, inspect private infrastructure, execute a mod against a real Deadlock installation, or perform vulnerability exploitation.

## 2. Executive assessment

DMM is no longer a small downloader. **Confirmed — source:** it is a broad ecosystem consisting of a Tauri desktop client, Bun/Hono/oRPC API, authentication service, website, documentation site, Discord bot, GameBanana mirror service, creator tools, shared database packages, native parsers, match synchronization, and server browsing. Its desktop navigation exposes dashboard, downloads, settings, local mods, catalog, maps, servers, crosshairs, skins, Foundry, autoexec, player statistics, and developer/experimental surfaces ([sidebar source](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src/components/layout/app-sidebar.tsx)).

The strongest parts of the current implementation are:

- transaction-like VPK rename/staging helpers and recovery tests;
- a manifest that records file ownership separately for every profile;
- safe archive-path handling for ZIP and 7z, with post-extraction symlink checks;
- patch-in-place `gameinfo.gi` management with validation and backup;
- support for more than 99 enabled VPKs by spreading them across up to ten addon search-path directories;
- explicit telemetry consent for Google Analytics;
- signed Tauri updater metadata and a Windows signing sponsor.

The most important caveats for Modlock are:

- DMM is GPL-3.0. Modlock must not copy its source, UI expression, tests, markers, schemas, or prose unless the product intentionally accepts GPL obligations.
- The public API and online documentation are not a stable product contract. The live OpenAPI version, application package versions, source routers, and online feature documentation disagree in coverage.
- DMM's local manifest is a useful observation, not an interoperable standard.
- Current DMM writes auth material into its JSON application store; the source does not show OS credential-vault storage.
- The checked-in Tauri production configuration sets CSP to `null`.
- Several safety properties are unit-tested in source, but power-loss durability, Windows file locking, antivirus interference, WebView resource use, and upgrade behavior remain unverified here.

## 3. Current release and footprint snapshot

**Confirmed — live, 2026-09-01:** GitHub reported 431 stars, 71 forks, 95 open issues, and GPL-3.0 for the public repository. The `v1.1.0` release contained a 23,023,848-byte Windows NSIS installer with 264,381 recorded asset downloads. GitHub asset counts are requests, not unique users or active installs. The release's `latest.json` updater manifest had 2.68 million downloads and must not be interpreted as application installations. Use the [release page](https://github.com/deadlock-mod-manager/deadlock-mod-manager/releases/tag/v1.1.0) rather than these dated counts for current values.

**Confirmed — source:** the desktop package still declares version `1.1.0`, while `main` contains post-release work and other applications declare their own versions. Source behavior therefore describes a future/nightly line as well as the stable release; it must not be assumed that every behavior below exists in the `v1.1.0` binary.

## 4. Repository and subsystem map

The root is a pnpm/Turborepo monorepo with `apps/*`, `packages/*`, and `tools/*` workspaces ([workspace configuration](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/pnpm-workspace.yaml)).

### Applications

| Path | Confirmed responsibility | Relevance to Modlock |
|---|---|---|
| `apps/desktop` | React 19/Vite frontend plus Tauri 2/Rust native backend. | Primary competitive client. |
| `apps/api` | Bun API built around Hono/oRPC; syncs catalog data, serves mod/profile/crosshair/server/report surfaces. | Shows DMM is a platform, not just a client. |
| `apps/auth` | Better Auth/OIDC service used by the desktop and web properties. | Identity and session dependency. |
| `apps/www` | Public website. | Discovery/marketing surface. |
| `apps/docs` | Fumadocs-style documentation and generated API pages. | Public contract is incomplete and dated. |
| `apps/mirror-service` | Fetches GameBanana files and stores cached copies in S3-compatible storage with validation/cleanup jobs. | Current architecture is explicitly under reconsideration. |
| `apps/bot` | Discord bot. | Community/operational integration. |
| `apps/lockdex` | Separate Deadlock information surface. | Ecosystem breadth; not central to mod installation. |
| `apps/dmodpkg` | CLI shell for `.dmodpkg` creation/manipulation. | Packaging work exists but should not be treated as a mature public standard. |

### Shared and native packages

| Path | Confirmed responsibility |
|---|---|
| `packages/database` | Database schema and repositories, including mods, downloads, profiles, reports, crosshairs and mirror records. |
| `packages/shared`, `packages/common` | Shared DTOs, validation, auth helpers and common utilities. |
| `packages/ui` | Shared React UI components. |
| `packages/crosshair` | Crosshair calculation, rendering, schema and URL/config generation. |
| `packages/vpk-parser` | Rust-backed VPK parser exposed to JavaScript. |
| `packages/hero-parser` | VPK-entry analysis for hero targeting. |
| `packages/vpkmanager` | Source 2 resource and VPK manipulation used by Foundry. |
| `packages/source2-model` | Source 2 model decoding/export behavior. |
| `packages/kv-parser` | Rust-backed Valve KeyValues parser. |
| `packages/dmodpkg` | Rust package container implementation and Bun FFI. |
| `packages/dmp-parser` | Match-data parser. |
| `packages/deadlock-discord-presence` | Console-log based presence/event mapping. |
| `packages/feature-flags` | Feature-flag client/server helpers. |
| `packages/relay-client` | Relay/server integration. |
| `packages/queue`, `packages/distributed-lock` | BullMQ/Redis job primitives and distributed coordination. |
| `packages/instrumentation`, `packages/logging` | Observability and shared logging. |

The authoritative high-level inventory is the [repository tree](https://github.com/deadlock-mod-manager/deadlock-mod-manager/tree/4626073406a8b99c6e782f3ce509aacc8090cce8); checked-in architecture prose should be treated as explanatory, not exhaustive, because [issue #609](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/609) acknowledges documentation lag.

## 5. Desktop architecture

### Runtime composition

**Confirmed — source:** the UI is React 19 with React Router, Zustand persistence, TanStack Query, Tailwind/shadcn-derived components, and Tauri IPC. The backend is Rust 2024 using Tauri 2.11.1, Tokio, Reqwest, `steamlocate`, archive libraries, process inspection, VPK/KeyValues parsers, and numerous Tauri plugins ([desktop package](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/package.json), [Rust manifest](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/Cargo.toml)).

The Rust `ModManager` aggregates Steam discovery, game-process checks, game configuration, VPK operations, file-tree analysis, in-memory mod state, backups, autoexec management, and the Tauri app handle ([manager source](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/mod_manager/manager.rs)). Tauri commands form the boundary between the React state machine and filesystem/process operations.

### Tauri capability and trust surface

**Confirmed — source:** the main window has recursive application-local-data read/write permission, updater/process/store/log/deep-link access, clipboard write, machine ID access, dialogs, an opener restricted to `steam://*`, and HTTP access to GameBanana, DMM domains, Deadworks, Deadlock API and localhost development origins ([capability file](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/capabilities/default.json)). Production configuration sets `"csp": null` ([Tauri configuration](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/tauri.conf.json)).

**Security observation:** a disabled CSP removes a defense-in-depth boundary for a privileged webview. This is not, by itself, proof of exploitability. Runtime navigation restrictions, HTML sanitization, plugin ACL resolution and updater integrity require a dedicated test.

### App initialization

**Confirmed — source:** startup loads `state.json`, rehydrates a Zustand object named `local-config`, initializes API/proxy/download management, then mounts global renderers for plugins, game presence, match sync, live match state, Forge installs, updater, onboarding, telemetry consent and font installation ([app source](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src/app.tsx)). Rust initializes deep links, logs, updater, filesystem/store/process/network plugins and a global manager ([Tauri entrypoint](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/lib.rs)).

## 6. Feature matrix

This table is based on reachable pages, commands and active components in pinned `main`; it does not guarantee stable-release availability or production quality.

| Feature | Source status | Implementation surface | Runtime status |
|---|---|---|---|
| Dashboard and announcements | Confirmed | dashboard components; announcement API | Not exercised |
| Browse/search/filter mods | Confirmed | `/mods`, API client, catalog routes | Live API observed, UI not exercised |
| Mod details/media/dependencies/donations/NSFW | Confirmed | mod detail components and mod DTOs | Not exercised |
| Queued/pause/resume downloads | Confirmed | JS `DownloadManager`; Rust download manager | Not exercised under network loss |
| ZIP/RAR/7z/raw VPK import | Confirmed | archive extractor and download processing | ZIP/7z have traversal tests; RAR safety parity not proven here |
| Enable/disable/purge | Confirmed | `ModManager` lifecycle | Unit behavior inspected, Windows behavior unknown |
| Update and batch update | Confirmed | per-mod variants and `batch_update_mods` | Interrupted batch recovery not independently tested |
| Profiles and sharing/import | Confirmed | profile folders, API profile records, batch import | Feature-flag dependent; interoperability not standardized |
| Load ordering | Confirmed | manifest order plus sharded reorder staging | Engine precedence should be runtime-tested |
| More than 99 VPKs | Confirmed in source after stable release | up to ten `addonsN` shards, 99 each | Not proven in actual game here |
| Variants/file selection | Confirmed | archive file tree, option swap, variant switching | Open issue #685 indicates selection-state defect |
| Backups/restore/pruning | Confirmed | directory snapshots of all addon shards | Power-loss and AV/file-lock behavior unknown |
| `gameinfo.gi` setup/reset/repair | Confirmed | marker-based patch and validation | Patch drift remains a reported failure class |
| Autoexec editor | Confirmed | editable content with protected managed sections | No per-command safety policy inferred |
| Crosshair library/editor | Confirmed | hosted crosshair API and CFG generator | Writes one global configuration; per-hero live switching not implemented |
| Maps | Confirmed | map catalog and managed `map` command | Not exercised |
| Skins/hero assignment/model preview | Confirmed | VPK analysis, hero assignment and model viewer | Open issues #686/#688 show classifier accuracy is active work |
| Foundry | Confirmed | model/sound/paint/resource workspace and export | Complex post-release surface; maturity unknown |
| Font installation | Confirmed | scan/stash/install/cleanup commands | OS-level consequences need Windows test |
| Server browser and required-mod resolution | Confirmed | server/relay API and server-specific addon layer | Not exercised |
| Player statistics/live match/match sync | Confirmed | Deadlock API client, local match-data and GC paths | User consent and service behavior not audited end-to-end |
| Discord/game presence | Confirmed | console log watcher/presence package | Not exercised |
| Plugins/themes | Confirmed | global plugin renderer and bundled plugins | Third-party plugin trust model needs separate audit |
| Stable/nightly updater | Confirmed | signed Tauri updater endpoints | Artifact matrix correctness is an open issue group |
| Forge one-click bridge | Confirmed | loopback bridge plus deep-link launch | Threat boundary not runtime-tested |
| Favorites, reports, feature flags, localization | Confirmed | persisted store/API/Crowdin integration | Not exercised |
| Portable Windows build | Not implemented | [issue #512](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/512) | Open request |
| General config-mod installation | Incomplete | [issue #418](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/418) | Open request |

## 7. Mod discovery and download flow

### Catalog source

**Confirmed — source:** the API has a GameBanana provider, RSS processor and mod-sync service. DMM's own README calls GameBanana its primary mod source. The database normalizes GameBanana submissions and downloads into DMM DTOs ([provider directory](https://github.com/deadlock-mod-manager/deadlock-mod-manager/tree/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/api/src/providers/game-banana)).

**Confirmed — issue:** [issue #673](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/673) proposes migrating catalog consumption directly to GameBanana and retiring the DMM mirror. This means the current catalog/mirror architecture is explicitly non-final. Modlock must not depend on DMM's API as a durable upstream contract.

### Download routing

**Confirmed — source:** the renderer obtains files from the DMM API. In default mode it uses the supplied URL. In automatic or selected-server mode it queries `/api/v2/fileservers/gamebanana`, chooses a route using latency/throughput metadata, and falls back to original URLs if resolution fails ([fileserver resolver](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src/lib/download/fileserver.ts), [queue logic](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src/lib/download/manager.ts)).

The Rust command layer accepts HTTP(S) downloads only when the host is `gamebanana.com`, `deadlockmods.app`, or a subdomain of either. File names reject separators and parent components ([download validation](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/commands/mods.rs)).

**Observed — issue:** [issue #569](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/569) reports no fallback when a default cache node is unreachable. The current source has a fallback for *fileserver URL resolution failure*; that does not prove retry/fallback after a selected URL fails mid-download.

### Local download state

**Confirmed — source:** downloads are written below `app_local_data_dir()/mods/<mod-id>`. Archives and extracted content remain in this per-mod store; copied VPKs are placed into the selected game profile. Active download bookkeeping is in memory, while renderer statuses persist in `state.json`. Startup reconciles persisted transient statuses against the backend's active in-memory list and marks orphans failed.

**Unknown:** the exact expanded Windows path, ACLs, antivirus behavior, disk-space failure behavior, redirect ceiling, TLS proxy behavior, and whether every downloaded file is cryptographically verified. DMM DTOs can include MD5 data, but the one-click flow shown below constructs a download record with no checksum.

## 8. Installation lifecycle and filesystem mutations

### Game and profile roots

**Confirmed — source:** Deadlock discovery uses Steam location logic. DMM mutates paths below the selected installation:

```text
<Deadlock>/game/citadel/gameinfo.gi
<Deadlock>/game/citadel/gameinfo.gi.bak
<Deadlock>/game/citadel/gameinfo.gi.tmp
<Deadlock>/game/citadel/cfg/autoexec.cfg
<Deadlock>/game/citadel/cfg/machine_convars.vcfg
<Deadlock>/game/citadel/addons[/<profile>]
<Deadlock>/game/citadel/addons2[/<profile>]
...
<Deadlock>/game/citadel/addons10[/<profile>]
<Deadlock>/game/citadel/addons-backups/addons-backup-<timestamp>/
```

It can also create a replay link from `citadel/replays` to `citadel/addons/replays` and install fonts through platform-specific operations. Those secondary mutations require explicit runtime inventory before Modlock treats them as compatibility requirements.

### Download-to-disabled staging

**Confirmed — source:** download/extraction finds VPKs recursively and copies selected VPKs into the profile's base addon directory under an ownership prefix shaped like `<mod-id>_<original-name>.vpk`. In this state the mod is downloaded but disabled. The original archive/extracted tree remains under application-local data.

### Enable/install

`ModManager::install_mod` performs the following observable behavior ([lifecycle source](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/mod_manager/manager/lifecycle.rs)):

1. If game setup is not cached as complete, ensure Deadlock is closed and patch `gameinfo.gi` for addon search paths.
2. Resolve the default or named profile base.
3. Find all disabled prefixed VPKs belonging to the mod; older local imports may be restored from the application-local mod store.
4. Open/recover the profile manifest and any recognized staging directory.
5. Choose one shard with enough space for the mod's entire VPK group.
6. Rename each prefixed VPK into the next free `pak##_dir.vpk` slot in that shard. A rename transaction attempts to roll back already-renamed files on failure.
7. Record enabled file names, original names, order and shard in `.dmm.json`.
8. Save the manifest through `.dmm.json.tmp` and rename it into place. If save fails, attempt to disable the newly enabled files.
9. Update the in-memory repository. If the mod has an order, run a reorder; reorder failure is logged but does not convert the already committed install into a reported failure.

**Inference:** install state is more robust than an unjournaled sequence but is not a single filesystem transaction. File placement commits before the manifest, and reorder is explicitly post-commit. Recovery logic narrows inconsistent states, but only fault injection can establish the full crash matrix.

### Shards and load order

**Confirmed — source:** Source 2 is treated as loading at most 99 enabled `pak##_dir.vpk` files per search-path directory. DMM supports ten 1-based shards: `addons`, then `addons2` through `addons10`. A multi-file mod stays within one shard. Disabled prefixed files and `.dmm.json` always remain in shard one. `gameinfo.gi` receives one ordered search-path line per active shard ([shard model](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/mod_manager/shard.rs)).

Reordering uses a `.dmm-reorder` staging directory and temporarily named `.pending` entries, then places ordered groups into numeric slots and updates the manifest. Recovery recognizes reorder, clear and update staging prefixes. This source is newer than [issue #504](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/504), which originally requested escape from the 99-addon cap.

**Unknown:** verified engine precedence across shards, actual maximum stable load, interactions with third-party manual search paths, and behavior when a patch changes Source 2's rules.

### Disable/uninstall

In DMM UI language, uninstall is primarily **disable**:

1. Load the profile manifest, falling back to UI or in-memory file lists only when needed.
2. Locate enabled numeric VPKs in the recorded shard.
3. Rename existing files back to `<mod-id>_<original-name>.vpk` in the profile base. Missing files may be reconciled.
4. Mark the manifest entry disabled and save it.
5. If manifest save fails, attempt to re-enable the prefixed files.
6. Remove empty overflow shard directories.

The downloaded archive and application-local files remain available.

### Purge/delete

Purge removes both profile VPK ownership and the application-local `mods/<mod-id>` directory. The current source validates mod IDs before recursive deletion, stages all owned VPKs to an update directory, removes the manifest entry, saves the manifest, and only then deletes staged files. Tests explicitly reject `..`, slash and backslash traversal IDs.

### Update

**Confirmed — source:** permanent replacement stages and removes the old mod's profile files and manifest entry, downloads/extracts replacement content, recopies disabled prefixed VPKs, enables them and restores order. Batch update can create a complete addon-shard backup first and reports success/failure per mod. Variant replacement uses VPK snapshots/rename transactions.

**Important behavior:** per-mod update removes the old owned VPKs before the new download/install completes. Batch backup is a recovery path, not proof that each individual update is atomic. Modlock should preserve the active generation until a replacement generation is fully validated.

### Clear and nuke/reinstall

**Confirmed — source:** clear operations stage all VPKs in the active profile before committing an empty manifest. Settings also expose a broader “nuke reinstall” control that wipes cache, mod state and mod files and then redownloads known mods. The exact data-loss and partial-failure behavior needs Windows runtime testing before comparison.

## 9. Manifest and local state

### Profile VPK manifest

**Confirmed — source:** `.dmm.json` manifest version 2 has a `mods` object keyed by mod ID. Each entry records:

- `enabled`;
- optional numeric `order`;
- 1-based `shard`;
- `currentVpks` for active numeric filenames;
- `disabledVpks` for prefixed inactive filenames;
- `originalVpkNames`.

The loader upgrades older version-1 semantics to shard one, rejects future manifest versions and invalid shard numbers, reconciles a `.dmm.json.tmp`, and recovers known staging directories ([manifest source](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/mod_manager/vpk_manifest.rs)).

**Boundary:** this schema is GPL-covered project source and not declared as an open compatibility specification. Modlock may design independently around the functional need “record file ownership, activation generation, order and recovery state,” but must not copy this schema or markers.

### Application state

**Confirmed — source:** Zustand persists most state to the Tauri store `state.json`, under the `local-config` key, with explicit migration versions. Slices include mods, profiles, server profiles, game paths/state, settings, network preferences, UI, crosshairs, favorites and statistics ([store source](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src/lib/store/index.ts)). The exact application-local path is delegated to Tauri.

The Rust auth command also writes an `auth_token` string into `state.json`. Its caller serializes the access token, refresh token and expiry timestamp into that string ([token caller](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src/lib/auth/token.ts)). OIDC uses authorization-code flow with PKCE, scopes `openid profile email offline_access`, and temporarily holds the verifier in webview session storage ([OIDC source](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src/lib/auth/oidc.ts), [token store source](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/commands/auth.rs)).

**Security observation:** source does not show Windows Credential Manager/DPAPI/keyring protection for the access and refresh credentials in that serialized token bundle. Modlock should keep refresh credentials in the OS vault and only short-lived access material in memory.

### Logs, caches and backups

- Rust logs rotate at 1 MB but use a `KeepAll` strategy. Retention and sensitive-value redaction need runtime verification.
- Download archives/extraction live under application-local `mods/<id>` and can be cleared independently of installed VPKs.
- Addon backups live inside the game tree under `game/citadel/addons-backups`; each current backup is a directory snapshot of all addon shards.
- Backup copy skips symlinks and internal staging artifacts, validates manifest-referenced files, and restores through `.dmm-restore-staging`.
- Hero/VPK analysis and the ingest tool maintain additional caches; their exact on-disk retention is outside this teardown's core install trace.

## 10. `gameinfo.gi` and patch recovery

**Confirmed — source:** setup validates the existing KeyValues structure, creates `gameinfo.gi.bak` if missing, injects a marked SearchPaths block rather than replacing the whole file, writes a `.tmp`, validates it, writes the final file, validates again and tries the backup on failure ([configuration manager](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/mod_manager/game_config_manager.rs)). Profile and server changes replace only DMM's marker block with ordered addon search paths.

The manager can report status, back up, restore, reset to a bundled vanilla fallback, open the file in an editor, toggle vanilla/modded search paths and repair missing markers. Source comments recognize that game updates and Settings reset can replace the file.

Failure evidence:

- [#613](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/613): reported crash/corruption after vanilla auto-reset;
- [#538](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/538): reported patch/update and reset trouble;
- [#527](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/527): mixed line endings on Linux;
- [#664](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/664): current reliability work to invalidate cached setup and preserve line endings.

These reports are not proof the pinned source still exhibits each defect. They define mandatory Modlock regression fixtures: CRLF/LF preservation, marker loss, vanilla replacement, corrupt/partial file, concurrent patcher, read-only file, game running, locked file, no backup and stale setup cache.

## 11. Profiles and sharing

**Confirmed — source:** a profile is a directory below each addon shard. Creating one sanitizes a generated ID/name; switching profiles migrates old layout if needed and rewrites the DMM-owned `gameinfo.gi` search paths. Deleting a profile removes matching directories across all shards. Import downloads each referenced mod into a selected/new profile, then enables it. Profiles can be shared through `POST /v2/profiles` and fetched by ID, subject to a server feature flag ([desktop profile commands](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/commands/profiles.rs), [API profile router](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/api/src/routers/v2/profiles.ts)).

Shared profile creation accepts a client `hardwareId`, name, version and profile payload; the API content-hashes the serialized input and returns an existing record for a duplicate hash. Source does not require an authenticated user for the public procedure.

**Gap:** a DMM profile is an application-specific reference format, not a general mod-pack standard. [Issue #387](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/387) requests retained load order on export. Modlock should use its own versioned, provenance-rich pack contract and separately provide explicitly licensed import adapters.

## 12. CFG and crosshair behavior

### Autoexec editor

**Confirmed — source:** DMM reads/creates `<game>/game/citadel/cfg/autoexec.cfg`. It divides the file into editable content and DMM-owned read-only sections. On save, known managed sections are merged back even if the UI-provided full text removed them. The two current owned sections are crosshair settings and a custom-map command.

The generic editor is text-based. This teardown found no central allowlist preventing users from entering arbitrary console commands. That is acceptable for an advanced local editor but is not a safe design for remotely supplied creator presets.

### Crosshairs

The crosshair generator writes these convars into one managed autoexec section:

```text
citadel_crosshair_color_r/g/b
citadel_crosshair_pip_border
citadel_crosshair_pip_gap_static
citadel_crosshair_pip_opacity
citadel_crosshair_pip_width
citadel_crosshair_pip_height
citadel_crosshair_pip_gap
citadel_crosshair_dot_opacity
citadel_crosshair_dot_outline_opacity
```

The input DTO includes a `hero` string, but the Rust generator does not use that field in emitted commands ([autoexec command source](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/commands/autoexec.rs)). **Confirmed conclusion:** DMM's current installation is one active global custom crosshair; hero is catalog/classification metadata, not automatic per-character switching.

Disabling custom crosshairs requires the game to be closed, parses `machine_convars.vcfg`, removes only the managed crosshair keys, removes the autoexec section, then writes both files. If the machine-convars parse fails, source tests expect autoexec to remain unchanged. Normal apply/update commands do not show the same explicit game-running guard.

**Modlock implication:** store per-hero preferences in Modlock, but do not promise live hero switching until a supported, non-injection activation channel is proven. Remote presets must be typed key/value records, not arbitrary CFG programs.

## 13. Deep links and one-click installation

**Confirmed — source:** Windows/Linux register three schemes: `deadlock-mod-manager`, `deadlock-modmanager`, and `dlmm`. Routes also carry OIDC callbacks, legacy auth callbacks and a Forge launch request ([deep-link source](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/deep_link.rs)).

The GameBanana mod form is three comma-separated values: download URL, mod type and numeric mod ID. Initial parsing only checks that the URL text contains `gamebanana.com`; the later Rust download command parses the URL and enforces the host allowlist. The UI fetches canonical mod metadata from DMM's API, performs a HEAD request to infer size/type, constructs a checksum-less file record, downloads it, and automatically invokes installation ([renderer one-click flow](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src/hooks/use-deep-link.ts)).

Security observations:

- defense is split across the parser, Tauri HTTP capability and Rust download host validation;
- the legacy auth callback can carry a token in a deep-link URL, which can be exposed in OS/app logs or process invocation history;
- DMM logs incoming deep-link URLs at info level, so OIDC authorization codes and legacy tokens may enter retained logs unless redaction occurs elsewhere;
- query parsing splits pairs on `=` without limiting to the first delimiter, which may truncate padded values;
- checksum-less one-click records rely on transport/server integrity plus archive/VPK parsing.

No exploit was attempted. Modlock should parse a versioned URL structure with a standard URL library, never log secrets or full callback URLs, bind OAuth state to the initiating session, resolve an immutable release manifest, and verify a server-signed SHA-256 before extraction.

## 14. Updater, signing and release channels

**Confirmed — source:** Tauri updater metadata has an embedded minisign public key and defaults to GitHub's stable `latest.json`. Stable/nightly and Wry/CEF endpoint selection is applied at startup from `update-channel.json` under the OS config directory ([updater configuration](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/tauri.conf.json), [channel logic](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/updater_channel.rs)). The README states Windows binaries receive free SignPath code signing.

The app checks shortly after launch unless development mode, Flatpak, CLI disable or GUI disable applies. It downloads/installs with Tauri then relaunches. Flatpak follows a separate update path.

Open reliability/security work is captured in:

- [#655](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/655), validate updater manifests/artifact URLs before publication;
- [#659](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/659), exact runtime/channel/target routing;
- [#660](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/660), distinguish failure from no update;
- [#661](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/661), nightly trust and rollback;
- [#662](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/662), withhold unverified CEF artifacts.

These are project-owned work items, not independently confirmed vulnerabilities. Modlock needs a release manifest matrix test, offline rollback story, key rotation/revocation runbook, two-person production signing controls and a reproducible release provenance record.

## 15. Authentication, analytics and telemetry

### Authentication

**Confirmed — source:** the desktop uses DMM's auth service with OIDC authorization code + PKCE and an app callback. The API context can consume sessions; some endpoints use `adminProcedure`, some optionally personalize using `context.session`, and feature-flag overrides require a user. The live OpenAPI document declares no operation-level security requirements, so consumers cannot infer auth correctly from that schema.

### Google Analytics

**Confirmed — source:** usage analytics defaults to disabled in the current Zustand migration/settings state. When enabled and a measurement ID exists, React GA4 initializes. Identification uses the machine UID as the analytics identity and may attach the authenticated subject, application version, installed-mod count and profile count. Feature/page/install/error events are emitted through typed helper hooks ([analytics hook](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src/hooks/use-analytics.ts), [provider](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src/contexts/analytics-context.tsx)).

Calling this data “anonymous” is imprecise because a stable hardware-derived identifier is used and can be associated with an authenticated user ID. This is a privacy assessment, not a claim about DMM's legal compliance.

### Error reporting and operational instrumentation

Sentry dependencies and instrumentation exist across the monorepo, and Rust logging persists local application logs. **Unknown:** exact production Sentry initialization/consent path, event scrubbing, IP handling, retention, release tagging and whether crash reports can include filesystem/user identifiers. A packet-level consent-on/consent-off test is required.

## 16. Cache and mirror architecture

**Confirmed — source:** the API maintains a normalized mod cache and publishes update events through Redis. The separate mirror service looks up GameBanana file IDs, returns an existing non-stale S3 object when present, otherwise fetches and uploads the source, stores database metadata, records metrics, validates mirrored size/existence and cleans unused objects ([mirror service](https://github.com/deadlock-mod-manager/deadlock-mod-manager/tree/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/mirror-service/src)). It uses PostgreSQL-backed repositories, Redis and an S3-compatible bucket.

**Unknown/legal dependency:** the public repository cannot establish that every mirrored asset license or GameBanana term permits third-party caching/rehosting. The existence of implementation is not permission for Modlock to mirror. Written GameBanana terms and per-release author licensing are required.

## 17. Public API inventory

**Confirmed — live:** the OpenAPI document reported the following HTTP surface on 2026-09-01. Routes may be feature-flagged or require roles in source even though the schema does not declare security.

| Group | Methods and paths |
|---|---|
| Service | `GET /health`, `/version`, `/status`, `/releases`, `/stats`, `/transparency-stats` |
| Legacy mods | `GET /v1/mods`, `/v1/mods/{id}`, `/v1/mods/{id}/download` |
| Mods | `GET /v2/mods`, `/v2/mods/{id}`, `/v2/mods/{id}/downloads`, `/v2/mods/{id}/download`; `POST /v2/mods/check-updates`, `/v2/sync`, `/v2/sync/{id}` |
| Crosshairs | `GET /v2/crosshairs`, `GET /v2/crosshairs/{id}`, `GET .../{id}/likes`; `POST /v2/crosshairs`, `POST .../{id}/download`, `POST .../{id}/like` |
| Profiles | `GET /v2/profiles/{id}`, `POST /v2/profiles` |
| Analysis | `POST /v2/kv-parse`, `/v2/vpk-analyse`, `/v2/vpk-analyse-hashes` |
| Reports | `POST /v2/reports`; `GET /v2/reports/mod/{modId}`, `/counts`, `/recent` |
| Servers | `GET /v2/servers`, `/facets`, `/{id}`, `/v2/relays/health`; `POST /v2/servers/{id}/resolve-mods` |
| Announcements | public/admin reads plus create, update, delete, publish and archive paths under `/v2/announcements` |
| Identity/flags/admin | `GET /v2/auth/session`, `GET /v2/feature-flags`, put/delete user override, `GET /v2/dashboard/analytics` |
| Routing | `GET /v2/fileservers/gamebanana` |

### Contract quality observations

- The live schema's `info.version` is `2.0.0`; source package `apps/api` is `3.1.1`.
- The live schema contains routes not represented by individual checked-in API documentation pages.
- The schema exposes no security declaration, while source uses admin/authenticated procedures.
- The desktop default base is `https://api.deadlockmods.app`, and client calls include `/api/...`; the OpenAPI server base also includes `/api`.
- Source routers and live deployment can drift independently.
- No service-level SLA or compatibility/deprecation commitment was found.

**Modlock decision:** use DMM API only as an observed competitor/discovery source. Do not build a production dependency without written permission, rate/availability contract, a versioned adapter, cache bounds and a GameBanana-direct fallback.

## 18. Dependency and license review

### Project license

The repository, desktop Rust package and multiple native/shared packages declare GPL-3.0. The README explicitly states GPL-3.0 and points to third-party notices. Therefore:

- reading and describing public behavior is allowed research;
- copying source, test structure, UI expression, manifest fields/markers or docs into a distributed non-GPL Modlock product is prohibited absent a separate license;
- dynamically or statically incorporating DMM GPL packages would create licensing obligations that need counsel;
- network interoperability with independently designed public protocols is a separate question, but DMM's internal schemas must not be presumed unprotectable or standardized.

### Notable desktop dependencies

The desktop uses Tauri/Wry, React, Tokio, Reqwest, `zip`, `unrar`, `sevenz-rust2`, `steamlocate`, `sysinfo`, `notify`, KeyValues libraries, image/font parsers, Steam/GC libraries, and several local GPL packages. The exact transitive SBOM and license set was **not** generated in this audit.

### Copied-in third-party bodies

The repository's [third-party notices](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/THIRD-PARTY-NOTICES.md) identify:

- MIT `vpkmerge`/`morphic` source in the VPK manager;
- MIT ValveResourceFormat-derived/adapted source;
- MIT shadcn/ui components;
- Deadlock Rich Presence-derived event mapping, credited without a vendored license text.

Modlock may separately evaluate the original permissive upstream projects and their exact revisions. It must not extract the GPL-combined DMM adaptations as a shortcut.

## 19. Security observations and required tests

These are design-review observations, not vulnerability disclosures.

| Observation | Evidence | Risk question | Required Modlock control/test |
|---|---|---|---|
| CSP is disabled | Tauri config | Would renderer injection gain privileged IPC? | Strict CSP, navigation policy, least-privilege command capabilities, adversarial HTML test. |
| Auth token in JSON store | Rust auth commands | Can another local process/user recover refresh credentials? | OS credential vault, short-lived memory token, filesystem ACL test. |
| Deep-link URLs logged | deep-link handler | Can codes/tokens leak to retained logs? | Structured redaction; never accept bearer token in URL. |
| One-click record lacks checksum | renderer flow | What anchors downloaded bytes to release metadata? | Signed release manifest plus SHA-256/size verification. |
| Archive extraction handles untrusted input | ZIP/RAR/7z code | Are traversal, links, bombs and parser crashes bounded for all formats? | Sandboxed worker; entry/byte/ratio/depth/time caps; corpus and fuzzing. |
| RAR extraction path differs from ZIP/7z | archive extractor | Does `unrar` preserve the same path/link invariants? | Malicious RAR corpus on Windows; post-extraction canonical walk. |
| Manifest save uses temp rename | manifest code | Is rename durable over power loss/AV locks? | Flush file and parent directory where supported; stepwise crash matrix. |
| Install file commit precedes metadata commit | lifecycle | Are every split state and repair action deterministic? | Durable operation journal with old/new generations. |
| Post-install reorder may fail without failing install | lifecycle | Can UI/order metadata diverge from disk? | Separate committed state and repair-needed state; reconciliation UX. |
| Remote catalog includes HTML/media | detail UI/API | Can unsafe markup or links execute/navigate? | Sanitize at ingest and render; URL allowlist; CSP. |
| Plugins and Forge bridge expand trust | renderer/loopback bridge | Can local web content invoke privileged install behavior? | Explicit pairing/nonce, origin validation, narrow loopback protocol, consent. |
| Hardware ID analytics | analytics provider | Is consent and deletion meaningful for a stable identifier? | Random resettable install ID, data map, consent tests, delete/export. |
| Updater target matrix is complex | updater source/issues | Can the wrong artifact/runtime be served? | Signed matrix contract and release-gate tests. |

Positive controls already visible in source include URL host parsing in the Rust download boundary, traversal-resistant mod/profile ID validation, safe canonical VPK deletion, archive path tests, symlink rejection, staged VPK renames, future-manifest rejection, backup validation, game-not-running checks for core setup, and signed updater metadata.

## 20. Issue-derived failure-mode register

Public issues are useful test inputs, not confirmed facts about current builds.

| Failure class | Evidence | Modlock regression requirement |
|---|---|---|
| Game patch/reset invalidates configuration | [#613](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/613), [#538](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/538), [#664](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/664) | Detect build/file replacement, stop mutation, offer repair/restore with exact diff. |
| Large raw VPK freezes/fails | [#586](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/586) | Stream/hash with bounded memory; 200 MB+ raw fixture; UI cancellation. |
| Cache node lacks operational fallback | [#569](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/569) | Retry policy across authorized origins; resumable downloads; integrity after resume. |
| Webview blank/grey/crash | [#617](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/617), [#539](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/539), [#651](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/651) | Native UI preference; GPU/WebView fault recovery if a webview is chosen. |
| Game process state remains stale after crash | [#542](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/542) | Re-resolve PID/executable/start time; never trust cached boolean. |
| Variant selection is lost | [#685](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/685) | Pin release file/variant in profile and pack manifests. |
| Installed-mod search performance | [#666](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/666) | Benchmark catalog and 1,000-local-mod fixture; index local DB. |
| Persisting transient progress causes cost | [#665](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/665) | Keep progress in memory; persist checkpoints only. |
| Path-backed files cross renderer IPC | [#663](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/663) | Pass opaque handles/IDs; parsing stays in native sandbox. |
| Updater artifact/channel mismatch | [#655](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/655), [#659](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/659) | CI validation of every platform/runtime/channel tuple. |
| Documentation drifts from product | [#609](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/609) | Generate feature/API references from executable contracts and release gates. |
| Profile export loses ordering | [#387](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/387) | Pack schema pins order, variant, release, hash and source. |
| Config mods not first-class | [#418](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues/418) | Separate typed CFG presets from untrusted binary mods. |

## 21. Mandatory Windows runtime audit

The following questions remain **unknown** until a signed stable build and a source-built pinned revision are run on isolated Windows 11 test machines:

### Footprint and performance

- cold/warm launch time, UI-ready time and shutdown time;
- installer size vs installed size;
- idle/active working set, private bytes, handle count, thread count and CPU;
- catalog response parse/render cost with 10,000 entries;
- raw VPK and archive memory usage at 200 MB, 1 GB and adversarial expansion ratios;
- background behavior after closing the window;
- WebView2/runtime dependency and first-install behavior.

### Filesystem and recovery

- terminate process and power-cycle after every file/manifest/config mutation;
- NTFS rename/flush guarantees and parent-directory durability;
- antivirus quarantine, Controlled Folder Access, read-only files and sharing violations;
- low disk during download, extraction, backup, manifest save and reorder;
- Unicode, reserved device names, long paths, alternate data streams and junctions;
- manual VPKs mixed with managed files;
- migration from stable v1 manifest to current sharded main;
- patch replacing `gameinfo.gi` while DMM is open;
- 99, 100, 990 and 991 enabled VPK boundaries;
- backup restore interrupted at every stage.

### Network and security

- redirects from GameBanana and mirror URLs, host validation after every redirect;
- proxy/TLS interception, offline start, DNS failure, partial response and resume;
- analytics/Sentry traffic with consent off and on;
- OIDC state/replay/multiple-window behavior and local token protection;
- malformed deep links, protocol ownership collision and log redaction;
- HTML/media injection in catalog fields;
- updater signature failure, wrong target, downgrade, revoked release and interrupted install;
- loopback Forge bridge origin/nonce/auth behavior;
- malicious ZIP, 7z, RAR and VPK corpus under resource limits.

### Game behavior

- actual search-path precedence across ten shards;
- load order for conflicting resources within/across shards;
- split VPK companion handling;
- game running/crashed/restarting races;
- Valve update/verify-files interaction;
- replay link behavior;
- global crosshair activation and reset on a clean account;
- server-required mod layer cleanup.

## 22. Direct product lessons for Modlock

These are independently stated requirements, not DMM implementation instructions:

1. Keep the desktop scope focused: safe install/update/profile/CFG/crosshair/pack operations, with player stats, servers and creation tooling outside the first utility release.
2. Use an immutable content-addressed object store and activate a validated generation; never remove the active generation before the replacement is ready.
3. Maintain an fsynced operation journal whose recovery action is deterministic after any process stop.
4. Treat game files and user CFG as shared documents. Patch only owned blocks, preserve encoding/newlines, and always show/retain a reversible diff.
5. Store credentials in Windows Credential Manager/DPAPI-backed storage.
6. Keep renderer/UI code unable to hand arbitrary filesystem paths or untrusted URLs to privileged operations.
7. Require signed release metadata, SHA-256 and size before extraction.
8. Sandbox all untrusted parsing and enforce compressed/uncompressed size, entry, path, depth and time ceilings.
9. Make telemetry optional, off by default, and based on a resettable random identifier rather than a hardware ID.
10. Support GameBanana through an isolated adapter and written terms; do not rely on DMM's API or mirror.
11. Make packs reference immutable authorized releases; never silently rebundle third-party binaries.
12. Keep per-hero crosshair presets as Modlock-side preferences until safe supported activation is proven.

## 23. Source register

Primary evidence used in this teardown:

- [Pinned DMM source tree](https://github.com/deadlock-mod-manager/deadlock-mod-manager/tree/4626073406a8b99c6e782f3ce509aacc8090cce8)
- [README and project/license statement](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/README.md)
- [GPL-3.0 license](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/LICENSE.md)
- [Third-party notices](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/THIRD-PARTY-NOTICES.md)
- [Desktop Tauri configuration](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/tauri.conf.json)
- [Desktop capability ACL](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/capabilities/default.json)
- [Desktop Rust manifest](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/Cargo.toml)
- [Mod manager implementation](https://github.com/deadlock-mod-manager/deadlock-mod-manager/tree/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/mod_manager)
- [Archive extractor](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/mod_manager/archive_extractor.rs)
- [VPK manifest](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/mod_manager/vpk_manifest.rs)
- [Profile commands](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/commands/profiles.rs)
- [Deep-link handler](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/deep_link.rs)
- [Autoexec/crosshair manager](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/desktop/src-tauri/src/mod_manager/autoexec_manager.rs)
- [API routers](https://github.com/deadlock-mod-manager/deadlock-mod-manager/tree/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/api/src/routers)
- [Live OpenAPI](https://api.deadlockmods.app/docs/openapi.json)
- [Public documentation](https://docs.deadlockmods.app/)
- [Stable release](https://github.com/deadlock-mod-manager/deadlock-mod-manager/releases/tag/v1.1.0)
- [Open issues](https://github.com/deadlock-mod-manager/deadlock-mod-manager/issues)

## 24. Refresh procedure

This teardown becomes stale quickly because Deadlock and DMM are both under active development. To refresh it:

1. record a new evidence date and exact DMM commit;
2. compare the repository tree, desktop/package versions and stable release;
3. diff `mod_manager`, Tauri capabilities/configuration, updater, auth, analytics, deep links and API routers;
4. download the live OpenAPI and diff paths/schemas/security declarations;
5. review issues created/closed since the prior snapshot;
6. rerun the Windows runtime matrix;
7. update claims only with their evidence state and preserve the old dated result in Git history.
