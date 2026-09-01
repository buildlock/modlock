# Content style and localization readiness

Status: baseline  
Last reviewed: 2026-09-01

- Use short direct sentences and consistent domain terms from the player guide.
- Never use `official`, `verified`, `safe`, `compatible`, `clean`, or `anonymous` beyond their documented evidence definition.
- Distinguish creator, uploader, source host, pack curator, and verified artifact approver.
- Dates/times/bytes/numbers are locale-aware; stored values remain canonical UTC/bytes.
- UI strings are externalized; do not concatenate grammar or embed markup in translated strings.
- Error codes are stable/nonlocalized; user messages are localized and actionable.
- Screens accommodate expansion, RTL where feasible, and non-Latin names/paths without lossy normalization.
- Legal/policy translations require qualified review and identify controlling version/language.
- Creator/user text is not machine-translated and republished without labeling/consent.

