"use server";
import { revalidatePath } from "next/cache";
import { requireMutationSession } from "@/server/session";
import { reviewReport, StaffAccessError } from "@/server/moderation";
import type { ActionResult } from "./community";
export async function moderateReport(
  _: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireMutationSession();
    await reviewReport(session.user.id, session.session.id, {
      id: String(form.get("id")),
      status: form.get("status") as "reviewing",
      response: String(form.get("response") ?? ""),
      visibility: form.get("visibility") as "keep",
      expectedUpdatedAt: String(form.get("updatedAt")),
    });
    revalidatePath("/", "layout");
    return {
      ok: true,
      message: "Review saved. The reporter can see your response.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof StaffAccessError ||
        (error instanceof Error &&
          error.message.startsWith("This report changed"))
          ? error.message
          : "Review could not be saved. Check the fields and reload before retrying.",
    };
  }
}
