import Link from "next/link";
import { Bookmark, ShieldCheck, UserRound } from "lucide-react";
import { Header, Footer } from "./shell";
import { AuthForm, type AuthMode } from "./auth-form";
import { readAccountConfig } from "@/server/config";
import { safeReturnPath } from "@buildlock/portfolio-auth-client";

const content = {
  "sign-in": {
    eyebrow: "WELCOME BACK",
    title: "Your setup starts here.",
    description: "Save the mods you love. Pick up where you left off.",
    form: "Sign in to Modlock",
  },
  "sign-up": {
    eyebrow: "MAKE YOURSELF AT HOME",
    title: "A little more your own.",
    description:
      "One account for your saved mods, your profile, and what comes next.",
    form: "Create your account",
  },
  forgot: {
    eyebrow: "ACCOUNT RECOVERY",
    title: "Let’s get you back in.",
    description: "Request a recovery link to choose a new password.",
    form: "Reset your password",
  },
  reset: {
    eyebrow: "A FRESH START",
    title: "Make it memorable.",
    description: "Choose a unique password to protect your Modlock account.",
    form: "Choose a new password",
  },
};
export function AuthPage({
  mode,
  next,
  token,
  error,
}: {
  mode: AuthMode;
  next?: string;
  token?: string;
  error?: string;
}) {
  const copy = content[mode],
    config = readAccountConfig(),
    enabled = config.enabled,
    shared = config.mode === "shared";
  return (
    <>
      <Header />
      <main id="main" className="page-wrap auth-page">
        <section className="auth-story">
          <span className="overline">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
          <ul className="auth-benefits">
            <li>
              <Bookmark size={20} />
              <span>Keep your next favorites close.</span>
            </li>
            <li>
              <UserRound size={20} />
              <span>A profile that belongs to you.</span>
            </li>
            <li>
              <ShieldCheck size={20} />
              <span>Your private library stays private.</span>
            </li>
          </ul>
          <Link href="/#catalog" className="text-link">
            Keep exploring without an account →
          </Link>
        </section>
        <section className="auth-panel">
          <span className="overline">MODLOCK ACCOUNT</span>
          <h2>{shared ? "Continue with your account" : copy.form}</h2>
          {shared ? (
            <>
              <p>Your BuildLock username, profile and Steam link come with you. Sign in once to keep your saved mods together.</p>
              {error && <p className="form-message form-error" role="alert">That sign-in could not finish. Please start again. If it continues, try again shortly.</p>}
              <a className="button primary-button" href={`/api/account/sign-in?next=${encodeURIComponent(safeReturnPath(next || "/account"))}`}>Continue with BuildLock →</a>
              <p className="field-help">Steam and your existing sign-in methods are available on BuildLock.</p>
            </>
          ) : enabled ? (
            <AuthForm mode={mode} next={next} token={token} />
          ) : (
            <p className="form-message">
              Accounts are not configured in this preview. The catalog is still
              open to browse.
            </p>
          )}
          <p className="auth-footnote">
            {shared ? "Account security and recovery are managed through your shared BuildLock account." : <>Local development preview. Verification and recovery messages stay
            in the local outbox.{" "}
            <Link href="/help#accounts">How to test accounts</Link>
            </>}
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
