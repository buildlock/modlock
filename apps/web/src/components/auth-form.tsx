"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { safeReturnPath } from "@/lib/navigation";

export type AuthMode = "sign-in" | "sign-up" | "forgot" | "reset";
export function AuthForm({
  mode,
  next,
  token,
}: {
  mode: AuthMode;
  next?: string;
  token?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [visible, setVisible] = useState(false),
    [challenge, setChallenge] = useState(false),
    [backup, setBackup] = useState(false);
  const destination = safeReturnPath(next);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (challenge) {
        const code = String(data.get("code") ?? "").trim();
        const result = backup
          ? await authClient.twoFactor.verifyBackupCode({ code })
          : await authClient.twoFactor.verifyTotp({ code, trustDevice: false });
        if (result.error) {
          setError(
            "That code could not be verified. Try a new code or a recovery code.",
          );
          return;
        }
        router.push(destination);
        router.refresh();
        return;
      }
      const email = String(data.get("email") ?? "").trim(),
        password = String(data.get("password") ?? "");
      if (mode === "sign-up") {
        const result = await authClient.signUp.email({
          email,
          password,
          name: String(data.get("name") ?? "").trim(),
          callbackURL: "/account",
        });
        if (result.error) {
          setError(
            "We couldn’t create the account. Check your details and try again shortly.",
          );
          return;
        }
        setMessage(
          "Check your email to verify your account, then sign in. This local preview writes messages to the development outbox.",
        );
        return;
      }
      if (mode === "forgot") {
        const result = await authClient.requestPasswordReset({
          email,
          redirectTo: "/reset-password",
        });
        if (result.error) {
          setError(
            "Recovery is temporarily unavailable. Wait a minute and try again.",
          );
          return;
        }
        setMessage(
          "If that email has an account, a recovery link is ready. Check the development outbox for this local preview.",
        );
        return;
      }
      if (mode === "reset") {
        if (password !== data.get("confirm")) {
          setError("The passwords don’t match.");
          return;
        }
        if (!token) {
          setError(
            "This recovery link is missing or expired. Request a new one.",
          );
          return;
        }
        const result = await authClient.resetPassword({
          newPassword: password,
          token,
        });
        if (result.error) {
          setError(
            "This recovery link could not be used. Request a new one and try again.",
          );
          return;
        }
        setMessage(
          "Password changed. All previous sessions have been signed out. You can now sign in with your new password.",
        );
        return;
      }
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe: data.get("remember") === "on",
      });
      if (result.error) {
        setError(
          result.error.code === "EMAIL_NOT_VERIFIED"
            ? "Verify your email before signing in. A verification message is in the development outbox."
            : "We couldn’t sign you in. Check your email and password, or try again shortly.",
        );
        return;
      }
      if (
        result.data &&
        "twoFactorRedirect" in result.data &&
        result.data.twoFactorRedirect
      ) {
        setChallenge(true);
        return;
      }
      router.push(destination);
      router.refresh();
    } catch {
      setError("The account service is unavailable. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="account-form" onSubmit={submit}>
      {challenge ? (
        <>
          <div className="form-intro">
            <ShieldCheck size={25} />
            <h2>One more check.</h2>
            <p>
              {backup
                ? "Enter one of your saved recovery codes."
                : "Enter the six-digit code from your authenticator app."}
            </p>
          </div>
          <label htmlFor="code">
            {backup ? "Recovery code" : "Authenticator code"}
          </label>
          <input
            id="code"
            name="code"
            autoComplete="one-time-code"
            inputMode={backup ? "text" : "numeric"}
            maxLength={backup ? 30 : 6}
            minLength={backup ? 6 : 6}
            pattern={backup ? undefined : "[0-9]{6}"}
            required
            autoFocus
          />
        </>
      ) : (
        <>
          {mode === "sign-up" && (
            <>
              <label htmlFor="name">Display name</label>
              <input
                id="name"
                name="name"
                autoComplete="nickname"
                minLength={2}
                maxLength={50}
                required
                placeholder="What should we call you?"
              />
              <span className="field-help">
                Your public name. You can change it later.
              </span>
            </>
          )}
          {mode !== "reset" && (
            <>
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                placeholder="you@example.com"
              />
            </>
          )}
          {mode !== "forgot" && (
            <>
              <label htmlFor="password">
                {mode === "reset" ? "New password" : "Password"}
              </label>
              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={visible ? "text" : "password"}
                  autoComplete={
                    mode === "sign-in" ? "current-password" : "new-password"
                  }
                  minLength={mode === "sign-in" ? 1 : 12}
                  maxLength={128}
                  required
                />
                <button
                  type="button"
                  aria-label={visible ? "Hide password" : "Show password"}
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {mode !== "sign-in" && (
                <span className="field-help">
                  At least 12 characters. A long, unique passphrase works well.
                </span>
              )}
            </>
          )}
          {mode === "reset" && (
            <>
              <label htmlFor="confirm">Confirm new password</label>
              <input
                id="confirm"
                name="confirm"
                type={visible ? "text" : "password"}
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                required
              />
            </>
          )}
          {mode === "sign-in" && (
            <div className="form-options">
              <label className="check-label">
                <input type="checkbox" name="remember" /> Keep me signed in
              </label>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>
          )}
        </>
      )}
      {error && (
        <p className="form-message form-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="form-message form-success" role="status">
          <Check size={17} />
          {message}
        </p>
      )}
      {!message && (
        <button
          className="button primary-button full-button"
          disabled={busy}
          type="submit"
        >
          {busy
            ? "Please wait…"
            : challenge
              ? "Verify code"
              : mode === "sign-up"
                ? "Create account"
                : mode === "forgot"
                  ? "Send recovery link"
                  : mode === "reset"
                    ? "Set new password"
                    : "Sign in"}
          <ArrowRight size={17} />
        </button>
      )}
      {challenge ? (
        <button
          className="text-link form-switch"
          type="button"
          onClick={() => {
            setBackup(!backup);
            setError("");
          }}
        >
          {backup ? "Use an authenticator code" : "Use a recovery code instead"}
        </button>
      ) : (
        <p className="form-switch">
          {mode === "sign-in" ? (
            <>
              New to Modlock?{" "}
              <Link href={`/sign-up?next=${encodeURIComponent(destination)}`}>
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href={`/sign-in?next=${encodeURIComponent(destination)}`}>
                Sign in
              </Link>
            </>
          )}
        </p>
      )}
    </form>
  );
}
