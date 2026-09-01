# ADR-0006: Quarantine and isolated scanning

- Status: accepted
- Date: 2026-09-01

## Decision

Uploads go directly to non-public quarantine through object-scoped, expiring multipart credentials. Network-isolated, resource-bounded workers validate hashes/magic, safely inventory archives/VPKs, scan malware/policy rules, re-encode media, and issue an attestation. Scanner credentials cannot publish content.

## Consequences

A clean scan is necessary but not sufficient for policy approval. Every attestation is bound to exact bytes and scanner version. Promotion is an authorized state transition.

