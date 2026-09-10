# Read-only Steam fixture discovery

Date: 2026-09-10
Owner: Codex, SHO-128; one independent reviewer
Status: PR7 accepted and merged; all PR/main Linux/Windows checks passed

## Implemented scope

The Rust core now has a [KeyValues parser](../../crates/modlock-core/src/keyvalues.rs)
and [Steam metadata/discovery module](../../crates/modlock-core/src/steam.rs).
The pure parsers accept caller-provided bytes. The filesystem entrypoint reads
only an explicitly supplied synthetic root with the exact `fixture.identity`
marker. It reads `steam/steamapps/libraryfolders.vdf`, then the app 1422450
manifest in each registered library below that root. Empty/stale `apps` hints
cannot hide an existing manifest. Multiple candidates remain distinct and sort
by numeric library index.

The app parser requires the exact app ID, one safe install-directory component,
a positive build ID and bounded positive depot/manifest IDs. Discovery checks
the expected fixture paths for exact inert marker bytes. Those paths and bytes
are authored oracles, not evidence of a current Valve executable or game build.
The result includes a canonical local path, stable identity for that same path,
build/depot facts and exact manifest digest. A build refresh changes the digest
without changing that same-path identity. Moving a directory invalidates the
old candidate; automatic profile reassociation is not implemented.

`validate_fixture_override` re-discovers and accepts only a current registered
fixture candidate. An override cannot bypass a missing/changed manifest, path
validation or fixture evidence. This is a selection validator, not permission
to scan an arbitrary game directory.

## Format source and compatibility

Implementation was authored from Modlock requirements and Valve's public
[KeyValues text-format notes](https://github.com/ValveSoftware/source-sdk-2013/blob/b8cfb12c0e083a2ef5b2f9f9b50f3902fa034474/src/public/tier1/KeyValues.h#L45-L57).
No DMM or Valve parser implementation was copied or translated. The local subset
supports quoted/unquoted tokens, nested braces, escaped quoted strings, UTF-8,
an initial BOM and line comments. Ordered pairs and original byte spans are
retained; duplicate keys remain representable for future gameinfo search paths.
Steam identity-bearing scopes separately reject case-insensitive duplicates.

There is no claim of complete KeyValues compatibility. Includes/base directives,
conditionals, binary/KV3, unknown escapes and block comments are unsupported.
Legacy string-form library entries fail closed. Unknown non-library metadata is
ignored only after bounded parsing; it supplies no filesystem path or identity.
Real Steam app/library observations and the current Deadlock structure remain
unverified. The developer wiki was inaccessible during this run; the linked
public SDK notes were available. No private Steam data was inspected.

## Bounds and filesystem boundary

- At most 1 MiB input, 16 nested objects, 8,192 pairs and 4,096 raw bytes per token.
- At most 32 libraries and 128 depots per manifest. Decimal IDs reject signs,
  leading-zero aliases, exponent syntax and overflow.
- Local absolute library paths must be lexically inside the caller's fixture
  root. Relative, UNC/device, alternate-stream, dot/parent and empty components
  fail before candidate reads. Every traversed child is inspected and resolved
  beneath the canonical root. Links/reparse points and special files are rejected.
- Fixture-owned components use a conservative Unicode/Windows-safe subset:
  letters/numbers, space, underscore, hyphen, dot and parentheses; NFKC-changing
  spellings, device aliases and trailing dot/space are rejected. This does not
  claim every valid Windows filename is supported.
- Reads are capped and check length/mtime. Discovery re-reads each manifest and
  the library list before returning; detected drift fails. These checks do not
  create an atomic whole-filesystem snapshot or an authorization for later writes.
- The fixture root/ancestors are caller-owned and static. Race-resistant handles,
  hostile ancestor replacement, mount identity and complete Windows hardlink
  defenses remain part of the production filesystem adapter. Static Unix
  hardlinks and Windows reparse points are rejected in this prototype.
- Errors contain categories only. Returned paths are local application data and
  must not become telemetry. No account IDs or manifest contents are logged.

## Verification

Run `cargo test --workspace --locked`, `cargo clippy --workspace --all-targets
--locked -- -D warnings`, `cargo fmt --all --check` and the fresh Python gate.
All tests create and remove their own disposable trees. Metadata and inert
`.exe`/`.gi` marker bytes are authored from test source; no game/mod payload or
third-party rights claim enters the corpus.

Local macOS passes 27 regular tests: 13 new parser/discovery groups plus the
14 existing journal/recovery groups. The latter still includes actual process
termination at 41 activation and six recovery boundaries. One ignored test is
the existing subprocess entrypoint, executed by its parent tests.

New cases cover structure/spans/Unicode, truncation, malformed bytes, directives,
limits, a deterministic hostile byte corpus, multiple libraries, exact before/
after filesystem bytes, build refresh, stale hints, moved folders, fresh override,
duplicate IDs, lookalikes, unsafe paths, oversized records and actual Unix
symlink/hardlink/socket entries. Windows CI additionally creates an actual
directory junction and requires rejection. Its result must pass before merge;
it is hosted Windows Server evidence, not Windows 11 player/game acceptance.

Local formatting, Clippy with warnings denied, Windows cross-target compilation
and cargo-audit 0.22.2 pass. The refreshed RustSec scan covers all 25 locked crate
dependencies with zero vulnerabilities and no warnings. The fresh Python 3.13.15
gate passes all 28 contract tests and removes its temporary environment.

No Steam registry access, process detection, game launch, download,
mutation, local database, UI or network operation is implemented here. SHO-128
remains open for full prototype
acceptance. DESK-002, production game compatibility and Phase 0 remain incomplete.

The next [gameinfo byte planner](gameinfo-plan-proof.md) is separately implemented
on accepted PR7. It proposes a minimal edit and has no filesystem write capability.
