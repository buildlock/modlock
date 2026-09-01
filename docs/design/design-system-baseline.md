# Design-system baseline

Status: proposed  
Last reviewed: 2026-09-01

## Principles

- Native utility clarity over game-themed ornament.
- Provenance and state are visible, never hidden behind color alone.
- Destructive or game-mutating actions show exact scope and recovery.
- Local/offline/remote state are visually distinct.
- Dense libraries use progressive disclosure and keyboard-efficient controls.

## Semantic tokens

Define platform-specific values for `surface`, `surface-raised`, `text`, `text-muted`, `border`, `accent`, `success`, `warning`, `danger`, `info`, and focus-ring tokens. Support light/dark and Windows high-contrast themes. No feature code uses raw semantic colors.

## Core components

- Provenance badge; verification badge; compatibility badge; scan/policy badge.
- Mod/release/file/pack cards and dense rows.
- Install-plan summary, conflict table, diff viewer, transaction progress, recovery banner.
- Typed setting field, crosshair preview, load-order list, profile switcher.
- Empty/error/offline/revoked states.
- Confirmation dialog that names the mutation and rollback.

## Content language

Use `install`, `enable`, `disable`, `update`, `remove`, `repair`, and `roll back` precisely. Do not say `safe`, `compatible`, `verified`, or `official` without the corresponding evidence/status definition. External-source failures name the source.

