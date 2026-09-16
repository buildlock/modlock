import test from "node:test";
import assert from "node:assert/strict";
import {
  refreshCatalog,
  PROFILE_TTL,
  RETENTION_TTL,
  validateCatalog,
} from "../src/lib/catalog-refresh.ts";
import type {
  ProfileCheckpoint,
  RefreshStore,
} from "../src/lib/catalog-refresh.ts";
import { normalizeProfile, readIndex } from "../src/lib/gamebanana.ts";
import type { Catalog } from "../src/lib/gamebanana.ts";

const NOW = Date.parse("2026-09-16T12:00:00.000Z");
const item = (id: number, overrides: Record<string, unknown> = {}) => ({
  _idRow: id,
  _sModelName: "Mod",
  _sName: `Fixture ${id}`,
  _aGame: { _idRow: 20948 },
  _sInitialVisibility: "show",
  _bIsObsolete: false,
  _bHasFiles: true,
  _bHasContentRatings: false,
  _bIsPrivate: false,
  _bIsWithheld: false,
  _bIsTrashed: false,
  _tsDateModified: 1700000000,
  _aFiles: [{ _idRow: 1 }],
  _aSubmitter: { _idRow: 1, _sName: "Fixture author" },
  ...overrides,
});
const envelope = (items: unknown[], complete = true) => ({
  _aRecords: items,
  _aMetadata: { _nRecordCount: items.length, _bIsComplete: complete },
});
function previous(ids: number[], checked = NOW - 2 * PROFILE_TTL): Catalog {
  return {
    version: 1,
    complete: true,
    syncedAt: new Date(checked).toISOString(),
    discovered: ids.length,
    pending: 0,
    excluded: 0,
    errors: 0,
    pages: 2,
    mods: ids.map(
      (id) =>
        normalizeProfile(
          item(id),
          readIndex(envelope([item(id)]), "Mod").entries[0],
          new Date(checked).toISOString(),
        )!,
    ),
  };
}
function memory(initial: Catalog | null = null) {
  let catalog = initial;
  let publications = 0;
  const profiles = new Map<string, ProfileCheckpoint>();
  const store: RefreshStore = {
    catalog: async () => catalog,
    profiles: async (keys) =>
      [...profiles.values()].filter((profile) => keys.includes(profile.key)),
    checkpoint: async (profile) => {
      profiles.set(profile.key, structuredClone(profile));
    },
    publish: async (value) => {
      catalog = structuredClone(value);
      publications++;
    },
  };
  return {
    store,
    profiles,
    current: () => catalog,
    publications: () => publications,
  };
}
function provider(ids: number[], override: (id: number) => unknown = item) {
  const fetched: number[] = [];
  return {
    fetched,
    request: async (url: URL) => {
      if (url.pathname === "/apiv11/Mod/Index")
        return envelope(ids.map((id) => item(id)));
      if (url.pathname === "/apiv11/Sound/Index") return envelope([]);
      const id = Number(url.pathname.split("/")[3]);
      fetched.push(id);
      return override(id);
    },
  };
}

test("bounded daily refresh retains unchanged listings and advances through every stale profile", async () => {
  const fixture = memory(previous([1, 2, 3, 4]));
  const source = provider([1, 2, 3, 4]);
  for (let run = 0; run < 4; run++) {
    const result = await refreshCatalog(fixture.store, {
      ...source,
      details: 1,
      now: () => NOW + run * 1000,
    });
    assert.equal(result.mods.length, 4);
    assert.equal(result.pending, 3 - run);
    assert.equal(result.retained, 3 - run);
  }
  assert.deepEqual(source.fetched, [1, 2, 3, 4]);
});

test("failed profiles advance the durable queue and do not starve new entries after restart", async () => {
  const fixture = memory();
  const source = provider([1, 2, 3], (id) => {
    if (id === 1) throw new Error("unavailable");
    return item(id);
  });
  for (let run = 0; run < 3; run++)
    await refreshCatalog(fixture.store, {
      ...source,
      details: 1,
      now: () => NOW + run * 1000,
    });
  assert.deepEqual(source.fetched, [1, 2, 3]);
  assert.deepEqual(
    fixture.current()!.mods.map((mod) => mod.id),
    [2, 3],
  );
  assert.equal(fixture.current()!.pending, 1);
});

test("fresh negative profile checks are retained so ineligible entries do not consume every batch", async () => {
  const fixture = memory();
  const source = provider([1, 2], (id) =>
    item(id, id === 1 ? { _bIsPrivate: true } : {}),
  );
  await refreshCatalog(fixture.store, {
    ...source,
    details: 1,
    now: () => NOW,
  });
  const result = await refreshCatalog(fixture.store, {
    ...source,
    details: 1,
    now: () => NOW + 1000,
  });
  assert.deepEqual(source.fetched, [1, 2]);
  assert.equal(result.excluded, 1);
  assert.equal(result.pending, 0);
});

test("a changed revision is withheld when its profile fails, while unchanged eligible metadata retains its original timestamp", async () => {
  const fixture = memory(previous([1, 2]));
  const result = await refreshCatalog(fixture.store, {
    details: 2,
    now: () => NOW,
    request: async (url) => {
      if (url.pathname === "/apiv11/Mod/Index")
        return envelope([item(1, { _tsDateModified: 1700000100 }), item(2)]);
      if (url.pathname === "/apiv11/Sound/Index") return envelope([]);
      throw new Error("provider unavailable");
    },
  });
  assert.deepEqual(
    result.mods.map((mod) => mod.id),
    [2],
  );
  assert.equal(
    result.mods[0].checkedAt,
    new Date(NOW - 2 * PROFILE_TTL).toISOString(),
  );
  assert.equal(result.errors, 2);
  assert.equal(result.retained, 1);
});

