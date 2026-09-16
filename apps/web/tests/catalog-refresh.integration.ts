import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { after, test } from "node:test";
import { Pool } from "pg";
import {
  CATALOG_REFRESH_LOCK,
  DatabaseRefreshStore,
} from "../src/server/catalog-refresh-store.ts";
import { refreshCatalog } from "../src/lib/catalog-refresh.ts";
import type { Catalog } from "../src/lib/gamebanana.ts";

const enabled = process.env.MODLOCK_TEST_SHARED === "1";
const integration = enabled ? test : test.skip;
const url = new URL(
  process.env.DATABASE_URL || "postgresql://localhost/disabled",
);
if (
  enabled &&
  (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    !/^\/modlock_shared_[a-f0-9]{12,32}$/.test(url.pathname))
)
  throw new Error("Use a fresh loopback fixture database.");
const pool = new Pool({ connectionString: url.href, max: 3 });
const catalog = (time: string): Catalog => ({
  version: 1,
  syncedAt: time,
  complete: true,
  discovered: 0,
  pending: 0,
  excluded: 0,
  errors: 0,
  pages: 2,
  retained: 0,
  mods: [],
});
after(async () => {
  await pool.end();
});

integration(
  "catalogue lock excludes another connection and is recoverable after the worker connection dies",
  async () => {
    const first = await pool.connect(),
      second = await pool.connect();
    let closed = false;
    try {
      assert.equal(
        (
          await first.query("SELECT pg_try_advisory_lock($1) AS acquired", [
            CATALOG_REFRESH_LOCK,
          ])
        ).rows[0].acquired,
        true,
      );
      assert.equal(
        (
          await second.query("SELECT pg_try_advisory_lock($1) AS acquired", [
            CATALOG_REFRESH_LOCK,
          ])
        ).rows[0].acquired,
        false,
      );
      first.release(true);
      closed = true;
      // This blocking lock has a short database timeout and can succeed only once
      // PostgreSQL has observed closure of the original owning session.
      await second.query("SET statement_timeout='2s'");
      await second.query("SELECT pg_advisory_lock($1)", [CATALOG_REFRESH_LOCK]);
      await second.query("SELECT pg_advisory_unlock($1)", [
        CATALOG_REFRESH_LOCK,
      ]);
    } finally {
      if (!closed) first.release(true);
      second.release(true);
    }
  },
);

integration(
  "normalized profile checkpoints survive a connection restart",
  async () => {
    const first = await pool.connect();
    const checkpoint = {
      key: "mod-123",
      attemptedAt: "2026-09-16T01:00:00.000Z",
      checkedAt: null,
      revision: null,
      mod: null,
    };
    try {
      await new DatabaseRefreshStore(first).checkpoint(checkpoint);
    } finally {
      first.release(true);
    }
    const second = await pool.connect();
    try {
      assert.deepEqual(
        await new DatabaseRefreshStore(second).profiles(["mod-123"]),
        [checkpoint],
      );
    } finally {
      second.release(true);
    }
  },
);

integration(
  "publication and checkpoint pruning roll back together on a storage failure",
  async () => {
    const client = await pool.connect();
    try {
      const store = new DatabaseRefreshStore(client),
        before = catalog("2026-09-15T00:00:00.000Z");
      await store.publish(before, ["mod-123"]);
      await client.query(
        "CREATE FUNCTION reject_checkpoint_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture rejection'; END $$",
      );
      await client.query(
        "CREATE TRIGGER reject_checkpoint_delete BEFORE DELETE ON catalog_profile_checkpoint FOR EACH ROW EXECUTE FUNCTION reject_checkpoint_delete()",
      );
      await assert.rejects(
        store.publish(catalog("2026-09-16T00:00:00.000Z"), []),
        /fixture rejection/,
      );
      assert.deepEqual(await store.catalog(), before);
      assert.equal((await store.profiles(["mod-123"])).length, 1);
      await client.query(
        "DROP TRIGGER reject_checkpoint_delete ON catalog_profile_checkpoint",
      );
      await client.query("DROP FUNCTION reject_checkpoint_delete()");
      await store.publish(catalog("2026-09-16T00:00:00.000Z"), []);
      assert.equal((await store.profiles(["mod-123"])).length, 0);
    } finally {
      client.release(true);
    }
  },
);

