# Security, moderation, and legal boundaries

This is product/engineering guidance, not legal advice. Obtain counsel before accepting public uploads or representing player/creator endorsements.

## Threat model

### Assets

- User's game installation, configs, Steam library, Windows account, and credentials.
- Creator identity, unreleased uploads, licenses, and reputation.
- Modlock signing keys, moderation accounts, database, object storage, and update channel.
- Catalog integrity, release hashes, install plans, and scanner attestations.

### Adversaries and failures

- Malware uploader hiding payloads in nested/malformed archives.
- Path traversal or parser exploit targeting scanner or desktop.
- Copyright/trademark infringer or creator impersonator.
- Cheat distributor describing a competitive advantage as a cosmetic mod.
- Compromised third-party host changing bytes behind a stable URL.
- Account takeover of a creator, moderator, or release signer.
- Supply-chain compromise in archive/VPK libraries or the app updater.
- Honest creator mistake, bad metadata, broken game patch, network interruption, or full disk.

## Security controls

### Public upload controls

- Quarantine is a separate bucket/account with no public read policy.
- Direct upload credentials are short-lived, object-scoped, size-limited, and cannot overwrite.
- Scanner workers have no secrets for public promotion and no outbound network.
- Enforce resource limits at container/microVM and parser levels.
- Anti-malware and rules engines are defense in depth, not proof of safety.
- Images/video are decoded and re-encoded; original media stays private until approved.
- Immutable public keys include content digest; replacement requires a new release.
- Known-bad hashes can be revoked globally and blocked from future uploads.

### Desktop controls

- Normal operation is unprivileged.
- No downloaded code is executed.
- Every download is locally hashed and structurally checked.
- Every game mutation is journaled and reversible.
- Deep links resolve opaque server state and always present confirmation.
- Tokens use Windows credential protection.
- Updater and binaries are signed through separate, least-privilege release credentials.
- Logs exclude tokens, pre-signed URLs, personal CFG content, and complete local paths by default.

### Administrative controls

- Hardware-backed MFA/passkeys for privileged roles.
- Least privilege and separate takedown, malware, moderation, and release-signing capabilities.
- Step-up authentication for publish override, identity verification, revocation, and signing changes.
- Tamper-evident audit events exported to a separate security destination.
- No moderator directly edits scan output or binary hashes.
- Incident runbooks for malware, signing-key compromise, third-party host compromise, and wrongful takedown.

## Content policy baseline

### Allowed with rights and accurate labeling

- Cosmetic character/weapon/model replacements.
- Audio/music/voice replacements where the uploader owns or licenses the content.
- HUD and visual customization that does not expose hidden information.
- Maps and practice content that do not misrepresent official matchmaking support.
- Accessibility modifications reviewed for competitive impact.
- Crosshairs and typed CFG settings in the allowlisted registry.

### Prohibited

- Malware, credential theft, miners, loaders, drivers, DLL injection, or executable payloads disguised as mods.
- Cheats, memory reading/writing, process injection, anti-cheat bypass, automated input/actions, or match manipulation.
- Changes intended to reveal hidden players/information, remove fog/occlusion, exaggerate enemy visibility/outlines, provide exact unavailable health/state, or otherwise create an unfair advantage.
- Full copyrighted games/assets, unauthorized ports, stolen creator work, or content whose license forbids redistribution.
- Impersonation, fake verified-player approval, deceptive downloads, or manipulated metrics.
- Sexualized content involving minors; illegal content; doxxing; hateful or harassing content.

### Restricted/review-required

- NSFW content with age controls and jurisdiction-aware availability.
- Large portions of another game's copyrighted assets.
- Competitive UI/accessibility modifications where advantage is ambiguous.
- Performance presets touching visibility, FOV, outlines, post-processing, networking, input automation, or unknown convars.
- Mods with external dependencies or unusual install targets.

Policy decisions should be capability- and effect-based, not filename/category-based. A file labeled “skin” can still contain prohibited resources.

## Steam and Valve boundary

Deadlock's official Steam page describes an early-development Valve game. No authoritative public Deadlock mod policy was found in this research. Steam's Online Conduct rules and Subscriber Agreement prohibit cheat programs, unfair advantage, malware, and intellectual-property violations.

Before public launch:

1. Ask Valve for written guidance on tolerated mod categories, branding, and any anti-cheat constraints.
2. State clearly that Modlock is unofficial and not affiliated with or endorsed by Valve.
3. Use nominative references to Deadlock/Steam carefully; do not use Valve logos as Modlock branding.
4. Provide a kill switch for newly prohibited categories and client warnings by game build/policy version.
5. Retain counsel for terms, privacy, DMCA/copyright operations, child safety/NSFW controls, and relevant platform liability.

Community forum posts can identify possible risk areas, but they are not official policy.

## Copyright, licenses, and takedowns

### Upload requirements

The uploader must select an SPDX license or provide custom terms, identify third-party assets, and affirm authority to publish. “No license” means users may receive the file for personal use under stated terms; it does not grant Modlock permission to redistribute elsewhere.

Store:

- the license/version presented at upload;
- source and creator attribution;
- redistribution and modification flags;
- external source link and remote file ID;
- uploader affirmation and timestamp; and
- hashes of every published file.

### Takedown program

Publish an accessible copyright agent/contact, compliant notice requirements, counter-notice/appeal process, repeat-infringer policy, and response targets. Quarantine accused content during review when appropriate while preserving evidence. Hash blocks need an appeal path because identical files can have legitimate contexts.

External-linked records should be delisted locally when required even if the source host has not acted. Notify the source host through its own process when appropriate.

## Player, streamer, and creator consent

Verification has two separate claims:

1. **Identity verification:** the account controls an attributable public identity.
2. **Artifact approval:** that identity approved one exact preset/pack version.

One does not imply the other. A verified player profile cannot automatically turn a community-submitted pack into an endorsed pack.

Approval records include exact version digest, scope, approver, public evidence or private audit reference, timestamp, expiry, and revocation. New versions require new approval. Revoked/expired artifacts remain historically attributable but lose the verified badge and cannot be promoted as current.

Use these labels consistently:

- `Creator verified` — exact immutable version approved by the person/team.
- `Creator contributed` — submitted through a delegated maintainer workflow and attributable, pending/direct approval policy.
- `Community reported` — cites a public source but has no endorsement.
- `Expired` — provenance may remain, currentness is no longer asserted.

Do not use a person's likeness in advertising, sell access to their name/pack, or imply sponsorship without a separate agreement.

## Privacy

Collect only what is necessary:

- Public creator identity is separate from private account/contact information.
- Steam/Discord provider subject IDs are not public by default.
- Do not upload local mod inventories, CFG content, Steam library paths, crash dumps, or gameplay logs without explicit scoped consent.
- Downloads can be counted with privacy-preserving, abuse-resistant aggregates; do not create a cross-site player profile.
- Define retention and deletion for accounts, logs, uploads, reports, and legal holds.
- Provide export/deletion flows subject to legitimate fraud/security/legal retention.

## Security release gates

No public beta until:

- independent review of archive/VPK parsing and transaction/rollback code;
- fuzzing corpus and continuous fuzz targets for every untrusted parser;
- update-signing ceremony, offline root recovery, and compromise drill;
- malware upload tabletop and emergency revocation test;
- production restore drill for database and object metadata;
- moderator access review and audit-log verification;
- terms, privacy policy, content rules, copyright workflow, and player verification terms are approved; and
- an opt-in beta uses clearly disposable/recoverable game-state backups.
