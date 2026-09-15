"use server";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireMutationSession } from "@/server/session";
import { sharedAccount, removeSharedProductData } from "@/server/shared-account";
import { readAccountConfig } from "@/server/config";

export async function removeModlockData(_previous: { message: string }, form: FormData) {
  try {
    if (readAccountConfig().mode !== "shared" || form.get("confirm") !== "remove") return { message: "Confirm that you want to remove your Modlock data." };
    const session = await requireMutationSession();
    const client = sharedAccount();
    const request = new Request(client.origin + "/api/account/sign-out", { method: "POST", headers: new Headers(await headers()) });
    await removeSharedProductData(session.user.id, () => client.signOut(request));
    (await cookies()).set(client.sessionCookie, "", { path: "/", httpOnly: true, secure: client.origin.startsWith("https:"), sameSite: "lax", maxAge: 0 });
  } catch { return { message: "Could not finish removing your data. Please sign in and try again." }; }
  redirect("/sign-in?removed=1");
}
