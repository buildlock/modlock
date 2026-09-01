# ADR-0003: Rust desktop core and measured native shell

- Status: accepted for core; proposed for shell
- Date: 2026-09-01

## Decision

Implement discovery, path safety, downloads, archive/VPK inventory, profiles, CFG ownership, journaling, activation, validation, and rollback in UI-independent Rust crates. Select between WinUI 3 plus a narrow Rust ABI and an all-Rust native toolkit only after identical Windows benchmarks.

Electron is rejected for the lightweight brief. Tauri is a fallback if native delivery cost fails the measured product tradeoff.

## Decision gate

Cold/warm launch, idle memory/CPU, installer size, accessibility, list virtualization, updater/deep-link integration, and team implementation effort on the designated Windows 11 reference PC.

