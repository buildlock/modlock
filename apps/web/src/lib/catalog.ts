import "server-only";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Catalog } from "./gamebanana";
export async function getCatalog(): Promise<Catalog | null> {
  try {
    const data = JSON.parse(
      await readFile(
        resolve(process.cwd(), "data/gamebanana/catalog.json"),
        "utf8",
      ),
    ) as Catalog;
    if (data.version !== 1 || !Array.isArray(data.mods))
      throw new Error("Invalid catalog snapshot");
    return data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
