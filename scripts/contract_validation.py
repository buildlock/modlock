#!/usr/bin/env python3
"""Deterministic V1 contract loading, JSON Schema, and semantic validation."""

from __future__ import annotations

import copy
import base64
import binascii
import hashlib
import json
import math
import re
import unicodedata
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path, PurePosixPath
from typing import Any, Dict, Iterable, List, Mapping, Optional, Sequence, Tuple
from urllib.parse import urlsplit

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
INDEX_PATH = ROOT / "contracts" / "v1" / "index.json"
VALID_FIXTURE_DIR = ROOT / "fixtures" / "contracts" / "valid"


@dataclass(frozen=True, order=True)
class Violation:
    kind: str
    path: str
    code: str

    def as_dict(self) -> Dict[str, str]:
        return {"kind": self.kind, "path": self.path, "code": self.code}


def load_json(path: Path) -> Any:
    def reject_constant(value: str) -> None:
        raise ValueError("non-finite JSON number is forbidden: {}".format(value))

    def finite_float(value: str) -> float:
        parsed = float(value)
        if not math.isfinite(parsed):
            raise ValueError("non-finite JSON number is forbidden: {}".format(value))
        return parsed

    def unique_object(pairs: Sequence[Tuple[str, Any]]) -> Dict[str, Any]:
        result: Dict[str, Any] = {}
        for key, value in pairs:
            if key in result:
                raise ValueError("duplicate JSON object key is forbidden: {}".format(key))
            result[key] = value
        return result

    with path.open("r", encoding="utf-8") as handle:
        return json.load(
            handle,
            object_pairs_hook=unique_object,
            parse_constant=reject_constant,
            parse_float=finite_float,
        )


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def canonical_json_sha256(value: Any) -> str:
    """Hash the V1 JCS-compatible subset: ASCII keys and no floating-point values."""

    def validate_subset(node: Any) -> None:
        if isinstance(node, float):
            raise ValueError("floating-point values are outside the V1 canonical digest subset")
        if isinstance(node, int) and not isinstance(node, bool):
            if not -(2**53 - 1) <= node <= 2**53 - 1:
                raise ValueError("integer is outside the V1 canonical digest safe range")
        if isinstance(node, Mapping):
            for key, child in node.items():
                if not isinstance(key, str) or not key.isascii():
                    raise ValueError("canonical digest object keys must be ASCII strings")
                validate_subset(child)
        elif isinstance(node, list):
            for child in node:
                validate_subset(child)
        elif node is not None and not isinstance(node, (str, int, bool)):
            raise ValueError("unsupported canonical digest value type")

    validate_subset(value)
    encoded = json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False,
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def rights_sha256(document: Mapping[str, Any]) -> str:
    return canonical_json_sha256(document["rights"])


PACK_VERSION_FIELDS = (
    "schema_version",
    "contract",
    "pack_id",
    "pack_version_id",
    "version",
    "creator",
    "provenance",
    "rights_scope",
    "embedded_payloads",
    "items",
)


def pack_version_sha256(document: Mapping[str, Any]) -> str:
    return canonical_json_sha256({key: document[key] for key in PACK_VERSION_FIELDS})


REGISTRY_SIGNATURE_PAYLOAD_FIELDS = (
    "schema_version",
    "contract",
    "registry_id",
    "registry_version",
    "game",
    "settings",
)


def registry_signature_payload_sha256(document: Mapping[str, Any]) -> str:
    return canonical_json_sha256({key: document[key] for key in REGISTRY_SIGNATURE_PAYLOAD_FIELDS})


def json_pointer(parts: Iterable[Any]) -> str:
    encoded = []
    for part in parts:
        encoded.append(str(part).replace("~", "~0").replace("/", "~1"))
    return "/" + "/".join(encoded) if encoded else "/"


class ContractStore:
    def __init__(self) -> None:
        index = load_json(INDEX_PATH)
        expected_index_keys = {"schema_version", "contract", "contracts", "supporting_schemas"}
        if set(index) != expected_index_keys:
            raise ValueError("contract index is not closed-world")
        if index["schema_version"] != 1 or index["contract"] != "modlock.contract-index":
            raise ValueError("contract index version/discriminator mismatch")

        entries = list(index["contracts"]) + list(index["supporting_schemas"])
        self.schemas_by_name: Dict[str, Mapping[str, Any]] = {}
        self.paths_by_name: Dict[str, Path] = {}
        resources: List[Tuple[str, Resource[Any]]] = []
        seen_ids = set()

        for entry in entries:
            if set(entry) != {"name", "schema_id", "path"}:
                raise ValueError("contract index entry is not closed-world")
            schema_path = (INDEX_PATH.parent / entry["path"]).resolve()
            schema_path.relative_to(ROOT.resolve())
            schema = load_json(schema_path)
            if schema.get("$id") != entry["schema_id"]:
                raise ValueError("schema id mismatch for {}".format(entry["name"]))
            if entry["schema_id"] in seen_ids:
                raise ValueError("duplicate schema id: {}".format(entry["schema_id"]))
            seen_ids.add(entry["schema_id"])
            Draft202012Validator.check_schema(schema)
            self.schemas_by_name[entry["name"]] = schema
            self.paths_by_name[entry["name"]] = schema_path
            resources.append((entry["schema_id"], Resource.from_contents(schema)))

        self.contract_names = tuple(entry["name"] for entry in index["contracts"])
        self.registry = Registry().with_resources(resources)
        self.validators = {
            name: Draft202012Validator(
                self.schemas_by_name[name],
                registry=self.registry,
                format_checker=FORMAT_CHECKER,
            )
            for name in self.contract_names
        }

    def validate_schema(self, contract_name: str, instance: Any) -> List[Violation]:
        errors = sorted(
            self.validators[contract_name].iter_errors(instance),
            key=lambda error: (
                tuple(str(part) for part in error.absolute_path),
                str(error.validator),
                error.message,
            ),
        )
        return [
            Violation(
                kind="schema",
                path=json_pointer(error.absolute_path),
                code="schema.{}".format(error.validator),
            )
            for error in errors
        ]

    def validate(self, contract_name: str, instance: Any) -> List[Violation]:
        violations = self.validate_schema(contract_name, instance)
        if not violations:
            violations.extend(semantic_violations(contract_name, instance))
        return sorted(violations)


