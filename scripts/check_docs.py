#!/usr/bin/env python3
"""Validate the documentation package without network or third-party dependencies."""

from __future__ import annotations

import json
import re
import sys
from collections.abc import Iterator
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
ROOT_RESOLVED = ROOT.resolve()

MARKDOWN_LINK = re.compile(r"!?\[[^\]]*\]\(([^)]+)\)")
REFERENCE_LINK = re.compile(r"^ {0,3}\[[^\]]+\]:\s*(\S+)", re.MULTILINE)
FENCE = re.compile(r"^ {0,3}(`{3,}|~{3,})(.*)$")
FEATURE_ID = re.compile(r"^(WEB|DESK)-\d{3}$")
FEATURE_FILENAME = re.compile(r"^((?:WEB|DESK)-\d{3})-[a-z0-9][a-z0-9-]*\.md$")
FEATURE_HEADER = re.compile(r"^# ((?:WEB|DESK)-\d{3})\s+[—-]\s+\S.+$")
ADR_FILENAME = re.compile(r"^(\d{4})-[a-z0-9][a-z0-9-]*\.md$")
ADR_HEADER = re.compile(r"^# ADR-(\d{4}):\s+\S.+$")
ADR_STATUS = re.compile(r"^- Status:\s*(\S.+)$", re.MULTILINE | re.IGNORECASE)
ADR_DATE = re.compile(r"^- Date:\s*(\d{4}-\d{2}-\d{2})\s*$", re.MULTILINE)
TRAILING_WHITESPACE = re.compile(r"[ \t]+$")

FEATURE_SECTIONS = (
    "Problem and user stories",
    "Scope and non-goals",
    "States and primary flow",
    "Errors and offline behavior",
    "Permissions",
    "Data and API",
    "Safety, privacy, and accessibility",
    "Telemetry",
    "Acceptance criteria",
    "Dependencies and open questions",
)
FEATURE_METADATA_FIELDS = ("ID", "Owner", "Phase", "Status")
FEATURE_STATUSES = {"draft", "validated", "in_progress", "implemented", "retired"}
ADR_STATUSES = {"proposed", "accepted", "superseded", "rejected"}

# These files are the durable spine of the package. Feature and ADR members are
# checked dynamically below so adding a new page does not require editing this list.
REQUIRED_FILES = (
    ".github/workflows/docs.yml",
    "README.md",
    "STATUS.md",
    "HANDOFF.md",
    "DEVELOPMENT_LOG.md",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "scripts/check_docs.py",
    "contracts/README.md",
    "contracts/v1/index.json",
    "contracts/v1/schemas/common.schema.json",
    "contracts/v1/schemas/hosted-release.schema.json",
    "contracts/v1/schemas/external-reference.schema.json",
    "contracts/v1/schemas/install-plan.schema.json",
    "contracts/v1/schemas/profile.schema.json",
    "contracts/v1/schemas/pack.schema.json",
    "contracts/v1/schemas/cfg-setting.schema.json",
    "contracts/v1/schemas/cfg-registry.schema.json",
    "contracts/v1/schemas/fixture-corpus.schema.json",
    "docs/design/2026-09-01-contract-outline/openapi/modlock-v1.openapi.json",
    "docs/design/2026-09-01-contract-outline/schemas/cfg-setting.schema.json",
    "docs/design/2026-09-01-contract-outline/schemas/crosshair.schema.json",
    "docs/design/2026-09-01-contract-outline/schemas/error.schema.json",
    "docs/design/2026-09-01-contract-outline/schemas/external-reference.schema.json",
    "docs/design/2026-09-01-contract-outline/schemas/fixture-manifest.schema.json",
    "docs/design/2026-09-01-contract-outline/schemas/install-plan.schema.json",
    "docs/design/2026-09-01-contract-outline/schemas/pack.schema.json",
    "docs/design/2026-09-01-contract-outline/schemas/profile.schema.json",
    "docs/design/2026-09-01-contract-outline/schemas/release.schema.json",
    "docs/00-executive-brief.md",
    "docs/01-ecosystem-research.md",
    "docs/02-product-specification.md",
    "docs/03-platform-architecture.md",
    "docs/04-desktop-technical-design.md",
    "docs/05-security-moderation-legal.md",
    "docs/06-roadmap.md",
    "docs/07-sources.md",
    "docs/adr/README.md",
    "docs/features/README.md",
    "docs/features/_template.md",
    "docs/product/requirements-traceability.md",
    "docs/project/ownership.md",
    "docs/project/risk-register.md",
    "docs/security/threat-model.md",
    "docs/teardowns/deadlock-mod-manager.md",
    "docs/teardowns/dmm-clean-room-evidence.md",
    "docs/teardowns/gamebanana.md",
    "docs/testing/fixture-catalog.md",
    "docs/testing/test-strategy.md",
)