integration(
  "catalogue worker capability can refresh metadata and cannot read account data",
  async () => {
    const role = `catalog_fixture_${randomBytes(8).toString("hex")}`;
    const client = await pool.connect();
    try {
      await client.query(
        `CREATE ROLE "${role}" NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT`,
      );
      await client.query(`GRANT USAGE ON SCHEMA public TO "${role}"`);
      await client.query(
        `GRANT SELECT, INSERT, UPDATE ON catalog_snapshot TO "${role}"`,
      );
      await client.query(
        `GRANT SELECT, INSERT, UPDATE, DELETE ON catalog_profile_checkpoint TO "${role}"`,
      );
      await client.query(`SET ROLE "${role}"`);
      const store = new DatabaseRefreshStore(client);
      await store.checkpoint({
        key: "mod-321",
        attemptedAt: "2026-09-16T00:00:00.000Z",
        checkedAt: null,
        revision: null,
        mod: null,
      });
      await store.publish(catalog("2026-09-16T01:00:00.000Z"), []);
      await assert.rejects(
        client.query('SELECT * FROM "user"'),
        /permission denied/,
      );
      await assert.rejects(
        client.query("SELECT * FROM saved_mod"),
        /permission denied/,
      );
      await assert.rejects(
        client.query("DELETE FROM catalog_snapshot"),
        /permission denied/,
      );
    } finally {
      await client.query("RESET ROLE");
      await client.query(`DROP OWNED BY "${role}"`);
      await client.query(`DROP ROLE "${role}"`);
      client.release(true);
    }
  },
);

integration(
  "restart reconciles 10001 stored checkpoints against a current 10000-entry index and prunes the obsolete row",
  async () => {
    const client = await pool.connect();
    try {
      // A complete prior run had keys 1..10000. It then checkpointed the new
      // replacement 10001 and died before publishing/pruning old key 1.
      await client.query(`INSERT INTO catalog_profile_checkpoint(key,document)
      SELECT 'mod-' || n, jsonb_build_object('key','mod-' || n,
        'attemptedAt','2026-09-15T00:00:00.000Z','checkedAt',NULL,'revision',NULL,'mod',NULL)
      FROM generate_series(1,10001) n`);
      const item = (id: number) => ({
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
      });
      const result = await refreshCatalog(new DatabaseRefreshStore(client), {
        pages: 200,
        details: 1,
        now: () => Date.parse("2026-09-16T12:00:00.000Z"),
        request: async (url) => {
          if (url.pathname === "/apiv11/Sound/Index")
            return {
              _aRecords: [],
              _aMetadata: { _nRecordCount: 0, _bIsComplete: true },
            };
          if (url.pathname === "/apiv11/Mod/Index") {
            const page = Number(url.searchParams.get("_nPage"));
            return {
              _aRecords: Array.from({ length: 50 }, (_, i) =>
                item((page - 1) * 50 + i + 2),
              ),
              _aMetadata: { _nRecordCount: 10000, _bIsComplete: page === 200 },
            };
          }
          return item(Number(url.pathname.split("/")[3]));
        },
      });
      assert.equal(result.discovered, 10000);
      assert.equal(result.mods.length, 1);
      assert.equal(
        (
          await client.query(
            "SELECT count(*)::int AS count FROM catalog_profile_checkpoint",
          )
        ).rows[0].count,
        10000,
      );
      assert.equal(
        (
          await client.query(
            "SELECT * FROM catalog_profile_checkpoint WHERE key='mod-1'",
          )
        ).rowCount,
        0,
      );
    } finally {
      client.release(true);
    }
  },
);
