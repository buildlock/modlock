import he from "he";

export type Model = "Mod" | "Sound";
export type Category =
  | "Skins"
  | "Models"
  | "HUD"
  | "Sounds"
  | "Animations"
  | "Quality of life"
  | "Other";
export interface IndexEntry {
  id: number;
  model: Model;
  title: string;
  category: Category;
  categoryName: string;
  hero: string | null;
  modifiedAt: string | null;
  visible: boolean;
  unrated: boolean;
}
export interface Mod extends IndexEntry {
  key: string;
  url: string;
  description: string;
  body: string;
  submitter: { name: string; url: string | null; avatar: string | null };
  images: { url: string; thumbnail: string; caption: string }[];
  credits: { name: string; role: string; group: string; url: string | null }[];
  license: string;
  permissions: { yes: string[]; ask: string[]; no: string[] };
  downloads: number | null;
  likes: number | null;
  version: string | null;
  publishedAt: string | null;
  checkedAt: string;
  fileCount: number;
}
export interface Catalog {
  version: 1;
  syncedAt: string;
  complete: boolean;
  discovered: number;
  pending: number;
  excluded: number;
  errors: number;
  pages: number;
  mods: Mod[];
}
type Raw = Record<string, any>;
const object = (value: unknown): Raw =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Raw)
    : {};
