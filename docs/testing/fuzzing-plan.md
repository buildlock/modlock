# Parser fuzzing plan

Status: implementation specification  
Last reviewed: 2026-09-01

Targets: ZIP/optional archive metadata and extraction planning, VPK headers/tree/ranges/split relations, VDF/Steam manifests, CFG ownership parsing, JSON contracts/manifests, custom deep links, update/install-plan canonicalization/signatures, and any media/third-party normalization parser.

- Seed with synthetic valid, minimized regressions, malformed boundary values, and public-format samples with rights.
- Use structure-aware mutation where useful and generic byte fuzzing for parser boundaries.
- Assert no panic/crash/OOM/hang, no path escape or unbounded allocation, deterministic classification, and safe error.
- Set per-input time/memory/size limits and run sanitizers/platform equivalents where supported.
- Every crash/security finding becomes a minimized non-sensitive regression fixture before closure.
- Continuous smoke budget on PR/nightly; deeper campaigns scheduled and before beta/release.
- Third-party parser/library updates rerun the relevant corpus and dependency review.

Do not upload potentially copyrighted private mods to public fuzzing services. Keep exploit details restricted until remediation/advisory coordination.

