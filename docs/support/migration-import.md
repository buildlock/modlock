# Import and migration guide

Status: design draft  
Last reviewed: 2026-09-01

## Existing local mods

Import is read-only analysis first: inventory files/VPK internals, compute hashes, identify likely source/variant, show conflicts/unknown ownership, and create a new Modlock profile only after confirmation. Never rename/delete unknown files during discovery.

## DMM

Modlock may recognize public behavior/manifests for interoperability but does not copy GPL implementation. Import maps installed identity/version/order where evidence is reliable, preserves originals/backups, and labels unknowns. It does not claim DMM scan/compatibility state as Modlock evidence.

## Grimoire

Support the documented reference-based `.modprofile.json`/share-code subset when compatible. Unknown extension fields are preserved where safe; Modlock-specific additions live under `extensions.modlock`. No binaries are embedded or mirrored.

## Rollback

Before adopting an existing install, snapshot managed candidate files and current search/config state. The original manager remains untouched unless the user explicitly completes migration; provide export/restore instructions and avoid two managers concurrently owning the same active directory.

