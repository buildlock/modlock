import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { getMigrations } from "better-auth/db/migration";
import { accountAuthOptions } from "../src/server/auth.ts";
import { getDatabase } from "../src/server/database.ts";

try {
  process.loadEnvFile(resolve(".env.local"));
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
const pool = getDatabase();
const client = await pool.connect();
try {
  await client.query("SELECT pg_advisory_lock(86731501)");
  const migration = await getMigrations(accountAuthOptions());
  await migration.runMigrations();
  await client.query(
    "CREATE TABLE IF NOT EXISTS modlock_migration (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  for (const name of (await readdir(resolve("migrations")))
    .filter((name) => /^\d{4}-[a-z-]+\.sql$/.test(name))
    .sort()) {
    const sql = await readFile(resolve("migrations", name), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const existing = await client.query(
      "SELECT checksum FROM modlock_migration WHERE name = $1",
      [name],
    );
    if (existing.rowCount) {
      if (existing.rows[0].checksum !== checksum)
        throw new Error(`Applied migration changed: ${name}`);
      continue;
    }
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query(
        "INSERT INTO modlock_migration(name, checksum) VALUES ($1, $2)",
        [name, checksum],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
    console.log(`Applied ${name}`);
  }
  console.log("Local account database is ready.");
} finally {
  await client.query("SELECT pg_advisory_unlock(86731501)");
  client.release();
  await pool.end();
}
