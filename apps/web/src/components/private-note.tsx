"use client";
import { useActionState } from "react";
import { updateSavedNote } from "@/app/actions/community";
export function PrivateNote({
  modKey,
  note,
}: {
  modKey: string;
  note: string;
}) {
  const [state, action, pending] = useActionState(updateSavedNote, {
    ok: false,
    message: "",
  });
  return (
    <details className="private-note">
      <summary>
        {note ? "Edit your private note" : "Add a private note"}
      </summary>
      <form action={action} className="account-form">
        <input type="hidden" name="key" value={modKey} />
        <label htmlFor={`note-${modKey}`}>Only you can see this</label>
        <textarea
          id={`note-${modKey}`}
          name="note"
          rows={2}
          maxLength={500}
          defaultValue={note}
          placeholder="Why you saved it, a setup idea, a reminder…"
        />
        <button className="text-link" disabled={pending}>
          Save note
        </button>
        {state.message && (
          <span role={state.ok ? "status" : "alert"}>{state.message}</span>
        )}
      </form>
    </details>
  );
}
