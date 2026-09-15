import { createPortfolioClient, type SharedProfile } from "@buildlock/portfolio-auth-client";
import { readAccountConfig } from "./config.ts";
import { transaction } from "./database.ts";

export function sharedAccount() {
  const config = readAccountConfig();
  if (config.mode !== "shared") throw new Error("Shared sign-in is not configured.");
  return createPortfolioClient({
    clientId: "modlock", clientSecret: process.env.PORTFOLIO_CLIENT_SECRET || "",
    origin: config.origin, issuer: process.env.PORTFOLIO_ISSUER || "https://buildlock.net",
    production: process.env.NODE_ENV === "production",
  });
}

/** Revoke access before removing product data. Either failure reaches the UI. */
export async function removeSharedProductData(userId: string, revoke: () => Promise<unknown>) {
  await revoke();
  await transaction(async (client) => { await client.query('DELETE FROM "user" WHERE id=$1', [userId]); });
}

/** The projection owns no credentials or email address. Names are refreshed
 * from the issuer and can only be edited there. Existing product opt-in stays. */
export async function syncSharedProfile(profile: SharedProfile) {
  await transaction(async (client) => {
    await client.query(`INSERT INTO "user" (id,name,image,"createdAt","updatedAt") VALUES ($1,$2,$3,$4,now())
      ON CONFLICT (id) DO UPDATE SET name=excluded.name,image=excluded.image,"updatedAt"=now()
      WHERE ("user".name,"user".image) IS DISTINCT FROM (excluded.name,excluded.image)`,
    [profile.user.id, profile.user.name, profile.user.image, profile.user.createdAt]);
    // The issuer has proved the current name belongs to this canonical ID.
    // Release an obsolete projection without transferring its product data.
    await client.query("UPDATE member_profile SET handle=NULL WHERE handle=$1 AND user_id<>$2", [profile.user.username, profile.user.id]);
    await client.query(`INSERT INTO member_profile(user_id,handle,bio) VALUES ($1,$2,$3)
      ON CONFLICT (user_id) DO UPDATE SET handle=excluded.handle,bio=excluded.bio,updated_at=now()
      WHERE (member_profile.handle,member_profile.bio) IS DISTINCT FROM (excluded.handle,excluded.bio)`,
    [profile.user.id, profile.user.username, profile.user.bio.slice(0,500)]);
  });
}
