import "server-only";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Catalog } from "./gamebanana";
import { readAccountConfig } from "@/server/config";
import { restrictions } from "@/server/community";
import { getDatabase } from "@/server/database";
let cached: { value: Catalog | null; expires: number } | undefined;
async function sharedCatalog(): Promise<Catalog | null> {
  if (cached && cached.expires > Date.now()) return cached.value;
  const result = await getDatabase().query<{ document: Catalog }>("SELECT document FROM catalog_snapshot WHERE singleton=true");
  const value = result.rows[0]?.document ?? null;
  cached = { value, expires: Date.now() + 30000 };
  return value;
}
export async function getCatalog(): Promise<Catalog | null> {
  try {
    const config = readAccountConfig();
    const data = config.mode === "shared" ? await sharedCatalog() : JSON.parse(
      await readFile(
        resolve(process.cwd(), "data/gamebanana/catalog.json"),
        "utf8",
      ),
    ) as Catalog;
    if (!data) return null;
    if (data.version !== 1 || !Array.isArray(data.mods))
      throw new Error("Invalid catalog snapshot");
    if (config.enabled) {
      const hidden = await restrictions();
      return { ...data, mods: data.mods.filter((mod) => !hidden.has(mod.key)) };
    }
    return data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
