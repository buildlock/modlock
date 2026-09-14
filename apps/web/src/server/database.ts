import { Pool, type PoolClient } from "pg";
import { readAccountConfig } from "./config.ts";

let database: Pool | undefined;
export function getDatabase() {
  const config = readAccountConfig();
  if (!config.enabled) throw new Error("Accounts have not been configured.");
  if (database) return database;
  database = new Pool({
    connectionString: config.databaseUrl,
    max: 8,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 10_000,
    statement_timeout: 5000,
    application_name: "modlock-web-local",
  });
  database.on("error", () => {
    // An idle connection can disappear on local database restart. pg removes
    // it from the pool; future requests reconnect. Never log connection URLs.
    console.error("A local account database connection was interrupted.");
  });
  return database;
}
export async function transaction<T>(
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getDatabase().connect();
  try {
    await client.query("BEGIN");
    const value = await work(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
