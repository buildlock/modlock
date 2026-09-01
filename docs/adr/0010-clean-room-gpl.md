# ADR-0010: GPL clean-room research boundary

- Status: accepted
- Date: 2026-09-01

## Decision

Deadlock Mod Manager's GPL-3.0 implementation may be inspected to understand observable behavior, interoperability, formats, and failure classes, but Modlock implementation code will not be copied or translated from it into an incompatibly licensed product. Evidence documents record repository revision, behavioral requirement, public format/API source, and independent Modlock acceptance test.

## Consequences

Implementation contributors should work from Modlock requirements/contracts and public format documentation, not copied DMM snippets. Any desired GPL component requires a separate license/product decision and counsel review.

