import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getDatabase, transaction } from "./database.ts";
import { limitMember } from "./community.ts";
import { parseCrosshair, type CrosshairDocument } from "../lib/crosshair.ts";
export async function savedCrosshairs(userId: string) {
  return (
    await getDatabase().query<{
      id: string;
      name: string;
      document: CrosshairDocument;
      created_at: Date;
    }>(
      "SELECT id,name,document,created_at FROM saved_crosshair WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100",
      [userId],
    )
  ).rows;
}
export async function saveCrosshair(
  userId: string,
  name: string,
  document: unknown,
) {
  const title = z
      .string()
      .trim()
      .min(1)
      .max(50)
      .regex(/^[^\u0000-\u001f\u007f]+$/)
      .parse(name),
    value = parseCrosshair(document);
  return transaction(async (client) => {
    await limitMember(client, userId, "crosshair", 20);
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtextextended($1, 2))",
      [userId],
    );
    const count = await client.query(
      "SELECT count(*)::integer AS count FROM saved_crosshair WHERE user_id=$1",
      [userId],
    );
    if (count.rows[0].count >= 100)
      throw new Error(
        "You have 100 saved designs. Remove one before saving another.",
      );
    const id = randomUUID();
    await client.query(
      "INSERT INTO saved_crosshair(id,user_id,name,document) VALUES($1,$2,$3,$4)",
      [id, userId, title, JSON.stringify(value)],
    );
    return id;
  });
}
export async function removeCrosshair(userId: string, id: string) {
  z.uuid().parse(id);
  await getDatabase().query(
    "DELETE FROM saved_crosshair WHERE user_id=$1 AND id=$2",
    [userId, id],
  );
}
