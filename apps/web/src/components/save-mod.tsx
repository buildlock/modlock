"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Check } from "lucide-react";
import { setSavedMod } from "@/app/actions/community";
export function SaveModButton({
  modKey,
  initialSaved = false,
  signedIn = false,
  compact = false,
}: {
  modKey: string;
  initialSaved?: boolean;
  signedIn?: boolean;
  compact?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const label = saved ? "Remove from saved mods" : "Save to your library";
  useEffect(() => setSaved(initialSaved), [initialSaved]);
  if (!signedIn)
    return (
      <Link
        className={`save-mod ${compact ? "save-mod-compact" : ""}`}
        href={`/sign-in?next=${encodeURIComponent(`/mods/${modKey}`)}`}
        aria-label="Sign in to save this mod"
      >
        <Bookmark size={17} />
        {!compact && "Save to your library"}
      </Link>
    );
  return (
    <div className={compact ? "save-control-compact" : "save-control"}>
      <button
        className={`save-mod ${saved ? "is-saved" : ""} ${compact ? "save-mod-compact" : ""}`}
        aria-label={label}
        aria-pressed={saved}
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError("");
          try {
            const result = await setSavedMod(modKey, !saved);
            if (result.ok) setSaved(!saved);
            else setError(result.message);
          } catch {
            setError("Couldn’t update your library. Try again.");
          } finally {
            setPending(false);
          }
        }}
      >
        {saved ? <Check size={17} /> : <Bookmark size={17} />}{" "}
        {!compact &&
          (pending
            ? "Saving…"
            : saved
              ? "Saved to your library"
              : "Save to your library")}
      </button>
      {error && (
        <span role="alert" className="save-error">
          {error}
        </span>
      )}
    </div>
  );
}
