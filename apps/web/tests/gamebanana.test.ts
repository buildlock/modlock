import test from "node:test";
import assert from "node:assert/strict";
import {
  fetchJson,
  mediaUrl,
  normalizeProfile,
  plain,
  readIndex,
} from "../src/lib/gamebanana.ts";
import type { IndexEntry } from "../src/lib/gamebanana.ts";
const item = {
  _idRow: 123,
  _sModelName: "Mod",
  _sName: "Fixture skin",
  _aGame: { _idRow: 20948 },
  _sInitialVisibility: "show",
  _bIsObsolete: false,
  _bHasFiles: true,
  _bHasContentRatings: false,
  _aRootCategory: {
    _sName: "Skins",
    _sProfileUrl: "https://gamebanana.com/mods/cats/33295",
  },
  _aSubCategory: { _sName: "Haze" },
  _tsDateModified: 1700000000,
};
const envelope = (records: unknown[] = [item]) => ({
  _aMetadata: { _nRecordCount: records.length, _bIsComplete: true },
  _aRecords: records,
});
const entry: IndexEntry = readIndex(envelope(), "Mod").entries[0];
const checked = "2026-09-14T00:00:00.000Z";
const profile = () => ({
  ...item,
  _bIsPrivate: false,
  _bIsWithheld: false,
  _bIsTrashed: false,
  _aSubmitter: {
    _idRow: 4,
    _sName: "Fixture author",
    _sProfileUrl: "https://malicious.example/steal",
  },
  _sText: "<p>Original description.</p><script>alert(1)</script>",
  _aFiles: [{ _idRow: 42 }],
  _aPreviewMedia: {
    _aImages: [
      {
        _sType: "screenshot",
        _sBaseUrl: "https://images.gamebanana.com/img/ss/mods",
        _sFile: "example.jpg",
        _sFile530: "530-example.jpg",
      },
    ],
  },
  _aCredits: [
    {
      _sGroupName: "Authors",
      _aAuthors: [{ _sName: "Second creator", _sRole: "Textures", _idRow: 5 }],
    },
  ],
  _aLicenseChecklist: {
    yes: ["Download and install"],
    ask: ["Redistribute"],
    no: ["Commercial use"],
  },
});

