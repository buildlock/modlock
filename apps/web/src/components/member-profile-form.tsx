"use client";
import { useActionState } from "react";
import { updateMemberProfile } from "@/app/actions/community";
export function MemberProfileForm({
  profile,
  shared = false,
  settingsUrl = "https://buildlock.net/settings",
}: {
  profile: { handle: string; bio: string; website: string; is_public: boolean };
  shared?: boolean;
  settingsUrl?: string;
}) {
  const [state, action, pending] = useActionState(updateMemberProfile, {
    ok: false,
    message: "",
  });
  return (
    <form action={action} className="account-form profile-form">
      <label htmlFor="handle">Profile handle</label>
      <input
        id="handle"
        name="handle"
        defaultValue={profile.handle}
        readOnly={shared}
        minLength={3}
        maxLength={30}
        pattern={shared ? undefined : "[a-z][a-z0-9_]{2,29}"}
        required
        autoComplete="username"
      />
      <span className="field-help">
        {shared ? <>Your BuildLock username is shared across products. <a href={settingsUrl}>Edit your shared profile →</a></> : "3–30 lowercase letters, numbers or underscores. Start with a letter."}
      </span>
      <label htmlFor="bio">About you</label>
      <textarea
        id="bio"
        name="bio"
        defaultValue={profile.bio}
        readOnly={shared}
        maxLength={500}
        rows={4}
        placeholder="Your favorite heroes, the kind of mods you love…"
      />
      <label htmlFor="website">Your website</label>
      <input
        id="website"
        name="website"
        type="url"
        defaultValue={profile.website}
        maxLength={300}
        placeholder="https://"
      />
      <label className="check-label public-profile-option">
        <input
          type="checkbox"
          name="public"
          defaultChecked={profile.is_public}
        />
        <span>
          Make my profile public{" "}
          <small>
            Shares your display name, handle, bio and website. Your email, saved
            mods and notes stay private.
          </small>
        </span>
      </label>
      {state.message && (
        <p
          role={state.ok ? "status" : "alert"}
          className={`form-message ${state.ok ? "form-success" : "form-error"}`}
        >
          {state.message}
        </p>
      )}
      <button className="button primary-button" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
