import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/shell";
import { readAccountConfig } from "@/server/config";
export const metadata: Metadata = { title: "Privacy" };
export const dynamic = "force-dynamic";
export default function Page() {
  const shared = readAccountConfig().mode === "shared";
  return (
    <>
      <Header />
      <main id="main" className="page-wrap utility-page">
        <span className="overline">YOUR INFORMATION</span>
        <h1>Private by default.</h1>
        <p className="utility-lead">
          How Modlock handles your information.
        </p>
        <div className="help-sections">
          <section>
            <h2>Browsing</h2>
            <p>
              Browsing does not require an account. Search and filter choices
              are stored in the page URL. Listing images load directly from
              GameBanana; your browser connects to that image host. Modlock does
              not run advertising or product analytics.
            </p>
          </section>
          <section>
            <h2>Accounts and sessions</h2>
            {shared ? <><p>Sign-in uses your existing BuildLock account. BuildLock keeps your credentials, linked sign-in methods and account security. Modlock reads your current account to recognize you and stores your account ID, name, avatar and profile alongside your Modlock data. Modlock does not store a copy of your password, second-factor secret or email address.</p>
              <p>A secure session cookie connects this browser to your account. Signing out everywhere on BuildLock ends access from connected products. Shared account requests use server-to-server connections.</p></> : <><p>
              The dedicated local database stores your email, display name,
              password hash, session records and account settings. Passwords are
              hashed by the authentication library. Session cookies let the
              server recognize your signed-in browser. Authentication may retain
              session IP and browser information for account controls and abuse
              limits.
            </p>
            <p>
              Verification and password-recovery links are written to a private
              local outbox. No external email provider is connected. Local
              outbox messages remain until the operator removes them; their
              links expire. The outbox contains sensitive account links and is
              excluded from version control.
            </p>
            </>}
          </section>
          <section>
            <h2>What stays private</h2>
            <p>
              Your email, saved mods, personal notes, saved crosshair designs,
              account security settings and reports are not part of your public
              member profile. Publishing a profile shares only your display
              name, handle, bio and website. You can make it private again from{" "}
              <Link href="/account">profile settings</Link>.
            </p>
          </section>
          <section>
            <h2>Export and deletion</h2>
            <p>
              From <Link href="/account/security">account security</Link>,
              {shared ? "export your Modlock data or open your shared account controls. You can also remove your saved Modlock data from this page. Removing product data leaves your BuildLock account available for other products. " : "export your account data or delete your account. "} Deletion removes
              your account, profile, sessions, saved mods, notes and crosshair
              designs. Submitted reports remain in the review queue with their
              account link removed, and moderation history is retained. Avoid
              including personal details in report text.
            </p>
          </section>
          <section>
            <h2>{shared ? "Product data and shared accounts" : "Before a public release"}</h2>
            <p>
              {shared ? "Account suspension or a deletion request on BuildLock immediately prevents new access to Modlock and hides your public member identity. Modlock data is stored separately; use the Modlock data-removal control before deleting your shared account. Reports and moderation history may remain with the account reference removed." : <>This page describes a local development build. Public hosting,
              identity, mail delivery and retention operations will need to be
              finalized before launch. The website is not deployed.
              </>}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
