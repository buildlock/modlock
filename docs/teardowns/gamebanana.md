# GameBanana teardown: Deadlock catalog and distribution

- **Audit date:** 2026-09-01
- **Target:** GameBanana game `20948` (Deadlock)
- **Purpose:** Establish what Modlock can safely rely on for discovery, attribution, and one-click installation.
- **Decision status:** Research complete; commercial/operational use remains gated on written GameBanana confirmation.

## Evidence labels

This document deliberately separates platform promises from behavior seen in a live response.

- **Confirmed** — stated by GameBanana's official documentation or policy.
- **Observed** — reproduced through a public, read-only request on the audit date. It is not necessarily a supported contract.
- **Inference** — a Modlock design conclusion derived from confirmed or observed facts.
- **Unknown** — not answered by public material; written confirmation is required.

No authentication was used. No private records were requested. File resolution was tested with `HEAD`; mod archives were not downloaded. Rate-limit behavior was not stress-tested.

## Executive verdict

**Inference:** GameBanana is the primary identifiable public host and catalog for Deadlock mods. Confirmed and observed surfaces provide:

- a documented, general-purpose Core API at [`api.gamebanana.com`](https://api.gamebanana.com/);
- a much richer, GameBanana-hosted `apiv11` JSON surface used by active mod managers;
- stable-looking submission, file, category, creator, license, content-rating, and download identities;
- browser-to-manager one-click integration negotiated per manager; and
- download indirection through GameBanana's file infrastructure.

The integration is technically feasible, but `apiv11` is not publicly documented as a stable third-party contract. Public material does not specify rate limits, caching/attribution obligations, service levels, bulk-sync permission, download-count semantics, or a current manager-registration process. Modlock therefore must use a defensive provider adapter and must not make GameBanana availability part of its correctness boundary.

Most importantly, GameBanana's right to host a file does **not** establish Modlock's right to copy or rehost it. Modlock should link to GameBanana, preserve source and creator attribution, resolve files from GameBanana at install time, and treat redistribution as prohibited unless the specific license/checklist or rightsholder separately permits it.

## Authoritative and observed surfaces

### Documented Core API

**Confirmed:** GameBanana publishes documentation for a small Core API at [`https://api.gamebanana.com/`](https://api.gamebanana.com/). Relevant endpoints include:

| Endpoint | Documented purpose | Relevant limitation |
|---|---|---|
| [`Core/Item/Data`](https://api.gamebanana.com/docs/endpoints/Core/Item/Data) | Fetch selected fields for one entity or submission. | The caller must name fields; available fields are dynamic by item type. |
| [`Core/Item/Data/AllowedFields`](https://api.gamebanana.com/docs/endpoints/Core/Item/Data/AllowedFields) | Discover permitted fields for an item type. | Field names include expression-like values such as `Files().aFiles()`. |
| [`Core/List/New`](https://api.gamebanana.com/docs/endpoints/Core/List/New) | List new submissions, optionally by item type, game, user, studio, age, and update status. | Intended for recent items, not a complete game catalog. |
| [`Core/List/Section`](https://api.gamebanana.com/docs/endpoints/Core/List/Section) | Return IDs for a section with documented sorts/filters. | On the audit date, `Mod` filters exposed only `userid`, not `gameid`. |
| [`Core/List/Like`](https://api.gamebanana.com/docs/endpoints/Core/List/Like) | Prefix-match an allowed field. | This is lookup, not full-text search. |
| [`Rss/New`](https://api.gamebanana.com/) | Return the newest SFW submissions as RSS. | It is a change hint, not reconciliation or deletion detection. |
| [`Core/App/Authenticate`](https://api.gamebanana.com/docs/endpoints/Core/App/Authenticate) | Exchange app credentials and a user ID for a token. | Public docs do not explain whether Modlock needs an app for read-only catalog use. |

**Confirmed:** `Core/Item/Data` supports JSON, minified JSON, XML, and PHP-serialized output; `return_keys=1` returns a keyed object; it also documents multicall by passing parameters as arrays.

**Observed:** public read-only metadata calls succeeded without authentication and responded with `Access-Control-Allow-Origin: *`. No `RateLimit-*`, `Retry-After`, `ETag`, or useful API `Cache-Control` headers were seen in the small audit sample. This absence is not evidence that calls are unlimited or uncacheable.

### Rich `apiv11` surface

**Observed:** active managers use a richer JSON surface rooted at `https://gamebanana.com/apiv11`. The following routes responded during this audit:

| Route | Role | Audit behavior |
|---|---|---|
| `GET /Mod/Index` | Complete Mod index for a game. | Cursorless page numbers; maximum observed `_nPerpage` is 50. |
| `GET /Sound/Index` | Complete Sound index for a game. | Same envelope as Mod with Sound-specific preview data. |
| `GET /Game/20948/ProfilePage` | Deadlock game metadata, root Mod categories, section counts, registered installer. | Useful bootstrap/canary. |
| `GET /Game/20948/CategoryTree` | Section/model counts. | Counts did not agree with index metadata; do not use as canonical totals. |
| `GET /Game/20948/TopSubs` | Current top submissions. | Ranking/presentation input only. |
| `GET /Util/List/Featured` | Featured submissions for a game. | Presentation input only; overlaps the main index. |
| `GET /Mod/{id}/ProfilePage` | Rich Mod detail. | Includes current and archived files, categories, media, credits, license, checklist, visibility, and ratings. |
| `GET /Sound/{id}/ProfilePage` | Rich Sound detail. | Similar model with audio preview metadata. |
| `GET /Mod/{id}/DownloadPage` | Current downloadable files, supported managers, license, owner, donation methods, flags. | Install-time source. |
| `GET /Sound/{id}/DownloadPage` | Equivalent for Sound. | Install-time source. |
| `GET /Util/Fileservers?_nPage=1` | File-server domains, states, and aggregate transfer statistics. | Optional diagnostics only; direct download indirection is safer. |

The current DMM consumer can be inspected at its pinned [GameBanana provider](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/api/src/providers/game-banana/index.ts) and [response types](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/packages/shared/src/providers/game-banana.ts). This is evidence of current consumer behavior, not a GameBanana guarantee.

**Unknown:** no first-party OpenAPI/JSON Schema, version policy, deprecation policy, changelog, support window, or public `apiv11` terms were found.

## Requests and response envelopes

### Catalog pagination

Observed request:

```http
GET https://gamebanana.com/apiv11/Mod/Index
    ?_nPerpage=50
    &_aFilters%5BGeneric_Game%5D=20948
    &_nPage=1
Accept: application/json
```

Sanitized shape:

```json
{
  "_aMetadata": {
    "_nRecordCount": 3761,
    "_bIsComplete": false,
    "_nPerpage": 50
  },
  "_aRecords": [
    {
      "_idRow": 123456,
      "_sModelName": "Mod",
      "_sName": "Example cosmetic",
      "_sProfileUrl": "https://gamebanana.com/mods/123456",
      "_sInitialVisibility": "show",
      "_tsDateAdded": 1700000000,
      "_tsDateModified": 1700001000,
      "_bHasFiles": true,
      "_bHasContentRatings": false,
      "_bIsObsolete": false,
      "_aGame": { "_idRow": 20948, "_sName": "Deadlock" },
      "_aRootCategory": { "_sName": "Skins", "_sProfileUrl": "..." },
      "_aSubCategory": { "_sName": "Hero name", "_sProfileUrl": "..." },
      "_aSubmitter": { "_idRow": 123, "_sName": "Creator", "_sProfileUrl": "..." },
      "_aPreviewMedia": { "_aImages": [] },
      "_aTags": []
    }
  ]
}
```

Observed pagination rules:

- `_nPage` is one-based.
- `_nPerpage` values through 50 worked; 100 returned an `INPUT_ERRORS` object stating that 50 is the maximum.
- The final non-empty page reported `_bIsComplete: true`; pages beyond the end returned an empty `_aRecords` array with `_bIsComplete: true`.
- Invalid page/per-page input can return HTTP 200 with an error object rather than a non-2xx status.
- The response does not expose a snapshot token. Records can move between pages while a long sweep is running.

**Inference:** a catalog sweep must parse the body before accepting a 2xx response, deduplicate by provider identity, and run reconciliation. It cannot assume page membership is stable during concurrent submissions/updates.

### Rich profile

Observed request:

```http
GET https://gamebanana.com/apiv11/Mod/{submission_id}/ProfilePage
Accept: application/json
```

Important fields observed across current records:

```text
Identity:       _idRow, _sName, _sProfileUrl, _sVersion
State:          _bIsPrivate, _bIsTrashed, _bIsWithheld,
                _bIsObsolete, _sInitialVisibility, _nStatus
Time:           _tsDateAdded, _tsDateModified, optional _tsDateUpdated
Presentation:   _sDescription, _sText, _aPreviewMedia, _aTags
Attribution:    _aSubmitter, _aCredits, _aContributingStudios
Taxonomy:       _aGame, _aCategory, optional _aSuperCategory
Files:          _aFiles, optional _aArchivedFiles
Rights:         _sLicense, _aLicenseChecklist
Safety:         optional _aContentRatings
Relationships:  optional _aRequirements, _bAdvancedRequirementsExist
Support:        optional _sFeedbackInstructions
Donations:      _bAcceptsDonations and submitter donation methods
```

Arrays and objects are not fully consistent across route families. A profile's `_aFiles` is an array; Core `Files().aFiles()` returned an object keyed by file ID in the observed response. Media may be an object containing `_aImages`, while tags can be strings or `{_sTitle,_sValue}` objects. Null and absent optional fields must be accepted.

### File record

Sanitized active-file shape observed in ProfilePage/DownloadPage:

```json
{
  "_idRow": 654321,
  "_sFile": "example.zip",
  "_nFilesize": 38084704,
  "_tsDateAdded": 1700000000,
  "_nDownloadCount": 24,
  "_sDownloadUrl": "https://gamebanana.com/dl/654321",
  "_sMd5Checksum": "32-lowercase-hex-characters",
  "_sAnalysisState": "done",
  "_sAnalysisResult": "ok",
  "_sAnalysisResultVerbose": "File passed preliminary analysis",
  "_sAvState": "done",
  "_sAvResult": "clean",
  "_bIsArchived": false,
  "_bHasContents": true,
  "_sVersion": "1.1",
  "_sDescription": "Optional file note",
  "_aModManagerIntegrations": []
}
```

**Inference:** GameBanana's analysis/AV result is useful provenance but not a Modlock security attestation. MD5 is useful for provider identity/change detection, but not sufficient against an active attacker. The desktop must compute SHA-256 and independently inspect the archive/VPK before activation.

### Error shapes

Observed error behavior was inconsistent:

| Request | HTTP | Body |
|---|---:|---|
| Invalid `_nPage=0` on Mod index | 200 | `_sErrorCode: INPUT_ERRORS`, per-field detail. |
| `_nPerpage=100` | 200 | `_sErrorCode: INPUT_ERRORS`, message says maximum 50. |
| Missing Mod ProfilePage | 200 | `_sErrorCode: NO_SUCH_RECORD`. |
| Missing Mod DownloadPage | 404 | Same `NO_SUCH_RECORD` body. |
| Missing item through Core `Item/Data` | 200 | `error` and `error_code: INVALID_PARAMS`. |
| Unknown model route | 200 in one probe | Content type/body were not safely parseable as the expected JSON contract. |

An HTTP 200 is therefore not success until the response content type, maximum size, JSON syntax, error discriminators, and route-specific schema all pass validation.

## Dated Deadlock catalog snapshot

The following values were observed on 2026-09-01 and are not market-size claims:

| Surface | Count/shape |
|---|---:|
| `Mod/Index` metadata | 3,761 records |
| `Sound/Index` metadata | 3,630 records |
| Game ProfilePage Sound section | 3,674 items |
| Game ProfilePage Mod root-category sum | 3,759 items |
| Game CategoryTree "Mods" | 6,944 items |
| Game CategoryTree "Sounds" | 3,674 items |

The values disagree. Possible causes include cache timing, differing visibility/scope, category aggregation rules, or an endpoint defect. **Unknown:** GameBanana has not defined which count represents publicly installable, unique, active releases.

**Decision:** use index records as sync inputs, never add Mod and Sound counts as a unique-mod total, and never expose a provider count without naming the surface and observation time.

## Taxonomy

GameBanana models installable Deadlock content through at least two submission types:

- `Mod` — general mod submissions, including a `Maps` root category.
- `Sound` — sound submissions with audio-specific previews/categories.

Observed Mod root categories from `Game/20948/ProfilePage`:

| Remote category ID | Remote name | Observed item count | Initial Modlock mapping |
|---:|---|---:|---|
| 33295 | Skins | 2,537 | `cosmetic.skin` |
| 33154 | Model Replacement | 465 | `cosmetic.model-replacement` |
| 31713 | HUD | 456 | `ui.hud` |
| 31710 | Other/Misc | 123 | `other` |
| 46154 | Quality of Life/Fixes | 112 | `qol-or-fix`, pending capability scan |
| 37225 | Maps | 33 | `map` |
| 33331 | Gameplay Modifications | 21 | `gameplay`, high-risk review |
| 47611 | Animations | 12 | `cosmetic.animation` |

These counts are volatile. The stable mapping key must be the remote category ID, with the name retained for display and drift diagnostics.

In a sample of the 50 newest Sound records, observed root names included `Abilities`, `VOs`, `In-Game Music`, `Item Sounds`, `Weapons`, `Sound Packs`, `Other/Misc`, `Movement`, `Killsounds`, and `Gameplay Events`. This is a sample, not an exhaustive contract; the Game ProfilePage reported 12 Sound categories.

**Inference:** taxonomy is presentation metadata, not a security capability declaration. For example, `Quality of Life/Fixes` or `Gameplay Modifications` can contain content Modlock policy disallows. The scanner must classify actual archive/VPK contents and policy capabilities independently.

## Download resolution and hosting

Observed active-file URL:

```text
https://gamebanana.com/dl/{file_id}
```

Observed one-click manager URL embedded in a file integration:

```text
deadlock-mod-manager:https://gamebanana.com/mmdl/{file_id},Mod,{submission_id}
```

For one public file, both `/dl/{file_id}` and `/mmdl/{file_id}` produced this `HEAD` redirect chain:

```text
gamebanana.com
  -> files.gamebanana.com/mods/<filename>
  -> filecache39.gamebanana.com/mods/<filename>
  -> 200 application/zip
```

The final response included `Content-Length`, `Last-Modified`, `ETag`, `Accept-Ranges: bytes`, and permissive CORS. The intermediate file host used `Cache-Control: no-cache`; the API responses sampled were Cloudflare `BYPASS`.

This is a dated routing example, not an allowlist promise. A different file can use a different category path, cache node, or redirect chain.

**Required Modlock behavior:**

1. Treat the deep link as untrusted identities/hints, not a trusted final URL.
2. Re-fetch the submission DownloadPage at install time.
3. Verify submission type, submission ID, active/allowed state, and exact file ID.
4. Use the provider-returned GameBanana resolver URL.
5. Follow a small bounded number of HTTPS redirects.
6. Validate every redirect target against a centrally maintained GameBanana host policy.
7. Enforce declared and actual byte limits; stream to disk rather than memory.
8. Compare byte count and provider MD5 when present; always compute SHA-256.
9. Run Modlock's archive/VPK safety analysis before staging.
10. Preserve the GameBanana canonical page and file identity in the local install record.

**Unknown:** whether `/mmdl` has required download-count/reporting semantics distinct from `/dl`, whether `HEAD` affects counts, and whether clients are permitted to choose a filecache directly. Modlock should not select filecache nodes or bypass the resolver without written approval.

## One-click manager registration

**Confirmed:** GameBanana's [1-Click Mod Installers guide](https://gamebanana.com/wikis/1999) says an integrated application needs:

- a registered custom URL scheme;
- HTTP downloading;
- ZIP, RAR, and 7z decompression support if it wants links for all supported archive types; and
- archive safety handling.

The guide says the exact manager URL structure is decided between GameBanana and the manager developer. It may include archive URL, submission type, and submission ID. GameBanana can perform per-game/per-manager server-side compatibility checks before presenting the one-click link.

**Confirmed:** creators can suppress integrations by placing `.disable_gb1click` or `.disable_gb1click_{protocol}` in an archive.

**Observed:** Deadlock Mod Manager is registered for game 20948 with tool ID `20646`, remote-install support, and alias `DeadlockModManager`. Its file integration currently emits a `deadlock-mod-manager:` custom-scheme link containing `/mmdl/{file_id}`, `Mod`, and the submission ID.

**Unknown:** there is no public current registration form, review SLA, naming rule, signing requirement, compatibility-test interface, revocation protocol, or production contact documented in the guide. Modlock must coordinate integration with GameBanana rather than imitating DMM's scheme.

## Attribution, licenses, and redistribution

### Creator and credits

Profile responses expose a submitter plus optional grouped credits and contributing studios. GameBanana's [site rules](https://gamebanana.com/wikis/1835) state that every contributor must be credited.

Modlock must show:

- submission title and canonical GameBanana page;
- submitter display name linked to their GameBanana profile;
- structured credits where supplied;
- source badge `Hosted by GameBanana`; and
- file/release identity in technical details.

Do not flatten the submitter and credited authors into one "creator" claim.

### License

Profile/DownloadPage responses expose both `_sLicense` (HTML) and `_aLicenseChecklist` with `yes`, `ask`, and `no` action lists. An observed public record allowed download/install, required asking before redistribution on other sites, and prohibited commercial use.

GameBanana's [Terms of Service](https://gamebanana.com/wikis/334) require an uploader to certify ownership and grant GameBanana a broad license to display and distribute submitted content. That grant is to GameBanana; it does not on its face grant Modlock permission to mirror the binary.

Modlock rules:

- store the raw license/checklist snapshot and its fetch time for evidence;
- sanitize all HTML before rendering, or render a plain-text/structured interpretation;
- treat `ask`, missing, contradictory, or unparsable redistribution rights as **no rehosting**;
- never infer redistribution rights from a successful download URL;
- link to the canonical source for authoritative/current terms; and
- require explicit creator/rightsholder authorization before importing a file into Modlock-hosted storage.

This is product guidance, not legal advice.

### Donations and paid content

Download/profile responses can expose `_bAcceptsDonations` and donation methods containing title, value, formatting templates, and sometimes HTML. The [Paid Content Setting policy](https://gamebanana.com/wikis/2374) distinguishes Free, Freemium, and Paid submissions and applies visibility/featuring restrictions.

Modlock must never render provider HTML directly. It may retain a validated `https` donation URL and plain label, clearly identify it as the creator's external link, and avoid becoming payment intermediary. **Unknown:** `apiv11` fields that reliably distinguish Free/Freemium/Paid were not confirmed.

## NSFW and age semantics

GameBanana's [Indecent Content Rules](https://gamebanana.com/wikis/1980) allow some rated adult content and prohibit specific categories. Its [Age Restrictions](https://gamebanana.com/wikis/2036) set account minimums by region.

Observed API signals include:

- index `_bHasContentRatings`;
- profile `_aContentRatings`, for example codes `st`, `sa`, and `lp` with display labels;
- `_sInitialVisibility: "warn"` on a rated public record; and
- private/withheld/trashed state flags.

Modlock must not infer SFW from a missing index flag alone. It should refresh the profile, preserve unknown rating codes, default ambiguous content to hidden/needs review, prevent adult thumbnails from entering ordinary caches before the user passes an age/content gate, and maintain its own stricter public policy where required.

GameBanana's policy does not determine what Valve permits in Deadlock, nor what Modlock will accept.

## Moderation, withholding, deletion, and takedown

GameBanana distinguishes several states:

- **withheld** — hidden while the author may revise; its [Post Withholding guide](https://gamebanana.com/wikis/510) describes unrevised, revised, accepted, and rejected workflow states;
- **trashed** — removed from normal availability;
- **private** — not public;
- **obsolete** — superseded/deprecated but not necessarily removed; and
- **archived file** — an older file within a still-existing submission.

GameBanana's [DMCA policy](https://gamebanana.com/wikis/677) documents notice, takedown, counter-notice, and possible repeat-infringer termination.

Modlock reconciliation policy:

| Provider state | Modlock catalog | New installs | Existing local install |
|---|---|---|---|
| public/current | Visible per Modlock policy | Allowed after fresh resolve/scan | Managed normally |
| obsolete | Visible with replacement/deprecation notice | Warn or redirect to replacement | Do not silently replace |
| withheld/private | Immediately hide | Block | Show unavailable-source warning; do not silently delete user files |
| trashed/DMCA unavailable | Tombstone public record and purge cached public media as policy requires | Block | Preserve minimal local provenance; give user removal guidance |
| archived file | Hide from default release choice | Only resolve an explicitly pinned file if provider still returns it and policy permits | Keep pinned identity; never silently substitute |

**Unknown:** no webhook or removal feed was found. RSS does not report deletions. Until GameBanana offers one, Modlock needs periodic profile reconciliation and an emergency provider kill switch. Modlock must also operate its own report/takedown process because displaying cached metadata/media creates independent obligations.

## Availability, caching, and rate limits

### Confirmed/observed

- Public Core documentation does not publish a rate limit.
- The sampled responses did not expose rate-limit headers.
- `apiv11` is behind Cloudflare and includes an internal-looking serving-node header; clients must not depend on it.
- API responses sampled did not provide validators suitable for conditional refresh.
- Missing/invalid responses can be HTTP 200.
- GameBanana's Terms say service/content storage is not guaranteed and paid services can experience downtime.

### Required design conclusion

The provider adapter must:

- impose a conservative client-side request budget and low concurrency;
- honor `Retry-After` whenever present;
- apply bounded exponential backoff with jitter for 429/5xx/timeouts;
- use RSS/new-index signals for discovery and a paced reconciliation pass for removals;
- cache raw responses and normalized records with fetch time and schema fingerprint;
- refresh DownloadPage at install time regardless of catalog cache;
- serve last-known metadata with an explicit stale state during outages;
- stop after repeated schema errors rather than poisoning the catalog; and
- support a provider-wide circuit breaker/kill switch.

The exact request rate, storage duration, image caching, and attribution language remain subject to GameBanana approval.

## Failure-mode register

| Failure | Detection | Safe response |
|---|---|---|
| HTTP 200 error object | Error discriminator/schema does not match success envelope. | Do not persist as an empty successful page; retry only when classification permits. |
| Empty/non-JSON 200 | Content-type/body/schema validation fails. | Mark provider degraded; retain last-known data. |
| Record changes pages during sweep | Duplicate/missing IDs across page snapshot. | Upsert/dedupe; follow with reconciliation; never delete solely because one sweep omitted an ID. |
| New or missing field | Schema monitor flags drift. | Accept additive unknowns; quarantine record when an identity/security field disappears. |
| Null/wrong container shape | Defensive parser path. | Normalize known variants; retain raw response for debugging. |
| Withheld/trashed/private after cache | Fresh profile/DownloadPage state. | Block resolution and tombstone/hide. |
| File replaced | File ID, size, MD5, or active/archive membership changes. | New immutable external-file version; never mutate an installed version silently. |
| Redirect leaves allowed host policy | Per-hop URL validation. | Abort before bytes; security alert. |
| Wrong length/type | Streamed byte counter/magic inspection. | Abort, delete staging object, record integrity failure. |
| Provider MD5 mismatch | Post-download hash. | Abort and alert; do not retry from arbitrary mirrors. |
| AV says clean but Modlock scanner fails | Independent scanner. | Modlock verdict wins; quarantine/block. |
| Rate-limited/unavailable | 429, timeout, 5xx, circuit metrics. | Back off; stale catalog; no blind fallback host. |
| Rating/license becomes stricter | Snapshot diff. | Apply latest access/redistribution policy; keep evidence of prior state. |
| One-click link forged by another app/site | Scheme invocation origin cannot be trusted. | Re-resolve IDs through GameBanana and require user confirmation. |

## What requires written GameBanana confirmation

The user/project owner is needed for outreach and agreement; engineering cannot answer these by more probing:

1. Is public `apiv11` approved for a third-party Deadlock catalog and desktop manager?
2. Is there a supported contract, schema, changelog, deprecation window, or preferred alternative?
3. What read/bulk-sync rate and concurrency limits should Modlock use?
4. What metadata, thumbnails, descriptions, and creator fields may be cached, and for how long?
5. What attribution and canonical-link language is required on web and desktop?
6. May Modlock index all public Deadlock `Mod` and `Sound` records, including NSFW metadata behind a gate?
7. Must install downloads use `/mmdl/{file_id}` rather than `/dl/{file_id}` to preserve metrics or manager reporting?
8. May the desktop retain downloaded archives/content-addressed objects locally for reinstall, profiles, and rollback?
9. May Modlock ever proxy or mirror a file when the creator's license independently permits it, or is separate GameBanana approval also required?
10. What is the current manager registration/review process, contact, expected protocol shape, signing requirement, and compatibility check?
11. How are `.disable_gb1click` and manager-specific opt-outs exposed to an API client?
12. Is there a deletion/withhold/DMCA webhook, feed, or recommended reconciliation interval?
13. What do GameBanana's file analysis and AV states guarantee, and can their enum/schema change without notice?
14. Which catalog count/scope should partners show publicly?
15. Are there requirements for donation links, paid/freemium records, content ratings, age gating, or regional blocking?
16. Is an API application/token required or preferred for production identification and support?
17. Is there a staging/sandbox path for one-click integration and compatibility tests?
18. What incident/security contact should Modlock use for a malicious file, forged integration link, or compromised creator account?

## Source register

### GameBanana primary sources

- [Deadlock hub, game 20948](https://gamebanana.com/games/20948)
- [Deadlock section rules](https://gamebanana.com/games/rules/20948)
- [Documented API index](https://api.gamebanana.com/)
- [Core Item Data](https://api.gamebanana.com/docs/endpoints/Core/Item/Data)
- [Core Item Data allowed fields](https://api.gamebanana.com/docs/endpoints/Core/Item/Data/AllowedFields)
- [Core List New](https://api.gamebanana.com/docs/endpoints/Core/List/New)
- [Core List Section](https://api.gamebanana.com/docs/endpoints/Core/List/Section)
- [Core App Authenticate](https://api.gamebanana.com/docs/endpoints/Core/App/Authenticate)
- [1-Click Mod Installers](https://gamebanana.com/wikis/1999)
- [Terms of Service](https://gamebanana.com/wikis/334)
- [Site Rules](https://gamebanana.com/wikis/1835)
- [Post Withholding](https://gamebanana.com/wikis/510)
- [DMCA Policy](https://gamebanana.com/wikis/677)
- [Indecent Content Rules](https://gamebanana.com/wikis/1980)
- [Age Restrictions](https://gamebanana.com/wikis/2036)
- [Paid Content Setting](https://gamebanana.com/wikis/2374)

### Current consumer evidence

- [DMM GameBanana provider at inspected commit `4626073`](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/apps/api/src/providers/game-banana/index.ts)
- [DMM GameBanana response types at inspected commit `4626073`](https://github.com/deadlock-mod-manager/deadlock-mod-manager/blob/4626073406a8b99c6e782f3ce509aacc8090cce8/packages/shared/src/providers/game-banana.ts)

Current-consumer links document routes another manager presently uses; they do not convert `apiv11` into a supported GameBanana contract.
