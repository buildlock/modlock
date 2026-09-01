# Delivery ownership: Codex versus Ahad

Status: active  
Last reviewed: 2026-09-01

This document separates work Codex can complete autonomously from work that requires Ahad's identity, authority, hardware, accounts, legal counsel, or human relationships. A task belongs in Ahad's lane only when Codex cannot complete or truthfully approve it.

## Codex-owned deliverables

Codex owns producing and maintaining:

- Public-source teardowns of Deadlock Mod Manager, Grimoire, GameBanana, relevant APIs, package formats, and ecosystem behavior.
- The product specification, feature wiki, competitive matrix, requirements traceability, information architecture, and acceptance criteria.
- Architecture decision records and provisional technical recommendations.
- OpenAPI and JSON Schema contracts, data model/ERD, data dictionary, error model, and versioning policy.
- Desktop transaction, archive/VPK, CFG, updater, profile, and rollback design.
- Test strategy, synthetic/adversarial fixture specifications, CI validators, and reproducible test harness designs.
- Developer onboarding, contribution, code review, generated-code, environment, CI, and Definition of Done documentation.
- Threat models, risk register, incident/revocation/backup/release/moderation runbooks, and draft public policies.
- Player, creator, pack/preset, migration, troubleshooting, and support documentation.
- Source citations, evidence freshness labels, clean-room logs, unresolved-question registers, handoffs, and Globalsave checkpoints.
- Linear backlog structure, documentation-linked issue descriptions, and factual project-status synchronization.

Codex may draft decisions that need human approval, but labels them `proposed` until approved.

## Ahad-owned decisions and actions

| ID | Human dependency | Why Codex cannot finish it | Prepared artifact / required response |
|---|---|---|---|
| HUM-001 | Authorize or send Valve outreach | Requires Ahad's identity and external representation. | Review the send-ready outreach in `docs/project/outreach-packets.md`; approve sending or send it. |
| HUM-002 | Authorize or send GameBanana outreach | Requires account/identity and may create a commercial/platform relationship. | Review the GameBanana packet and name the sender/contact account. |
| HUM-003 | Provide Windows 11 reference hardware | Native footprint and game integration cannot be credibly benchmarked on macOS or generic CI. | Provide a Windows host/runner with CPU, RAM, storage, display scale, and Deadlock access recorded. |
| HUM-004 | Approve use of a live/sacrificial Deadlock install | Mutating real game files needs the owner's explicit scope and recoverability decision. | Designate a test Steam account/install and confirm backups/reinstall are acceptable. |
| HUM-005 | Engage qualified counsel | Codex cannot give final legal approval. | Counsel reviews draft Terms, Privacy, Content, DMCA, Creator, consent, branding, and platform-liability documents. |
| HUM-006 | Recruit and obtain consent from pilot creators/players | Requires real relationships, identity verification, and consent. | Select 3–5 candidates; obtain exact-version hosting/pack/preset permissions using the prepared consent draft. |
| HUM-007 | Choose company/brand owner and signing identity | Required for contracts, privacy controller, domains, Windows code signing, and store accounts. | Provide legal entity, public operator name, support/security/legal contacts, and jurisdiction. |
| HUM-008 | Approve business model and risk appetite | Pricing, NSFW availability, donations, ads, and competitive-risk thresholds are owner decisions. | Answer the decision checklist in `docs/project/decision-checklist.md`. |
| HUM-009 | Purchase/hold production credentials | Code-signing certificates, domains, cloud billing, email, and identity-provider accounts must be owned by the operator. | Create accounts only after the corresponding ADR/vendor decision is approved; never paste secrets into docs/chat. |
| HUM-010 | Final go/no-go at each release gate | Release accepts business, legal, safety, and reputational risk. | Sign the release-gate checklist after objective evidence is attached. |

## Shared decisions

Codex supplies evidence and a recommendation; Ahad approves or revises:

- Native Windows shell after measured spike.
- API/server implementation language after a walking-skeleton comparison.
- Storage, queue, auth, email, search, and hosting vendors.
- Supported archive types and external source integrations.
- Telemetry default and retention.
- Monetization and creator revenue behavior.
- Public content boundaries that are stricter than platform/legal minimums.

## Escalation rule

If a task can be completed with public information, synthetic fixtures, local code, or reversible project-scoped changes, it remains Codex-owned. If it requires impersonating Ahad, accepting terms, spending money, disclosing secrets, contacting third parties, touching a real player installation, or making a legally binding/risk-bearing decision, Codex prepares the artifact and stops at the approval boundary.

