#!/usr/bin/env python3
"""Capture or verify an explicit source snapshot without pinning evolving main."""

from __future__ import annotations

import hashlib
import argparse
import os
import re
import subprocess
import sys
import unicodedata
from pathlib import Path, PurePosixPath
from typing import Dict, Iterable, List, Optional

ROOT = Path(__file__).resolve().parents[1]
LINE = re.compile(r"^([0-9a-f]{64})  ([^\0\r\n]+)$")


def repository_paths(manifest_path: Optional[Path] = None) -> List[str]:
    result = subprocess.run(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
        cwd=ROOT,
        check=True,
        stdout=subprocess.PIPE,
    )
    try:
        manifest_relative = manifest_path.resolve().relative_to(ROOT).as_posix() if manifest_path else None
    except ValueError:
        manifest_relative = None
    return sorted(
        os.fsdecode(value)
        for value in result.stdout.split(b"\0")
        if value and os.fsdecode(value) != manifest_relative
    )


def load_manifest(path: Path) -> Dict[str, str]:
    entries: Dict[str, str] = {}
    lines = path.read_text(encoding="utf-8").splitlines()
    for line_number, line in enumerate(lines, start=1):
        match = LINE.fullmatch(line)
        if match is None:
            raise ValueError("manifest line {} is not canonical".format(line_number))
        digest, relative_path = match.groups()
        pure_path = PurePosixPath(relative_path)
        if (
            unicodedata.normalize("NFKC", relative_path) != relative_path
            or "\\" in relative_path
            or pure_path.is_absolute()
            or str(pure_path) != relative_path
            or any(part in {"", ".", ".."} for part in pure_path.parts)
        ):
            raise ValueError("manifest path is unsafe: {}".format(relative_path))
        if relative_path in entries:
            raise ValueError("manifest path is duplicated: {}".format(relative_path))
        entries[relative_path] = digest
    if list(entries) != sorted(entries):
        raise ValueError("manifest paths are not sorted")
    return entries


def manifest_failures(
    manifest_path: Path,
    expected_paths: Optional[Iterable[str]] = None,
) -> List[str]:
    try:
        entries = load_manifest(manifest_path)
    except (OSError, UnicodeError, ValueError) as error:
        return [str(error)]

    expected = list(repository_paths(manifest_path) if expected_paths is None else sorted(expected_paths))
    failures = []
    if list(entries) != expected:
        missing = sorted(set(expected) - set(entries))
        extra = sorted(set(entries) - set(expected))
        if missing:
            failures.append("manifest paths missing: {}".format(", ".join(missing)))
        if extra:
            failures.append("manifest paths unlisted by repository inventory: {}".format(", ".join(extra)))

    for relative_path, expected_digest in entries.items():
        candidate = ROOT / relative_path
        current = ROOT
        has_symlink = False
        for part in PurePosixPath(relative_path).parts:
            current = current / part
            if current.is_symlink():
                has_symlink = True
                break
        if has_symlink:
            failures.append("manifest path is a symlink: {}".format(relative_path))
            continue
        if not candidate.is_file():
            failures.append("manifest path is not a regular file: {}".format(relative_path))
            continue
        actual_digest = hashlib.sha256(candidate.read_bytes()).hexdigest()
        if actual_digest != expected_digest:
            failures.append("manifest digest mismatch: {}".format(relative_path))
    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    operation = parser.add_mutually_exclusive_group(required=True)
    operation.add_argument("--write", type=Path, help="write a new snapshot to an unused path")
    operation.add_argument("--verify", type=Path, help="verify an explicitly selected snapshot")
    args = parser.parse_args()
    manifest = args.write or args.verify
    if args.write:
        entries = []
        for relative_path in repository_paths(manifest):
            candidate = ROOT / relative_path
            current = ROOT
            for part in PurePosixPath(relative_path).parts:
                current = current / part
                if current.is_symlink():
                    raise ValueError("manifest path is a symlink: {}".format(relative_path))
            if not candidate.is_file():
                raise ValueError("manifest path is not a regular file: {}".format(relative_path))
            entries.append("{}  {}\n".format(hashlib.sha256(candidate.read_bytes()).hexdigest(), relative_path))
        with manifest.open("x", encoding="utf-8") as output:
            output.writelines(entries)
    failures = manifest_failures(manifest)
    if failures:
        for failure in failures:
            print(failure, file=sys.stderr)
        return 1
    print(
        "Source manifest validation passed for {} repository files; manifest_sha256={}".format(
            len(load_manifest(manifest)), hashlib.sha256(manifest.read_bytes()).hexdigest()
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
