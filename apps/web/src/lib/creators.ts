import type { Mod } from "./gamebanana.ts";
export function sourceCreatorId(url: string | null) {
  return (
    url?.match(/^https:\/\/gamebanana\.com\/members\/([1-9]\d*)$/)?.[1] ?? null
  );
}
export function creatorDirectory(mods: Mod[]) {
  const creators = new Map<
    string,
    {
      id: string;
      name: string;
      url: string;
      count: number;
      downloads: number;
      categories: Set<string>;
    }
  >();
  for (const mod of mods) {
    const id = sourceCreatorId(mod.submitter.url);
    if (!id) continue;
    const entry = creators.get(id) ?? {
      id,
      name: mod.submitter.name,
      url: mod.submitter.url!,
      count: 0,
      downloads: 0,
      categories: new Set<string>(),
    };
    entry.count++;
    entry.downloads += mod.downloads ?? 0;
    entry.categories.add(mod.category);
    creators.set(id, entry);
  }
  return [...creators.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
}
