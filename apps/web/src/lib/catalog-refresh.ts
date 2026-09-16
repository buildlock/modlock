import { normalizeProfile, readIndex } from "./gamebanana.ts";
import { pacedProviderRequest } from "./gamebanana-request.ts";
import type { Catalog, IndexEntry, Mod, Model } from "./gamebanana.ts";

export const PROFILE_TTL = 24 * 60 * 60_000;
export const RETENTION_TTL = 7 * PROFILE_TTL;
export const MAX_CATALOG_BYTES = 64 * 1024 * 1024;
export const MAX_ENTRIES = 10_000;
const MAX_PROFILE_BYTES = 128 * 1024;
const MAX_CHECKPOINT_BYTES = 96 * 1024 * 1024;
export interface ProfileCheckpoint {
  key: string;
  // Attempt time advances on failures too, so one bad profile cannot starve others.
  attemptedAt: string;
  checkedAt: string | null;
  revision: string | null;
  mod: Mod | null;
}
export interface RefreshStore {
  catalog(): Promise<Catalog | null>;
  profiles(): Promise<ProfileCheckpoint[]>;
  checkpoint(profile: ProfileCheckpoint): Promise<void>;
  publish(catalog: Catalog, activeKeys: string[]): Promise<void>;
}
export interface RefreshOptions {
  details?: number;
  pages?: number;
  now?: () => number;
  request?: (url: URL) => Promise<unknown>;
  progress?: (event: string) => void;
}
const keyOf = (entry: IndexEntry) => `${entry.model.toLowerCase()}-${entry.id}`;
const age = (now: number, at: string | null) =>
  at ? now - Date.parse(at) : Infinity;
const recent = (now: number, at: string | null, ttl: number) => {
  const elapsed = age(now, at);
  return Number.isFinite(elapsed) && elapsed >= 0 && elapsed < ttl;
};
const eligible = (entry: IndexEntry) => entry.visible && entry.unrated;

