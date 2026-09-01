# Modlock agent instructions

Read `STATUS.md`, `HANDOFF.md`, `docs/README.md`, the relevant feature page, and ADRs before changing behavior.

- Preserve user work and keep `main` clean through reviewed, scoped changes.
- `contracts/` is the source of truth for portable/network shapes; generated code is not hand-edited.
- The desktop core must remain UI-independent, unprivileged, transactional, bounded, and recoverable.
- Do not copy GPL DMM implementation code. Implement from Modlock contracts, public format documentation, and clean-room evidence.
- Do not add real mod binaries without an approved fixture rights manifest.
- Never commit secrets, private API responses, personal Steam/CFG data, pre-signed URLs, signing material, or tokens.
- Use synthetic/disposable game trees for destructive tests.
- Unknown game/API/policy behavior is labeled and fails safely; do not turn assumptions into compatibility claims.
- Update feature acceptance criteria, traceability, tests, operations/support docs, status, and handoff with relevant changes.
- Run `python3 scripts/check_docs.py` until the code toolchain/`just docs` supersedes it.

