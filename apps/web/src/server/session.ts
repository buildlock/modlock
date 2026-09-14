import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth.ts";
import { readAccountConfig } from "./config.ts";
import { getDatabase } from "./database.ts";

export const currentSession = cache(async () => {
  if (!readAccountConfig().enabled) return null;
  return getAuth().api.getSession({ headers: await headers() });
});
export async function requirePageSession(next = "/account") {
  const session = await currentSession();
  if (!session?.user.emailVerified)
    redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return session;
}
export async function requireMutationSession() {
  if ((await headers()).get("origin") !== readAccountConfig().origin)
    throw new Error("Please reload Modlock before trying again.");
  const session = await currentSession();
  if (!session?.user.emailVerified) throw new Error("Sign in to continue.");
  return session;
}
export async function staffRole(userId: string) {
  return (
    (
      await getDatabase().query<{ role: "moderator" | "administrator" }>(
        "SELECT role FROM staff_grant WHERE user_id = $1",
        [userId],
      )
    ).rows[0]?.role ?? null
  );
}
