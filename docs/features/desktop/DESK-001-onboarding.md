# DESK-001 — Onboarding

| Field | Value |
|---|---|
| ID | `DESK-001` |
| Owner | Desktop product and Windows shell |
| Phase | Phase 2 |
| Status | Draft |

## Problem and user stories

New users need confidence that Modlock found the right game and will not mutate it unexpectedly. As a player, I want a short guided setup and dry-run health check so I understand paths, backups, privacy, and limitations before enabling mods.

## Scope and non-goals

**In scope:** Welcome/unofficial notice, performance/privacy defaults, DESK-002 discovery, install health, backup/storage location, safety/non-goals, optional account link, and completion/resume.

**Non-goals:** Mandatory account creation, automatic mod installation, admin elevation, or promising Valve endorsement/compatibility.

## States and primary flow

States are not_started, discovering, needs_path, health_warning, ready, and complete. The user reviews boundaries, confirms a validated game instance and local storage, sees a no-write dry run, then completes setup.

## Errors and offline behavior

All core setup except account linking works offline. Missing Steam/game remains recoverable through a validated manual path. Progress is persisted locally and safe to resume.

## Permissions

No administrative rights. Filesystem access is limited to selected Modlock storage and verified game/user config paths. Account linking uses WEB-005 only when requested.

## Data and API

Stores onboarding version, accepted local choices, game instance reference, and privacy settings in SQLite. No server API is required for local completion.

## Safety, privacy, and accessibility

No writes to game files during discovery/dry run. Explain optional telemetry before consent. Every step supports keyboard, screen reader, high contrast, scalable text, and back/resume without lost choices.

## Telemetry

If opted in: step completion/failure category, time to complete, discovery outcome, and anonymous app/platform versions. Never include paths or Steam IDs.

## Acceptance criteria

- A user can complete local setup offline without an account or administrator privileges.
- No game/config bytes change before explicit later install/CFG confirmation.
- Invalid manual paths cannot become game instances.
- Interrupted onboarding resumes at a safe step with prior choices visible.

## Dependencies and open questions

Depends on DESK-002/014/016, UI ADR from SHO-130, and Valve/unofficial wording from SHO-126.

