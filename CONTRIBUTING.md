# Contributing to Modlock

Modlock is currently private and in Phase 0. Changes must preserve the safety, provenance, and clean-room boundaries documented in `docs/adr`.

## Before contributing

1. Read `STATUS.md`, `HANDOFF.md`, the relevant feature page, and ADRs.
2. Link work to a Linear issue and state the acceptance criteria.
3. Do not copy implementation code from GPL DMM into an incompatibly licensed Modlock component.
4. Do not add real mod binaries without a fixture rights manifest and review.
5. Never commit credentials, personal CFGs, Steam identifiers, private API payloads, or pre-signed URLs.

## Change workflow

- Branch from current `main`; one coherent change per branch.
- Use conventional commit subjects such as `docs:`, `feat:`, `fix:`, `test:`, `chore:`.
- Update contracts/docs/tests in the same change as behavior.
- Generated code is produced in CI or a documented command and must not be edited manually.
- Pull requests explain user impact, safety/rollback behavior, test evidence, contract/migration changes, and remaining risk.
- Trust boundaries (`contracts`, scanner/parser, installer, updater/signing, auth, moderation/policy) require explicit CODEOWNER review.

## Definition of done

The relevant feature acceptance criteria pass; contracts and migrations are compatible; tests cover failures; security/privacy/accessibility are reviewed; operations/support docs are updated; and no unresolved safety blocker is hidden behind a follow-up.

See [the development handbook](docs/development/handbook.md) for the proposed toolchain and commands.

