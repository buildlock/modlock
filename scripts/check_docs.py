#!/usr/bin/env python3
"""Validate the documentation-only repository without network dependencies."""

from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
LINK = re.compile(r"!?\[[^\]]*\]\(([^)]+)\)")
SKIP_PREFIXES = ("http://", "https://", "mailto:", "#", "/")


def main() -> int:
    failures: list[str] = []
    documents = sorted(path for path in ROOT.rglob("*.md") if ".git" not in path.parts)

    if not documents:
        failures.append("repository contains no Markdown documentation")

    for document in documents:
        relative = document.relative_to(ROOT)
        try:
            content = document.read_text(encoding="utf-8")
        except UnicodeDecodeError as error:
            failures.append(f"{relative}: invalid UTF-8 ({error})")
            continue

        if not content.strip():
            failures.append(f"{relative}: document is empty")
            continue

        for line_number, match in enumerate(LINK.finditer(content), start=1):
            raw_target = match.group(1).strip().strip("<>")
            target = raw_target.split(maxsplit=1)[0]
            if not target or target.startswith(SKIP_PREFIXES):
                continue
            target = unquote(target.split("#", 1)[0])
            if not target:
                continue
            resolved = (document.parent / target).resolve()
            try:
                resolved.relative_to(ROOT.resolve())
            except ValueError:
                failures.append(f"{relative}: link escapes repository: {raw_target}")
                continue
            if not resolved.exists():
                failures.append(f"{relative}: missing local link target: {raw_target}")

    if failures:
        print("Documentation validation failed:")
        for failure in failures:
            print(f"  - {failure}")
        return 1

    print(f"Documentation validation passed for {len(documents)} Markdown files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

