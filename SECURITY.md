# Security policy

Modlock is pre-release and has no production service or supported binary yet.

## Reporting a vulnerability

Do not open a public issue for a vulnerability that could enable malware distribution, account takeover, update compromise, sandbox escape, arbitrary file writes, game/config corruption, or disclosure of private data.

Until the operator publishes a dedicated security address, contact the private repository owner directly through an agreed private channel. The production policy must replace this placeholder with an operator-owned security email and optional encrypted reporting key before public beta.

Include affected revision/version, environment, impact, reproduction steps, minimal proof, and whether exploitation may already be occurring. Do not access data that is not yours, persist access, disrupt service, or publish exploit details before coordinated remediation.

## Response targets

Proposed targets after beta launch: acknowledge critical/high reports within 2 business days, provide an initial severity/coordination decision within 5 business days, and communicate material changes. These are targets, not a bounty promise or safe-harbor contract until operator/counsel approval.

## Supported versions

No public versions are currently supported. Future stable support and end-of-life dates will be published with each release.

## Security boundaries

Modlock never intends to execute mod payloads, inject into Deadlock, bypass anti-cheat, or write outside its validated game/config/staging scope. The detailed threat model and runbooks live under `docs/security` and `docs/operations`.