def iter_object_schemas(node: Any, path: Tuple[Any, ...] = ()) -> Iterable[Tuple[Tuple[Any, ...], Mapping[str, Any]]]:
    if isinstance(node, Mapping):
        if node.get("type") == "object":
            yield path, node
        for key, value in node.items():
            yield from iter_object_schemas(value, path + (key,))
    elif isinstance(node, list):
        for index, value in enumerate(node):
            yield from iter_object_schemas(value, path + (index,))


def closed_world_schema_violations(store: ContractStore) -> List[str]:
    failures = []
    for name, schema in store.schemas_by_name.items():
        for path, object_schema in iter_object_schemas(schema):
            if object_schema.get("additionalProperties") is not False:
                failures.append("{}{} lacks additionalProperties=false".format(name, json_pointer(path)))
    return failures


UTC_TIMESTAMP = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$")
HOST_LABEL = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$")
URI_HEXDIGITS = frozenset("0123456789ABCDEFabcdef")
URI_UNRESERVED = frozenset("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~")
URI_SUB_DELIMITERS = frozenset("!$&'()*+,;=")
URI_PATH_CHARACTERS = URI_UNRESERVED | URI_SUB_DELIMITERS | frozenset(":@/")
URI_QUERY_FRAGMENT_CHARACTERS = URI_PATH_CHARACTERS | frozenset("?")


def parse_timestamp(value: Any) -> Optional[datetime]:
    if not isinstance(value, str) or UTC_TIMESTAMP.fullmatch(value) is None:
        return None
    try:
        return datetime.fromisoformat(value[:-1] + "+00:00")
    except (OverflowError, ValueError):
        return None


def valid_hostname(value: Any) -> bool:
    if not isinstance(value, str) or not value or len(value) > 253:
        return False
    if unicodedata.normalize("NFKC", value) != value or not value.isascii():
        return False
    return all(HOST_LABEL.fullmatch(label) is not None for label in value.split("."))


def valid_uri_component(value: str, allowed_characters: frozenset[str]) -> bool:
    if not value.isascii():
        return False
    index = 0
    while index < len(value):
        character = value[index]
        if character == "%":
            if (
                index + 2 >= len(value)
                or value[index + 1] not in URI_HEXDIGITS
                or value[index + 2] not in URI_HEXDIGITS
            ):
                return False
            index += 3
            continue
        if character not in allowed_characters:
            return False
        index += 1
    return True


def parsed_https_url(value: Any) -> Optional[Any]:
    if not isinstance(value, str) or len(value) > 2048:
        return None
    if unicodedata.normalize("NFKC", value) != value:
        return None
    if not value.isascii() or any(character.isspace() or character == "\\" for character in value):
        return None
    try:
        parsed = urlsplit(value)
        hostname = parsed.hostname
        port = parsed.port
    except (UnicodeError, ValueError):
        return None
    if parsed.scheme != "https" or not parsed.netloc or parsed.username is not None or parsed.password is not None:
        return None
    if hostname is None or not valid_hostname(hostname):
        return None
    if port is not None and not 1 <= port <= 65535:
        return None
    expected_netloc = hostname if port is None else "{}:{}".format(hostname, port)
    if parsed.netloc.casefold() != expected_netloc.casefold():
        return None
    if not valid_uri_component(parsed.path, URI_PATH_CHARACTERS):
        return None
    if not valid_uri_component(parsed.query, URI_QUERY_FRAGMENT_CHARACTERS):
        return None
    if not valid_uri_component(parsed.fragment, URI_QUERY_FRAGMENT_CHARACTERS):
        return None
    return parsed


FORMAT_CHECKER = FormatChecker()


@FORMAT_CHECKER.checks("modlock-date-time")
def valid_timestamp_format(value: Any) -> bool:
    return parse_timestamp(value) is not None


@FORMAT_CHECKER.checks("modlock-https-url")
def valid_https_url_format(value: Any) -> bool:
    return parsed_https_url(value) is not None


@FORMAT_CHECKER.checks("modlock-hostname")
def valid_hostname_format(value: Any) -> bool:
    return valid_hostname(value)


WINDOWS_RESERVED_NAMES = {
    "con",
    "prn",
    "aux",
    "nul",
    "clock$",
    "conin$",
    "conout$",
    "com0",
    "com1",
    "com2",
    "com3",
    "com4",
    "com5",
    "com6",
    "com7",
    "com8",
    "com9",
    "lpt0",
    "lpt1",
    "lpt2",
    "lpt3",
    "lpt4",
    "lpt5",
    "lpt6",
    "lpt7",
    "lpt8",
    "lpt9",
}

WINDOWS_FORBIDDEN_CHARACTERS = frozenset('<>"|?*')


def safe_relative_path(value: str) -> bool:
    normalized = unicodedata.normalize("NFKC", value)
    if normalized != value or not normalized or len(normalized) > 240:
        return False
    if "\\" in normalized or normalized.startswith("/"):
        return False
    if any(
        character in WINDOWS_FORBIDDEN_CHARACTERS
        or unicodedata.category(character) in {"Cc", "Cf", "Cs", "Zl", "Zp"}
        for character in normalized
    ):
        return False
    if re.match(r"^[A-Za-z]:", normalized) or ":" in normalized:
        return False
    path = PurePosixPath(normalized)
    parts = normalized.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        return False
    for part in parts:
        if part.endswith((" ", ".")):
            return False
        stem = part.split(".", 1)[0].casefold()
        if stem in WINDOWS_RESERVED_NAMES:
            return False
    return not path.is_absolute()


