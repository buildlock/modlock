# ADR-0001: Product and safety boundaries

- Status: accepted
- Date: 2026-09-01

## Decision

Modlock is an unofficial creator catalog plus an unprivileged Windows utility. It will not inject into Deadlock, access game memory, automate inputs, bypass anti-cheat, execute downloaded code, modify base VPKs, or distribute modifications intended to expose hidden information or confer unfair competitive advantage.

Automatic live per-hero crosshair switching, VPK merging, and arbitrary public scripts are deferred until separate technical and policy approval.

## Consequences

Safety checks can reject content/features beyond what is technically installable. The catalog needs capability classification and emergency revocation. The product must clearly disclose that it is unaffiliated with Valve.

