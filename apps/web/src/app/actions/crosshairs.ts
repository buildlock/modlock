"use server";
import { revalidatePath } from "next/cache";
import { requireMutationSession } from "@/server/session";
import { saveCrosshair, removeCrosshair } from "@/server/crosshairs";
import type { ActionResult } from "./community";
export async function storeCrosshair(
  name: string,
  document: unknown,
): Promise<ActionResult> {
  try {
    const session = await requireMutationSession();
    await saveCrosshair(session.user.id, name, document);
    revalidatePath("/tools/crosshair");
    return { ok: true, message: "Design saved to your account." };
  } catch {
    return {
      ok: false,
      message:
        "Design could not be saved. Check the name and sign-in status. Accounts can hold up to 100 designs.",
    };
  }
}
export async function deleteCrosshair(id: string): Promise<ActionResult> {
  try {
    const session = await requireMutationSession();
    await removeCrosshair(session.user.id, id);
    revalidatePath("/tools/crosshair");
    return { ok: true, message: "Saved design removed." };
  } catch {
    return { ok: false, message: "Could not remove this design." };
  }
}
