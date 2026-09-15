import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import type { PoolClient } from "pg";
import { getDatabase, transaction } from "./database.ts";
import { readAccountConfig } from "./config.ts";

export const modKeySchema = z.string().regex(/^(mod|sound)-[1-9]\d{0,9}$/);
export const reportReasons = {
  broken: "Broken or outdated",
  unsafe: "Potentially unsafe content",
  rights: "Rights or ownership concern",
  attribution: "Incorrect attribution",
  other: "Something else",
} as const;
const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(
      (v) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v),
      "Remove unsupported control characters.",
    );
const reservedHandles = new Set([
  "admin",
  "administrator",
  "moderator",
  "modlock",
  "gamebanana",
  "valve",
  "support",
  "staff",
  "security",
  "official",
]);
export const profileSchema = z.object({
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z][a-z0-9_]{2,29}$/,
      "Use 3–30 lowercase letters, numbers or underscores, starting with a letter.",
    )
    .refine((v) => !reservedHandles.has(v), "Choose a different handle."),
  bio: text(500),
  website: text(300).refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return (
        url.protocol === "https:" &&
        !url.username &&
        !url.password &&
        !!url.hostname
      );
    } catch {
      return false;
    }
  }, "Use a full HTTPS website address."),
  isPublic: z.boolean(),
});
export interface MemberProfile {
  user_id: string;
  handle: string;
  bio: string;
  website: string;
  is_public: boolean;
  updated_at: Date;
}
export interface SavedMod {
  mod_key: string;
  note: string;
  seen_modified_at: Date | null;
  saved_at: Date;
}
export interface Report {
  id: string;
  mod_key: string;
  reason: keyof typeof reportReasons;
  detail: string;
  status: string;
  response: string;
  created_at: Date;
  updated_at: Date;
}

