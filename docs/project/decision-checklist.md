# Owner decision checklist

Status: awaiting owner answers where marked  
Last reviewed: 2026-09-01

Answers should be committed as an ADR or policy update. Defaults below allow safe prototyping without silently deciding the business.

| Decision | Safe working default | Owner answer needed by |
|---|---|---|
| Legal operator and jurisdiction | Unspecified; no public accounts/uploads | Before production account creation |
| Product name/trademark clearance | `Modlock` is a working name only | Before public branding/domain purchase |
| Source license for Modlock | Private/proprietary undecided; use permissive dependencies and clean-room rules | Before accepting outside contributions |
| Website business model | Free, no ads, no paid placement | Before monetization implementation |
| Creator donations | Link to creator-owned donation pages; Modlock takes no cut | Before public creator pages |
| NSFW content | Disabled | Before moderation/public beta |
| Community-reported pro presets | Disabled; exact-version creator approval only | Before preset launch |
| Product telemetry | Off by default; operational security logs only | Before beta instrumentation |
| Public comments/social features | Out of V1 | Before roadmap expansion |
| Third-party file mirroring | Prohibited without explicit rights | Before source adapters ship |
| Automatic live crosshair switching | Prohibited unless supported and cleared | After technical/policy proof |
| VPK merging | Deferred and opt-in only | Post V1 evidence review |

## Release approval questions

1. Has counsel approved the current policy and contract versions?
2. Is the Windows binary signed by the intended operator?
3. Are all hosted pilot files licensed and attributable?
4. Are Valve and source-platform unknowns explicitly accepted or resolved?
5. Can every supported install mutation be rolled back in the current test matrix?
6. Can malware/revoked content be blocked immediately?
7. Can production data and signing metadata be restored from tested backups?
8. Are public support, security, legal, and takedown contacts staffed?

