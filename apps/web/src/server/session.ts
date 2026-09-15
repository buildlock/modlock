import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth.ts";
import { readAccountConfig } from "./config.ts";
import { getDatabase } from "./database.ts";
import { sharedAccount, syncSharedProfile } from "./shared-account.ts";

export const currentSession = cache(async () => {
  const config = readAccountConfig();
  if (!config.enabled) return null;
  if (config.mode === "shared") {
    try {
      const profile = await sharedAccount().current(new Request(config.origin + "/account", { headers: new Headers(await headers()) }));
      if (!profile) return null;
      await syncSharedProfile(profile);
      return {
        session: { id: profile.session.id, createdAt: new Date(profile.session.createdAt), expiresAt: new Date(profile.session.expiresAt), userId: profile.user.id },
        user: { id: profile.user.id, name: profile.user.name, email: profile.user.email || "", emailVerified: profile.user.emailVerified,
          verified: profile.user.verified, image: profile.user.image, username: profile.user.username, createdAt: new Date(profile.user.createdAt),
          updatedAt: new Date(profile.user.createdAt), twoFactorEnabled: false },
      };
    } catch {
      console.error("Shared account lookup is temporarily unavailable.");
      return null;
    }
  }
  const session = await getAuth().api.getSession({ headers: await headers() });
  return session ? { ...session, user: { ...session.user, verified: session.user.emailVerified, username: undefined } } : null;
});
export async function requirePageSession(next = "/account") {
  const session = await currentSession();
  if (!session?.user.verified)
    redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return session;
}
export async function requireMutationSession() {
  if ((await headers()).get("origin") !== readAccountConfig().origin)
    throw new Error("Please reload Modlock before trying again.");
  const session = await currentSession();
  if (!session?.user.verified) throw new Error("Sign in to continue.");
  return session;
}
export async function staffRole(userId: string) {
  if (readAccountConfig().mode === "shared") return null;
  return (
    (
      await getDatabase().query<{ role: "moderator" | "administrator" }>(
        "SELECT role FROM staff_grant WHERE user_id = $1",
        [userId],
      )
    ).rows[0]?.role ?? null
  );
}
