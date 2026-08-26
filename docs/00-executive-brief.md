# Executive brief

## Recommendation

Proceed, but position Modlock as a **safe, focused utility and creator platform**, not simply another mod browser. The incumbent Deadlock Mod Manager (DMM) is already mature and broad: it includes browsing, installs, updates, profiles, crosshairs, autoexec tools, skins, servers, statistics, backups, and authoring utilities. Grimoire is another active manager with strong offline behavior, profiles, conflict resolution, and VPK merging. The viable opening is better trust, better creator provenance, transactional installs, a deliberately narrow native client, and a polished CFG/crosshair/player-pack experience.

The two products should share one contract and one identity/catalog system, while the Windows client remains useful offline and does not need to stay resident.

## What exists today

| Area | Finding | Product implication |
|---|---|---|
| Primary mod host | GameBanana is the dominant public Deadlock catalog and binary host. | Integrate it with attribution and deep links; do not silently mirror third-party files. |
| Leading manager | DMM is GPL-3.0, Tauri/React/Rust, and actively developed. | Reimplement cleanly; do not copy GPL code into a proprietary product. |
| Other manager | Grimoire is MIT, Electron/React, offline-first, and publishes an open profile format. | Import/export its reference-based profile format where practical. |
| Game packaging | Mods are usually VPK files, often delivered in ZIP/RAR/7z archives. | Safe extraction and VPK inventory are core security features. |
| Activation | Managers add an addons search path to `gameinfo.gi` and order VPKs with numbered names. | Installs must be journaled, reversible, and resilient to game patches. |
| Configuration | `autoexec.cfg`, `machine_convars.vcfg`, and Steam Cloud key files interact in non-obvious ways. | Use a typed settings model, backups, ownership markers, and game-closed writes. |
| Per-hero crosshairs | The game has hero-specific defaults, but arbitrary custom live switching is not a proven supported feature. | Ship per-hero collections/manual activation first; gate auto-switching behind a technical proof. |
| Official APIs | No official Valve mod API/catalog was found. Community APIs exist. | Cache third-party metadata and expect schema/availability drift. |
| Policy | No authoritative Deadlock mod policy was found. Steam prohibits cheats and unfair advantage. | Adopt conservative rules and obtain legal review before public hosting. |

## Product shape

### Part 1 — Website

The website provides creator pages, immutable mod releases, media, categories, hero tags, dependencies, compatibility, downloads, packs, crosshair/CFG presets, reports, and moderation. Files uploaded to Modlock go through quarantine, hashing, malware analysis, archive validation, VPK inspection, and moderation before reaching public object storage/CDN.

GameBanana entries can appear as linked catalog records. A linked record preserves the original creator, license, file page, and host. Modlock resolves the download at install time through a dedicated adapter and never represents the binary as first-party hosted.

### Part 2 — Desktop utility

The Windows app owns a local content-addressed library, profiles, load order, CFG state, backups, and an install journal. It downloads to a staging area, verifies hashes, inspects content, builds the desired profile, applies the smallest possible game-file patch, validates the result, and rolls back on failure.

It launches only when needed, performs no background polling after exit, and collects no telemetry by default.

## Initial scope

The strongest first release is:

- Browse/search Modlock and linked GameBanana mods.
- One-click install through an authenticated custom protocol.
- Local library, enable/disable, update, profiles, variants, load order, conflict display, backup, repair, and rollback.
- Typed `autoexec.cfg` editor and command library.
- Crosshair editor with preview, shareable presets, and per-hero organization.
- Versioned creator/player pages and opt-in packs.
- Game-patch detection and safe mode when managed files change unexpectedly.

Defer automatic per-hero crosshair switching, VPK merging, arbitrary scripts, public comments, monetization, and always-on background services until the core is proven.

## Native client decision

Run a short, measured spike between:

1. **WinUI 3 shell + Rust core**, connected through a narrow C ABI. Best Windows integration and visual polish; more interop work.
2. **Rust + a native Rust UI toolkit**, with no webview. Simpler language/runtime story; less mature native Windows presentation.

Reject Electron for this product goal. Keep Tauri as a fallback if delivery speed becomes more important than a strict native footprint. The decision is made by measured cold start, working set, idle CPU, installer size, accessibility, updater behavior, and implementation velocity—not preference.

### Proposed performance gates

Measured on the agreed mid-range Windows 11 reference PC:

| Metric | Gate |
|---|---:|
| Cold launch to interactive | under 500 ms |
| Idle working set | under 60 MB |
| Idle CPU after stabilization | approximately 0% |
| Installed app idle after close | no process remains |
| Installer payload | target under 20 MB, excluding shared OS runtimes |
| Streaming download/extraction memory | bounded working buffer under 32 MB |

## Biggest risks

1. **Game and policy drift.** Deadlock is pre-release and patches can replace managed files or invalidate settings.
2. **Content liability.** Hosting creates malware, copyright, impersonation, privacy, and cheating obligations.
3. **Third-party dependency.** GameBanana and community APIs do not provide a guaranteed Modlock service contract.
4. **Creator endorsement.** Player presets/packs can easily become stale or imply a relationship that does not exist.
5. **Installer correctness.** Interrupted writes or bad archives can break the local game unless every mutation is transactional.

The roadmap begins with outreach, fixture collection, a policy review, API contract probes, and the native benchmark specifically to retire these risks before a large build.