export async function getMemberProfile(userId: string): Promise<MemberProfile> {
  if (readAccountConfig().mode === "shared") {
    const { rows } = await getDatabase().query<MemberProfile>("SELECT * FROM member_profile WHERE user_id=$1", [userId]);
    if (!rows[0]) throw new Error("Sign in again to restore your shared profile.");
    return rows[0];
  }
  const handle = `player_${createHash("sha256").update(userId).digest("hex").slice(0, 14)}`;
  await getDatabase().query(
    "INSERT INTO member_profile(user_id, handle) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING",
    [userId, handle],
  );
  return (
    await getDatabase().query<MemberProfile>(
      "SELECT * FROM member_profile WHERE user_id = $1",
      [userId],
    )
  ).rows[0];
}
export async function limitMember(
  client: PoolClient,
  userId: string,
  action: string,
  max: number,
) {
  const { rows } = await client.query<{ count: number }>(
    `INSERT INTO member_rate_limit(user_id, action, window_start, count)
    VALUES ($1, $2, now(), 1) ON CONFLICT (user_id, action) DO UPDATE SET
    count = CASE WHEN member_rate_limit.window_start < now() - interval '1 minute' THEN 1 ELSE member_rate_limit.count + 1 END,
    window_start = CASE WHEN member_rate_limit.window_start < now() - interval '1 minute' THEN now() ELSE member_rate_limit.window_start END RETURNING count`,
    [userId, action],
  );
  if (rows[0].count > max)
    throw new Error("Too many changes. Wait a minute and try again.");
}
export async function updateProfile(
  userId: string,
  input: z.input<typeof profileSchema>,
) {
  if (readAccountConfig().mode === "shared") {
    const website = profileSchema.shape.website.parse(input.website);
    const isPublic = z.boolean().parse(input.isPublic);
    await transaction(async (client) => {
      await limitMember(client, userId, "profile", 10);
      await client.query("UPDATE member_profile SET website=$2,is_public=$3,updated_at=now() WHERE user_id=$1", [userId, website, isPublic]);
    });
    return;
  }
  const value = profileSchema.parse(input);
  await getMemberProfile(userId);
  await transaction(async (client) => {
    await limitMember(client, userId, "profile", 10);
    await client.query(
      "UPDATE member_profile SET handle=$2, bio=$3, website=$4, is_public=$5, updated_at=now() WHERE user_id=$1",
      [userId, value.handle, value.bio, value.website, value.isPublic],
    );
  });
}
export async function savedMods(userId: string) {
  return (
    await getDatabase().query<SavedMod>(
      "SELECT mod_key, note, seen_modified_at, saved_at FROM saved_mod WHERE user_id = $1 ORDER BY saved_at DESC LIMIT 1000",
      [userId],
    )
  ).rows;
}
export async function saveMod(
  userId: string,
  key: string,
  saved: boolean,
  modifiedAt: string | null,
) {
  modKeySchema.parse(key);
  await transaction(async (client) => {
    await limitMember(client, userId, "library", 60);
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
      [userId],
    );
    if (!saved) {
      await client.query(
        "DELETE FROM saved_mod WHERE user_id=$1 AND mod_key=$2",
        [userId, key],
      );
      return;
    }
    const count = await client.query(
      "SELECT count(*)::integer AS count FROM saved_mod WHERE user_id=$1",
      [userId],
    );
    if (count.rows[0].count >= 1000)
      throw new Error(
        "Your library is full. Remove a saved mod before adding another.",
      );
    await client.query(
      "INSERT INTO saved_mod(user_id, mod_key, seen_modified_at) VALUES ($1,$2,$3) ON CONFLICT (user_id,mod_key) DO NOTHING",
      [userId, key, modifiedAt],
    );
  });
}
export async function saveModNote(userId: string, key: string, note: string) {
  modKeySchema.parse(key);
  const value = text(500).parse(note);
  await transaction(async (client) => {
    await limitMember(client, userId, "library", 60);
    const result = await client.query(
      "UPDATE saved_mod SET note=$3 WHERE user_id=$1 AND mod_key=$2",
      [userId, key, value],
    );
    if (!result.rowCount)
      throw new Error("Save this mod before adding a note.");
  });
}
export const reportSchema = z.object({
  key: modKeySchema,
  reason: z.enum(["broken", "unsafe", "rights", "attribution", "other"]),
  detail: text(2000).min(
    10,
    "Include at least 10 characters so we can understand the issue.",
  ),
  requestKey: z.uuid(),
});
export async function submitReport(
  userId: string,
  input: z.input<typeof reportSchema>,
) {
  const value = reportSchema.parse(input);
  return transaction(async (client) => {
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtextextended($1, 1))",
      [userId],
    );
    const existing = await client.query<{ id: string }>(
      "SELECT id FROM mod_report WHERE reporter_id=$1 AND (request_key=$2 OR (mod_key=$3 AND reason=$4 AND status IN ('submitted','reviewing'))) LIMIT 1",
      [userId, value.requestKey, value.key, value.reason],
    );
    if (existing.rows[0]) return existing.rows[0].id;
    const count = await client.query(
      "SELECT count(*)::integer AS count FROM mod_report WHERE reporter_id=$1",
      [userId],
    );
    if (count.rows[0].count >= 1000)
      throw new Error(
        "Your report history is full. Contact the local operator for help.",
      );
    await limitMember(client, userId, "report", 5);
    const id = randomUUID();
    await client.query(
      "INSERT INTO mod_report(id, reporter_id, mod_key, reason, detail, request_key) VALUES ($1,$2,$3,$4,$5,$6)",
      [id, userId, value.key, value.reason, value.detail, value.requestKey],
    );
    return id;
  });
}
export async function reportsForMember(userId: string, limit = 100) {
  return (
    await getDatabase().query<Report>(
      "SELECT id, mod_key, reason, detail, status, response, created_at, updated_at FROM mod_report WHERE reporter_id=$1 ORDER BY created_at DESC LIMIT $2",
      [userId, Math.max(1, Math.min(1000, limit))],
    )
  ).rows;
}
export async function publicMember(handle: string) {
  const shared = readAccountConfig().mode === "shared";
  if (!(shared ? /^[a-z0-9_.]{3,20}$/ : /^[a-z][a-z0-9_]{2,29}$/).test(handle)) return null;
  const member = (
    (
      await getDatabase().query<{
        handle: string;
        bio: string;
        website: string;
        name: string;
        user_id: string;
      }>(
        'SELECT p.handle,p.bio,p.website,u.name,p.user_id FROM member_profile p JOIN "user" u ON p.user_id=u.id WHERE p.handle=$1 AND p.is_public=true AND ($2::boolean OR u."emailVerified"=true)',
        [handle, shared],
      )
    ).rows[0] ?? null
  );
  if (!member || !shared) return member;
  // Product opt-in does not override central suspension, deletion or field privacy.
  const { sharedAccount } = await import("./shared-account.ts");
  const current = await sharedAccount().publicProfile(member.user_id);
  if (!current || current.username !== handle) return null;
  return { ...member, name: current.displayName, bio: current.bio || "" };
}
export async function restrictions() {
  return new Set(
    (
      await getDatabase().query<{ mod_key: string }>(
        "SELECT mod_key FROM catalog_restriction",
      )
    ).rows.map((r) => r.mod_key),
  );
}
