#!/usr/bin/env python3
"""Run every repository gate in a disposable, hash-locked Python environment."""

from __future__ import annotations

import os
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Iterable, Sequence, Tuple

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_PYTHON = (3, 13, 15)


def assert_bootstrap(version: Tuple[int, int, int], executable: Path) -> None:
    if version != EXPECTED_PYTHON:
        raise RuntimeError(
            "fresh checks require Python {}; got {}".format(
                ".".join(map(str, EXPECTED_PYTHON)), ".".join(map(str, version))
            )
        )
    stale_root = (ROOT / ".venv").resolve()
    candidate = executable.absolute()
    if candidate == stale_root or stale_root in candidate.parents:
        raise RuntimeError("fresh checks must not bootstrap from the repository .venv")


def gate_commands(python: Path, manifest: Path) -> Iterable[Sequence[str]]:
    yield [str(python), "scripts/check_source_manifest.py", "--write", str(manifest)]
    yield [str(python), "-m", "pip", "check"]
    yield [str(python), "scripts/check_source_files.py"]
    yield [str(python), "scripts/check_contracts.py"]
    yield [str(python), "-I", "-B", "scripts/check_docs.py"]
    yield [
        str(python),
        "-c",
        (
            "from pathlib import Path; "
            "files=sorted(Path('scripts').glob('*.py'))+sorted(Path('tests').glob('*.py')); "
            "[compile(p.read_text(encoding='utf-8'), str(p), 'exec') for p in files]; "
            "print(f'Python syntax validation passed for {len(files)} files')"
        ),
    ]
    yield ["git", "diff", "--check", "HEAD"]
    yield [str(python), "scripts/check_source_manifest.py", "--verify", str(manifest)]


def run(command: Sequence[str], env: dict[str, str]) -> None:
    print("+ {}".format(" ".join(command)), flush=True)
    subprocess.run(command, cwd=ROOT, env=env, check=True)


def main() -> int:
    assert_bootstrap(sys.version_info[:3], Path(sys.executable))
    environment = os.environ.copy()
    environment.pop("PYTHONPATH", None)
    environment.pop("VIRTUAL_ENV", None)
    environment["PYTHONNOUSERSITE"] = "1"
    environment["PYTHONDONTWRITEBYTECODE"] = "1"
    environment["PIP_NO_INPUT"] = "1"

    with tempfile.TemporaryDirectory(prefix="modlock-contract-check-") as directory:
        venv_root = Path(directory) / "venv"
        run([sys.executable, "-m", "venv", str(venv_root)], environment)
        python = venv_root / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
        run(
            [
                str(python),
                "-m",
                "pip",
                "install",
                "--disable-pip-version-check",
                "--require-hashes",
                "--only-binary=:all:",
                "-r",
                "requirements-contracts.txt",
            ],
            environment,
        )
        for command in gate_commands(python, Path(directory) / "source.sha256"):
            run(command, environment)

    print("Fresh Python 3.13.15 hash-locked gate passed; temporary environment removed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