def normalized_windows_path(value: str) -> str:
    return unicodedata.normalize("NFKC", value).casefold()


def safe_artifact_filename(value: str) -> bool:
    normalized = unicodedata.normalize("NFKC", value)
    return "/" not in normalized and "\\" not in normalized and safe_relative_path(value)


def path_has_symlink(root: Path, relative_path: str) -> bool:
    current = root
    for part in PurePosixPath(relative_path).parts:
        current = current / part
        if current.is_symlink():
            return True
    return False


def source_key(source: Mapping[str, Any]) -> str:
    return json.dumps(source, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def duplicate_values(values: Sequence[str]) -> set:
    seen = set()
    duplicates = set()
    for value in values:
        if value in seen:
            duplicates.add(value)
        seen.add(value)
    return duplicates


def violation(code: str, path: str) -> Violation:
    return Violation(kind="semantic", path=path, code=code)


def semantic_violations(contract_name: str, instance: Mapping[str, Any]) -> List[Violation]:
    handlers = {
        "hosted-release": validate_hosted_release,
        "external-reference": validate_external_reference,
        "install-plan": validate_install_plan,
        "profile": validate_profile,
        "pack": validate_pack,
        "cfg-setting": validate_cfg_setting_document,
        "cfg-registry": validate_cfg_registry,
        "fixture-corpus": validate_fixture_corpus,
    }
    return sorted(handlers[contract_name](instance))


def validate_hosted_release(document: Mapping[str, Any]) -> List[Violation]:
    issues = []
    if document["provenance"]["submitted_by_creator_id"] != document["creator"]["creator_id"]:
        issues.append(violation("hosted.provenance_creator_mismatch", "/provenance/submitted_by_creator_id"))

    variant_ids = [variant["variant_id"] for variant in document["variants"]]
    if duplicate_values(variant_ids):
        issues.append(violation("hosted.duplicate_variant_id", "/variants"))

    file_ids = []
    source_paths = []
    for variant_index, variant in enumerate(document["variants"]):
        for file_index, file_record in enumerate(variant["files"]):
            file_ids.append(file_record["file_id"])
            source_paths.append(normalized_windows_path(file_record["source_path"]))
            prefix = "/variants/{}/files/{}".format(variant_index, file_index)
            if not safe_relative_path(file_record["source_path"]):
                issues.append(violation("path.unsafe_relative", prefix + "/source_path"))
            if file_record["object_sha256"] != file_record["scan"]["artifact_sha256"]:
                issues.append(violation("hosted.scan_digest_mismatch", prefix + "/scan/artifact_sha256"))
            if document["state"] == "published" and file_record["scan"]["state"] != "clean":
                issues.append(violation("hosted.published_scan_not_clean", prefix + "/scan/state"))
            if document["state"] == "published":
                completed_at = parse_timestamp(file_record["scan"]["completed_at"])
                if completed_at < parse_timestamp(document["created_at"]):
                    issues.append(violation("hosted.scan_before_release_creation", prefix + "/scan/completed_at"))
                if completed_at > parse_timestamp(document["published_at"]):
                    issues.append(violation("hosted.scan_after_publication", prefix + "/scan/completed_at"))

    if duplicate_values(file_ids):
        issues.append(violation("hosted.duplicate_file_id", "/variants"))
    if duplicate_values(source_paths):
        issues.append(violation("hosted.duplicate_source_path", "/variants"))

    if "published_at" in document:
        if parse_timestamp(document["published_at"]) < parse_timestamp(document["created_at"]):
            issues.append(violation("hosted.publication_before_creation", "/published_at"))
    if document["state"] == "published":
        if parse_timestamp(document["rights"]["uploader_affirmed_at"]) > parse_timestamp(document["published_at"]):
            issues.append(violation("hosted.rights_affirmed_after_publication", "/rights/uploader_affirmed_at"))
        if document["rights"]["hosting_authorization"] != "affirmed":
            issues.append(violation("hosted.published_without_hosting_authorization", "/rights/hosting_authorization"))
        if document["rights"]["redistribution"] == "unknown":
            issues.append(violation("hosted.published_with_unknown_redistribution", "/rights/redistribution"))
        if document["rights"]["modification"] == "unknown":
            issues.append(violation("hosted.published_with_unknown_modification_rights", "/rights/modification"))
        if document["rights"]["third_party_assets"] == "unknown":
            issues.append(violation("hosted.published_with_unknown_third_party_assets", "/rights/third_party_assets"))
        if document["game"]["compatibility_state"] != "tested":
            issues.append(violation("hosted.published_without_tested_build", "/game/compatibility_state"))
    if document["game"]["compatibility_state"] == "tested" and not document["game"]["tested_build_ids"]:
        issues.append(violation("hosted.tested_state_without_build_ids", "/game/tested_build_ids"))
    if document["game"]["compatibility_state"] == "unknown" and document["game"]["tested_build_ids"]:
        issues.append(violation("hosted.unknown_state_with_build_ids", "/game/tested_build_ids"))
    if document["game"]["tested_build_ids"] != sorted(document["game"]["tested_build_ids"]):
        issues.append(violation("hosted.tested_build_ids_noncanonical", "/game/tested_build_ids"))
    if document["capabilities"] != sorted(document["capabilities"]):
        issues.append(violation("hosted.capabilities_noncanonical", "/capabilities"))
    if "revocation" in document and document["state"] != "revoked":
        issues.append(violation("hosted.revocation_state_mismatch", "/revocation"))
    if "revocation" in document:
        revoked_at = parse_timestamp(document["revocation"]["revoked_at"])
        if revoked_at < parse_timestamp(document["created_at"]):
            issues.append(violation("hosted.revocation_before_creation", "/revocation/revoked_at"))
        if "published_at" in document and revoked_at < parse_timestamp(document["published_at"]):
            issues.append(violation("hosted.revocation_before_publication", "/revocation/revoked_at"))
    return issues


def validate_external_reference(document: Mapping[str, Any]) -> List[Violation]:
    issues = []
    provider = document["provider"]["kind"]
    provenance = document["provenance"]["kind"]
    expected_provenance = "gamebanana-linked" if provider == "gamebanana" else "external-linked"
    if provenance != expected_provenance:
        issues.append(violation("external.provider_provenance_mismatch", "/provenance/kind"))
    parsed_page = parsed_https_url(document["provenance"]["canonical_page"])
    canonical_host = (parsed_page.hostname if parsed_page is not None else "").casefold()
    authoritative_host = document["provenance"]["authoritative_host"].casefold()
    if provider == "gamebanana":
        if authoritative_host != "gamebanana.com" or canonical_host not in {"gamebanana.com", "www.gamebanana.com"}:
            issues.append(violation("external.gamebanana_host_mismatch", "/provenance/authoritative_host"))
    elif canonical_host != authoritative_host:
        issues.append(violation("external.canonical_host_mismatch", "/provenance/authoritative_host"))
    if not safe_artifact_filename(document["artifact"]["filename"]):
        issues.append(violation("path.unsafe_artifact_filename", "/artifact/filename"))
    if document["state"] == "resolvable" and document["artifact"]["digest_state"] != "verified":
        issues.append(violation("external.resolvable_without_exact_digest", "/artifact/digest_state"))
    if document["artifact"]["digest_state"] == "verified" and "scan" in document["artifact"]:
        if document["artifact"]["scan"]["artifact_sha256"] != document["artifact"]["sha256"]:
            issues.append(violation("external.scan_digest_mismatch", "/artifact/scan/artifact_sha256"))
    game = document["game"]
    if game["compatibility_state"] == "tested" and not game["tested_build_ids"]:
        issues.append(violation("external.tested_state_without_build_ids", "/game/tested_build_ids"))
    if game["compatibility_state"] == "unknown" and game["tested_build_ids"]:
        issues.append(violation("external.unknown_state_with_build_ids", "/game/tested_build_ids"))
    if game["tested_build_ids"] != sorted(game["tested_build_ids"]):
        issues.append(violation("external.tested_build_ids_noncanonical", "/game/tested_build_ids"))
    if "revocation" in document and document["state"] != "revoked":
        issues.append(violation("external.revocation_state_mismatch", "/revocation"))
    if "revocation" in document and parse_timestamp(document["revocation"]["revoked_at"]) < parse_timestamp(document["observed_at"]):
        issues.append(violation("external.revocation_before_observation", "/revocation/revoked_at"))
    return issues


def validate_install_plan(document: Mapping[str, Any]) -> List[Violation]:
    issues = []
    if parse_timestamp(document["expires_at"]) <= parse_timestamp(document["issued_at"]):
        issues.append(violation("install.expiry_not_after_issue", "/expires_at"))
    if "revocation" in document and document["state"] != "revoked":
        issues.append(violation("install.revocation_state_mismatch", "/revocation"))
    if "revocation" in document:
        revoked_at = parse_timestamp(document["revocation"]["revoked_at"])
        if revoked_at < parse_timestamp(document["issued_at"]):
            issues.append(violation("install.revocation_before_issue", "/revocation/revoked_at"))
        if revoked_at > parse_timestamp(document["expires_at"]):
            issues.append(violation("install.revocation_after_expiry", "/revocation/revoked_at"))

    item_ids = [item["item_id"] for item in document["items"]]
    if duplicate_values(item_ids):
        issues.append(violation("install.duplicate_item_id", "/items"))
    targets = [normalized_windows_path(item["target"]["relative_path"]) for item in document["items"]]
    if duplicate_values(targets):
        issues.append(violation("install.duplicate_target", "/items"))
    sources = [source_key(item["source"]) for item in document["items"]]
    if duplicate_values(sources):
        issues.append(violation("install.duplicate_source_reference", "/items"))
    expected_order = sorted(document["items"], key=lambda item: (item["priority"], item["item_id"]))
    if list(document["items"]) != expected_order:
        issues.append(violation("install.noncanonical_order", "/items"))

    if document["state"] == "ready" and document["block_reasons"]:
        issues.append(violation("install.ready_with_block_reasons", "/block_reasons"))
    if document["state"] == "blocked" and not document["block_reasons"]:
        issues.append(violation("install.blocked_without_reasons", "/block_reasons"))
    if document["block_reasons"] != sorted(document["block_reasons"]):
        issues.append(violation("install.block_reasons_noncanonical", "/block_reasons"))
    if document["state"] == "ready" and document["game"]["compatibility_state"] != "tested":
        issues.append(violation("install.ready_without_tested_build_compatibility", "/game/compatibility_state"))

    for index, item in enumerate(document["items"]):
        prefix = "/items/{}".format(index)
        target = item["target"]["relative_path"]
        if not safe_artifact_filename(item["artifact"]["filename"]):
            issues.append(violation("path.unsafe_artifact_filename", prefix + "/artifact/filename"))
        if not safe_relative_path(target):
            issues.append(violation("path.unsafe_relative", prefix + "/target/relative_path"))
        expected_root = {
            "managed-vpk": "modlock-managed-addons",
            "managed-cfg-block": "modlock-owned-cfg-block",
        }[item["target"]["kind"]]
        if item["target"]["root"] != expected_root:
            issues.append(violation("install.target_root_kind_mismatch", prefix + "/target/root"))
        normalized_target = normalized_windows_path(target).strip("/")
        if normalized_target in {"pak01_dir.vpk", "game/citadel/pak01_dir.vpk"}:
            issues.append(violation("install.base_vpk_target_forbidden", prefix + "/target/relative_path"))
        if document["state"] == "ready":
            if item["state"] != "ready":
                issues.append(violation("install.ready_plan_contains_blocked_item", prefix + "/state"))
            if item["artifact"]["digest_state"] != "exact":
                issues.append(violation("install.ready_without_exact_digest", prefix + "/artifact/digest_state"))
            if item["artifact"]["scan_state"] != "clean":
                issues.append(violation("install.ready_without_clean_scan", prefix + "/artifact/scan_state"))
        if item["warnings"] != sorted(item["warnings"]):
            issues.append(violation("install.warnings_noncanonical", prefix + "/warnings"))
    return issues


def validate_profile(document: Mapping[str, Any]) -> List[Violation]:
    issues = []
    entry_ids = [entry["entry_id"] for entry in document["entries"]]
    if duplicate_values(entry_ids):
        issues.append(violation("profile.duplicate_entry_id", "/entries"))
    sources = [source_key(entry["source"]) for entry in document["entries"]]
    if duplicate_values(sources):
        issues.append(violation("profile.duplicate_source_reference", "/entries"))
    targets = [normalized_windows_path(entry["target_relative_path"]) for entry in document["entries"]]
    if duplicate_values(targets):
        issues.append(violation("profile.duplicate_target", "/entries"))
    expected_order = sorted(document["entries"], key=lambda entry: (entry["priority"], entry["entry_id"]))
    if list(document["entries"]) != expected_order:
        issues.append(violation("profile.noncanonical_order", "/entries"))
    for index, entry in enumerate(document["entries"]):
        if not safe_relative_path(entry["target_relative_path"]):
            issues.append(violation("path.unsafe_relative", "/entries/{}/target_relative_path".format(index)))
    preset_ids = document["cfg_selection"]["preset_version_ids"]
    if preset_ids != sorted(preset_ids):
        issues.append(violation("profile.preset_version_ids_noncanonical", "/cfg_selection/preset_version_ids"))
    return issues


def validate_pack(document: Mapping[str, Any]) -> List[Violation]:
    issues = []
    try:
        computed_version_sha256 = pack_version_sha256(document)
    except ValueError:
        issues.append(violation("pack.version_payload_not_canonical", "/version_sha256"))
    else:
        if document["version_sha256"] != computed_version_sha256:
            issues.append(violation("pack.version_digest_mismatch", "/version_sha256"))
    item_ids = [item["item_id"] for item in document["items"]]
    if duplicate_values(item_ids):
        issues.append(violation("pack.duplicate_item_id", "/items"))
    sources = [source_key(item["source"]) for item in document["items"]]
    if duplicate_values(sources):
        issues.append(violation("pack.duplicate_source_reference", "/items"))
    expected_order = sorted(document["items"], key=lambda item: (item["priority"], item["item_id"]))
    if list(document["items"]) != expected_order:
        issues.append(violation("pack.noncanonical_order", "/items"))
    for index, item in enumerate(document["items"]):
        if item["known_conflicts"] != sorted(item["known_conflicts"]):
            issues.append(violation("pack.known_conflicts_noncanonical", "/items/{}/known_conflicts".format(index)))
        if item["source"]["kind"] == "hosted-release" and item["variant_id"] != item["source"]["variant_id"]:
            issues.append(violation("pack.hosted_variant_mismatch", "/items/{}/variant_id".format(index)))

    approval = document["approval"]
    if approval["approved_version_sha256"] != document["version_sha256"]:
        issues.append(violation("pack.approval_digest_mismatch", "/approval/approved_version_sha256"))
    evidence_field = "approved_at" if "approved_at" in approval else "observed_at"
    evidence_at = parse_timestamp(approval[evidence_field])
    if parse_timestamp(document["provenance"]["created_at"]) > evidence_at:
        issues.append(violation("pack.evidence_before_creation", "/approval/" + evidence_field))
    if approval["status"] in {"creator-verified", "creator-contributed"}:
        if parse_timestamp(approval["expires_at"]) <= parse_timestamp(approval["approved_at"]):
            issues.append(violation("pack.approval_expiry_invalid", "/approval/expires_at"))
    elif approval["status"] == "community-reported":
        if parse_timestamp(approval["expires_at"]) <= parse_timestamp(approval["observed_at"]):
            issues.append(violation("pack.report_expiry_invalid", "/approval/expires_at"))
    else:
        evidence_at = approval.get("approved_at", approval.get("observed_at"))
        if parse_timestamp(approval["changed_at"]) < parse_timestamp(evidence_at):
            issues.append(violation("pack.lifecycle_change_before_evidence", "/approval/changed_at"))
        if approval["status"] == "expired" and parse_timestamp(approval["changed_at"]) < parse_timestamp(approval["expires_at"]):
            issues.append(violation("pack.expired_before_expiry", "/approval/changed_at"))

    if document["state"] == "published" and approval["status"] in {"expired", "revoked"}:
        issues.append(violation("pack.published_with_inactive_approval", "/approval/status"))
    if document["state"] in {"expired", "revoked"} and approval["status"] != document["state"]:
        issues.append(violation("pack.lifecycle_approval_mismatch", "/approval/status"))
    return issues


def validate_cfg_setting_document(document: Mapping[str, Any]) -> List[Violation]:
    return validate_cfg_setting(document["setting"], "/setting")


def validate_cfg_setting(setting: Mapping[str, Any], prefix: str) -> List[Violation]:
    issues = []
    if setting["auto_apply"]:
        issues.append(violation("cfg.auto_apply_requires_verified_allowlist", prefix + "/auto_apply"))
    if setting["provenance"]["evidence_kind"] == "fixture-control":
        if setting["status"] != "blocked":
            issues.append(violation("cfg.synthetic_control_not_blocked", prefix + "/status"))
        if setting["auto_apply"]:
            issues.append(violation("cfg.synthetic_control_auto_apply", prefix + "/auto_apply"))

    constraints = setting["constraints"]
    value_type = constraints["value_type"]
    expected_render = {
        "integer": "integer-decimal",
        "number": "number-decimal",
        "boolean": "boolean-01",
        "string": "quoted-string",
        "enum": "token",
    }[value_type]
    if setting["render"] != expected_render:
        issues.append(violation("cfg.render_type_mismatch", prefix + "/render"))

    if value_type in {"integer", "number"}:
        if constraints["minimum"] > constraints["maximum"]:
            issues.append(violation("cfg.invalid_numeric_range", prefix + "/constraints"))
        if not constraints["minimum"] <= constraints["default"] <= constraints["maximum"]:
            issues.append(violation("cfg.default_out_of_range", prefix + "/constraints/default"))
    elif value_type == "string":
        if constraints["min_length"] > constraints["max_length"]:
            issues.append(violation("cfg.invalid_string_range", prefix + "/constraints"))
        if not constraints["min_length"] <= len(constraints["default"]) <= constraints["max_length"]:
            issues.append(violation("cfg.default_length_out_of_range", prefix + "/constraints/default"))
        if unsafe_cfg_scalar(constraints["default"]):
            issues.append(violation("cfg.unsafe_string_value", prefix + "/constraints/default"))
    elif value_type == "enum":
        if constraints["default"] not in constraints["allowed_values"]:
            issues.append(violation("cfg.default_not_allowed", prefix + "/constraints/default"))
        if constraints["allowed_values"] != sorted(constraints["allowed_values"]):
            issues.append(violation("cfg.allowed_values_noncanonical", prefix + "/constraints/allowed_values"))
        for index, allowed_value in enumerate(constraints["allowed_values"]):
            if unsafe_cfg_scalar(allowed_value):
                issues.append(violation("cfg.unsafe_enum_value", prefix + "/constraints/allowed_values/{}".format(index)))
    return issues

CFG_SCRIPT_TOKENS = re.compile(
    r"(?:^|\s)(?:alias|bind|bindtoggle|exec|execifexists|incrementvar|multvar|toggle|unbind|unbindall|wait)(?:\s|$)",
    re.IGNORECASE,
)


def unsafe_cfg_scalar(value: str) -> bool:
    if any(
        character in {';', '`', '"', "'", "\\", "{", "}"}
        or unicodedata.category(character) in {"Cc", "Cf", "Cs", "Zl", "Zp"}
        for character in value
    ):
        return True
    return CFG_SCRIPT_TOKENS.search(value) is not None


def decode_canonical_base64(value: str) -> Optional[bytes]:
    try:
        decoded = base64.b64decode(value, validate=True)
    except (binascii.Error, ValueError):
        return None
    if base64.b64encode(decoded).decode("ascii") != value:
        return None
    return decoded


def valid_p256_der_signature(value: bytes) -> bool:
    p256_order = int("ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551", 16)
    if len(value) < 8 or len(value) > 72 or value[:1] != b"\x30":
        return False
    if value[1] != len(value) - 2:
        return False
    offset = 2
    for _ in range(2):
        if offset + 2 > len(value) or value[offset] != 0x02:
            return False
        length = value[offset + 1]
        offset += 2
        if length < 1 or length > 33 or offset + length > len(value):
            return False
        integer = value[offset : offset + length]
        if integer[0] & 0x80:
            return False
        if length > 1 and integer[0] == 0 and not integer[1] & 0x80:
            return False
        magnitude = integer[1:] if integer[0] == 0 else integer
        if (
            not magnitude
            or len(magnitude) > 32
            or not 0 < int.from_bytes(magnitude, "big") < p256_order
        ):
            return False
        offset += length
    return offset == len(value)


def valid_registry_signature_encoding(signature: Mapping[str, Any]) -> bool:
    decoded = decode_canonical_base64(signature["signature_base64"])
    if decoded is None:
        return False
    if signature["algorithm"] == "ed25519":
        return len(decoded) == 64
    if signature["algorithm"] == "ecdsa-p256-sha256":
        return valid_p256_der_signature(decoded)
    return False


def validate_cfg_registry(document: Mapping[str, Any]) -> List[Violation]:
    issues = []
    names = [setting["name"] for setting in document["settings"]]
    if duplicate_values(names):
        issues.append(violation("registry.duplicate_setting_name", "/settings"))
    if names != sorted(names):
        issues.append(violation("registry.noncanonical_order", "/settings"))
    for index, setting in enumerate(document["settings"]):
        issues.extend(validate_cfg_setting(setting, "/settings/{}".format(index)))
    if document["state"] == "draft" and ("signature" in document or "registry_sha256" in document):
        issues.append(violation("registry.signature_state_mismatch", "/state"))
    if document["state"] in {"signature-present-unverified", "revoked"}:
        try:
            computed_registry_sha256 = registry_signature_payload_sha256(document)
        except ValueError:
            issues.append(violation("registry.payload_not_canonical", "/registry_sha256"))
        else:
            if document["registry_sha256"] != computed_registry_sha256:
                issues.append(violation("registry.payload_digest_mismatch", "/registry_sha256"))
        if not valid_registry_signature_encoding(document["signature"]):
            issues.append(violation("registry.signature_encoding_invalid", "/signature/signature_base64"))
    if "revocation" in document and document["state"] != "revoked":
        issues.append(violation("registry.revocation_state_mismatch", "/revocation"))
    if "revocation" in document and parse_timestamp(document["revocation"]["revoked_at"]) < parse_timestamp(document["game"]["snapshot_at"]):
        issues.append(violation("registry.revocation_before_snapshot", "/revocation/revoked_at"))
    return issues


def validate_fixture_corpus(document: Mapping[str, Any]) -> List[Violation]:
    issues = []
    control_ids = [control["control_id"] for control in document["planned_controls"]]
    if duplicate_values(control_ids):
        issues.append(violation("corpus.duplicate_control_id", "/planned_controls"))
    paths = [fixture["path"] for fixture in document["conformance_fixtures"]]
    if duplicate_values(paths):
        issues.append(violation("corpus.duplicate_fixture_path", "/conformance_fixtures"))
    for index, path in enumerate(paths):
        if not safe_relative_path(path):
            issues.append(violation("path.unsafe_relative", "/conformance_fixtures/{}/path".format(index)))
    return issues


def validate_contract_graph(documents: Mapping[str, Mapping[str, Any]]) -> List[Violation]:
    required_documents = {"hosted-release", "external-reference", "install-plan", "profile", "pack"}
    if set(documents) != required_documents:
        raise ValueError("contract graph requires exactly {}".format(sorted(required_documents)))

    issues: List[Violation] = []
    hosted = documents["hosted-release"]
    external = documents["external-reference"]
    plan = documents["install-plan"]
    profile = documents["profile"]
    pack = documents["pack"]

    def graph_issue(code: str, path: str) -> Violation:
        return Violation(kind="graph", path=path, code=code)

    target_mapping = {
        "vpk-addon": ("managed-vpk", "modlock-managed-addons"),
        "vpk-split-directory": ("managed-vpk", "modlock-managed-addons"),
        "vpk-split-part": ("managed-vpk", "modlock-managed-addons"),
        "cfg-typed-artifact": ("managed-cfg-block", "modlock-owned-cfg-block"),
    }

    def resolve_source(source: Mapping[str, Any], path: str) -> Optional[Dict[str, Any]]:
        if source["kind"] == "hosted-release":
            if source["release_id"] != hosted["release_id"]:
                issues.append(graph_issue("graph.source_missing", path + "/release_id"))
                return None
            matching_variant = next(
                (variant for variant in hosted["variants"] if variant["variant_id"] == source["variant_id"]),
                None,
            )
            if matching_variant is None:
                issues.append(graph_issue("graph.source_missing", path + "/variant_id"))
                return None
            matching_file = next(
                (file_record for file_record in matching_variant["files"] if file_record["file_id"] == source["file_id"]),
                None,
            )
            if matching_file is None:
                issues.append(graph_issue("graph.source_missing", path + "/file_id"))
                return None
            if hosted["state"] != "published" or matching_file["scan"]["state"] != "clean":
                issues.append(graph_issue("graph.source_not_installable", path))
            target_kind, target_root = target_mapping[matching_file["target_kind"]]
            return {
                "source_kind": "hosted-release",
                "filename": PurePosixPath(matching_file["source_path"]).name,
                "media_type": matching_file["media_type"],
                "size_bytes": matching_file["size_bytes"],
                "artifact_sha256": matching_file["object_sha256"],
                "scan_state": matching_file["scan"]["state"],
                "target_kind": target_kind,
                "target_root": target_root,
                "rights_sha256": rights_sha256(hosted),
                "rights": hosted["rights"],
                "compatibility_state": hosted["game"]["compatibility_state"],
                "tested_build_ids": hosted["game"]["tested_build_ids"],
            }

        if source["external_reference_id"] != external["external_reference_id"]:
            issues.append(graph_issue("graph.source_missing", path + "/external_reference_id"))
            return None
        artifact = external["artifact"]
        scan = artifact.get("scan") if artifact["digest_state"] == "verified" else None
        installable = (
            external["state"] == "resolvable"
            and external["resolution_policy"] == "fresh-adapter-resolution"
            and artifact["digest_state"] == "verified"
            and scan is not None
            and scan["state"] == "clean"
            and scan["artifact_sha256"] == artifact["sha256"]
        )
        if not installable:
            issues.append(graph_issue("graph.source_not_installable", path))
        if artifact["digest_state"] != "verified":
            return None
        target_kind, target_root = target_mapping[artifact["target_kind"]]
        return {
            "source_kind": "external-reference",
            "filename": artifact["filename"],
            "media_type": artifact["media_type"],
            "size_bytes": artifact["size_bytes"],
            "artifact_sha256": artifact["sha256"],
            "scan_state": scan["state"] if scan is not None else None,
            "target_kind": target_kind,
            "target_root": target_root,
            "rights_sha256": rights_sha256(external),
            "rights": external["rights"],
            "compatibility_state": external["game"]["compatibility_state"],
            "tested_build_ids": external["game"]["tested_build_ids"],
        }

    def validate_binding(
        source: Mapping[str, Any],
        artifact_digest: Any,
        rights_digest: str,
        path: str,
        artifact_path: str,
    ) -> Optional[Dict[str, Any]]:
        resolved = resolve_source(source, path + "/source")
        if resolved is None:
            return None
        if artifact_digest != resolved["artifact_sha256"]:
            issues.append(graph_issue("graph.artifact_digest_mismatch", path + artifact_path))
        if rights_digest != resolved["rights_sha256"]:
            issues.append(graph_issue("graph.rights_digest_mismatch", path + "/rights_sha256"))
        return resolved

    if plan["state"] == "ready":
        for index, item in enumerate(plan["items"]):
            path = "/install-plan/items/{}".format(index)
            resolved = validate_binding(
                item["source"],
                item["artifact"].get("sha256"),
                item["rights_sha256"],
                path,
                "/artifact/sha256",
            )
            if resolved is None:
                continue
            expected_build = plan["game"]["expected_build_id"]
            if (
                resolved["compatibility_state"] != "tested"
                or expected_build not in resolved["tested_build_ids"]
            ):
                issues.append(graph_issue("graph.source_build_not_tested", path + "/source"))
            if resolved["source_kind"] == "external-reference" and any(
                value == "unknown"
                for key, value in resolved["rights"].items()
                if key != "license" and key != "uploader_affirmed_at"
            ):
                issues.append(graph_issue("graph.external_rights_unknown", path + "/source"))
            facts = (
                ("filename", "graph.artifact_filename_mismatch"),
                ("media_type", "graph.artifact_media_type_mismatch"),
                ("size_bytes", "graph.artifact_size_mismatch"),
                ("scan_state", "graph.scan_state_mismatch"),
            )
            for field, code in facts:
                if item["artifact"].get(field) != resolved[field]:
                    issues.append(graph_issue(code, path + "/artifact/" + field))
            if item["target"]["kind"] != resolved["target_kind"]:
                issues.append(graph_issue("graph.target_kind_mismatch", path + "/target/kind"))
            if item["target"]["root"] != resolved["target_root"]:
                issues.append(graph_issue("graph.target_root_mismatch", path + "/target/root"))
        if plan["source_request"]["kind"] == "pack-version":
            if plan["source_request"]["pack_version_id"] != pack["pack_version_id"]:
                issues.append(graph_issue("graph.pack_version_missing", "/install-plan/source_request/pack_version_id"))
            if plan["source_request"]["pack_version_sha256"] != pack["version_sha256"]:
                issues.append(graph_issue("graph.pack_version_digest_mismatch", "/install-plan/source_request/pack_version_sha256"))
            if pack["state"] != "published":
                issues.append(graph_issue("graph.pack_not_published", "/pack/state"))
            if parse_timestamp(pack["provenance"]["created_at"]) > parse_timestamp(plan["issued_at"]):
                issues.append(graph_issue("graph.pack_created_after_plan_issue", "/install-plan/issued_at"))
            approval = pack["approval"]
            if approval["approved_version_sha256"] != pack["version_sha256"]:
                issues.append(graph_issue("graph.pack_evidence_digest_mismatch", "/pack/approval/approved_version_sha256"))
            if approval["status"] not in {"creator-verified", "creator-contributed", "community-reported"}:
                issues.append(graph_issue("graph.pack_evidence_inactive", "/pack/approval/status"))
            else:
                evidence_at = approval.get("approved_at", approval.get("observed_at"))
                if parse_timestamp(evidence_at) > parse_timestamp(plan["issued_at"]):
                    issues.append(graph_issue("graph.pack_evidence_after_plan_issue", "/install-plan/issued_at"))
                if parse_timestamp(plan["expires_at"]) > parse_timestamp(approval["expires_at"]):
                    issues.append(graph_issue("graph.plan_outlives_pack_evidence", "/install-plan/expires_at"))
            plan_bindings = sorted(
                (
                    source_key(item["source"]),
                    item["artifact"]["sha256"],
                    item["rights_sha256"],
                    item["required"],
                    item["priority"],
                )
                for item in plan["items"]
            )
            pack_bindings = sorted(
                (
                    source_key(item["source"]),
                    item["artifact_sha256"],
                    item["rights_sha256"],
                    item["required"],
                    item["priority"],
                )
                for item in pack["items"]
            )
            if plan_bindings != pack_bindings:
                issues.append(graph_issue("graph.plan_pack_items_mismatch", "/install-plan/items"))
        else:
            release_id = plan["source_request"]["release_id"]
            for index, item in enumerate(plan["items"]):
                if (
                    item["source"].get("kind") != "hosted-release"
                    or item["source"].get("release_id") != release_id
                ):
                    issues.append(graph_issue("graph.direct_release_source_mismatch", "/install-plan/items/{}/source".format(index)))

    for index, entry in enumerate(profile["entries"]):
        validate_binding(
            entry["source"],
            entry["object_sha256"],
            entry["rights_sha256"],
            "/profile/entries/{}".format(index),
            "/object_sha256",
        )

    for index, item in enumerate(pack["items"]):
        validate_binding(
            item["source"],
            item["artifact_sha256"],
            item["rights_sha256"],
            "/pack/items/{}".format(index),
            "/artifact_sha256",
        )

    return sorted(issues)


def apply_graph_mutations(
    documents: Mapping[str, Any], operations: Sequence[Mapping[str, Any]]
) -> Dict[str, Any]:
    mutated = copy.deepcopy(dict(documents))
    for operation in operations:
        document_name = operation["document"]
        mutation = {key: value for key, value in operation.items() if key != "document"}
        mutated[document_name] = apply_mutations(mutated[document_name], [mutation])
    return mutated


def decode_pointer(pointer: str) -> List[str]:
    if pointer == "":
        return []
    if not pointer.startswith("/"):
        raise ValueError("invalid JSON pointer: {}".format(pointer))
    return [part.replace("~1", "/").replace("~0", "~") for part in pointer[1:].split("/")]


def resolve_parent(document: Any, pointer: str) -> Tuple[Any, str]:
    parts = decode_pointer(pointer)
    if not parts:
        raise ValueError("root mutation is not supported")
    current = document
    for part in parts[:-1]:
        current = current[int(part)] if isinstance(current, list) else current[part]
    return current, parts[-1]


def read_pointer(document: Any, pointer: str) -> Any:
    current = document
    for part in decode_pointer(pointer):
        current = current[int(part)] if isinstance(current, list) else current[part]
    return current


def apply_mutations(base: Any, operations: Sequence[Mapping[str, Any]]) -> Any:
    document = copy.deepcopy(base)
    for operation in operations:
        op = operation["op"]
        if op == "copy":
            value = copy.deepcopy(read_pointer(document, operation["from"]))
        else:
            value = copy.deepcopy(operation.get("value"))
        parent, key = resolve_parent(document, operation["path"])
        if op == "remove":
            if isinstance(parent, list):
                parent.pop(int(key))
            else:
                del parent[key]
        elif op in {"add", "copy"}:
            if isinstance(parent, list):
                if key == "-":
                    parent.append(value)
                else:
                    parent.insert(int(key), value)
            else:
                parent[key] = value
        elif op == "replace":
            if isinstance(parent, list):
                parent[int(key)] = value
            else:
                if key not in parent:
                    raise KeyError("replace target does not exist: {}".format(operation["path"]))
                parent[key] = value
        else:
            raise ValueError("unsupported mutation op: {}".format(op))
    return document
