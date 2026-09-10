from __future__ import annotations

import copy
import base64
import tempfile
import tomllib
import unittest
from pathlib import Path
from typing import Any, Dict

from scripts.contract_validation import (
    ROOT,
    ContractStore,
    Violation,
    apply_graph_mutations,
    apply_mutations,
    closed_world_schema_violations,
    load_json,
    pack_version_sha256,
    path_has_symlink,
    registry_signature_payload_sha256,
    rights_sha256,
    safe_relative_path,
    sha256_file,
    validate_contract_graph,
)
from scripts.check_fresh import EXPECTED_PYTHON, assert_bootstrap, gate_commands
from scripts.check_source_manifest import manifest_failures

CONFORMANCE_PATH = ROOT / "fixtures" / "contracts" / "conformance.v1.json"
CORPUS_PATH = ROOT / "fixtures" / "corpus-manifest.v1.json"


def fixture_path(contract_name: str) -> Path:
    if contract_name == "fixture-corpus":
        return CORPUS_PATH
    return ROOT / "fixtures" / "contracts" / "valid" / "{}.json".format(contract_name)


def expected_dicts(violations):
    return [violation.as_dict() for violation in sorted(violations)]


class ContractConformanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.store = ContractStore()
        cls.valid_documents: Dict[str, Any] = {
            name: load_json(fixture_path(name)) for name in cls.store.contract_names
        }

    def test_contract_index_has_exact_positive_fixture_set(self) -> None:
        expected = {
            "hosted-release",
            "external-reference",
            "install-plan",
            "profile",
            "pack",
            "cfg-setting",
            "cfg-registry",
            "fixture-corpus",
        }
        self.assertEqual(expected, set(self.store.contract_names))
        for name in self.store.contract_names:
            self.assertTrue(fixture_path(name).is_file(), name)

    def test_every_object_schema_is_closed_world(self) -> None:
        self.assertEqual([], closed_world_schema_violations(self.store))

    def test_positive_fixtures_validate_exactly(self) -> None:
        for name, document in self.valid_documents.items():
            with self.subTest(contract=name):
                self.assertEqual([], self.store.validate(name, document))

    def test_positive_fixture_graph_pins_the_same_exact_artifacts(self) -> None:
        hosted = self.valid_documents["hosted-release"]
        external = self.valid_documents["external-reference"]
        install_plan = self.valid_documents["install-plan"]
        profile = self.valid_documents["profile"]
        pack = self.valid_documents["pack"]

        hosted_file = hosted["variants"][0]["files"][0]
        external_artifact = external["artifact"]
        install_item = install_plan["items"][0]
        profile_hosted, profile_external = profile["entries"]
        pack_hosted, pack_external = pack["items"]

        self.assertEqual(hosted["release_id"], install_item["source"]["release_id"])
        self.assertEqual(hosted_file["file_id"], install_item["source"]["file_id"])
        self.assertEqual(hosted_file["object_sha256"], install_item["artifact"]["sha256"])
        self.assertEqual(hosted_file["object_sha256"], profile_hosted["object_sha256"])
        self.assertEqual(hosted_file["object_sha256"], pack_hosted["artifact_sha256"])

        self.assertEqual(external["external_reference_id"], profile_external["source"]["external_reference_id"])
        self.assertEqual(external["external_reference_id"], pack_external["source"]["external_reference_id"])
        self.assertEqual(external_artifact["sha256"], profile_external["object_sha256"])
        self.assertEqual(external_artifact["sha256"], pack_external["artifact_sha256"])
        self.assertEqual(pack["version_sha256"], pack["approval"]["approved_version_sha256"])
        self.assertEqual(pack["version_sha256"], install_plan["source_request"]["pack_version_sha256"])
        self.assertEqual(hosted_file["source_path"].split("/")[-1], install_item["artifact"]["filename"])
        self.assertEqual(hosted_file["media_type"], install_item["artifact"]["media_type"])
        self.assertEqual(hosted_file["size_bytes"], install_item["artifact"]["size_bytes"])
        self.assertEqual(external_artifact["filename"], install_plan["items"][1]["artifact"]["filename"])
        self.assertEqual(external_artifact["media_type"], install_plan["items"][1]["artifact"]["media_type"])
        self.assertEqual(external_artifact["size_bytes"], install_plan["items"][1]["artifact"]["size_bytes"])
        self.assertEqual(rights_sha256(hosted), install_item["rights_sha256"])
        self.assertEqual(rights_sha256(hosted), profile_hosted["rights_sha256"])
        self.assertEqual(rights_sha256(hosted), pack_hosted["rights_sha256"])
        self.assertEqual(rights_sha256(external), profile_external["rights_sha256"])
        self.assertEqual(rights_sha256(external), pack_external["rights_sha256"])

        graph = {
            name: self.valid_documents[name]
            for name in {"hosted-release", "external-reference", "install-plan", "profile", "pack"}
        }
        self.assertEqual([], validate_contract_graph(graph))

    def test_ready_graph_binds_build_and_every_mutation_relevant_source_fact(self) -> None:
        graph = {
            name: self.valid_documents[name]
            for name in {"hosted-release", "external-reference", "install-plan", "profile", "pack"}
        }
        cases = [
            ("/items/0/artifact/filename", "renamed.vpk", "/install-plan/items/0/artifact/filename", "graph.artifact_filename_mismatch"),
            ("/items/0/artifact/media_type", "text/plain", "/install-plan/items/0/artifact/media_type", "graph.artifact_media_type_mismatch"),
            ("/items/0/artifact/size_bytes", 129, "/install-plan/items/0/artifact/size_bytes", "graph.artifact_size_mismatch"),
            ("/items/0/artifact/scan_state", "requires-local-scan", "/install-plan/items/0/artifact/scan_state", "graph.scan_state_mismatch"),
            ("/items/0/target/kind", "managed-cfg-block", "/install-plan/items/0/target/kind", "graph.target_kind_mismatch"),
            ("/items/0/target/root", "modlock-owned-cfg-block", "/install-plan/items/0/target/root", "graph.target_root_mismatch"),
        ]
        for mutation_path, value, issue_path, code in cases:
            with self.subTest(code=code):
                mutated = apply_graph_mutations(
                    graph,
                    [{"document": "install-plan", "op": "replace", "path": mutation_path, "value": value}],
                )
                self.assertEqual(
                    [Violation("graph", issue_path, code)],
                    validate_contract_graph(mutated),
                )

        mutated = apply_graph_mutations(
            graph,
            [{"document": "install-plan", "op": "replace", "path": "/game/expected_build_id", "value": "fixture-build-missing"}],
        )
        self.assertEqual(
            [
                Violation("graph", "/install-plan/items/0/source", "graph.source_build_not_tested"),
                Violation("graph", "/install-plan/items/1/source", "graph.source_build_not_tested"),
            ],
            validate_contract_graph(mutated),
        )

        plan = copy.deepcopy(self.valid_documents["install-plan"])
        plan["game"]["compatibility_state"] = "author-declared"
        self.assertEqual(
            [Violation("semantic", "/game/compatibility_state", "install.ready_without_tested_build_compatibility")],
            self.store.validate("install-plan", plan),
        )

        mutated = apply_graph_mutations(
            graph,
            [{"document": "hosted-release", "op": "replace", "path": "/variants/0/files/0/target_kind", "value": "cfg-typed-artifact"}],
        )
        self.assertEqual(
            [
                Violation("graph", "/install-plan/items/0/target/kind", "graph.target_kind_mismatch"),
                Violation("graph", "/install-plan/items/0/target/root", "graph.target_root_mismatch"),
            ],
            validate_contract_graph(mutated),
        )

    def test_ready_graph_rejects_unknown_external_rights_and_uninstallable_sources(self) -> None:
        graph = {
            name: copy.deepcopy(self.valid_documents[name])
            for name in {"hosted-release", "external-reference", "install-plan", "profile", "pack"}
        }
        graph["external-reference"]["rights"]["redistribution"] = "unknown"
        changed_rights = rights_sha256(graph["external-reference"])
        graph["install-plan"]["items"][1]["rights_sha256"] = changed_rights
        graph["profile"]["entries"][1]["rights_sha256"] = changed_rights
        graph["pack"]["items"][1]["rights_sha256"] = changed_rights
        changed_pack = pack_version_sha256(graph["pack"])
        graph["pack"]["version_sha256"] = changed_pack
        graph["pack"]["approval"]["approved_version_sha256"] = changed_pack
        graph["install-plan"]["source_request"]["pack_version_sha256"] = changed_pack
        self.assertEqual(
            [Violation("graph", "/install-plan/items/1/source", "graph.external_rights_unknown")],
            validate_contract_graph(graph),
        )

        graph = {
            name: copy.deepcopy(self.valid_documents[name])
            for name in {"hosted-release", "external-reference", "install-plan", "profile", "pack"}
        }
        graph["external-reference"]["artifact"]["scan"]["state"] = "needs-review"
        self.assertEqual(
            [
                Violation("graph", "/install-plan/items/1/artifact/scan_state", "graph.scan_state_mismatch"),
                Violation("graph", "/install-plan/items/1/source", "graph.source_not_installable"),
                Violation("graph", "/pack/items/1/source", "graph.source_not_installable"),
                Violation("graph", "/profile/entries/1/source", "graph.source_not_installable"),
            ],
            validate_contract_graph(graph),
        )

    def test_ready_pack_request_binds_publication_digest_and_full_evidence_window(self) -> None:
        base = {
            name: copy.deepcopy(self.valid_documents[name])
            for name in {"hosted-release", "external-reference", "install-plan", "profile", "pack"}
        }
        cases = []

        wrong_digest = copy.deepcopy(base)
        wrong_digest["install-plan"]["source_request"]["pack_version_sha256"] = "d" * 64
        cases.append((wrong_digest, [Violation("graph", "/install-plan/source_request/pack_version_sha256", "graph.pack_version_digest_mismatch")]))

        draft = copy.deepcopy(base)
        draft["pack"]["state"] = "draft"
        cases.append((draft, [Violation("graph", "/pack/state", "graph.pack_not_published")]))

        evidence_late = copy.deepcopy(base)
        evidence_late["pack"]["approval"]["approved_at"] = "2026-08-30T16:05:00Z"
        cases.append((evidence_late, [Violation("graph", "/install-plan/issued_at", "graph.pack_evidence_after_plan_issue")]))

        evidence_short = copy.deepcopy(base)
        evidence_short["pack"]["approval"]["expires_at"] = "2026-08-30T16:10:00Z"
        cases.append((evidence_short, [Violation("graph", "/install-plan/expires_at", "graph.plan_outlives_pack_evidence")]))

        inactive = copy.deepcopy(base)
        inactive["pack"]["state"] = "revoked"
        inactive["pack"]["approval"] = {
            "status": "revoked",
            "previous_status": "creator-verified",
            "approver_creator_id": "creator_fixture_pack",
            "approved_version_sha256": inactive["pack"]["version_sha256"],
            "approved_at": "2026-08-30T15:10:00Z",
            "expires_at": "2026-09-30T15:10:00Z",
            "changed_at": "2026-08-30T15:30:00Z",
            "change_reason": "Synthetic lifecycle regression.",
        }
        cases.append(
            (
                inactive,
                [
                    Violation("graph", "/pack/approval/status", "graph.pack_evidence_inactive"),
                    Violation("graph", "/pack/state", "graph.pack_not_published"),
                ],
            )
        )

        expired = copy.deepcopy(base)
        expired["pack"]["state"] = "expired"
        expired["pack"]["approval"] = {
            "status": "expired",
            "previous_status": "creator-verified",
            "approver_creator_id": "creator_fixture_pack",
            "approved_version_sha256": expired["pack"]["version_sha256"],
            "approved_at": "2026-08-30T15:10:00Z",
            "expires_at": "2026-09-30T15:10:00Z",
            "changed_at": "2026-09-30T15:10:00Z",
            "change_reason": "Synthetic approval expiry regression.",
        }
        cases.append(
            (
                expired,
                [
                    Violation("graph", "/pack/approval/status", "graph.pack_evidence_inactive"),
                    Violation("graph", "/pack/state", "graph.pack_not_published"),
                ],
            )
        )

        for graph, expected in cases:
            with self.subTest(expected=expected):
                self.assertEqual(expected, validate_contract_graph(graph))

        community = copy.deepcopy(base)
        community["pack"]["approval"] = {
            "status": "community-reported",
            "evidence_url": "https://example.invalid/evidence/fixture-pack",
            "approved_version_sha256": community["pack"]["version_sha256"],
            "observed_at": "2026-08-30T15:20:00Z",
            "expires_at": "2026-09-30T15:20:00Z",
        }
        self.assertEqual([], validate_contract_graph(community))
        community["pack"]["approval"]["approved_version_sha256"] = "d" * 64
        self.assertEqual(
            [Violation("graph", "/pack/approval/approved_version_sha256", "graph.pack_evidence_digest_mismatch")],
            validate_contract_graph(community),
        )
        del community["pack"]["approval"]["approved_version_sha256"]
        self.assertEqual(
            [Violation("schema", "/approval", "schema.oneOf")],
            self.store.validate("pack", community["pack"]),
        )

    def test_direct_release_request_cannot_mix_external_or_other_release_items(self) -> None:
        graph = {
            name: copy.deepcopy(self.valid_documents[name])
            for name in {"hosted-release", "external-reference", "install-plan", "profile", "pack"}
        }
        graph["install-plan"]["source_request"] = {
            "kind": "release",
            "release_id": graph["hosted-release"]["release_id"],
        }
        self.assertEqual(
            [Violation("graph", "/install-plan/items/1/source", "graph.direct_release_source_mismatch")],
            validate_contract_graph(graph),
        )

    def test_authority_graph_is_an_exact_synthetic_bundle_not_a_general_resolver(self) -> None:
        graph = {
            name: self.valid_documents[name]
            for name in {"hosted-release", "external-reference", "install-plan", "profile", "pack"}
        }
        expanded = dict(graph)
        expanded["second-hosted-release"] = copy.deepcopy(graph["hosted-release"])
        with self.assertRaisesRegex(ValueError, "contract graph requires exactly"):
            validate_contract_graph(expanded)

    def test_every_contract_rejects_unknown_schema_version(self) -> None:
        expected = [Violation("schema", "/schema_version", "schema.const")]
        for name, document in self.valid_documents.items():
            mutated = copy.deepcopy(document)
            mutated["schema_version"] = 2
            with self.subTest(contract=name):
                self.assertEqual(expected, self.store.validate(name, mutated))

    def test_every_contract_rejects_unknown_root_field(self) -> None:
        expected = [Violation("schema", "/", "schema.additionalProperties")]
        for name, document in self.valid_documents.items():
            mutated = copy.deepcopy(document)
            mutated["future_field"] = "must be rejected"
            with self.subTest(contract=name):
                self.assertEqual(expected, self.store.validate(name, mutated))

    def test_machine_mutation_suite_has_exact_results(self) -> None:
        suite = load_json(CONFORMANCE_PATH)
        self.assertEqual(
            {"schema_version", "contract", "suite_id", "cases", "graph_cases"},
            set(suite),
        )
        self.assertEqual(1, suite["schema_version"])
        self.assertEqual("modlock.contract-conformance-suite", suite["contract"])
        case_ids = [case["case_id"] for case in suite["cases"]]
        self.assertEqual(len(case_ids), len(set(case_ids)))
        self.assertGreaterEqual(len(case_ids), 30)

        for case in suite["cases"]:
            with self.subTest(case=case["case_id"]):
                self.assertEqual(
                    {"case_id", "base_contract", "operations", "expected"},
                    set(case),
                )
                self.assertIn(case["base_contract"], self.valid_documents)
                mutated = apply_mutations(
                    self.valid_documents[case["base_contract"]],
                    case["operations"],
                )
                actual = expected_dicts(self.store.validate(case["base_contract"], mutated))
                expected = sorted(
                    case["expected"],
                    key=lambda item: (item["kind"], item["path"], item["code"]),
                )
                self.assertEqual(expected, actual)

        graph_case_ids = [case["case_id"] for case in suite["graph_cases"]]
        self.assertEqual(len(graph_case_ids), len(set(graph_case_ids)))
        self.assertGreaterEqual(len(graph_case_ids), 10)
        graph_documents = {
            name: self.valid_documents[name]
            for name in {"hosted-release", "external-reference", "install-plan", "profile", "pack"}
        }
        for case in suite["graph_cases"]:
            with self.subTest(graph_case=case["case_id"]):
                self.assertEqual({"case_id", "operations", "expected"}, set(case))
                mutated = apply_graph_mutations(graph_documents, case["operations"])
                actual = expected_dicts(validate_contract_graph(mutated))
                expected = sorted(
                    case["expected"],
                    key=lambda item: (item["kind"], item["path"], item["code"]),
                )
                self.assertEqual(expected, actual)

    def test_strict_json_loader_rejects_ambiguous_or_nonfinite_numbers(self) -> None:
        hostile_documents = {
            "duplicate": '{"key":1,"key":2}',
            "nan": '{"value":NaN}',
            "infinity": '{"value":Infinity}',
            "negative_infinity": '{"value":-Infinity}',
            "overflow": '{"value":1e400}',
        }
        with tempfile.TemporaryDirectory() as directory:
            for name, payload in hostile_documents.items():
                path = Path(directory) / "{}.json".format(name)
                path.write_text(payload, encoding="utf-8")
                with self.subTest(hostile=name):
                    with self.assertRaises(ValueError):
                        load_json(path)

    def test_pack_version_digest_and_terminal_history_are_exact(self) -> None:
        pack = self.valid_documents["pack"]
        self.assertEqual(pack["version_sha256"], pack_version_sha256(pack))
        self.assertEqual(pack["version_sha256"], pack["approval"]["approved_version_sha256"])

        changed = copy.deepcopy(pack)
        changed["items"][0]["variant_id"] = "alternate"
        self.assertNotEqual(pack["version_sha256"], pack_version_sha256(changed))

        terminal = copy.deepcopy(pack)
        terminal["state"] = "expired"
        terminal["approval"] = {
            "status": "expired",
            "previous_status": "creator-verified",
            "approver_creator_id": "creator_fixture_pack",
            "approved_version_sha256": pack["version_sha256"],
            "approved_at": "2026-08-30T15:10:00Z",
            "expires_at": "2026-09-30T15:10:00Z",
            "changed_at": "2026-09-30T15:10:00Z",
            "change_reason": "Fixture approval reached its recorded expiry.",
        }
        self.assertEqual([], self.store.validate("pack", terminal))
        del terminal["approval"]["approver_creator_id"]
        self.assertEqual(
            [Violation("schema", "/approval", "schema.oneOf")],
            self.store.validate("pack", terminal),
        )

    def test_safe_typed_cfg_values_remain_valid(self) -> None:
        document = copy.deepcopy(self.valid_documents["cfg-setting"])
        document["setting"]["constraints"] = {
            "value_type": "string",
            "min_length": 0,
            "max_length": 32,
            "default": "high contrast",
        }
        document["setting"]["render"] = "quoted-string"
        self.assertEqual([], self.store.validate("cfg-setting", document))

        document["setting"]["constraints"] = {
            "value_type": "enum",
            "allowed_values": ["green", "red"],
            "default": "green",
        }
        document["setting"]["render"] = "token"
        self.assertEqual([], self.store.validate("cfg-setting", document))

        document["setting"]["constraints"] = {
            "value_type": "number",
            "minimum": 0.0,
            "maximum": 2.0,
            "default": 1.5,
        }
        document["setting"]["render"] = "number-decimal"
        self.assertEqual([], self.store.validate("cfg-setting", document))

    def test_registry_signature_present_unverified_payload_and_encoding_are_exact(self) -> None:
        registry = copy.deepcopy(self.valid_documents["cfg-registry"])
        registry["state"] = "signature-present-unverified"
        registry["registry_sha256"] = registry_signature_payload_sha256(registry)
        registry["signature"] = {
            "algorithm": "ed25519",
            "key_id": "fixture_signing_key",
            "signature_base64": base64.b64encode(bytes(64)).decode("ascii"),
            "verification_state": "not-verified",
        }
        self.assertEqual([], self.store.validate("cfg-registry", registry))
        registry["registry_sha256"] = "d" * 64
        self.assertIn(
            Violation("semantic", "/registry_sha256", "registry.payload_digest_mismatch"),
            self.store.validate("cfg-registry", registry),
        )

        registry["settings"][0]["constraints"] = {
            "value_type": "number",
            "minimum": 0.0,
            "maximum": 2.0,
            "default": 1.5,
        }
        registry["settings"][0]["render"] = "number-decimal"
        self.assertEqual(
            [Violation("semantic", "/registry_sha256", "registry.payload_not_canonical")],
            self.store.validate("cfg-registry", registry),
        )

        registry = copy.deepcopy(self.valid_documents["cfg-registry"])
        registry["state"] = "signed"
        self.assertEqual(
            [Violation("schema", "/state", "schema.enum")],
            self.store.validate("cfg-registry", registry),
        )

    def test_schema_formats_are_total_for_hostile_timestamp_and_url_edges(self) -> None:
        cases = [
            ("install-plan", "/expires_at", "not-a-dateZ"),
            ("install-plan", "/expires_at", "2026-08-30T24:00:00Z"),
            ("install-plan", "/expires_at", "2026-08-30T14:15:60Z"),
            ("install-plan", "/expires_at", "0000-08-30T14:15:00Z"),
            ("install-plan", "/expires_at", "10000-08-30T14:15:00Z"),
            ("hosted-release", "/created_at", "2026-02-30T12:00:00Z"),
            ("external-reference", "/observed_at", "not-a-dateZ"),
            ("external-reference", "/provenance/canonical_page", "https://example.invalid／evil"),
            ("external-reference", "/provenance/canonical_page", "https://[x"),
            ("external-reference", "/provenance/authoritative_host", "not a host"),
        ]
        for contract_name, path, value in cases:
            with self.subTest(contract=contract_name, path=path, value=value):
                mutated = apply_mutations(
                    self.valid_documents[contract_name],
                    [{"op": "replace", "path": path, "value": value}],
                )
                self.assertEqual(
                    [Violation("schema", path, "schema.format")],
                    self.store.validate(contract_name, mutated),
                )

    def test_https_url_components_reject_malformed_text_and_percent_escapes(self) -> None:
        cases = [
            "https://source.example.invalid/a b",
            "https://source.example.invalid/%zz",
            "https://source.example.invalid/%",
            "https://source.example.invalid/a\\b",
            "https://source.example.invalid/path?q=a b",
            "https://source.example.invalid/path?q=%zz",
            "https://source.example.invalid/path?q=%0",
            "https://source.example.invalid/path?q=a\\b",
            "https://source.example.invalid/path#f a",
            "https://source.example.invalid/path#%zz",
            "https://source.example.invalid/path#%0G",
            "https://source.example.invalid/path#a\\b",
        ]
        for value in cases:
            with self.subTest(value=value):
                mutated = apply_mutations(
                    self.valid_documents["external-reference"],
                    [{"op": "replace", "path": "/provenance/canonical_page", "value": value}],
                )
                self.assertEqual(
                    [Violation("schema", "/provenance/canonical_page", "schema.format")],
                    self.store.validate("external-reference", mutated),
                )

        valid = apply_mutations(
            self.valid_documents["external-reference"],
            [
                {
                    "op": "replace",
                    "path": "/provenance/canonical_page",
                    "value": "https://source.example.invalid/a%20b?q=%25#fragment%2Fpart",
                }
            ],
        )
        self.assertEqual([], self.store.validate("external-reference", valid))

    def test_pack_creation_precedes_approval_and_ready_plan_reference(self) -> None:
        pack = copy.deepcopy(self.valid_documents["pack"])
        pack["provenance"]["created_at"] = "2026-08-30T15:11:00Z"
        pack["version_sha256"] = pack_version_sha256(pack)
        pack["approval"]["approved_version_sha256"] = pack["version_sha256"]
        self.assertEqual(
            [Violation("semantic", "/approval/approved_at", "pack.evidence_before_creation")],
            self.store.validate("pack", pack),
        )

        community = copy.deepcopy(self.valid_documents["pack"])
        community["provenance"]["created_at"] = "2026-08-30T15:21:00Z"
        community["approval"] = {
            "status": "community-reported",
            "evidence_url": "https://example.invalid/evidence/fixture-pack",
            "approved_version_sha256": "d" * 64,
            "observed_at": "2026-08-30T15:20:00Z",
            "expires_at": "2026-09-30T15:20:00Z",
        }
        community["version_sha256"] = pack_version_sha256(community)
        community["approval"]["approved_version_sha256"] = community["version_sha256"]
        self.assertEqual(
            [Violation("semantic", "/approval/observed_at", "pack.evidence_before_creation")],
            self.store.validate("pack", community),
        )

        graph = {
            name: copy.deepcopy(self.valid_documents[name])
            for name in {"hosted-release", "external-reference", "install-plan", "profile", "pack"}
        }
        graph["pack"]["provenance"]["created_at"] = "2026-08-30T16:01:00Z"
        graph["pack"]["version_sha256"] = pack_version_sha256(graph["pack"])
        graph["pack"]["approval"]["approved_version_sha256"] = graph["pack"]["version_sha256"]
        graph["install-plan"]["source_request"]["pack_version_sha256"] = graph["pack"]["version_sha256"]
        self.assertEqual(
            [Violation("graph", "/install-plan/issued_at", "graph.pack_created_after_plan_issue")],
            validate_contract_graph(graph),
        )

    def test_revocation_chronology_is_fail_closed(self) -> None:
        hosted = copy.deepcopy(self.valid_documents["hosted-release"])
        hosted["state"] = "revoked"
        hosted["revocation"] = {"reason_code": "policy", "revoked_at": "2026-08-30T11:59:00Z"}
        self.assertEqual(
            [
                Violation("semantic", "/revocation/revoked_at", "hosted.revocation_before_creation"),
                Violation("semantic", "/revocation/revoked_at", "hosted.revocation_before_publication"),
            ],
            self.store.validate("hosted-release", hosted),
        )

        external = copy.deepcopy(self.valid_documents["external-reference"])
        external["state"] = "revoked"
        external["revocation"] = {"reason_code": "policy", "revoked_at": "2026-08-30T12:59:00Z"}
        self.assertEqual(
            [Violation("semantic", "/revocation/revoked_at", "external.revocation_before_observation")],
            self.store.validate("external-reference", external),
        )

        plan = copy.deepcopy(self.valid_documents["install-plan"])
        plan["state"] = "revoked"
        plan["revocation"] = {"reason_code": "policy", "revoked_at": "2026-08-30T15:59:00Z"}
        self.assertEqual(
            [Violation("semantic", "/revocation/revoked_at", "install.revocation_before_issue")],
            self.store.validate("install-plan", plan),
        )

        registry = copy.deepcopy(self.valid_documents["cfg-registry"])
        registry["state"] = "revoked"
        registry["registry_sha256"] = registry_signature_payload_sha256(registry)
        registry["signature"] = {
            "algorithm": "ed25519",
            "key_id": "fixture_signing_key",
            "signature_base64": base64.b64encode(bytes(64)).decode("ascii"),
            "verification_state": "not-verified",
        }
        registry["revocation"] = {"reason_code": "superseded", "revoked_at": "2026-08-30T15:59:00Z"}
        self.assertEqual(
            [Violation("semantic", "/revocation/revoked_at", "registry.revocation_before_snapshot")],
            self.store.validate("cfg-registry", registry),
        )

    def test_auto_apply_is_closed_until_a_verified_allowlist_exists(self) -> None:
        document = copy.deepcopy(self.valid_documents["cfg-setting"])
        document["setting"]["status"] = "supported"
        document["setting"]["provenance"]["evidence_kind"] = "official-documentation"
        document["setting"]["auto_apply"] = True
        self.assertEqual(
            [Violation("schema", "/setting/auto_apply", "schema.const")],
            self.store.validate("cfg-setting", document),
        )

    def test_fresh_gate_cannot_bootstrap_from_stale_repository_venv(self) -> None:
        with self.assertRaisesRegex(RuntimeError, "require Python 3.13.15"):
            assert_bootstrap((3, 9, 6), ROOT / ".venv" / "bin" / "python")
        with self.assertRaisesRegex(RuntimeError, "must not bootstrap"):
            assert_bootstrap(EXPECTED_PYTHON, ROOT / ".venv" / "bin" / "python")
        fresh_python = Path("/private/tmp/modlock-fresh/venv/bin/python")
        source_snapshot = Path("/private/tmp/modlock-fresh/source.sha256")
        commands = list(gate_commands(fresh_python, source_snapshot))
        self.assertTrue(all(command[0] == str(fresh_python) or command[0] == "git" for command in commands))
        self.assertFalse(any(str(ROOT / ".venv") in part for command in commands for part in command))
        self.assertEqual(["--write", str(source_snapshot)], commands[0][-2:])
        self.assertEqual(["--verify", str(source_snapshot)], commands[-1][-2:])

    def test_source_manifest_rejects_stale_bytes_exactly(self) -> None:
        relative_path = "mise.toml"
        correct_digest = sha256_file(ROOT / relative_path)
        with tempfile.TemporaryDirectory() as directory:
            manifest = Path(directory) / "manifest.sha256"
            manifest.write_text("{}  {}\n".format("0" * 64, relative_path), encoding="utf-8")
            self.assertEqual(
                ["manifest digest mismatch: mise.toml"],
                manifest_failures(manifest, [relative_path]),
            )
            manifest.write_text("{}  {}\n".format(correct_digest, relative_path), encoding="utf-8")
            self.assertEqual([], manifest_failures(manifest, [relative_path]))

    def test_protected_documentation_job_name_is_stable(self) -> None:
        workflow = (ROOT / ".github" / "workflows" / "docs.yml").read_text(encoding="utf-8")
        toolchain = (ROOT / "mise.toml").read_text(encoding="utf-8")
        self.assertEqual(1, workflow.count("    name: Validate documentation\n"))
        self.assertNotIn("    name: Validate documentation and contracts\n", workflow)
        self.assertIn("          python-version: '3.13.15'\n", workflow)
        self.assertIn("        run: python -I -B scripts/check_fresh.py\n", workflow)
        self.assertNotIn(".venv/bin/python", workflow)
        self.assertNotIn("3.12.5", workflow)
        self.assertEqual("3.13.15", tomllib.loads(toolchain)["tools"]["python"])

    def test_corpus_manifest_pins_exact_conformance_bytes(self) -> None:
        manifest = self.valid_documents["fixture-corpus"]
        listed_contracts = set()
        for record in manifest["conformance_fixtures"]:
            listed_contracts.add(record["contract_name"])
            self.assertTrue(safe_relative_path(record["path"]))
            self.assertFalse(path_has_symlink(ROOT, record["path"]), record["path"])
            candidate = ROOT / record["path"]
            self.assertTrue(candidate.is_file(), record["path"])
            resolved = candidate.resolve()
            resolved.relative_to(ROOT.resolve())
            self.assertEqual(record["sha256"], sha256_file(resolved), record["path"])
            parsed = load_json(resolved)
            self.assertEqual([], self.store.validate(record["contract_name"], parsed))
        self.assertEqual(set(self.store.contract_names) - {"fixture-corpus"}, listed_contracts)
        listed_paths = {record["path"] for record in manifest["conformance_fixtures"]}
        actual_paths = {
            str(path.relative_to(ROOT))
            for path in (ROOT / "fixtures" / "contracts" / "valid").iterdir()
            if path.is_file()
        }
        self.assertEqual(listed_paths, actual_paths)

    def test_fixture_tree_inventory_is_complete_symlink_free_and_parseable(self) -> None:
        fixture_root = ROOT / "fixtures"
        manifest = self.valid_documents["fixture-corpus"]
        expected_paths = {
            "fixtures/README.md",
            "fixtures/corpus-manifest.v1.json",
            "fixtures/contracts/conformance.v1.json",
        }
        expected_paths.update(record["path"] for record in manifest["conformance_fixtures"])
        discovered = []
        for path in fixture_root.rglob("*"):
            self.assertFalse(path.is_symlink(), str(path.relative_to(ROOT)))
            if path.is_file():
                discovered.append(path)
        self.assertEqual(expected_paths, {str(path.relative_to(ROOT)) for path in discovered})

        files = sorted(discovered)
        for path in files:
            with self.subTest(path=str(path.relative_to(ROOT))):
                self.assertIn(path.suffix, {".json", ".md"})
                self.assertLess(path.stat().st_size, 1024 * 1024)
                if path.suffix == ".json":
                    self.assertIsInstance(load_json(path), dict)
                else:
                    self.assertNotIn("\x00", path.read_text(encoding="utf-8"))

    def test_planned_corpus_controls_have_no_payloads(self) -> None:
        manifest = self.valid_documents["fixture-corpus"]
        self.assertEqual("scaffold-only", manifest["state"])
        self.assertEqual(0, manifest["materialized_payload_count"])
        for control in manifest["planned_controls"]:
            self.assertEqual("metadata-only", control["state"])
            self.assertIsNone(control["payload_path"])
            self.assertEqual("synthetic-control-only", control["rights_state"])
        assertions = manifest["content_assertions"]
        self.assertFalse(assertions["contains_game_bytes"])
        self.assertFalse(assertions["contains_mod_bytes"])
        self.assertFalse(assertions["contains_provider_bytes"])
        self.assertFalse(assertions["contains_archive_or_vpk_payloads"])

    def test_path_safety_matrix_is_deterministic(self) -> None:
        accepted = [
            "payload/synthetic_dir.vpk",
            "managed/unicode_α.vpk",
            "cfg/modlock-owned.cfg",
        ]
        rejected = [
            "",
            "/absolute.vpk",
            "../escape.vpk",
            "payload/../escape.vpk",
            "payload//double.vpk",
            "payload/./dot.vpk",
            "C:/device.vpk",
            "\\\\server\\share\\file.vpk",
            "payload\\windows.vpk",
            "payload/file.vpk:stream",
            "payload/CON.vpk",
            "payload/COM0.vpk",
            "payload/LPT0",
            "payload/COM¹.vpk",
            "payload/COM⁰.vpk",
            "payload/COM².vpk",
            "payload/COM³.vpk",
            "payload/LPT¹.vpk",
            "payload/LPT².vpk",
            "payload/LPT³.vpk",
            "payload/LPT⁹.vpk",
            "payload/control\x01.vpk",
            "payload/delete\x7f.vpk",
            "payload/new\nline.vpk",
            "payload/less<.vpk",
            "payload/greater>.vpk",
            "payload/quote\".vpk",
            "payload/pipe|.vpk",
            "payload/question?.vpk",
            "payload/star*.vpk",
            "payload/trailing-dot.",
            "payload/trailing-space ",
            "／absolute.vpk",
            "payload／..／escape.vpk",
            "payload＼evil.vpk",
            "Ｃ：／evil.vpk",
            "payload/CON．vpk",
            "payload/fullwidth＜.vpk",
            "payload/fullwidth＊.vpk",
            "payload/trailing-dot．",
            "payload/trailing-space　",
            "ﷺ" * 20,
        ]
        for path in accepted:
            with self.subTest(path=path):
                self.assertTrue(safe_relative_path(path))
        for path in rejected:
            with self.subTest(path=path):
                self.assertFalse(safe_relative_path(path))


if __name__ == "__main__":
    unittest.main()
