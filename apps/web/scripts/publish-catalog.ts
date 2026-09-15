import { readFile } from "node:fs/promises";
import { getDatabase } from "../src/server/database.ts";
import { readAccountConfig } from "../src/server/config.ts";

if (readAccountConfig().mode !== "shared") throw new Error("Publish to the shared-mode Modlock database only.");
// Operator input is the already-normalized output of ingest-gamebanana.ts.
// Never take a catalogue or arbitrary URL from an HTTP request.
let bytes: Buffer;
if (process.argv[2] === "--stdin") {
  const chunks: Buffer[] = []; let size = 0;
  for await (const chunk of process.stdin) {
    size += chunk.length;
    if (size > 16 * 1024 * 1024) throw new Error("Catalogue exceeds 16 MiB.");
    chunks.push(chunk);
  }
  bytes = Buffer.concat(chunks);
} else bytes = await readFile(process.argv[2] || "data/gamebanana/catalog.json");
if (bytes.length > 16 * 1024 * 1024) throw new Error("Catalogue exceeds 16 MiB.");
const document = JSON.parse(bytes.toString("utf8"));
if (document.version !== 1 || !Array.isArray(document.mods) || document.mods.length > 10000 ||
    document.complete !== true || document.errors !== 0 || !Number.isFinite(Date.parse(document.syncedAt)) ||
    document.mods.some((m: { key?: string; url?: string }) => !/^(mod|sound)-[1-9]\d{0,9}$/.test(m.key || "") ||
      typeof m.url !== "string" || !/^https:\/\/gamebanana\.com\/(mods|sounds)\/[1-9]\d*$/.test(m.url)))
  throw new Error("Expected a normalized GameBanana catalogue.");
const pool = getDatabase();
try {
  await pool.query("INSERT INTO catalog_snapshot(singleton,document) VALUES(true,$1::jsonb) ON CONFLICT(singleton) DO UPDATE SET document=excluded.document,published_at=now()", [JSON.stringify(document)]);
  console.log(`Published ${document.mods.length} normalized listings.`);
} finally { await pool.end(); }
