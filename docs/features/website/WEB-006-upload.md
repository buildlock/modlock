# WEB-006 — Upload

| Field | Value |
|---|---|
| ID | `WEB-006` |
| Owner | Platform, scanner, and trust |
| Phase | Phase 1 |
| Status | Draft |

## Problem and user stories

Creators need reliable large-file upload without granting public access before validation. As a creator, I want resumable direct upload and exact scan feedback so I can correct unsafe packaging before publication.

## Scope and non-goals

**In scope:** Draft-scoped multipart sessions, quarantine storage, declared metadata/rights, size/checksum validation, resume, completion, scan job creation, progress, cancellation, and actionable findings.

**Non-goals:** Uploading directly to public storage, overwriting published bytes, executing uploaded content, or allowing an uploader to certify their own scan.

## States and primary flow

States are draft, creating_session, uploading, paused, completing, quarantined, scanning, needs_action, needs_moderation, rejected, and cancelled. The API issues short-lived object-scoped parts; completion verifies object identity and idempotently starts scanning.

## Errors and offline behavior

Interrupted parts can resume until session expiry. Wrong length/hash, expired credentials, quota, unsafe archive, and scanner timeout produce distinct errors. Offline pauses browser upload; no publication transition occurs.

## Permissions

Creator owners/maintainers upload only to owned drafts. Scanner identities read quarantine and write attestations but cannot publish. Moderators cannot alter scan output.

## Data and API

Uses upload_sessions, blobs, release_files, scan_jobs/reports, licenses, and audit events. Planned create/complete/status/cancel contracts require idempotency keys and immutable object keys.

## Safety, privacy, and accessibility

Quarantine is non-public, isolated, and scanned without outbound network. Credentials are short-lived and never logged. Upload progress, pause/error/retry, and individual file findings are announced and keyboard reachable.

## Telemetry

Upload size buckets, duration, resume rate, completion failures, scan queue latency, and finding categories; exclude filenames when they may contain personal data.

## Acceptance criteria

- Upload credentials cannot read, list, overwrite, or publish objects.
- Completion is idempotent and verifies exact size and digest before scan enqueue.
- An interrupted multipart upload can resume without duplicate public or scan records.
- Unsafe content remains unavailable through every public/download endpoint.

## Dependencies and open questions

Depends on WEB-005, WEB-007, scanner contracts, object-store ADR, SHO-124 fixtures, and SHO-127 schemas. RAR/7z support remains OQ4.

