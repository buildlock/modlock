# Status page, support, and escalation operations

Status: draft  
Last reviewed: 2026-09-01

## Status components

Website/catalog, API/auth, hosted downloads, uploads/scanning, install resolution, GameBanana adapter, other source adapters, game-data refresh, and update service. Third-party degradation is labeled separately.

## Updates

Initial incident notice states user-visible symptom, affected component, start/observation time, and mitigation without speculation. Subsequent updates provide material change or a stated cadence. Resolution states duration, current state, recovery action, and whether a postmortem follows.

## Support routing

- Security vulnerability → private security process.
- Malware/active unsafe release → emergency moderation/security.
- Copyright/ownership → restricted takedown process.
- Account/identity/verification → trust queue with identity-safe evidence.
- Install/config failure → diagnostic/support flow; never request secrets or full personal configs by default.
- External-source failure → adapter status and source platform where appropriate.

Support bundles are generated locally, previewed, and explicitly uploaded. Default bundle contains client/build, OS coarse version, transaction/error codes, redacted state digests, and event timing—not tokens, usernames, Steam IDs, arbitrary paths, CFG content, or mod inventory unless separately selected and necessary.

