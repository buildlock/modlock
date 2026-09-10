#!/usr/bin/env python3
"""Validate every tracked or untracked, non-ignored source file deterministically."""

from __future__ import annotations

import hashlib
import os
import subprocess
import sys
from pathlib import Path

from contract_validation import ROOT, load_json


def repository_files() -> list[Path]:
    result = subprocess.run(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
        cwd=ROOT,
        check=True,
        stdout=subprocess.PIPE,
    )
    relative_paths = [os.fsdecode(value) for value in result.stdout.split(b"\0") if value]
    return [ROOT / relative_path for relative_path in sorted(relative_paths)]


def main() -> int:
    failures = []
    inventory = hashlib.sha256()
    files = repository_files()
    for path in files:
        relative_path = path.relative_to(ROOT).as_posix()
        if path.is_symlink():
            failures.append("{} is a symlink".format(relative_path))
            continue
        if not path.is_file():
            failures.append("{} is not a regular file".format(relative_path))
            continue

        raw = path.read_bytes()
        inventory.update(relative_path.encode("utf-8"))
        inventory.update(b"\0")
        inventory.update(hashlib.sha256(raw).digest())
        inventory.update(b"\0")
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            failures.append("{} is not UTF-8 text".format(relative_path))
            continue
        if "\x00" in text:
            failures.append("{} contains a NUL byte".format(relative_path))
        if "\r" in text:
            failures.append("{} contains a carriage return".format(relative_path))
        for line_number, line in enumerate(text.splitlines(), start=1):
            trailing = line[len(line.rstrip(" \t")) :]
            if trailing:
                # Preserve current-main CommonMark hard breaks, using the
                # same exact two-space rule as its documentation validator.
                if path.suffix == ".md" and trailing == "  " and line[:-2].strip():
                    continue
                failures.append("{}:{} has trailing whitespace".format(relative_path, line_number))
        if path.suffix == ".json":
            try:
                load_json(path)
            except (OSError, UnicodeError, ValueError) as error:
                failures.append("{} is not strict JSON: {}".format(relative_path, error))

    if failures:
        for failure in failures:
            print(failure, file=sys.stderr)
        return 1
    print(
        "Source-file validation passed for {} tracked/untracked files; inventory_sha256={}".format(
            len(files), inventory.hexdigest()
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
