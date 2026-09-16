import { readFile } from "node:fs/promises";
import { getDatabase } from "../src/server/database.ts";
import { readAccountConfig } from "../src/server/config.ts";
import { CATALOG_REFRESH_LOCK } from "../src/server/catalog-refresh-store.ts";
import {
  MAX_CATALOG_BYTES,
  validateCatalog,
} from "../src/lib/catalog-refresh.ts";

if (readAccountConfig().mode !== "shared")
  throw new Error("Publish to the shared-mode Modlock database only.");
// Operator input is the already-normalized output of ingest-gamebanana.ts.
// Never take a catalogue or arbitrary URL from an HTTP request.
let bytes: Buffer;
if (process.argv[2] === "--stdin") {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of process.stdin) {
    size += chunk.length;
    if (size > MAX_CATALOG_BYTES) throw new Error("Catalogue exceeds 64 MiB.");
    chunks.push(chunk);
  }
  bytes = Buffer.concat(chunks);
} else
  bytes = await readFile(process.argv[2] || "data/gamebanana/catalog.json");
if (bytes.length > MAX_CATALOG_BYTES)
  throw new Error("Catalogue exceeds 64 MiB.");
const document = JSON.parse(bytes.toString("utf8"));
validateCatalog(document);
const pool = getDatabase();
const client = await pool.connect();
try {
  const lock = await client.query(
    "SELECT pg_try_advisory_lock($1) AS acquired",
    [CATALOG_REFRESH_LOCK],
  );
  if (!lock.rows[0].acquired)
    throw new Error("Another catalogue writer is running.");
  const existing = await client.query(
    "SELECT document->>'syncedAt' AS synced FROM catalog_snapshot WHERE singleton=true",
  );
  if (
    existing.rows[0] &&
    Date.parse(existing.rows[0].synced) > Date.parse(document.syncedAt)
  )
    throw new Error("Refusing to publish an older catalogue.");
  await client.query(
    "INSERT INTO catalog_snapshot(singleton,document) VALUES(true,$1::jsonb) ON CONFLICT(singleton) DO UPDATE SET document=excluded.document,published_at=now()",
    [JSON.stringify(document)],
  );
  console.log(`Published ${document.mods.length} normalized listings.`);
} finally {
  client.release(true);
  await pool.end();
}
