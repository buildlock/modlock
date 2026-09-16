import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { after, test } from "node:test";
import { Pool } from "pg";
import {
  CATALOG_REFRESH_LOCK,
  DatabaseRefreshStore,
} from "../src/server/catalog-refresh-store.ts";
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
      assert.deepEqual(await new DatabaseRefreshStore(second).profiles(), [
        checkpoint,
      ]);
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
      assert.equal((await store.profiles()).length, 1);
      await client.query(
        "DROP TRIGGER reject_checkpoint_delete ON catalog_profile_checkpoint",
      );
      await client.query("DROP FUNCTION reject_checkpoint_delete()");
      await store.publish(catalog("2026-09-16T00:00:00.000Z"), []);
      assert.equal((await store.profiles()).length, 0);
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
