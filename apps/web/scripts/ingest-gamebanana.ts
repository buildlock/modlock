import {
  mkdir,
  readFile,
  readdir,
  rename,
  writeFile,
  open,
  unlink,
} from "node:fs/promises";
import { resolve } from "node:path";
import { refreshCatalog } from "../src/lib/catalog-refresh.ts";
import type { ProfileCheckpoint } from "../src/lib/catalog-refresh.ts";
import type { Catalog } from "../src/lib/gamebanana.ts";
import { pacedProviderRequest } from "../src/lib/gamebanana-request.ts";

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value, extra] = arg.split("=");
    if (extra !== undefined || value === undefined)
      throw new Error("Use --details=N or --pages=N.");
    return [key, value] as const;
  }),
);
for (const key of args.keys())
  if (!["--details", "--pages"].includes(key))
    throw new Error(`Unknown option ${key}`);
const directory = resolve("data/gamebanana"),
  checkpoints = resolve(directory, "checkpoints");
await mkdir(checkpoints, { recursive: true });
const lock = await open(resolve(directory, "ingest.lock"), "wx");
const signal = AbortSignal.timeout(20 * 60_000);
async function read<T>(path: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
async function atomic(path: string, value: unknown) {
  await writeFile(path + ".tmp", JSON.stringify(value) + "\n", { mode: 0o600 });
  await rename(path + ".tmp", path);
}
try {
  const catalog = await refreshCatalog(
    {
      catalog: () => read<Catalog>(resolve(directory, "catalog.json")),
      profiles: async () => {
        const names = (await readdir(checkpoints)).filter((name) =>
          /^refresh-(mod|sound)-[1-9]\d{0,15}\.json$/.test(name),
        );
        if (names.length > 10000)
          throw new Error("Profile checkpoint budget exceeded.");
        const profiles: ProfileCheckpoint[] = [];
        for (const name of names) {
          const profile = await read<ProfileCheckpoint>(
            resolve(checkpoints, name),
          );
          if (profile) profiles.push(profile);
        }
        return profiles;
      },
      checkpoint: async (profile) => {
        signal.throwIfAborted();
        await atomic(
          resolve(checkpoints, `refresh-${profile.key}.json`),
          profile,
        );
      },
      publish: async (value, keys) => {
        signal.throwIfAborted();
        const active = new Set(keys.map((key) => `refresh-${key}.json`));
        for (const name of await readdir(checkpoints))
          if (
            /^refresh-(mod|sound)-[1-9]\d{0,15}\.json$/.test(name) &&
            !active.has(name)
          )
            await unlink(resolve(checkpoints, name));
        await atomic(resolve(directory, "catalog.json"), value);
      },
    },
    {
      details: Number(args.get("--details") ?? 100),
      pages: Number(args.get("--pages") ?? 120),
      request: pacedProviderRequest(signal),
      progress: (message) => console.log(message),
    },
  );
  console.log(
    JSON.stringify(
      { ...catalog, mods: `${catalog.mods.length} published listings` },
      null,
      2,
    ),
  );
} finally {
  await lock.close();
  await unlink(resolve(directory, "ingest.lock"));
}