// A bounded run is a complete index reconciliation plus part of a durable,
// oldest-attempt-first profile queue. It never republishes an index-only record.
export async function refreshCatalog(
  store: RefreshStore,
  options: RefreshOptions = {},
): Promise<Catalog> {
  const details = options.details ?? 300,
    pageLimit = options.pages ?? 120;
  if (
    !Number.isInteger(details) ||
    details < 1 ||
    details > 1000 ||
    !Number.isInteger(pageLimit) ||
    pageLimit < 1 ||
    pageLimit > 200
  )
    throw new Error(
      "Refresh bounds: 1–1000 profiles and 1–200 pages per model.",
    );
  const now = options.now ?? Date.now,
    request =
      options.request ?? pacedProviderRequest(AbortSignal.timeout(20 * 60_000));
  const progress = options.progress ?? (() => {});
  const previous = await store.catalog();
  if (previous) validateCatalog(previous);
  const profiles = new Map(
    (await store.profiles()).map((profile) => [profile.key, profile]),
  );
  // Bootstrap from the already-published, normalized catalogue, preserving its
  // original profile timestamps rather than making old data appear fresh.
  for (const mod of previous?.mods ?? []) {
    if (!profiles.has(mod.key))
      profiles.set(mod.key, {
        key: mod.key,
        attemptedAt: mod.checkedAt,
        checkedAt: mod.checkedAt,
        revision: mod.modifiedAt,
        mod,
      });
  }
  const sizes = new Map(
    [...profiles].map(([key, profile]) => [
      key,
      Buffer.byteLength(JSON.stringify(profile)),
    ]),
  );
  let checkpointBytes = [...sizes.values()].reduce(
    (sum, size) => sum + size,
    0,
  );
  if (checkpointBytes > MAX_CHECKPOINT_BYTES)
    throw new Error("Profile checkpoint byte budget exceeded.");
  const save = async (profile: ProfileCheckpoint) => {
    const size = Buffer.byteLength(JSON.stringify(profile));
    const nextBytes = checkpointBytes - (sizes.get(profile.key) ?? 0) + size;
    if (size > MAX_PROFILE_BYTES || nextBytes > MAX_CHECKPOINT_BYTES)
      throw new Error("Profile checkpoint byte budget exceeded.");
    await store.checkpoint(profile);
    checkpointBytes = nextBytes;
    sizes.set(profile.key, size);
    profiles.set(profile.key, profile);
  };
  const entries = new Map<string, IndexEntry>();
  let pages = 0;
  for (const model of ["Mod", "Sound"] as Model[]) {
    let complete = false;
    for (let page = 1; page <= pageLimit; page++) {
      const url = new URL(`https://gamebanana.com/apiv11/${model}/Index`);
      url.searchParams.set("_nPage", String(page));
      url.searchParams.set("_nPerpage", "50");
      url.searchParams.set("_aFilters[Generic_Game]", "20948");
      const result = readIndex(await request(url), model);
      pages++;
      for (const entry of result.entries) entries.set(keyOf(entry), entry);
      if (entries.size > MAX_ENTRIES)
        throw new Error("Source index exceeds the catalogue entry budget.");
      progress(`${model} page ${page}: ${result.entries.length} entries`);
      if (result.complete) {
        complete = true;
        break;
      }
    }
    // No partial index, timeout or invalid envelope can replace the last snapshot.
    if (!complete)
      throw new Error("Incomplete index; previous catalogue preserved.");
  }
  const snapshotTime = now();
  for (const [key, entry] of entries) {
    const old = profiles.get(key);
    if (!eligible(entry) && old && (old.mod || old.checkedAt)) {
      const blocked = {
        key,
        attemptedAt: new Date(snapshotTime).toISOString(),
        checkedAt: null,
        revision: null,
        mod: null,
      };
      await save(blocked);
    }
  }
  const due = [...entries.values()]
    .filter((entry) => {
      if (!eligible(entry)) return false;
      const profile = profiles.get(keyOf(entry));
      return (
        !profile ||
        profile.revision !== entry.modifiedAt ||
        !recent(snapshotTime, profile.checkedAt, PROFILE_TTL)
      );
    })
    .sort((a, b) => {
      const at = (entry: IndexEntry) =>
        Date.parse(profiles.get(keyOf(entry))?.attemptedAt ?? "") || 0;
      return at(a) - at(b) || keyOf(a).localeCompare(keyOf(b));
    });
  let errors = 0,
    consecutiveErrors = 0;
  for (const entry of due.slice(0, details)) {
    const key = keyOf(entry),
      at = new Date(now()).toISOString();
    const old = profiles.get(key);
    let checkpoint: ProfileCheckpoint;
    try {
      const payload = await request(
        new URL(
          `https://gamebanana.com/apiv11/${entry.model}/${entry.id}/ProfilePage`,
        ),
      );
      const mod = normalizeProfile(payload, entry, at);
      // A source revision changing during the sweep must wait for a coherent
      // next sweep; never label those bytes with the older index revision.
      if (mod && mod.modifiedAt !== entry.modifiedAt)
        throw new Error("Profile revision changed during reconciliation.");
      checkpoint = {
        key,
        attemptedAt: at,
        checkedAt: at,
        revision: entry.modifiedAt,
        mod,
      };
      if (Buffer.byteLength(JSON.stringify(checkpoint)) > MAX_PROFILE_BYTES)
        throw new Error("Normalized profile exceeds its byte budget.");
      consecutiveErrors = 0;
    } catch {
      errors++;
      consecutiveErrors++;
      checkpoint = old
        ? { ...old, attemptedAt: at }
        : {
            key,
            attemptedAt: at,
            checkedAt: null,
            revision: null,
            mod: null,
          };
      progress(`${key}: profile unavailable; queued for a later run`);
    }
    // Persist every attempt before proceeding. Restarts retain progress, while
    // DB errors abort publication instead of masquerading as provider failures.
    await save(checkpoint);
    if (consecutiveErrors >= 5) {
      progress("Profile circuit opened after five consecutive failures.");
      break;
    }
  }

  const mods: Mod[] = [];
  let excluded = 0,
    pending = 0,
    retained = 0;
  const publishedAt = now();
  for (const [key, entry] of entries) {
    // Immediate source restrictions override cached public metadata, even when
    // an unrelated profile failed. Omitted entries are withdrawn, not declared deleted.
    if (!eligible(entry)) {
      excluded++;
      continue;
    }
    const profile = profiles.get(key);
    const sameRevision = profile?.revision === entry.modifiedAt;
    const current =
      sameRevision &&
      recent(publishedAt, profile?.checkedAt ?? null, PROFILE_TTL);
    if (!current) pending++;
    if (current && !profile?.mod) {
      excluded++;
      continue;
    }
    if (
      sameRevision &&
      profile?.mod &&
      recent(publishedAt, profile.checkedAt, RETENTION_TTL)
    ) {
      mods.push(profile.mod);
      if (!current) retained++;
    }
  }
  const catalog: Catalog = {
    version: 1,
    syncedAt: new Date(publishedAt).toISOString(),
    complete: true,
    discovered: entries.size,
    pending,
    excluded,
    errors,
    pages,
    retained,
    mods,
  };
  validateCatalog(catalog);
  await store.publish(catalog, [...entries.keys()]);
  return catalog;
}

export function validateCatalog(document: Catalog): void {
  if (
    Buffer.byteLength(JSON.stringify(document)) > MAX_CATALOG_BYTES ||
    document.version !== 1 ||
    document.complete !== true ||
    !Number.isFinite(Date.parse(document.syncedAt)) ||
    !Array.isArray(document.mods) ||
    document.mods.length > MAX_ENTRIES ||
    [
      document.discovered,
      document.pending,
      document.excluded,
      document.errors,
      document.pages,
      document.retained ?? 0,
    ].some((value) => !Number.isSafeInteger(value) || value < 0) ||
    new Set(document.mods.map((mod) => mod.key)).size !==
      document.mods.length ||
    document.mods.some(
      (mod) =>
        !/^(mod|sound)-[1-9]\d{0,15}$/.test(mod.key) ||
        mod.key !== keyOf(mod) ||
        !eligible(mod) ||
        !Number.isFinite(Date.parse(mod.checkedAt)) ||
        mod.url !==
          `https://gamebanana.com/${mod.model === "Mod" ? "mods" : "sounds"}/${mod.id}`,
    )
  )
    throw new Error("Expected a bounded normalized GameBanana catalogue.");
}
