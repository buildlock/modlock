"use client";
import { useActionState } from "react";
import { removeModlockData } from "@/app/actions/shared-data";
export function RemoveSharedData() {
  const [state, action, pending] = useActionState(removeModlockData, { message: "" });
  return <form action={action} className="account-form">
    <h3>Remove your Modlock data</h3>
    <p>This removes saved mods, notes, crosshair designs and your Modlock profile. Your shared BuildLock account remains available. Submitted reports stay with the account reference removed.</p>
    <label className="check-label"><input type="checkbox" name="confirm" value="remove" required /> I want to permanently remove my Modlock data.</label>
    <button className="button" disabled={pending}>{pending ? "Removing…" : "Remove my Modlock data"}</button>
    {state.message && <p className="form-message form-error" role="alert">{state.message}</p>}
  </form>;
}
