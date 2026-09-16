import { Pool } from "pg";
import { refreshCatalog } from "../src/lib/catalog-refresh.ts";
import { pacedProviderRequest } from "../src/lib/gamebanana-request.ts";
import {
  CATALOG_REFRESH_LOCK,
  DatabaseRefreshStore,
} from "../src/server/catalog-refresh-store.ts";

// No account client secret or central database access is needed by this worker.
if (process.env.MODLOCK_CATALOG_REFRESH_ENABLED !== "1") {
  console.log("Catalogue refresh is disabled.");
} else {
  let url: URL;
  try {
    url = new URL(process.env.DATABASE_URL || "");
  } catch {
    throw new Error(
      "A valid private Modlock database configuration is required.",
    );
  }
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !(
      url.hostname.endsWith(".railway.internal") ||
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    ) ||
    !/^\/modlock(?:_shared_[a-f0-9]{12,32})?$/.test(url.pathname)
  )
    throw new Error("Refresh only the dedicated private Modlock database.");
  const abort = new AbortController();
  const timer = setTimeout(
    () => abort.abort(new Error("Refresh deadline exceeded.")),
    20 * 60_000,
  );
  timer.unref();
  const stop = () => abort.abort(new Error("Refresh interrupted."));
  process.once("SIGTERM", stop);
  process.once("SIGINT", stop);
  const pool = new Pool({
    connectionString: url.href,
    max: 1,
    connectionTimeoutMillis: 3000,
    statement_timeout: 5000,
    application_name: "modlock-catalog-refresh",
  });
  pool.on("error", stop);
  try {
    const client = await pool.connect();
    client.on("error", stop);
    try {
      const lock = await client.query(
        "SELECT pg_try_advisory_lock($1) AS acquired",
        [CATALOG_REFRESH_LOCK],
      );
      if (!lock.rows[0].acquired)
        console.log("Another catalogue refresh is running; skipped.");
      else {
        const store = new DatabaseRefreshStore(client);
        const catalog = await refreshCatalog(
          {
            catalog: () => store.catalog(),
            profiles: () => store.profiles(),
            checkpoint: async (profile) => {
              abort.signal.throwIfAborted();
              await store.checkpoint(profile);
            },
            publish: async (value, keys) => {
              abort.signal.throwIfAborted();
              await store.publish(value, keys);
            },
          },
          {
            request: pacedProviderRequest(abort.signal),
            progress: (message) => console.log(message),
          },
        );
        console.log(
          JSON.stringify({
            published: catalog.mods.length,
            pending: catalog.pending,
            retained: catalog.retained,
            errors: catalog.errors,
            syncedAt: catalog.syncedAt,
          }),
        );
      }
    } finally {
      client.release(true); // Closing the dedicated session also releases its lock.
    }
  } catch {
    // Neither connection URLs nor raw provider responses belong in cron logs.
    console.error(
      "Catalogue refresh failed; the previous publication is preserved. Check worker and provider availability.",
    );
    process.exitCode = 1;
  } finally {
    clearTimeout(timer);
    process.removeListener("SIGTERM", stop);
    process.removeListener("SIGINT", stop);
    await pool.end();
  }
}