test("explicit restriction and omission withdraw cached listings even when another profile fails", async () => {
  const fixture = memory(previous([1, 2, 3]));
  const result = await refreshCatalog(fixture.store, {
    now: () => NOW,
    request: async (url) => {
      if (url.pathname === "/apiv11/Mod/Index")
        return envelope([item(1, { _bHasContentRatings: true }), item(2)]);
      if (url.pathname === "/apiv11/Sound/Index") return envelope([]);
      throw new Error("provider unavailable");
    },
  });
  assert.deepEqual(
    result.mods.map((mod) => mod.id),
    [2],
  );
  assert.equal(fixture.profiles.get("mod-1")!.mod, null);
  const source = provider([1, 2], (id) => item(id, { _bIsPrivate: true }));
  await refreshCatalog(fixture.store, { ...source, now: () => NOW + 1000 });
  assert.ok(
    source.fetched.includes(1),
    "newly public index must not resurrect pre-restriction metadata",
  );
});

test("profiles older than seven days or from the future cannot be retained", async () => {
  for (const at of [NOW - RETENTION_TTL, NOW + 1000]) {
    const fixture = memory(previous([1], at));
    const result = await refreshCatalog(fixture.store, {
      ...provider([1], () => {
        throw new Error("offline");
      }),
      now: () => NOW,
    });
    assert.equal(result.mods.length, 0);
    assert.equal(result.pending, 1);
  }
});

test("a complete empty source may withdraw the last listing without manufacturing source deletion claims", async () => {
  const fixture = memory(previous([1]));
  const result = await refreshCatalog(fixture.store, {
    ...provider([]),
    now: () => NOW,
  });
  assert.equal(result.mods.length, 0);
  assert.equal(result.complete, true);
});

test("incomplete, failed or malformed index walks never publish or advance profile checkpoints", async () => {
  for (const kind of ["incomplete", "failure", "invalid"]) {
    const fixture = memory(previous([1]));
    await assert.rejects(
      refreshCatalog(fixture.store, {
        pages: 1,
        now: () => NOW,
        request: async () => {
          if (kind === "failure") throw new Error("offline");
          return kind === "invalid"
            ? { _sErrorCode: "INPUT_ERRORS" }
            : envelope([item(1)], false);
        },
      }),
    );
    assert.equal(fixture.publications(), 0);
    assert.equal(fixture.profiles.size, 0);
  }
});

test("checkpoint storage failure prevents publication and is not misclassified as a provider failure", async () => {
  const fixture = memory();
  fixture.store.checkpoint = async () => {
    throw new Error("storage unavailable");
  };
  await assert.rejects(
    refreshCatalog(fixture.store, { ...provider([1]), now: () => NOW }),
    /storage unavailable/,
  );
  assert.equal(fixture.publications(), 0);
});

test("five consecutive profile failures open the circuit, preserve the queue and bound requests", async () => {
  const fixture = memory();
  const source = provider(
    Array.from({ length: 10 }, (_, i) => i + 1),
    () => {
      throw new Error("offline");
    },
  );
  const result = await refreshCatalog(fixture.store, {
    ...source,
    now: () => NOW,
  });
  assert.equal(source.fetched.length, 5);
  assert.equal(result.errors, 5);
  assert.equal(result.pending, 10);
});

test("profile/index revision race remains pending rather than becoming a falsely fresh listing", async () => {
  const fixture = memory();
  const result = await refreshCatalog(fixture.store, {
    ...provider([1], (id) => item(id, { _tsDateModified: 1700000100 })),
    now: () => NOW,
  });
  assert.equal(result.mods.length, 0);
  assert.equal(result.errors, 1);
  assert.equal(result.pending, 1);
});

test("catalogue publication rejects duplicate identities, wrong URLs and invalid counters", () => {
  const good = previous([1]);
  validateCatalog(good);
  assert.throws(() =>
    validateCatalog({ ...good, mods: [...good.mods, good.mods[0]] }),
  );
  assert.throws(() =>
    validateCatalog({
      ...good,
      mods: [{ ...good.mods[0], url: "https://example.test" }],
    }),
  );
  assert.throws(() => validateCatalog({ ...good, errors: -1 }));
});

test("read-time expiry removes old profiles even when an index outage prevents a new publication", async () => {
  const { currentCatalogProfiles } = await import(
    "../src/lib/catalog-refresh.ts"
  );
  const fixture = memory(previous([1], NOW - RETENTION_TTL + 1000));
  assert.equal(currentCatalogProfiles(fixture.current()!, NOW).mods.length, 1);
  await assert.rejects(
    refreshCatalog(fixture.store, {
      now: () => NOW + 1000,
      request: async () => {
        throw new Error("index unavailable");
      },
    }),
  );
  assert.equal(
    fixture.current()!.mods.length,
    1,
    "raw publication remains intact",
  );
  assert.equal(
    currentCatalogProfiles(fixture.current()!, NOW + 1000).mods.length,
    0,
    "expired data is withheld when served",
  );
});
