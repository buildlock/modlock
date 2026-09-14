"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, KeyRound, Monitor, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function SecuritySettings({
  name,
  email,
  twoFactorEnabled,
}: {
  name: string;
  email: string;
  twoFactorEnabled: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const [setup, setSetup] = useState<{
      totpURI: string;
      backupCodes: string[];
    } | null>(null),
    [enabled, setEnabled] = useState(twoFactorEnabled),
    [copied, setCopied] = useState(false);
  async function perform(key: string, work: () => Promise<void>) {
    setBusy(key);
    setError("");
    setMessage("");
    try {
      await work();
    } catch {
      setError(
        "This change could not be completed. Check your password or sign in again, then retry.",
      );
    } finally {
      setBusy("");
    }
  }
  function form(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    return new FormData(event.currentTarget);
  }
  return (
    <div className="security-sections">
      <section className="settings-panel">
        <h2>Account details</h2>
        <p className="panel-copy">
          Your email is private. Your display name appears on your public
          profile.
        </p>
        <p className="verified-email">
          <Check size={16} />
          {email}
          <span>Verified</span>
        </p>
        <form
          className="account-form"
          onSubmit={(event) => {
            const data = form(event);
            void perform("name", async () => {
              const result = await authClient.updateUser({
                name: String(data.get("name") ?? ""),
              });
              if (result.error) throw new Error();
              setMessage("Display name updated.");
              router.refresh();
            });
          }}
        >
          <label htmlFor="display-name">Display name</label>
          <input
            id="display-name"
            name="name"
            defaultValue={name}
            minLength={2}
            maxLength={50}
            required
            autoComplete="nickname"
          />
          <button className="button subtle-button" disabled={!!busy}>
            Update name
          </button>
        </form>
      </section>
      <section className="settings-panel">
        <h2>
          <KeyRound size={22} /> Change password
        </h2>
        <form
          className="account-form"
          onSubmit={(event) => {
            const element = event.currentTarget,
              data = form(event);
            void perform("password", async () => {
              if (data.get("newPassword") !== data.get("confirm")) {
                setError("The new passwords don’t match.");
                return;
              }
              const result = await authClient.changePassword({
                currentPassword: String(data.get("currentPassword") ?? ""),
                newPassword: String(data.get("newPassword") ?? ""),
                revokeOtherSessions: true,
              });
              if (result.error) throw new Error();
              element.reset();
              setMessage(
                "Password changed. Other sessions have been signed out.",
              );
            });
          }}
        >
          <label htmlFor="current-password">Current password</label>
          <input
            id="current-password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
          />
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={128}
          />
          <label htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={128}
          />
          <button className="button subtle-button" disabled={!!busy}>
            Change password
          </button>
        </form>
      </section>
      <section className="settings-panel">
        <h2>
          <ShieldCheck size={22} /> Two-factor authentication
        </h2>
        <p className="panel-copy">
          {enabled
            ? "An authenticator code protects your account when you sign in."
            : "Add an authenticator app for an extra check at sign-in."}
        </p>
        <span className={`small-status ${enabled ? "status-enabled" : ""}`}>
          {enabled ? "Enabled" : "Not enabled"}
        </span>
        {!setup && (
          <form
            className="account-form"
            onSubmit={(event) => {
              const element = event.currentTarget,
                data = form(event);
              void perform("two-factor", async () => {
                const password = String(data.get("password") ?? "");
                if (enabled) {
                  const result = await authClient.twoFactor.disable({
                    password,
                  });
                  if (result.error) throw new Error();
                  setEnabled(false);
                  setMessage("Two-factor authentication disabled.");
                } else {
                  const result = await authClient.twoFactor.enable({
                    password,
                    method: "totp",
                  });
                  if (result.error || result.data?.method !== "totp")
                    throw new Error();
                  setSetup(result.data);
                }
                element.reset();
                router.refresh();
              });
            }}
          >
            <label htmlFor="two-factor-password">Confirm your password</label>
            <input
              id="two-factor-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={128}
            />
            <button className="button subtle-button" disabled={!!busy}>
              {enabled ? "Disable two-factor" : "Set up an authenticator"}
            </button>
          </form>
        )}
        {setup && (
          <div className="authenticator-setup">
            <p>
              Add this setup key to your authenticator app as a time-based
              account named Modlock.
            </p>
            <code className="setup-key">
              {new URL(setup.totpURI).searchParams.get("secret")}
            </code>
            <button
              type="button"
              className="text-link"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    new URL(setup.totpURI).searchParams.get("secret") || "",
                  );
                  setCopied(true);
                } catch {
                  setError("Copy the setup key manually.");
                }
              }}
            >
              <Copy size={15} />
              {copied ? "Copied" : "Copy setup key"}
            </button>
            <h3>Save your recovery codes</h3>
            <p>
              Keep these somewhere private. Each code can be used once if you
              lose your authenticator.
            </p>
            <div className="recovery-codes">
              {setup.backupCodes.map((code) => (
                <code key={code}>{code}</code>
              ))}
            </div>
            <form
              className="account-form"
              onSubmit={(event) => {
                const data = form(event);
                void perform("verify-two-factor", async () => {
                  const result = await authClient.twoFactor.verifyTotp({
                    code: String(data.get("code") ?? ""),
                  });
                  if (result.error) throw new Error();
                  setSetup(null);
                  setEnabled(true);
                  setMessage("Two-factor authentication is now enabled.");
                  router.refresh();
                });
              }}
            >
              <label htmlFor="setup-code">Six-digit authenticator code</label>
              <input
                id="setup-code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                required
              />
              <label className="check-label">
                <input type="checkbox" required /> I saved my recovery codes
              </label>
              <button className="button primary-button" disabled={!!busy}>
                Verify and enable
              </button>
            </form>
          </div>
        )}
      </section>
      <section className="settings-panel">
        <h2>
          <Monitor size={22} /> Signed-in sessions
        </h2>
        <p className="panel-copy">
          End other sessions if you used a shared device. Signing out everywhere
          includes this browser.
        </p>
        <div className="button-row">
          <button
            className="button subtle-button"
            disabled={!!busy}
            onClick={() =>
              void perform("other-sessions", async () => {
                const result = await authClient.revokeOtherSessions();
                if (result.error) throw new Error();
                setMessage("All other sessions have been signed out.");
              })
            }
          >
            Sign out other sessions
          </button>
          <button
            className="text-link"
            disabled={!!busy}
            onClick={() =>
              void perform("all-sessions", async () => {
                const result = await authClient.revokeSessions();
                if (result.error) throw new Error();
                await authClient.signOut();
                router.push("/sign-in");
                router.refresh();
              })
            }
          >
            Sign out everywhere
          </button>
        </div>
      </section>
      <section className="settings-panel">
        <h2>Your data</h2>
        <p className="panel-copy">
          Download your profile, saved mods, private notes, crosshair designs
          and reports as JSON.
        </p>
        <a className="button subtle-button" href="/account/export">
          Download account data
        </a>
      </section>
      <section className="settings-panel danger-panel">
        <h2>Delete your account</h2>
        <p className="panel-copy">
          Removes your account, profile, saved mods, notes and crosshair
          designs. Submitted reports stay in the review queue without an account
          link. This cannot be undone.
        </p>
        <form
          className="account-form"
          onSubmit={(event) => {
            const data = form(event);
            void perform("delete", async () => {
              const result = await authClient.deleteUser({
                password: String(data.get("password") ?? ""),
              });
              if (result.error) throw new Error();
              router.push("/");
              router.refresh();
            });
          }}
        >
          <label htmlFor="delete-password">Confirm your password</label>
          <input
            id="delete-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
          />
          <label className="check-label">
            <input type="checkbox" required /> I understand my account will be
            permanently deleted
          </label>
          <button className="button danger-button" disabled={!!busy}>
            Delete account
          </button>
        </form>
      </section>
      {(message || error) && (
        <div
          className={`security-feedback form-message ${error ? "form-error" : "form-success"}`}
          role={error ? "alert" : "status"}
        >
          {error || message}
        </div>
      )}
    </div>
  );
}