const id = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0;
const count = (value: unknown) =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : null;
const heroes = new Set([
  "Abrams",
  "Apollo",
  "Bebop",
  "Billy",
  "Calico",
  "Celeste",
  "Drifter",
  "Dynamo",
  "Graves",
  "Grey Talon",
  "Haze",
  "Holliday",
  "Infernus",
  "Ivy",
  "Kelvin",
  "Lady Geist",
  "Lash",
  "McGinnis",
  "Mina",
  "Mirage",
  "Mo & Krill",
  "Paige",
  "Paradox",
  "Pocket",
  "Rem",
  "Seven",
  "Shiv",
  "Silver",
  "Sinclair",
  "The Doorman",
  "Venator",
  "Victor",
  "Vindicta",
  "Viscous",
  "Vyper",
  "Warden",
  "Wraith",
  "Yamato",
]);
export function plain(value: unknown, limit = 500): string {
  if (typeof value !== "string") return "";
  return he
    .decode(
      value
        .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
        .replace(/<(?:br\s*\/?|\/p|\/div|\/li)>/gi, "\n")
        .replace(/<[^>]*>/g, ""),
    )
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, limit);
}
function date(value: unknown): string | null {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 1_000_000_000 &&
    value <= Date.now() / 1000 + 86400
    ? new Date(value * 1000).toISOString()
    : null;
}
export function mediaUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.hostname === "images.gamebanana.com" &&
      !url.port &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      /^\/(?:img|static\/img)\/[a-zA-Z0-9_./-]+\.(?:jpg|jpeg|png|webp|gif)$/i.test(
        url.pathname,
      )
      ? url.href
      : null;
  } catch {
    return null;
  }
}
function category(model: Model, raw: Raw): Category {
  if (model === "Sound") return "Sounds";
  const path = String(object(raw._aRootCategory)._sProfileUrl ?? "");
  const categories: Record<string, Category> = {
    "33295": "Skins",
    "33154": "Models",
    "31713": "HUD",
    "46154": "Quality of life",
    "47611": "Animations",
  };
  return categories[path.match(/\/cats\/(\d+)$/)?.[1] ?? ""] ?? "Other";
}
export function readIndex(
  payload: unknown,
  model: Model,
): { entries: IndexEntry[]; complete: boolean; total: number } {
  const raw = object(payload),
    meta = object(raw._aMetadata);
  if (
    !Array.isArray(raw._aRecords) ||
    raw._aRecords.length > 50 ||
    typeof meta._bIsComplete !== "boolean" ||
    count(meta._nRecordCount) === null ||
    meta._nRecordCount > 100_000
  )
    throw new Error("Invalid GameBanana index envelope");
  if (!raw._aRecords.length && !meta._bIsComplete)
    throw new Error("Incomplete index returned an empty page");
  const entries = raw._aRecords.map((value: unknown): IndexEntry => {
    const item = object(value);
    if (
      !id(item._idRow) ||
      item._sModelName !== model ||
      object(item._aGame)._idRow !== 20948 ||
      !plain(item._sName)
    )
      throw new Error("Invalid submission identity or game");
    const sub = plain(object(item._aSubCategory)._sName, 80);
    return {
      id: item._idRow,
      model,
      title: plain(item._sName, 180),
      category: category(model, item),
      categoryName:
        sub || plain(object(item._aRootCategory)._sName, 80) || model,
      hero: heroes.has(sub) ? sub : null,
      modifiedAt: date(item._tsDateModified),
      visible:
        item._sInitialVisibility === "show" &&
        item._bIsObsolete === false &&
        item._bHasFiles === true &&
        !["_bIsPrivate", "_bIsWithheld", "_bIsTrashed"].some(
          (key) => item[key] === true,
        ),
      unrated: item._bHasContentRatings === false,
    };
  });
  return { entries, complete: meta._bIsComplete, total: meta._nRecordCount };
}
export function normalizeProfile(
  payload: unknown,
  entry: IndexEntry,
  checkedAt: string,
): Mod | null {
  const raw = object(payload);
  if (
    !id(raw._idRow) ||
    raw._idRow !== entry.id ||
    object(raw._aGame)._idRow !== 20948 ||
    (raw._sModelName && raw._sModelName !== entry.model)
  )
    throw new Error("Profile identity does not match index");
  // apiv11 omits _aContentRatings on unrated profiles. Require the explicit index
  // flag AND a public profile; missing index evidence never permits publication.
  if (
    !entry.visible ||
    !entry.unrated ||
    raw._sInitialVisibility !== "show" ||
    raw._bIsObsolete !== false ||
    ["_bIsPrivate", "_bIsWithheld", "_bIsTrashed"].some(
      (key) => raw[key] !== false,
    )
  )
    return null;
  if (
    raw._aContentRatings !== undefined &&
    (!Array.isArray(raw._aContentRatings) || raw._aContentRatings.length > 0)
  )
    return null;
  if (!Array.isArray(raw._aFiles) || raw._aFiles.length === 0) return null;
  const submitter = object(raw._aSubmitter);
  if (!id(submitter._idRow) || !plain(submitter._sName))
    throw new Error("Missing submitter attribution");
  const images = (
    Array.isArray(object(raw._aPreviewMedia)._aImages)
      ? raw._aPreviewMedia._aImages
      : []
  )
    .slice(0, 12)
    .flatMap((value: unknown) => {
      const image = object(value);
      if (image._sType !== "screenshot") return [];
      const url = mediaUrl(`${image._sBaseUrl}/${image._sFile}`);
      const thumbnail = mediaUrl(
        `${image._sBaseUrl}/${image._sFile530 ?? image._sFile}`,
      );
      return url && thumbnail
        ? [{ url, thumbnail, caption: plain(image._sCaption, 180) }]
        : [];
    });
  const permissions = object(raw._aLicenseChecklist);
  const list = (value: unknown) =>
    (Array.isArray(value) ? value : [])
      .slice(0, 30)
      .map((x) => plain(x, 250))
      .filter(Boolean);
  const credits = (Array.isArray(raw._aCredits) ? raw._aCredits : [])
    .slice(0, 30)
    .flatMap((value: unknown) => {
      const group = object(value);
      return (Array.isArray(group._aAuthors) ? group._aAuthors : [])
        .slice(0, 30)
        .map((author: unknown) => {
          const a = object(author);
          return {
            name: plain(a._sName, 100),
            role: plain(a._sRole, 200),
            group: plain(group._sGroupName, 100),
            url: id(a._idRow)
              ? `https://gamebanana.com/members/${a._idRow}`
              : null,
          };
        })
        .filter((a: { name: string }) => a.name);
    });
  return {
    ...entry,
    title: plain(raw._sName, 180) || entry.title,
    key: `${entry.model.toLowerCase()}-${entry.id}`,
    url: `https://gamebanana.com/${entry.model === "Mod" ? "mods" : "sounds"}/${entry.id}`,
    description: plain(raw._sDescription, 350),
    body: plain(raw._sText, 12_000),
    submitter: {
      name: plain(submitter._sName, 100),
      url: `https://gamebanana.com/members/${submitter._idRow}`,
      avatar: mediaUrl(submitter._sAvatarUrl),
    },
    images,
    credits,
    license: plain(raw._sLicense, 3000),
    permissions: {
      yes: list(permissions.yes),
      ask: list(permissions.ask),
      no: list(permissions.no),
    },
    downloads: count(raw._nDownloadCount),
    likes: count(raw._nLikeCount),
    version: plain(raw._sVersion, 80) || null,
    publishedAt: date(raw._tsDateAdded),
    modifiedAt: date(raw._tsDateModified),
    checkedAt,
    fileCount: raw._aFiles.length,
  };
}

export async function fetchJson(
  url: URL,
  fetcher: typeof fetch = fetch,
): Promise<unknown> {
  if (
    url.origin !== "https://gamebanana.com" ||
    !/^\/apiv11\/(?:Mod|Sound)\/(?:Index|[1-9]\d*\/ProfilePage)$/.test(
      url.pathname,
    )
  )
    throw new Error("Unapproved provider endpoint");
  const response = await fetcher(url, {
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
    headers: {
      Accept: "application/json",
      "User-Agent": "Modlock/0.1 (+https://github.com/buildlock/modlock)",
    },
  });
  if (!response.ok) throw new Error(`GameBanana HTTP ${response.status}`);
  // Observed apiv11 responses use text/html even for JSON (2026-09-14).
  // Treat the bounded body as JSON only; never render or execute provider HTML.
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty provider response");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 8 * 1024 * 1024)
        throw new Error("Provider response exceeds 8 MiB");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
