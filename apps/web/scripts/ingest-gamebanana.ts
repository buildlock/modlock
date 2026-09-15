import {
  mkdir,
  readFile,
  rename,
  writeFile,
  open,
  unlink,
} from "node:fs/promises";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import {
  fetchJson,
  readIndex,
  normalizeProfile,
} from "../src/lib/gamebanana.ts";
import type { Catalog, IndexEntry, Model, Mod } from "../src/lib/gamebanana.ts";

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.split("=");
    return [key, value];
  }),
);
for (const arg of args.keys())
  if (!["--details", "--pages"].includes(arg))
    throw new Error(`Unknown option ${arg}`);
function limit(key: string, fallback: number, max: number) {
  const value = Number(args.get(key) ?? fallback);
  if (!Number.isInteger(value) || value < 1 || value > max)
    throw new Error(`${key} must be 1–${max}`);
  return value;
}
const detailLimit = limit("--details", 100, 10_000),
  pageLimit = limit("--pages", 120, 2000);
const directory = resolve("data/gamebanana");
await mkdir(directory, { recursive: true });
const lock = await open(resolve(directory, "ingest.lock"), "wx");
try {
  let previous: Catalog | null = null;
  try {
    previous = JSON.parse(
      await readFile(resolve(directory, "catalog.json"), "utf8"),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const cached = new Map((previous?.mods ?? []).map((mod) => [mod.key, mod]));
  const entries = new Map<string, IndexEntry>();
  let pages = 0,
    complete = true;
  const request = async (url: URL) => {
    for (let attempt = 0; ; attempt++) {
      await delay(attempt ? 3000 * attempt : 1050);
      try {
        return await fetchJson(url);
      } catch (error) {
        const failure = error as Error;
        if (
          attempt >= 2 ||
          (!/TimeoutError|AbortError|TypeError/.test(failure.name) &&
            !(
              failure instanceof SyntaxError &&
              /Unexpected end/.test(failure.message)
            ) &&
            !/HTTP (429|5\d\d)/.test(failure.message))
        )
          throw error;
        console.log(`Retrying ${url.pathname} after ${failure.name}`);
      }
    }
  };
  const cacheDirectory = resolve(directory, "checkpoints");
  await mkdir(cacheDirectory, { recursive: true });
  async function checkpoint<T>(
    name: string,
    ttl: number,
    compute: () => Promise<T>,
  ): Promise<T> {
    const path = resolve(cacheDirectory, name + ".json");
    try {
      const saved = JSON.parse(await readFile(path, "utf8")) as {
        at: number;
        value: T;
      };
      if (Date.now() - saved.at < ttl) return saved.value;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    const value = await compute();
    await writeFile(path + ".tmp", JSON.stringify({ at: Date.now(), value }), {
      mode: 0o600,
    });
    await rename(path + ".tmp", path);
    return value;
  }
  for (const model of ["Mod", "Sound"] as Model[]) {
    let finished = false;
    for (let page = 1; page <= pageLimit; page++) {
      const url = new URL(`https://gamebanana.com/apiv11/${model}/Index`);
      url.searchParams.set("_nPage", String(page));
      url.searchParams.set("_nPerpage", "50");
      url.searchParams.set("_aFilters[Generic_Game]", "20948");
      const result = await checkpoint(
        `index-${model}-${page}`,
        600_000,
        async () => readIndex(await request(url), model),
      );
      pages++;
      for (const item of result.entries)
        entries.set(`${model.toLowerCase()}-${item.id}`, item);
      console.log(
        `${model} page ${page}: ${result.entries.length} records / ${result.total} reported`,
      );
      if (result.complete) {
        finished = true;
        break;
      }
    }
    complete &&= finished;
  }
  const mods: Mod[] = [];
  let excluded = 0,
    fetched = 0,
    pending = 0,
    errors = 0;
  // Interleave categories so the first bounded enrichment produces a useful catalog.
  const groups = new Map<string, [string, IndexEntry][]>();
  for (const pair of entries) {
    const key = pair[1].category;
    groups.set(key, [...(groups.get(key) ?? []), pair]);
  }
  const ordered: [string, IndexEntry][] = [];
  while ([...groups.values()].some((group) => group.length))
    for (const group of groups.values()) {
      const next = group.shift();
      if (next) ordered.push(next);
    }
  for (const [key, entry] of ordered) {
    if (!entry.visible || !entry.unrated) {
      excluded++;
      continue;
    }
    const old = cached.get(key);
    if (
      old &&
      old.modifiedAt === entry.modifiedAt &&
      Date.now() - Date.parse(old.checkedAt) < 86400_000
    ) {
      mods.push(old);
      continue;
    }
    if (fetched >= detailLimit) {
      pending++;
      continue;
    }
    fetched++;
    try {
      const result = await checkpoint(
        `profile-${key}-${Date.parse(entry.modifiedAt ?? "") || 0}`,
        86400_000,
        async () =>
          normalizeProfile(
            await request(
              new URL(
                `https://gamebanana.com/apiv11/${entry.model}/${entry.id}/ProfilePage`,
              ),
            ),
            entry,
            new Date().toISOString(),
          ),
      );
      if (result) mods.push(result);
      else excluded++;
    } catch (error) {
      errors++;
      console.error(`${key}: ${(error as Error).message}`);
    }
    if (fetched % 10 === 0)
      console.log(
        `Profile checks ${fetched}/${detailLimit}; ${mods.length} public listings`,
      );
  }
  // No partial catalog replacement after network/parser failures or a capped walk.
  if (!complete || errors)
    throw new Error(
      `Catalog not replaced: complete=${complete}, profile errors=${errors}. Previous snapshot preserved.`,
    );
  const catalog: Catalog = {
    version: 1,
    syncedAt: new Date().toISOString(),
    complete,
    discovered: entries.size,
    pending,
    excluded,
    errors,
    pages,
    mods,
  };
  if (!mods.length)
    throw new Error("No public listings; previous snapshot preserved");
  const temporary = resolve(directory, "catalog.json.tmp");
  await writeFile(temporary, JSON.stringify(catalog, null, 2) + "\n", {
    mode: 0o600,
  });
  await rename(temporary, resolve(directory, "catalog.json"));
  console.log(
    JSON.stringify(
      { ...catalog, mods: `${mods.length} published listings` },
      null,
      2,
    ),
  );
} finally {
  await lock.close();
  await unlink(resolve(directory, "ingest.lock"));
}
