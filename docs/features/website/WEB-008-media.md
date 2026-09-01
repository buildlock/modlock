# WEB-008 — Media management

| Field | Value |
|---|---|
| ID | `WEB-008` |
| Owner | Creator experience and scanner |
| Phase | Phase 1 |
| Status | Draft |

## Problem and user stories

Creators need to showcase mods while players need safe, accurately labelled previews. As a creator, I want to upload and order images/video with captions and warnings so users can evaluate a release.

## Scope and non-goals

**In scope:** Image/video upload, safe re-encoding, thumbnails, alt text/captions, ordering, cover selection, content warnings, ownership, and immutable processed assets.

**Non-goals:** Serving raw originals publicly, auto-playing audio/video, hosting unrelated media, or treating preview media as compatibility evidence.

## States and primary flow

States are uploading, processing, needs_action, ready, restricted, rejected, and deleted. Media enters private quarantine, is decoded/re-encoded under limits, reviewed when required, then attached to a mod/release.

## Errors and offline behavior

Malformed or unsupported media reports exact supported constraints. Processing can retry idempotently. Failed media does not block saving other release metadata; website editing requires connectivity.

## Permissions

Owners/maintainers manage media on owned drafts; moderators restrict/remove media; public users see only processed approved assets consistent with age/content controls.

## Data and API

Uses media objects, processed variants, captions/alt text, content rating, ownership, hashes, and audit events. Planned upload/complete/status/reorder/attach/delete routes reuse quarantine controls.

## Safety, privacy, and accessibility

Strip metadata such as EXIF location, decode in isolation, enforce pixel/frame/time limits, and prevent SVG/script execution. Alt text is required for meaningful media; video requires captions or descriptive transcript where necessary.

## Telemetry

Processing duration/failure category, bytes/pixels buckets, missing accessibility metadata, and public media loads. Do not retain extracted metadata beyond security review needs.

## Acceptance criteria

- Public URLs expose only re-encoded approved derivatives, never quarantine originals.
- Location/device metadata is absent from published files.
- Restricted media remains gated in cards, detail pages, embeds, and direct asset requests.
- Keyboard users can navigate, pause, and select media; meaningful images have alt text.

## Dependencies and open questions

Depends on WEB-003/006/007/011 and media policy. Storage/CDN and processing limits require ADRs and fixture tests.