def repository_files(suffixes: tuple[str, ...]) -> list[Path]:
    """Return matching regular files while excluding Git internals."""
    return sorted(
        path
        for path in ROOT.rglob("*")
        if path.is_file()
        and ".git" not in path.parts
        and path.suffix.lower() in suffixes
    )


def display(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def line_number(content: str, offset: int) -> int:
    return content.count("\n", 0, offset) + 1


def read_utf8(path: Path, failures: list[str]) -> str | None:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError as error:
        failures.append(f"{display(path)}: invalid UTF-8 ({error})")
        return None


def check_required_files(failures: list[str]) -> None:
    for relative in REQUIRED_FILES:
        path = ROOT / relative
        if not path.is_file():
            failures.append(f"missing required package file: {relative}")
        elif path.stat().st_size == 0:
            failures.append(f"required package file is empty: {relative}")


def check_trailing_whitespace(paths: list[Path], failures: list[str]) -> None:
    for path in paths:
        content = read_utf8(path, failures)
        if content is None:
            continue
        for number, line in enumerate(content.splitlines(), start=1):
            match = TRAILING_WHITESPACE.search(line)
            if not match:
                continue
            trailing = match.group(0)
            # Exactly two terminal spaces after visible Markdown content are a
            # CommonMark hard break, not accidental formatting whitespace.
            if path.suffix.lower() == ".md" and trailing == "  " and line[:-2].strip():
                continue
            failures.append(f"{display(path)}:{number}: trailing whitespace")


def check_fences(path: Path, content: str, failures: list[str]) -> None:
    opening: tuple[str, int, int] | None = None
    for number, line in enumerate(content.splitlines(), start=1):
        match = FENCE.match(line)
        if not match:
            continue
        marker, rest = match.groups()
        character = marker[0]
        if opening is None:
            opening = (character, len(marker), number)
            continue
        open_character, open_length, _ = opening
        if character == open_character and len(marker) >= open_length and not rest.strip():
            opening = None
    if opening is not None:
        character, length, number = opening
        failures.append(
            f"{display(path)}:{number}: unclosed Markdown fence "
            f"({character * length})"
        )


def link_targets(content: str) -> Iterator[tuple[int, str]]:
    for pattern in (MARKDOWN_LINK, REFERENCE_LINK):
        for match in pattern.finditer(content):
            yield line_number(content, match.start()), match.group(1).strip()


def normalized_link_target(raw_target: str) -> str:
    target = raw_target.strip()
    if target.startswith("<") and ">" in target:
        return target[1 : target.index(">")]
    # Markdown permits a quoted title after an unbracketed destination.
    return target.split(maxsplit=1)[0]


def is_external_or_absolute(target: str) -> bool:
    parsed = urlsplit(target)
    return bool(parsed.scheme or parsed.netloc or target.startswith("/") or target.startswith("#"))


def resolve_inside_repo(source: Path, target: str) -> Path | None:
    path_part = unquote(urlsplit(target).path)
    if not path_part:
        return None
    candidate = (source.parent / path_part).resolve()
    try:
        candidate.relative_to(ROOT_RESOLVED)
    except ValueError:
        return None
    return candidate


def check_links(path: Path, content: str, failures: list[str]) -> None:
    for number, raw_target in link_targets(content):
        target = normalized_link_target(raw_target)
        if not target or is_external_or_absolute(target):
            continue
        resolved = resolve_inside_repo(path, target)
        if resolved is None:
            failures.append(
                f"{display(path)}:{number}: local link escapes repository: {raw_target}"
            )
        elif not resolved.exists():
            failures.append(
                f"{display(path)}:{number}: missing local link target: {raw_target}"
            )


def check_markdown(documents: list[Path], failures: list[str]) -> None:
    if not documents:
        failures.append("repository contains no Markdown documentation")
        return
    for document in documents:
        content = read_utf8(document, failures)
        if content is None:
            continue
        if not content.strip():
            failures.append(f"{display(document)}: document is empty")
            continue
        check_fences(document, content, failures)
        check_links(document, content, failures)


def check_json(documents: list[Path], failures: list[str]) -> dict[Path, object]:
    parsed: dict[Path, object] = {}
    for document in documents:
        content = read_utf8(document, failures)
        if content is None:
            continue
        try:
            parsed[document] = json.loads(content)
        except json.JSONDecodeError as error:
            failures.append(
                f"{display(document)}:{error.lineno}:{error.colno}: invalid JSON "
                f"({error.msg})"
            )
    return parsed


def walk_refs(value: object, location: str = "$") -> Iterator[tuple[str, object]]:
    if isinstance(value, dict):
        for key, child in value.items():
            child_location = f"{location}.{key}"
            if key == "$ref":
                yield child_location, child
            yield from walk_refs(child, child_location)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk_refs(child, f"{location}[{index}]")


def check_contract_refs(parsed_json: dict[Path, object], failures: list[str]) -> None:
    contracts_root = ROOT / "contracts"
    for document, value in parsed_json.items():
        deferred_root = ROOT / "docs/design/2026-09-01-contract-outline"
        if contracts_root not in document.parents and deferred_root not in document.parents:
            continue
        for location, raw_ref in walk_refs(value):
            if not isinstance(raw_ref, str):
                failures.append(f"{display(document)}:{location}: $ref must be a string")
                continue
            if raw_ref.startswith("#") or is_external_or_absolute(raw_ref):
                continue
            resolved = resolve_inside_repo(document, raw_ref)
            if resolved is None:
                failures.append(
                    f"{display(document)}:{location}: relative $ref escapes repository: {raw_ref}"
                )
            elif not resolved.is_file():
                failures.append(
                    f"{display(document)}:{location}: missing relative $ref target: {raw_ref}"
                )


def metadata_table(content: str) -> dict[str, str]:
    values: dict[str, str] = {}
    for line in content.splitlines():
        match = re.match(r"^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$", line)
        if match:
            field, value = match.groups()
            values[field.strip()] = value.strip().strip("`")
    return values


def section_body(content: str, heading: str) -> str | None:
    match = re.search(rf"^## {re.escape(heading)}\s*$", content, re.MULTILINE)
    if not match:
        return None
    next_heading = re.search(r"^## ", content[match.end() :], re.MULTILINE)
    end = match.end() + next_heading.start() if next_heading else len(content)
    return content[match.end() : end].strip()


def check_feature_wiki(failures: list[str]) -> None:
    feature_root = ROOT / "docs/features"
    index_path = feature_root / "README.md"
    feature_files = sorted(
        list((feature_root / "website").glob("*.md"))
        + list((feature_root / "desktop").glob("*.md"))
    )
    if not feature_files:
        failures.append("feature wiki contains no WEB/DESK feature pages")
        return

    seen: dict[str, Path] = {}
    for path in feature_files:
        filename_match = FEATURE_FILENAME.fullmatch(path.name)
        if not filename_match:
            failures.append(f"{display(path)}: feature filename does not contain a valid ID")
            continue
        filename_id = filename_match.group(1)
        expected_prefix = "WEB" if path.parent.name == "website" else "DESK"
        if not filename_id.startswith(expected_prefix + "-"):
            failures.append(
                f"{display(path)}: {filename_id} is in the wrong feature directory"
            )

        content = read_utf8(path, failures)
        if content is None:
            continue
        first_line = content.splitlines()[0] if content.splitlines() else ""
        header_match = FEATURE_HEADER.fullmatch(first_line)
        if not header_match:
            failures.append(f"{display(path)}: invalid feature H1 header")
            header_id = None
        else:
            header_id = header_match.group(1)
            if header_id != filename_id:
                failures.append(
                    f"{display(path)}: header ID {header_id} does not match filename ID {filename_id}"
                )

        metadata = metadata_table(content)
        for field in FEATURE_METADATA_FIELDS:
            if not metadata.get(field):
                failures.append(f"{display(path)}: missing feature metadata field {field}")
        metadata_id = metadata.get("ID")
        if metadata_id and metadata_id != filename_id:
            failures.append(
                f"{display(path)}: metadata ID {metadata_id} does not match filename ID {filename_id}"
            )
        status = metadata.get("Status", "").lower()
        if status and status not in FEATURE_STATUSES:
            failures.append(f"{display(path)}: unsupported feature status: {metadata['Status']}")

        for heading in FEATURE_SECTIONS:
            body = section_body(content, heading)
            if body is None:
                failures.append(f"{display(path)}: missing required section: {heading}")
            elif not body:
                failures.append(f"{display(path)}: required section is empty: {heading}")

        if filename_id in seen:
            failures.append(
                f"duplicate feature ID {filename_id}: {display(seen[filename_id])} and {display(path)}"
            )
        else:
            seen[filename_id] = path

    index_content = read_utf8(index_path, failures) if index_path.is_file() else None
    if index_content is None:
        return
    index_ids = re.findall(r"^\|\s*((?:WEB|DESK)-\d{3})\s*\|", index_content, re.MULTILINE)
    index_counts = {feature_id: index_ids.count(feature_id) for feature_id in set(index_ids)}
    for feature_id, path in seen.items():
        count = index_counts.get(feature_id, 0)
        if count != 1:
            failures.append(
                f"docs/features/README.md: {feature_id} has {count} index entries; expected 1 "
                f"for {display(path)}"
            )
    for feature_id, count in sorted(index_counts.items()):
        if not FEATURE_ID.fullmatch(feature_id):
            failures.append(f"docs/features/README.md: invalid indexed feature ID {feature_id}")
        elif feature_id not in seen:
            failures.append(f"docs/features/README.md: indexed feature has no page: {feature_id}")
        elif count != 1:
            failures.append(
                f"docs/features/README.md: duplicate index entries for {feature_id}: {count}"
            )


def check_adrs(failures: list[str]) -> None:
    adr_files = sorted((ROOT / "docs/adr").glob("[0-9][0-9][0-9][0-9]-*.md"))
    if not adr_files:
        failures.append("ADR directory contains no numbered decision records")
        return
    seen_ids: dict[str, Path] = {}
    for path in adr_files:
        filename_match = ADR_FILENAME.fullmatch(path.name)
        if not filename_match:
            failures.append(f"{display(path)}: invalid ADR filename")
            continue
        filename_id = filename_match.group(1)
        content = read_utf8(path, failures)
        if content is None:
            continue
        first_line = content.splitlines()[0] if content.splitlines() else ""
        header_match = ADR_HEADER.fullmatch(first_line)
        if not header_match:
            failures.append(f"{display(path)}: invalid ADR H1 header")
        elif header_match.group(1) != filename_id:
            failures.append(
                f"{display(path)}: ADR header ID {header_match.group(1)} "
                f"does not match filename ID {filename_id}"
            )
        if filename_id in seen_ids:
            failures.append(
                f"duplicate ADR ID {filename_id}: {display(seen_ids[filename_id])} and {display(path)}"
            )
        else:
            seen_ids[filename_id] = path

        status_match = ADR_STATUS.search(content)
        if not status_match:
            failures.append(f"{display(path)}: missing ADR status")
        else:
            words = set(re.findall(r"[a-z_]+", status_match.group(1).lower()))
            if not words.intersection(ADR_STATUSES):
                failures.append(
                    f"{display(path)}: ADR status must include one of "
                    f"{', '.join(sorted(ADR_STATUSES))}"
                )
        if not ADR_DATE.search(content):
            failures.append(f"{display(path)}: missing or invalid YYYY-MM-DD ADR date")
        if section_body(content, "Decision") is None:
            failures.append(f"{display(path)}: missing Decision section")


def main() -> int:
    failures: list[str] = []
    check_required_files(failures)

    markdown = repository_files((".md",))
    json_documents = repository_files((".json",))
    checked_text = repository_files((".md", ".json", ".yml", ".yaml", ".py"))

    check_trailing_whitespace(checked_text, failures)
    check_markdown(markdown, failures)
    parsed_json = check_json(json_documents, failures)
    check_contract_refs(parsed_json, failures)
    check_feature_wiki(failures)
    check_adrs(failures)

    if failures:
        print(f"Documentation validation failed with {len(failures)} error(s):")
        for failure in failures:
            print(f"  - {failure}")
        return 1

    feature_count = len(list((ROOT / "docs/features/website").glob("WEB-*.md"))) + len(
        list((ROOT / "docs/features/desktop").glob("DESK-*.md"))
    )
    adr_count = len(list((ROOT / "docs/adr").glob("[0-9][0-9][0-9][0-9]-*.md")))
    print(
        "Documentation validation passed: "
        f"{len(markdown)} Markdown files, {len(json_documents)} JSON files, "
        f"{feature_count} feature pages, and {adr_count} ADRs."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
