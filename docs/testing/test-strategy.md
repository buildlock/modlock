# Master test strategy

Status: active design contract  
Last reviewed: 2026-09-01

## Objectives

Testing proves that untrusted content cannot escape its boundaries, game/config mutations are recoverable, contracts remain compatible, external failures degrade safely, and the UI accurately explains state.

## Test layers

| Layer | Scope | Gate |
|---|---|---|
| Contract | JSON Schema/OpenAPI parsing, examples, generated clients, backward compatibility | Every PR |
| Unit | Path normalization, resolver ordering, state transitions, CFG parsing/rendering, signature checks | Every PR |
| Property/fuzz | Archives, VPK, VDF/CFG, manifests, deep links, parsers | Continuous + release corpus |
| Component | Database repositories, object store adapter, job leases, scanner attestation, updater metadata | Every PR |
| Integration | API/Postgres/object emulator/scanner; desktop core/fixture filesystem | Every PR/nightly by cost |
| Failure injection | Kill process, disk full, locks, corruption, timeouts, partial network, patch replacement | Nightly and release |
| End-to-end | Browser → API → quarantine → scanner → publish → resolve → disposable install → rollback | Release candidate |
| Windows compatibility | Supported Windows builds, scales, filesystem layouts, Steam libraries, antivirus interactions | Release candidate |
| Performance | Cold/warm launch, memory/CPU, large catalogs/archives, slow disk/network | Architecture and release gates |
| Security | SAST/dependencies/SBOM, parser review, auth/authorization, penetration test | Continuous + external beta review |
| Accessibility | Keyboard, focus, screen reader, contrast, scaling/reduced motion | Feature and release gates |

## Transaction oracle

For every filesystem mutation boundary:

1. Record pre-state tree/content digests.
2. Start the planned transaction.
3. Terminate or inject the selected failure immediately before and after the boundary.
4. Restart recovery.
5. Assert the state is either the fully committed desired state or byte-equivalent recoverable pre-state.
6. Assert no unowned base-game file changed and no staging/journal ambiguity remains.

Rollback success is 100% for supported test cases. A test that cannot define the expected recoverable state blocks the mutation from shipping.

## External adapter tests

- Store sanitized response fixtures by provider/schema observation date.
- Contract-test live public endpoints at a respectful schedule, never in every PR.
- Fail closed/circuit-break on schema mismatch affecting identity, license, rating, file, hash, or download resolution.
- Test deletion, withheld/private, 404/410, 429, 5xx, timeouts, redirect changes, stale cache, and inconsistent pages.
- Never make live third-party availability a release-build dependency.

## Required evidence

Test results attach environment, game/client/service build, fixture IDs, contract digests, relevant logs with secrets removed, and artifacts/diffs. Flaky tests are quarantined with an owner/deadline; safety tests are never silently retried into green.

## Definition of done for a feature

- Feature wiki acceptance criteria map to automated/manual tests.
- Normal, empty, error, offline, revoked, and permission-denied states are covered where applicable.
- Threat/privacy/accessibility review is complete.
- Metrics and logs are documented and privacy-filtered.
- Rollback/migration behavior is proven.
- Documentation and support changes ship with code.

