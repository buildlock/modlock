# Source register

Research dates: **2026-08-26 through 2026-09-01**. Live counts and implementation details are dated snapshots. Links are grouped by authority; absence of an official policy/API is not proof that none exists privately. The dedicated DMM and GameBanana teardowns contain the exhaustive evidence registers.

## Primary repositories and APIs

| Source | Used for | Notes |
|---|---|---|
| [Deadlock Mod Manager repository](https://github.com/deadlock-mod-manager/deadlock-mod-manager) | Current architecture, install/config behavior, license, features, service code. | Refreshed at revision `4626073406a8b99c6e782f3ce509aacc8090cce8` on 2026-09-01; GPL-3.0. See the [full teardown](teardowns/deadlock-mod-manager.md). |
| [DMM releases](https://github.com/deadlock-mod-manager/deadlock-mod-manager/releases) | Current packaged release and asset sizing. | Counts change continuously. |
| [DMM API OpenAPI](https://api.deadlockmods.app/docs/openapi.json) | Live path/schema inventory. | Observed base path `/api`; do not assume an SLA. |
| [DMM documentation](https://docs.deadlockmods.app/) | User-facing behavior and API claims. | Some pages conflicted with current source/live behavior; source and live contract took precedence. |
| [GameBanana Deadlock hub](https://gamebanana.com/games/20948) | Primary catalog and category context; game ID 20948. | Web and API counts use differing scopes. |
| [GameBanana API](https://api.gamebanana.com/) | Public API documentation and concepts. | Current managers also use an `apiv11` surface; negotiate/monitor it. |
| [GameBanana 1-click mod manager integration](https://gamebanana.com/wikis/1999) | Custom manager/deep-link ecosystem. | Confirm current registration requirements directly before implementation. |
| [GameBanana Terms](https://gamebanana.com/wikis/334) | Public platform terms context. | Written integration confirmation and counsel interpretation remain required. |
| [GameBanana DMCA policy](https://gamebanana.com/wikis/677) | Source-platform rights/takedown behavior. | Does not replace Modlock's own process. See the [full teardown](teardowns/gamebanana.md). |
| [Grimoire repository](https://github.com/Slush97/grimoire) | Competing manager architecture, MIT implementation, profiles, conflicts, config research. | Inspected revision `cc61247e1ac43f1ad2ca4b53621d766f23123bd4`. |
| [Grimoire tools and open profile format](https://www.grimoiremods.com/tools/) | `.modprofile.json`, share code, VPK merge information, package-size snapshot. | Public page version may lag repository source. |
| [Deadlock community API docs](https://api.deadlock-api.com/docs) | Heroes/items/assets, players/matches, patch/game data. | Community-run; cache and pin snapshots. |
| [Deadlock community API repository](https://github.com/deadlock-api/deadlock-api) | Implementation/license and self-hosting context. | MIT; still not an official Valve API. |

## Authoritative platform and format references

| Source | Used for | Notes |
|---|---|---|
| [Official Deadlock Steam page](https://store.steampowered.com/app/1422450/Deadlock/) | App ID, Valve publisher/developer, early-development status. | Game status and copy can change. |
| [Steam Online Conduct](https://store.steampowered.com/online_conduct/) | Cheat, malware, harassment, and IP boundaries. | Platform-level rules, not a Deadlock-specific mod policy. |
| [Steam Subscriber Agreement](https://store.steampowered.com/subscriber_agreement/) | Account/content/cheat/unfair-advantage terms. | Obtain counsel for product interpretation. |
| [Valve Developer Community: VPK format](https://developer.valvesoftware.com/wiki/VPK_%28file_format%29) | VPK/VPK2 directory and split-package background. | Community-maintained Valve developer wiki. |
| [Steam Web API documentation](https://steamcommunity.com/dev) | Server-side Steam Web API context. | Keys stay server-side; endpoints are not proof of identity endorsement. |
| [Steam OAuth documentation](https://steamcommunity.com/dev/oauth) | OAuth partner/access constraints. | Do not assume a client ID or scopes will be approved. |

## Secondary discovery sources

Secondary sources helped identify current community behavior and questions. They are intentionally not treated as policy or stable contracts.

| Source | Used for | Caveat |
|---|---|---|
| [Deadlock official forums](https://forums.playdeadlock.com/) | Reports about patch/config behavior and competitive-advantage concerns. | User/community posts are anecdotal unless Valve staff state policy explicitly. |
| [Deadlock Hub crosshair generator](https://deadlockhub.net/crosshair-generator) | Crosshair convar/preset discovery. | Revalidate keys/ranges in the current game build; player attribution can become stale. |

## Live snapshot interpretation

The [original 2026-08-26 snapshot](snapshots/2026-08-26-ecosystem.json) preserves the first research checkpoint. The [refreshed 2026-09-01 snapshot](snapshots/2026-09-01-ecosystem.json) pins current DMM/GameBanana evidence and explicitly omits unrefreshed counts. Counts are included to understand catalog shape and payload scale, not to assert active users, market share, unique mods, or a durable API promise.

## Open information requests

The following need direct confirmation rather than more scraping:

1. Valve's current Deadlock mod and anti-cheat policy, allowed modification surfaces, and branding guidance.
2. GameBanana's current API contract, cache/attribution rules, download resolution expectations, and 1-click manager registration.
3. A supported in-game mechanism, if any, for reloading crosshair values safely and selecting arbitrary values per hero.
4. Rights/approval from named streamers/pros for exact preset and pack versions.
5. Redistribution licenses for each pilot mod and every bundled archive-decoder dependency.
