import { randomUUID } from "node:crypto";
import { getDatabase, transaction } from "../src/server/database.ts";
try {
  process.loadEnvFile(".env.local");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
const [email, role] = process.argv.slice(2);
if (!email || !["moderator", "administrator", "revoke"].includes(role))
  throw new Error(
    "Usage: accounts:staff <email> <moderator|administrator|revoke>",
  );
try {
  await transaction(async (client) => {
    const { rows } = await client.query<{
      id: string;
      emailVerified: boolean;
      twoFactorEnabled: boolean;
    }>(
      'SELECT id,"emailVerified","twoFactorEnabled" FROM "user" WHERE email=$1',
      [email.toLowerCase()],
    );
    const user = rows[0];
    if (!user) throw new Error("Local account not found.");
    if (role !== "revoke" && (!user.emailVerified || !user.twoFactorEnabled))
      throw new Error(
        "Verify the email and enable two-factor authentication first.",
      );
    if (role === "revoke")
      await client.query("DELETE FROM staff_grant WHERE user_id=$1", [user.id]);
    else
      await client.query(
        "INSERT INTO staff_grant(user_id,role) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET role=$2",
        [user.id, role],
      );
    await client.query('DELETE FROM session WHERE "userId"=$1', [user.id]);
    await client.query(
      "INSERT INTO moderation_event(id,actor_id,action,reason) VALUES($1,NULL,$2,$3)",
      [
        randomUUID(),
        `staff:${role}`,
        `Local operator changed grant for account ${user.id}`,
      ],
    );
  });
  console.log("Staff grant updated. Existing sessions ended; sign in again.");
} finally {
  await getDatabase().end();
}