test("normalizes only the requested game and model, preserving category and hero", () => {
  assert.equal(entry.category, "Skins");
  assert.equal(entry.hero, "Haze");
  assert.throws(
    () => readIndex(envelope([{ ...item, _aGame: { _idRow: 1 } }]), "Mod"),
    /identity or game/,
  );
  assert.throws(
    () => readIndex(envelope([{ ...item, _sModelName: "Sound" }]), "Mod"),
    /identity or game/,
  );
  assert.throws(() =>
    readIndex(
      envelope([{ ...item, _idRow: Number.MAX_SAFE_INTEGER + 1 }]),
      "Mod",
    ),
  );
});
test("a 200 error envelope and incomplete empty pages cannot complete an import", () => {
  assert.throws(() => readIndex({ _sErrorCode: "INPUT_ERRORS" }, "Mod"));
  assert.throws(
    () =>
      readIndex(
        {
          _aMetadata: { _bIsComplete: false, _nRecordCount: 3 },
          _aRecords: [],
        },
        "Mod",
      ),
    /empty page/,
  );
  assert.equal(readIndex(envelope([]), "Mod").complete, true);
});
test("unknown categories stay unclassified rather than becoming skins", () => {
  assert.equal(
    readIndex(
      envelope([
        {
          ...item,
          _aRootCategory: {
            _sProfileUrl: "https://gamebanana.com/mods/cats/999999",
          },
        },
      ]),
      "Mod",
    ).entries[0].category,
    "Other",
  );
});
test("restricted and ambiguous index state never becomes public", () => {
  for (const change of [
    { _bHasContentRatings: true },
    { _bHasContentRatings: undefined },
    { _sInitialVisibility: "warn" },
    { _bIsObsolete: true },
    { _bHasFiles: false },
  ]) {
    const candidate = readIndex(envelope([{ ...item, ...change }]), "Mod")
      .entries[0];
    assert.equal(normalizeProfile(profile(), candidate, checked), null);
  }
});
test("valid public profiles retain creator, credits and permissions with canonical links", () => {
  const mod = normalizeProfile(profile(), entry, checked)!;
  assert.equal(mod.url, "https://gamebanana.com/mods/123");
  assert.equal(mod.submitter.url, "https://gamebanana.com/members/4");
  assert.equal(mod.credits[0].name, "Second creator");
  assert.deepEqual(mod.permissions.ask, ["Redistribute"]);
  assert.equal(mod.body, "Original description.");
  assert.equal(
    mod.images[0].thumbnail,
    "https://images.gamebanana.com/img/ss/mods/530-example.jpg",
  );
});
test("private, withheld, trashed, obsolete, and ambiguous profiles are excluded", () => {
  for (const flag of ["_bIsPrivate", "_bIsWithheld", "_bIsTrashed"]) {
    assert.equal(
      normalizeProfile({ ...profile(), [flag]: true }, entry, checked),
      null,
    );
    assert.equal(
      normalizeProfile({ ...profile(), [flag]: undefined }, entry, checked),
      null,
    );
  }
  assert.equal(
    normalizeProfile({ ...profile(), _bIsObsolete: true }, entry, checked),
    null,
  );
  assert.equal(
    normalizeProfile(
      { ...profile(), _sInitialVisibility: "warn" },
      entry,
      checked,
    ),
    null,
  );
});
test("content ratings are restrictive, including unknown ratings and malformed shapes", () => {
  for (const ratings of [[{ code: "unknown" }], {}, null, "none"])
    assert.equal(
      normalizeProfile(
        { ...profile(), _aContentRatings: ratings },
        entry,
        checked,
      ),
      null,
    );
  assert.ok(
    normalizeProfile({ ...profile(), _aContentRatings: [] }, entry, checked),
  );
});
test("identity mismatch and missing attribution fail rather than silently remap", () => {
  assert.throws(() =>
    normalizeProfile({ ...profile(), _idRow: 124 }, entry, checked),
  );
  assert.throws(() =>
    normalizeProfile({ ...profile(), _aGame: { _idRow: 12 } }, entry, checked),
  );
  assert.throws(() =>
    normalizeProfile({ ...profile(), _aSubmitter: {} }, entry, checked),
  );
});
test("profiles without active files are not offered as available downloads", () => {
  assert.equal(
    normalizeProfile({ ...profile(), _aFiles: [] }, entry, checked),
    null,
  );
});
test("media rejects executable formats, foreign hosts, credentials and query strings", () => {
  for (const url of [
    "javascript:alert(1)",
    "https://images.gamebanana.com.evil.test/img/a.png",
    "http://images.gamebanana.com/img/a.jpg",
    "https://user:pass@images.gamebanana.com/img/a.jpg",
    "https://images.gamebanana.com/img/a.svg",
    "https://images.gamebanana.com/img/a.png?token=x",
    "https://127.0.0.1/img/a.jpg",
  ])
    assert.equal(mediaUrl(url), null, url);
  assert.equal(
    mediaUrl("https://images.gamebanana.com/img/a.webp"),
    "https://images.gamebanana.com/img/a.webp",
  );
});
test("foreign previews are dropped without losing the original source link", () => {
  const mod = normalizeProfile(
    {
      ...profile(),
      _aPreviewMedia: {
        _aImages: [
          {
            _sType: "screenshot",
            _sBaseUrl: "https://malicious.example",
            _sFile: "tracking.png",
          },
        ],
      },
    },
    entry,
    checked,
  )!;
  assert.equal(mod.images.length, 0);
  assert.equal(mod.url, "https://gamebanana.com/mods/123");
});
test("untrusted descriptions are bounded plain text, not HTML", () => {
  assert.equal(
    plain("<style>bad</style><b>A &amp; B</b><br>Next<script>x()</script>"),
    "A & B\nNext",
  );
  assert.equal(plain("x".repeat(5000), 80).length, 80);
  assert.equal(plain({ html: "no" }), "");
});
const endpoint = new URL("https://gamebanana.com/apiv11/Mod/Index");
const respond = (response: Response) => (async () => response) as typeof fetch;
test("accepts apiv11 JSON mislabeled text/html but rejects actual HTML", async () => {
  assert.deepEqual(
    await fetchJson(
      endpoint,
      respond(
        new Response('{"ok":true}', {
          headers: { "content-type": "text/html" },
        }),
      ),
    ),
    { ok: true },
  );
  await assert.rejects(
    fetchJson(endpoint, respond(new Response("<html>upstream error</html>"))),
  );
});
test("provider fetch rejects arbitrary endpoints before making a network request", async () => {
  let called = false;
  await assert.rejects(
    fetchJson(new URL("https://example.com"), (async () => {
      called = true;
      return new Response("{}");
    }) as typeof fetch),
  );
  assert.equal(called, false);
});
test("HTTP failures cannot masquerade as an empty catalog", async () => {
  await assert.rejects(
    fetchJson(endpoint, respond(new Response("{}", { status: 429 }))),
    /HTTP 429/,
  );
});
test("provider body limits apply to actual streamed bytes, not a claimed content length", async () => {
  await assert.rejects(
    fetchJson(
      endpoint,
      respond(
        new Response("x".repeat(8 * 1024 * 1024 + 1), {
          headers: { "content-length": "1" },
        }),
      ),
    ),
    /8 MiB/,
  );
});

test("catalog query state round-trips and bounds untrusted URL values", async () => {
  const { parseCatalogState, serializeCatalogState } = await import(
    "../src/lib/catalog-state.ts"
  );
  const state = {
    query: "Haze & Ivy",
    category: "Skins",
    hero: "Haze",
    sort: "likes",
    page: 2,
    list: true,
  };
  assert.deepEqual(
    parseCatalogState(new URLSearchParams(serializeCatalogState(state))),
    state,
  );
  const invalid = parseCatalogState(
    new URLSearchParams({
      q: "x".repeat(300),
      category: "bad",
      page: "-1",
      sort: "SQL",
      view: "unexpected",
    }),
  );
  assert.equal(invalid.query.length, 120);
  assert.equal(invalid.category, "All mods");
  assert.equal(invalid.page, 1);
  assert.equal(invalid.sort, "updated");
  assert.equal(invalid.list, false);
});
