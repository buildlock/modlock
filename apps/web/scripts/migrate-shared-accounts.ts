import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { getDatabase } from "../src/server/database.ts";
import { readAccountConfig } from "../src/server/config.ts";

const config = readAccountConfig();
if (config.mode !== "shared") throw new Error("This migrator requires shared account mode.");
const databaseName = new URL(config.databaseUrl).pathname.slice(1);
if (!/^modlock(?:_shared_[a-f0-9]{12,32})?$/.test(databaseName)) throw new Error("Migrate only the dedicated Modlock database.");
const pool = getDatabase(), client = await pool.connect();
try {
  await client.query("SELECT pg_advisory_lock(86731502)");
  const legacy = await client.query("SELECT to_regclass('public.account') AS legacy");
  if (legacy.rows[0].legacy) throw new Error("Shared mode requires a separate database; local credentials are never migrated implicitly.");
  await client.query(`CREATE TABLE IF NOT EXISTS "user" (
    id text PRIMARY KEY CHECK (id ~ '^[a-f0-9-]{36}$'),
    name text NOT NULL, image text, email text,
    "emailVerified" boolean NOT NULL DEFAULT false,
    "twoFactorEnabled" boolean NOT NULL DEFAULT false,
    "createdAt" timestamptz NOT NULL, "updatedAt" timestamptz NOT NULL
  )`);
  await client.query("CREATE TABLE IF NOT EXISTS modlock_migration (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())");
  for (const name of (await readdir(resolve("migrations"))).filter((name) => /^\d{4}-[a-z-]+\.sql$/.test(name)).sort()) {
    const sql = await readFile(resolve("migrations", name), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const existing = await client.query("SELECT checksum FROM modlock_migration WHERE name=$1", [name]);
    if (existing.rowCount) {
      if (existing.rows[0].checksum !== checksum) throw new Error(`Applied migration changed: ${name}`);
      continue;
    }
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO modlock_migration(name,checksum) VALUES($1,$2)", [name, checksum]);
      await client.query("COMMIT");
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    console.log(`Applied ${name}`);
  }
  // Shared usernames are issuer-controlled and may start with a digit or
  // contain a period. The local-account constraint remains unchanged there.
  const version = "shared-identity-v1";
  const migration = `ALTER TABLE member_profile DROP CONSTRAINT member_profile_handle_check;
    ALTER TABLE member_profile ADD CONSTRAINT member_profile_handle_check CHECK (handle ~ '^[a-z0-9_.]{3,20}$');
    CREATE TABLE catalog_snapshot (
      singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
      document jsonb NOT NULL CHECK (jsonb_typeof(document)='object'),
      published_at timestamptz NOT NULL DEFAULT now()
    );`;
  const digest = createHash("sha256").update(migration).digest("hex");
  const applied = await client.query("SELECT checksum FROM modlock_migration WHERE name=$1", [version]);
  if (applied.rowCount && applied.rows[0].checksum !== digest) throw new Error("Shared migration changed.");
  if (!applied.rowCount) {
    await client.query("BEGIN");
    try {
      await client.query(migration);
      await client.query("INSERT INTO modlock_migration(name,checksum) VALUES($1,$2)", [version,digest]);
      await client.query("COMMIT");
    } catch (error) { await client.query("ROLLBACK"); throw error; }
  }
  const handleVersion = "shared-handle-reuse-v1";
  const handleMigration = "ALTER TABLE member_profile ALTER COLUMN handle DROP NOT NULL";
  const handleDigest = createHash("sha256").update(handleMigration).digest("hex");
  const handleApplied = await client.query("SELECT checksum FROM modlock_migration WHERE name=$1", [handleVersion]);
  if (handleApplied.rowCount && handleApplied.rows[0].checksum !== handleDigest) throw new Error("Shared handle migration changed.");
  if (!handleApplied.rowCount) {
    await client.query("BEGIN");
    try {
      await client.query(handleMigration);
      await client.query("INSERT INTO modlock_migration(name,checksum) VALUES($1,$2)", [handleVersion,handleDigest]);
      await client.query("COMMIT");
    } catch (error) { await client.query("ROLLBACK"); throw error; }
  }
  console.log("Shared Modlock product storage is ready.");
} finally {
  await client.query("SELECT pg_advisory_unlock(86731502)"); client.release(); await pool.end();
}
