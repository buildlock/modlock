# Synthetic transaction and recovery proof

Status: implemented locally; independent source review and CI acceptance pending
Date: 2026-09-10
Owner: Codex, SHO-129; one independent source reviewer

## What this proves

The first [Rust core](../../crates/modlock-core/src/synthetic.rs) can replace a
bounded synthetic text-file tree through a flushed intent, staged generation,
two-phase rename and digest-bound commit record. A real OS process lock excludes
another cooperating process. Errors and cancellation attempt immediate recovery;
after abrupt process termination, opening the same sandbox and calling `recover`
restores its initial tree or retains its committed desired tree.

This is a single-use experiment, not a game installer. Creation refuses every
existing directory, including an empty one. Inputs contain at most 32 flat ASCII
`.txt` names, 64 KiB per file and 1 MiB in total. Each file starts with the literal
`MODLOCK SYNTHETIC` line and contains only printable ASCII, newline and tab bytes.
Game packages, gameinfo, archives, scripts, network paths and arbitrary relative
paths are outside this API. All materialized test bytes are authored synthetic
text; no game or third-party payload enters the repository or tests.

The broader MLK-P0-005/006/008/009/010 jobs remain partially implemented. This PR
combines only the scaffold, inert fixtures and transaction proof needed for one
reviewable outcome; it does not create unused web/API shells or claim the full
planned fixture, staging, install-plan or application scope is complete.

## State and recovery rule

The journal records before/after names, byte lengths and SHA-256 digests. It is
an internal experiment format, not a second public install-plan contract.
`contracts/v1` remains the sole portable/network contract authority. Filesystem
slots are fixed by the implementation and never read from the journal as paths.

| Durable/visible state | Recovery result | Preserved files |
|---|---|---|
| No published intent, original active | Unstarted | Original active; any incomplete intent bytes retained |
| Intent, original active, candidate absent/partial/complete | RolledBack | Original active; candidate retained for inspection |
| Intent, prior original, candidate ready, active absent | RolledBack | Prior renamed to active; candidate retained |
| Intent, prior original, new active, no commit | RolledBack | New active renamed back to candidate, then prior to active |
| Digest-bound commit, new active, prior original | Committed | New active and original backup |
| Unknown entries, corrupt records, missing or changed required bytes | Error; manual inspection required | No speculative overwrite or deletion |

Recovery validates all trees needed for a rename before performing that rename.
An interrupted recovery follows the same table on restart. A second activation
is rejected; there is no garbage collector, repeated profile switch or backup
retention service yet. Retained candidate, partial record and backup bytes are
intentional evidence, not active files. The caller removes its own disposable
sandbox after inspection; the core never recursively deletes a supplied path.

`CommittedAfterError` explicitly distinguishes a published commit followed by an
I/O error. `RecoveryRequired` retains both redacted error categories when an
ordinary activation error cannot be rolled back immediately. Error messages
contain neither file contents nor local paths.

## Verification and scope

The [test harness](../../crates/modlock-core/src/synthetic/tests.rs) pauses a
separate process before/after each write, flush, directory creation and rename,
then the parent calls the OS termination primitive. No unwind or destructor in
the terminated process can repair its files. An independent byte-level oracle
checks the exact active file set/content and an unowned sibling sentinel.

- Local macOS Rust 1.98.1: 13 tests pass, including 41 abrupt activation
  boundaries and six reverse-recovery boundaries, repeat recovery, process lock
  contention/release, cancellation before every operation, staged hash mismatch,
  external edits, corrupt/unbound records, path limits, Unix links and sockets.
- One ignored test is the subprocess entrypoint and is executed by its parent
  tests. It is not skipped feature coverage.
- StorageFull, PermissionDenied and WriteZero injections exercise returned-error
  paths. They are labeled simulations.
- The separate [Linux ENOSPC runner](../../scripts/check_enospc.py) runs the actual
  test executable in a 256 KiB tmpfs within a pinned, offline, read-only container.
  Its only host bind is the test binary. It requires an actual StorageFull result,
  verifies original active bytes, and verifies removal of its owned container.
  Local Linux container execution passed with actual StorageFull and verified
  cleanup. The same source also passed all 13 regular Linux tests, including
  the complete abrupt-termination matrix. CI repeats this on its own Linux host.
- Windows CI runs the same process-termination tests and an actual open-file
  test with delete sharing denied. Execution evidence is pending at this checkpoint.
- Cargo fmt, Clippy with warnings denied and the locked dependency audit pass
  locally. The RustSec database checked on September 10 reports zero findings.
  CI requires both Rust platforms before the existing protected documentation
  check can succeed; fresh Python contract/source checks remain required.

File contents and published records use `sync_all`; Unix directories also flush
after creation/rename. Windows directory/power-loss durability is not implemented
or claimed. These tests prove process-termination behavior on their actual host,
not physical disk power loss, Windows 11 game compatibility, antivirus behavior,
Steam discovery, semantic gameinfo/CFG repair, signed-plan authorization or SQLite
commit coordination. Windows CI uses a hosted Windows Server runner, not the
designated player reference machine.

The sandbox assumes no concurrent hostile local actor swaps its ancestors or
replaces the lock inode. Static Unix symlinks/hardlinks/special files and Windows
reparse points are rejected; a race-resistant handle-based Windows filesystem
adapter and complete Windows hardlink defenses remain necessary before real
game paths. Do not adopt this prototype's path checks as that production adapter.

## Run and inspect

Install Rust 1.98.1 with rustfmt/Clippy and Python 3.13.15. The repository pins
both toolchains; Cargo.lock binds the complete dependency graph.

```sh
cargo test --workspace --locked -- --nocapture
cargo clippy --workspace --all-targets --locked -- -D warnings
cargo fmt --all --check
mise run docs
```

On Linux with Docker, `python3 -I -B scripts/check_enospc.py` runs the isolated
storage-exhaustion case. Do not invoke the ignored child entrypoint directly.

For a developer demonstration, choose a nonexistent disposable path:

```sh
cargo run --locked -p modlock-core --example synthetic_journal -- create /tmp/my-modlock-sandbox
cargo run --locked -p modlock-core --example synthetic_journal -- recover /tmp/my-modlock-sandbox
```

Both commands should report `Committed`; inspect `active`, `prior`, `intent.json`
and `commit.json`. This command accepts no downloaded file or game location.
After an error, preserve the sandbox, run recovery once, and inspect any explicit
drift/corruption result. Never remove unknown user files to make recovery pass.

## Next evidence

Accept the exact source after Linux/Windows CI and independent review. Then
extend bounded fixture proof toward the production filesystem adapter and
accepted install-plan semantics, with repeated transactions and receipt/SQLite
coordination. Game/Windows reference-host, rights, outreach, provider and release
gates remain owned separately; SHO-129 and Phase 0 stay incomplete until their
full acceptance criteria have evidence.
