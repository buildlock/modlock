"use client";
import { useActionState } from "react";
import Link from "next/link";
import { reportMod } from "@/app/actions/community";
const reasons = {
  broken: "Broken or outdated",
  unsafe: "Potentially unsafe content",
  rights: "Rights or ownership concern",
  attribution: "Incorrect attribution",
  other: "Something else",
};
export function ReportForm({
  modKey,
  requestKey,
}: {
  modKey: string;
  requestKey: string;
}) {
  const [state, action, pending] = useActionState(reportMod, {
    ok: false,
    message: "",
  });
  return state.ok ? (
    <div className="report-confirmation" role="status">
      <h2>Thanks for the heads-up.</h2>
      <p>{state.message}</p>
      <p>
        Reference: <code>{state.reference}</code>
      </p>
      <Link className="text-link" href="/account/reports">
        View your reports →
      </Link>
    </div>
  ) : (
    <form className="account-form" action={action}>
      <input type="hidden" name="key" value={modKey} />
      <input type="hidden" name="requestKey" value={requestKey} />
      <label htmlFor="reason">What needs attention?</label>
      <select name="reason" id="reason" required>
        {Object.entries(reasons).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <label htmlFor="detail">Tell us what happened</label>
      <textarea
        id="detail"
        name="detail"
        minLength={10}
        maxLength={2000}
        rows={5}
        required
        placeholder="Include the relevant details. Please leave out passwords, private files, and personal contact information."
      />
      <p className="field-help">
        Your report is private. Submitting a report does not automatically
        remove a mod. This preview records reports locally.
      </p>
      {state.message && (
        <p className="form-message form-error" role="alert">
          {state.message}
        </p>
      )}
      <button className="button primary-button" disabled={pending}>
        {pending ? "Saving report…" : "Submit report"}
      </button>
    </form>
  );
}
