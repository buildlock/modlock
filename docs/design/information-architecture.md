# Information architecture and critical wireflows

Status: proposed  
Last reviewed: 2026-09-01

## Website route inventory

```text
/
/mods
/mods/{slug}
/mods/{slug}/releases/{version}
/creators/{slug}
/packs
/packs/{slug}
/presets/cfg
/presets/crosshairs
/presets/{type}/{slug}
/auth/sign-in
/dashboard
/dashboard/mods/{id}
/dashboard/mods/{id}/releases/new
/dashboard/packs/{id}
/dashboard/identity
/moderation/queue
/moderation/cases/{id}
/reports/new
/legal/{terms,privacy,content,dmca,creator}
/help
/status
```

Public pages communicate source provenance, creator, immutable version, license, content rating, game-build evidence, file/variant, scan status, and whether installation opens the desktop utility. Search and browsing remain usable without an account.

## Desktop navigation

```text
Onboarding
Library
Discover
Profiles
Configuration
  CFG
  Crosshairs
Packs
Activity
  Transactions
  Backups and recovery
Settings
  Game and Steam
  Downloads and storage
  Updates
  Privacy
  Advanced diagnostics
```

The local library becomes interactive before remote discovery. Recovery state overrides normal navigation after an incomplete transaction.

## Critical wireflow: first install

```mermaid
flowchart TD
    A["Open modlock install link"] --> B{"Desktop installed?"}
    B -->|No| C["Website installation guide and manual file option"]
    B -->|Yes| D["Resolve opaque release ID over HTTPS"]
    D --> E["Show creator, source, version, files, size, risks, conflicts"]
    E -->|Cancel| F["No mutation"]
    E -->|Confirm| G["Game-closed check"]
    G -->|Running| H["Explain and wait/cancel"]
    G -->|Closed| I["Download, hash, inspect, stage"]
    I --> J["Snapshot and journal"]
    J --> K["Activate and validate"]
    K -->|Success| L["Receipt and profile state"]
    K -->|Failure| M["Automatic rollback and diagnostic"]
```

## Critical wireflow: creator publication

```mermaid
flowchart TD
    A["Create draft and rights declaration"] --> B["Select release, variant, game build, license"]
    B --> C["Direct upload to quarantine"]
    C --> D["Scan and inventory"]
    D -->|Finding| E["Exact creator-action explanation"]
    D -->|Clean| F{"Policy review required?"}
    F -->|Yes| G["Moderator decision"]
    F -->|No| H["Publish immutable release"]
    G -->|Approve| H
    G -->|Reject| I["Reason and appeal path"]
```

## Critical wireflow: patch recovery

1. Desktop detects a new Steam/game build or changed managed file.
2. It enters safe mode before mutation.
3. It compares current semantic structure and profile object hashes with recorded state.
4. It presents a dry-run repair and compatibility unknowns.
5. User confirms; Modlock journals the repair and validates or rolls back.
6. Compatibility remains `unknown` until evidence upgrades it.

## Content hierarchy

On every catalog/install surface, present identity and safety before popularity:

1. title and creator/source;
2. version/updated/tested game build;
3. capability/content warnings and verification;
4. files/variants/license/provenance;
5. dependencies/conflicts/load-order effects;
6. media/description/changelog;
7. counts and community signals.

