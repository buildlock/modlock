"use server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requireMutationSession } from "@/server/session";
import { getCatalog } from "@/lib/catalog";
import {
  saveMod,
  saveModNote,
  updateProfile,
  submitReport,
} from "@/server/community";

export interface ActionResult {
  ok: boolean;
  message: string;
  reference?: string;
}
function failure(error: unknown): ActionResult {
  if (error instanceof ZodError)
    return {
      ok: false,
      message: error.issues[0]?.message || "Check the form and try again.",
    };
  if ((error as { code?: string })?.code === "23505")
    return {
      ok: false,
      message: "That handle is already taken. Choose another.",
    };
  if (
    error instanceof Error &&
    [
      "Sign in",
      "Please reload",
      "Too many",
      "Your library",
      "Your report",
      "Save this mod",
      "This listing",
    ].some((prefix) => error.message.startsWith(prefix))
  )
    return { ok: false, message: error.message };
  return {
    ok: false,
    message: "This change could not be saved. Please try again.",
  };
}
export async function setSavedMod(
  key: string,
  saved: boolean,
): Promise<ActionResult> {
  try {
    const session = await requireMutationSession();
    if (typeof saved !== "boolean") throw new Error("Invalid selection");
    const mod = saved
      ? (await getCatalog())?.mods.find((m) => m.key === key)
      : undefined;
    if (saved && !mod) throw new Error("This listing is no longer available.");
    await saveMod(session.user.id, key, saved, mod?.modifiedAt ?? null);
    revalidatePath("/", "layout");
    return {
      ok: true,
      message: saved ? "Saved to your library." : "Removed from your library.",
    };
  } catch (error) {
    return failure(error);
  }
}
export async function updateMemberProfile(
  _previous: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireMutationSession();
    await updateProfile(session.user.id, {
      handle: String(form.get("handle") ?? ""),
      bio: String(form.get("bio") ?? ""),
      website: String(form.get("website") ?? ""),
      isPublic: form.get("public") === "on",
    });
    revalidatePath("/account");
    revalidatePath("/members/[handle]", "page");
    return { ok: true, message: "Profile saved." };
  } catch (error) {
    return failure(error);
  }
}
export async function updateSavedNote(
  _previous: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireMutationSession();
    await saveModNote(
      session.user.id,
      String(form.get("key") ?? ""),
      String(form.get("note") ?? ""),
    );
    revalidatePath("/library");
    return { ok: true, message: "Private note saved." };
  } catch (error) {
    return failure(error);
  }
}
export async function reportMod(
  _previous: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireMutationSession();
    const key = String(form.get("key") ?? "");
    if (!(await getCatalog())?.mods.some((m) => m.key === key))
      throw new Error("This listing is no longer available.");
    const reference = await submitReport(session.user.id, {
      key,
      reason: form.get("reason") as "broken",
      detail: String(form.get("detail") ?? ""),
      requestKey: String(form.get("requestKey") ?? ""),
    });
    revalidatePath("/account/reports");
    return {
      ok: true,
      message: "Your report has been saved for review.",
      reference,
    };
  } catch (error) {
    return failure(error);
  }
}
