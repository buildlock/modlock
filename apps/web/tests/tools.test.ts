import test from "node:test";
import assert from "node:assert/strict";
import { parseKeyValues } from "../src/lib/keyvalues.ts";
import {
  readVpkHeader,
  inspectVpkDirectory,
  MAX_VPK_TREE,
} from "../src/lib/vpk.ts";
import {
  readCrosshair,
  crosshairDocument,
  defaultCrosshair,
} from "../src/lib/crosshair.ts";
import { safeReturnPath } from "../src/lib/navigation.ts";
import { readAccountConfig } from "../src/server/config.ts";

test("KeyValues keeps duplicate pairs, order, strings and escaped values", () => {
  assert.deepEqual(
    parseKeyValues(
      '\uFEFF// fixture\n"root" { tag one tag "two" url "https://example.test" nested { empty "" line "one\\ntwo" } }',
    ),
    [
      {
        key: "root",
        value: [
          { key: "tag", value: "one" },
          { key: "tag", value: "two" },
          { key: "url", value: "https://example.test" },
          {
            key: "nested",
            value: [
              { key: "empty", value: "" },
              { key: "line", value: "one\ntwo" },
            ],
          },
        ],
      },
    ],
  );
  assert.deepEqual(parseKeyValues('"__proto__" "just text"'), [
    { key: "__proto__", value: "just text" },
  ]);
});
test("KeyValues rejects malformed, unsupported, binary and excessive inputs", () => {
  for (const input of [
    "key",
    "{key value}",
    "key { inner value",
    'key "unfinished',
    '#include "somefile"',
    "key value [$WIN32]",
    "/* comment */ key value",
    "<!-- kv3 --> { key = value }",
    'key "bad\\q"',
    "key\0value",
  ])
    assert.throws(() => parseKeyValues(input));
  assert.throws(
    () => parseKeyValues("k {".repeat(18) + "v t" + "}".repeat(18)),
    /Nesting/,
  );
  assert.throws(() => parseKeyValues("k v ".repeat(8193)), /8192/);
  assert.throws(() => parseKeyValues('k "' + "a".repeat(4100) + '"'), /4096/);
  assert.throws(() => parseKeyValues("x".repeat(1024 * 1024 + 1)), /1 MiB/);
});
function fixture(version: 1 | 2, paths = ["assets/example"]) {
  const parts: Buffer[] = [Buffer.from("txt\0")];
  for (const path of paths) {
    const cut = path.lastIndexOf("/"),
      directory = cut < 0 ? " " : path.slice(0, cut),
      name = path.slice(cut + 1),
      entry = Buffer.alloc(18);
    entry.writeUInt16LE(3, 4);
    entry.writeUInt16LE(0x7fff, 6);
    entry.writeUInt16LE(0xffff, 16);
    parts.push(
      Buffer.from(`${directory}\0${name}\0`),
      entry,
      Buffer.from("abc"),
      Buffer.from([0]),
    );
  }
  parts.push(Buffer.from([0, 0]));
  const tree = Buffer.concat(parts),
    header = Buffer.alloc(version === 1 ? 12 : 28);
  header.writeUInt32LE(0x55aa1234, 0);
  header.writeUInt32LE(version, 4);
  header.writeUInt32LE(tree.length, 8);
  return Buffer.concat([header, tree]);
}
test("VPK reads synthetic v1/v2 directory entries and preload bytes without extraction", () => {
  for (const version of [1, 2] as const) {
    const bytes = fixture(version),
      result = inspectVpkDirectory(bytes, bytes.length);
    assert.equal(result.header.version, version);
    assert.equal(result.totalBytes, 3);
    assert.equal(result.entries[0].path, "assets/example.txt");
    assert.equal(result.entries[0].archive, 0x7fff);
    assert.equal(result.warnings, 0);
  }
});
test("VPK identifies traversal and case-insensitive duplicate names", () => {
  const bytes = fixture(2, ["../escape", "assets/Example", "assets/example"]),
    result = inspectVpkDirectory(bytes, bytes.length);
  assert.equal(result.warnings, 2);
  assert.equal(result.entries[0].warning, "Unsafe path");
  assert.equal(result.entries[2].warning, "Duplicate path");
});
test("VPK rejects corrupt headers, entry bounds, terminators, trailing bytes and oversized directories", () => {
  const original = fixture(2);
  assert.throws(() => readVpkHeader(original.subarray(0, 11), original.length));
  for (const [offset, value] of [
    [0, 0],
    [4, 3],
    [8, MAX_VPK_TREE + 1],
    [12, 10000],
  ] as const) {
    const bytes = Buffer.from(original);
    bytes.writeUInt32LE(value, offset);
    assert.throws(() => inspectVpkDirectory(bytes, bytes.length));
  }
  assert.throws(() =>
    inspectVpkDirectory(original.subarray(0, -1), original.length),
  );
  const entryStart = 28 + 4 + 7 + 8;
  const invalidTerminator = Buffer.from(original);
  invalidTerminator.writeUInt16LE(0, entryStart + 16);
  assert.throws(
    () => inspectVpkDirectory(invalidTerminator, invalidTerminator.length),
    /terminator/,
  );
  const outsideEmbedded = Buffer.from(original);
  outsideEmbedded.writeUInt32LE(10, entryStart + 12);
  assert.throws(
    () => inspectVpkDirectory(outsideEmbedded, outsideEmbedded.length),
    /embedded/,
  );
  const trailing = Buffer.concat([original, Buffer.from([0])]);
  trailing.writeUInt32LE(trailing.readUInt32LE(8) + 1, 8);
  assert.throws(
    () => inspectVpkDirectory(trailing, trailing.length),
    /trailing/,
  );
});
test("crosshair export and import use the authoritative closed contract", () => {
  const document = crosshairDocument(defaultCrosshair);
  assert.deepEqual(readCrosshair(JSON.stringify(document)), document);
  for (const value of [
    { ...document, schema_version: 2 },
    { ...document, gameValidated: true },
    { ...document, extra: "no" },
    { ...document, design: { ...defaultCrosshair, thickness: 1.5 } },
    { ...document, design: { ...defaultCrosshair, color: "red;url(bad)" } },
  ])
    assert.throws(() => readCrosshair(JSON.stringify(value)));
  assert.throws(() => readCrosshair(" ".repeat(4097)), /4 KiB/);
  assert.throws(
    () => readCrosshair('{"version":1,"\\u0076ersion":2}'),
    /Duplicate/,
  );
});
test("return links cannot escape the website or introduce redirect payloads", () => {
  for (const value of [
    "//evil.test",
    "https://evil.test",
    "/\\evil",
    "/library?next=evil",
    "/account\n",
    "/api/auth/delete-user",
    "/%2f%2fevil",
  ])
    assert.equal(safeReturnPath(value), "/library");
  for (const value of [
    "/mods/mod-123/report",
    "/tools/crosshair",
    "/account/security",
    "/moderation",
  ])
    assert.equal(safeReturnPath(value), value);
});
test("account configuration is disabled by default and rejects public activation", () => {
  assert.equal(readAccountConfig({}).enabled, false);
  const env = {
    MODLOCK_LOCAL_ACCOUNTS: "1",
    BETTER_AUTH_URL: "http://127.0.0.1:4310",
    DATABASE_URL: "postgres://test:test@127.0.0.1:54339/test",
    BETTER_AUTH_SECRET: "x".repeat(48),
    MODLOCK_MAIL_TRANSPORT: "outbox",
  };
  assert.equal(readAccountConfig(env).enabled, true);
  assert.throws(
    () =>
      readAccountConfig({ ...env, BETTER_AUTH_URL: "https://modlock.example" }),
    /Deployment is on hold/,
  );
  assert.throws(
    () =>
      readAccountConfig({
        ...env,
        DATABASE_URL: "postgres://test:test@remote.example/test",
      }),
    /dedicated local/,
  );
  assert.throws(
    () => readAccountConfig({ ...env, BETTER_AUTH_SECRET: "short" }),
    /private random/,
  );
  assert.throws(
    () => readAccountConfig({ ...env, MODLOCK_MAIL_TRANSPORT: "smtp" }),
    /outbox/,
  );
});
