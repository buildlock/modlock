"use client";
import { useActionState } from "react";
import { moderateReport } from "@/app/actions/moderation";
export function ModerationForm({
  id,
  updatedAt,
  response,
  status,
}: {
  id: string;
  updatedAt: string;
  response: string;
  status: string;
}) {
  const [state, action, pending] = useActionState(moderateReport, {
    ok: false,
    message: "",
  });
  return (
    <form action={action} className="account-form">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="updatedAt" value={updatedAt} />
      <label htmlFor={`status-${id}`}>Review status</label>
      <select
        id={`status-${id}`}
        name="status"
        defaultValue={status === "submitted" ? "reviewing" : status}
      >
        <option value="reviewing">Reviewing</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </select>
      <label htmlFor={`response-${id}`}>Response to reporter</label>
      <textarea
        id={`response-${id}`}
        name="response"
        defaultValue={response}
        minLength={10}
        maxLength={1000}
        rows={3}
        required
      />
      <label htmlFor={`visibility-${id}`}>Catalog visibility</label>
      <select id={`visibility-${id}`} name="visibility">
        <option value="keep">Keep current visibility</option>
        <option value="hide">Hide this listing from Modlock</option>
        <option value="restore">Restore this listing on Modlock</option>
      </select>
      <p className="field-help">
        Changes affect this local Modlock catalog. They are recorded in the
        audit log.
      </p>
      <button className="button subtle-button" disabled={pending}>
        {pending ? "Saving…" : "Save review"}
      </button>
      {state.message && (
        <p
          className={`form-message ${state.ok ? "form-success" : "form-error"}`}
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
