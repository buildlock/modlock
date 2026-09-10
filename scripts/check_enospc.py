#!/usr/bin/env python3
"""Run the Linux core's real ENOSPC test in a disposable 256 KiB tmpfs."""

from __future__ import annotations

import json
import argparse
import platform
import subprocess
import sys
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGE = "ubuntu@sha256:224a1869083a311ef3f13648a154ba79832fbef6364d31493642ca03082da254"
TEST = "synthetic::tests::real_storage_full_during_staging_restores_original"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--test-binary", type=Path, help="explicit Linux executable built from this source")
    args = parser.parse_args()
    binaries = [args.test_binary.resolve()] if args.test_binary else []
    if not binaries:
        if platform.system() != "Linux":
            raise SystemExit("Build on Linux or supply its explicit --test-binary; Docker is required.")
        build = subprocess.run(
            ["cargo", "+1.98.1", "test", "--workspace", "--locked", "--no-run", "--message-format=json"],
            cwd=ROOT, check=True, text=True, stdout=subprocess.PIPE,
        )
        for line in build.stdout.splitlines():
            artifact = json.loads(line)
            if (artifact.get("reason") == "compiler-artifact"
                    and artifact.get("target", {}).get("name") == "modlock_core"
                    and artifact.get("profile", {}).get("test")
                    and artifact.get("executable")):
                binaries.append(Path(artifact["executable"]).resolve())
    if len(binaries) != 1 or not binaries[0].is_file():
        raise SystemExit("Expected exactly one compiled core test executable.")
    container = "modlock-enospc-" + uuid.uuid4().hex
    # The executable is the only host bind. No source tree, user home, credentials,
    # Docker socket, or other host path enters this offline, read-only container.
    command = [
        "docker", "run", "--rm", "--name", container, "--network=none", "--read-only",
        "--cap-drop=ALL", "--security-opt=no-new-privileges", "--pids-limit=64",
        "--memory=128m", "--cpus=1", "--tmpfs", "/proof:rw,noexec,nosuid,size=256k",
        "--env", "TMPDIR=/proof", "--env", "MODLOCK_PROOF_ENOSPC=1",
        "--mount", "type=bind,source={},target=/journal-proof,readonly".format(binaries[0]),
        IMAGE, "/journal-proof", "--exact", TEST, "--ignored", "--nocapture",
    ]
    try:
        subprocess.run(command, cwd=ROOT, check=True, timeout=180)
    finally:
        # Only this randomly named fixture can be removed, even after timeout.
        inventory = subprocess.run(
            ["docker", "container", "ls", "--all", "--filter", "name=^/{}$".format(container), "--format", "{{.Names}}"],
            check=True, text=True, stdout=subprocess.PIPE,
        ).stdout.splitlines()
        if inventory:
            if inventory != [container]:
                raise RuntimeError("Unexpected fixture inventory; refusing cleanup.")
            subprocess.run(["docker", "rm", "--force", container], check=True, stdout=subprocess.DEVNULL)
        remaining = subprocess.run(
            ["docker", "container", "ls", "--all", "--filter", "name=^/{}$".format(container), "--format", "{{.Names}}"],
            check=True, text=True, stdout=subprocess.PIPE,
        ).stdout.strip()
        if remaining:
            raise RuntimeError("Fixture cleanup could not be verified.")
        print("ENOSPC fixture cleanup verified: zero owned containers; tmpfs discarded.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
