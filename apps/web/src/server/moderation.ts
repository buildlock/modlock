import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getDatabase, transaction } from "./database.ts";
import { limitMember, type Report } from "./community.ts";
import { readAccountConfig } from "./config.ts";

export class StaffAccessError extends Error {}
export async function requireStaff(
  userId: string,
  sessionId: string,
  fresh = false,
) {
  if (readAccountConfig().mode === "shared") throw new StaffAccessError("Shared-account moderation has not been configured.");
  const { rows } = await getDatabase().query<{
    role: string;
    created_at: Date;
  }>(
    `SELECT g.role, s."createdAt" AS created_at FROM staff_grant g
     JOIN "user" u ON u.id=g.user_id JOIN session s ON s."userId"=u.id
     WHERE u.id=$1 AND s.id=$2 AND s."expiresAt">now()
     AND u."emailVerified"=true AND u."twoFactorEnabled"=true`,
    [userId, sessionId],
  );
  if (!rows[0])
    throw new StaffAccessError(
      "Staff access requires an assigned role and two-factor authentication.",
    );
  if (fresh && Date.now() - new Date(rows[0].created_at).getTime() > 300_000)
    throw new StaffAccessError(
      "Sign out and sign in again before making a moderation decision.",
    );
  return rows[0].role;
}
export async function moderationQueue(
  userId: string,
  sessionId: string,
  page: number,
) {
  await requireStaff(userId, sessionId);
  const { rows } = await getDatabase().query<Report & { hidden: boolean }>(
    `SELECT r.id,r.mod_key,r.reason,r.detail,r.status,r.response,r.created_at,r.updated_at,
     EXISTS(SELECT 1 FROM catalog_restriction c WHERE c.mod_key=r.mod_key) AS hidden
     FROM mod_report r ORDER BY CASE WHEN status IN ('submitted','reviewing') THEN 0 ELSE 1 END, created_at DESC LIMIT 26 OFFSET $1`,
    [Math.max(0, Math.min(9999, page - 1)) * 25],
  );
  return rows;
}
export const decisionSchema = z.strictObject({
  id: z.uuid(),
  status: z.enum(["reviewing", "resolved", "closed"]),
  response: z.string().trim().min(10).max(1000),
  visibility: z.enum(["keep", "hide", "restore"]),
  expectedUpdatedAt: z.iso.datetime({ offset: true }),
});
export async function reviewReport(
  userId: string,
  sessionId: string,
  input: z.input<typeof decisionSchema>,
) {
  const value = decisionSchema.parse(input);
  await requireStaff(userId, sessionId, true);
  await transaction(async (client) => {
    // Lock the grant so revocation cannot race this transaction.
    const grant = await client.query(
      `SELECT g.role FROM staff_grant g JOIN "user" u ON u.id=g.user_id JOIN session s ON s."userId"=u.id
      WHERE u.id=$1 AND s.id=$2 AND s."expiresAt">now() AND s."createdAt">now()-interval '5 minutes'
      AND u."emailVerified"=true AND u."twoFactorEnabled"=true FOR SHARE OF g,u,s`,
      [userId, sessionId],
    );
    if (!grant.rowCount)
      throw new StaffAccessError("Staff access has been revoked.");
    await limitMember(client, userId, "moderation", 30);
    const report = await client.query<{ mod_key: string; updated_at: Date }>(
      "SELECT mod_key,updated_at FROM mod_report WHERE id=$1 FOR UPDATE",
      [value.id],
    );
    if (!report.rows[0]) throw new Error("Report not found.");
    if (
      report.rows[0].updated_at.toISOString() !==
      new Date(value.expectedUpdatedAt).toISOString()
    )
      throw new Error("This report changed. Reload before reviewing it again.");
    await client.query(
      "UPDATE mod_report SET status=$2,response=$3,updated_at=GREATEST(date_trunc('milliseconds',clock_timestamp()),updated_at+interval '1 millisecond') WHERE id=$1",
      [value.id, value.status, value.response],
    );
    if (value.visibility === "hide")
      await client.query(
        "INSERT INTO catalog_restriction(mod_key,reason,actor_id) VALUES($1,$2,$3) ON CONFLICT(mod_key) DO UPDATE SET reason=$2,actor_id=$3,created_at=now()",
        [report.rows[0].mod_key, value.response, userId],
      );
    if (value.visibility === "restore")
      await client.query("DELETE FROM catalog_restriction WHERE mod_key=$1", [
        report.rows[0].mod_key,
      ]);
    await client.query(
      "INSERT INTO moderation_event(id,report_id,actor_id,action,reason) VALUES($1,$2,$3,$4,$5)",
      [
        randomUUID(),
        value.id,
        userId,
        `${value.status}:${value.visibility}`,
        value.response,
      ],
    );
  });
}
