# Synthetic fixture controls

This tree contains repository-authored JSON metadata only. It contains no Deadlock files, game assets, mod payloads, provider responses, archives, VPKs, executables, or third-party bytes.

The synthetic metadata is marked `repository-license-pending` and `internal-conformance-only`; this slice does not make a repository licensing decision.

- [`corpus-manifest.v1.json`](corpus-manifest.v1.json) is the `SHO-124` control scaffold. Every planned archive/VPK/game-install case is metadata-only with a null payload path and makes no coverage or parser-support claim.
- [`contracts/valid`](contracts/valid) contains one positive synthetic document for every `SHO-127` V1 contract.
- [`contracts/conformance.v1.json`](contracts/conformance.v1.json) defines 79 deterministic single-document mutations and 27 five-document authority-graph mutations with exact expected violations.

The conformance gate enumerates the complete fixture tree, rejects symlinks before resolution, parses every JSON file with duplicate/non-finite rejection, and verifies every positive fixture against its manifest digest and contract. The authority graph contains exactly one synthetic hosted and one synthetic external record, with ready source/build/fact/rights and pack-evidence bindings; it is a conformance control, not a general source resolver.

The corpus remains incomplete until separately reviewed payloads have explicit rights/provenance, exact hashes, expected outcomes, and isolated parser/installer proof. RAR/7z rows are planning controls only and do not mean support exists.
