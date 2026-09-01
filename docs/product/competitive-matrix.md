# Competitive capability matrix

Research baseline: **2026-09-01**. This is a product-planning comparison, not a claim that every observed feature works in every current game build. DMM and GameBanana observations are backed by the dedicated current teardowns; Grimoire observations use the inspected revision recorded in [ecosystem research](../01-ecosystem-research.md). GameBanana is a hosting/community platform, not a desktop manager. `Target` describes Modlock requirements, not implemented functionality.

## Product and distribution

| Capability | Deadlock Mod Manager | Grimoire | GameBanana | Modlock target |
|---|---|---|---|---|
| Public Deadlock catalog | Broad catalog through its service/API | GameBanana-centered discovery | Primary identifiable public catalog/host | First-party catalog plus attributable linked sources |
| Creator-controlled uploads | Service has broader publishing/foundry surfaces; exact current workflow needs deeper audit | Primarily manager/tooling focus | Mature submission/file pages | Direct-to-quarantine upload, immutable releases, creator/team roles |
| Immutable release identity and SHA-256 | Partial/unclear from current audit | Local/reference metadata; exact hosting guarantees vary | Host file/version model; durable hash contract needs confirmation | Required for every first-party published file |
| License/provenance first-class | Source metadata present; completeness varies | Preserves external references | Submission licenses/author metadata | Required fields, redistribution state, immutable evidence |
| Direct manual download | Yes where source permits | Yes through source | Yes | Yes where license permits |
| Registered one-click manager | Registered with GameBanana | Supports GameBanana one-click | Provides manager integration ecosystem | Target after written GameBanana integration path |
| Packs/collections | Profiles exist; package/bundle work needs deeper audit | Open `.modprofile.json`/`mp1:` reference profile | Collections/community features vary | Immutable reference manifests; no unauthorized rebundling |
| Pro/streamer artifact approval | Crosshairs/profiles exist; exact consent model unclear | Not established in current research | Creator identity, not Modlock-style exact artifact approval | Exact-version approval, expiry/revocation, unendorsed community labels |
| Moderation/takedown evidence model | Service routes exist; operational model not audited | Not a public upload platform | Mature platform moderation, terms need direct integration review | Capability-separated queues, immutable evidence and appeals |

## Desktop utility

| Capability | Deadlock Mod Manager | Grimoire | GameBanana | Modlock target |
|---|---|---|---|---|
| Desktop stack | Tauri 2, Rust, React/TypeScript | Electron 35, React 19, SQLite | Not applicable | Native Windows shell benchmark plus independent Rust core |
| Observed package footprint | About 23 MB setup in dated snapshot | Older public Windows package about 184 MB | Not applicable | Installer below performance gate; no Electron default |
| No resident process after close | Needs runtime verification | Offline-first claim; runtime verification needed | Not applicable | Explicit invariant |
| Safe archive formats | ZIP/RAR/7z/raw VPK observed | ZIP/archive/native tools observed | Hosts arbitrary uploads under platform policy | ZIP/raw/split VPK first; RAR/7z only after sandbox/license proof |
| One-click install | Yes | Yes | Launches registered manager | Exact confirmation plus signed resolution and local reinspection |
| Transaction journal/crash recovery | Backups/installation handling observed; full failure proof not established | Recovery details need deeper audit | Not applicable | Fsynced journal, terminate-at-every-step test, automatic safe recovery |
| Profiles | Yes | Yes, open portable format | Not applicable | Deterministic desired state with interoperable reference export |
| Load order | Yes | Yes | Not applicable | Explicit priority plus stable tie-break and active-tree hash |
| Conflict inventory | VPK analysis exists | Conflict resolver and merge tooling | Not applicable | Pre-activation normalized path conflicts and visible winner |
| VPK merging | Not a V1 dependency in research | Available tooling | Not applicable | Deferred, opt-in only after correctness proof |
| Patch-reset repair | Known failure class/open-issue signal | Behavior needs current audit | Not applicable | Build-aware safe mode and semantic owned-marker repair |
| Offline local management | Some local behavior; complete boundary unverified | Offline-first | Web platform requires network | Local library/profile/CFG/repair available before network |
| Signed updater and rollback | Packaged updates exist; trust design needs audit | Packaged updates; trust design needs audit | Not applicable | Signed expiring metadata, rollback protection, atomic bootstrapper |

## Configuration and trust

| Capability | Deadlock Mod Manager | Grimoire | GameBanana | Modlock target |
|---|---|---|---|---|
| Autoexec/CFG editing | Autoexec editor and command library | Performance/config tooling research | Hosts config-related submissions | Typed registry, raw advanced mode, owned blocks, exact diff/backups |
| Crosshair editor/library | Browse/generate crosshairs; dated API had 227 | Crosshair/profile extensions | Hosts community submissions | Validated editor, approximate preview, version/provenance/build state |
| Per-hero arbitrary crosshair switching | Not proven; current behavior primarily global | Not proven | Not applicable | Preference organization and explicit apply; automatic live switching deferred |
| Competitive-risk content rules | Current service policy requires separate audit | Local manager; hosted-policy role limited | Platform rules/moderation | Explicit capability/effect policy; no injection/automation/hidden information |
| First-party upload scanning | VPK analysis/service routes observed; full pipeline not audited | Local analysis focus | Platform scanning/moderation is internal | Quarantine, isolated bounded parsing, malware/rules, attested inventory |
| Local privacy/telemetry | Requires dedicated network/runtime audit | Described as offline-first/no telemetry in research | Platform account/analytics policies apply | Opt-in analytics; never upload inventory/CFG/paths without scoped consent |
| Accessibility acceptance gates | Not established by this audit | Not established by this audit | Website platform responsibility | Keyboard, screen reader, high contrast and measurable release gates |

## Strategic conclusion

Modlock should not compete by reproducing the longest feature list. Its differentiators are creator-controlled immutable hosting, reference-safe interoperability, transaction/rollback proof, typed configuration, precise endorsement semantics, strong degraded/offline behavior, and a measured native footprint. Source-level/current public DMM and GameBanana teardowns are complete; DMM Windows runtime measurements and written GameBanana integration terms remain explicit human/evidence gates.
