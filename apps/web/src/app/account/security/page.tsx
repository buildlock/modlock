import type { Metadata } from "next";
import { Header, Footer } from "@/components/shell";
import { AccountNav } from "@/components/account-nav";
import { SecuritySettings } from "@/components/security-settings";
import { requirePageSession } from "@/server/session";
import { readAccountConfig } from "@/server/config";
import Link from "next/link";
import { RemoveSharedData } from "@/components/remove-shared-data";
export const metadata: Metadata = { title: "Account security" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const session = await requirePageSession("/account/security");
  const shared = readAccountConfig().mode === "shared";
  return (
    <>
      <Header />
      <main id="main" className="page-wrap member-page">
        <div className="member-heading">
          <div>
            <span className="overline">YOUR MODLOCK ACCOUNT</span>
            <h1>Keep it yours.</h1>
            <p>Password, sessions and account controls.</p>
          </div>
        </div>
        <AccountNav active="security" />
        {shared ? <section className="settings-panel">
          <h2>One account across products</h2>
          <p>Your username, profile, sign-in methods and account security are managed on BuildLock.</p>
          <a className="button primary-button" href={`${process.env.PORTFOLIO_ISSUER || "https://buildlock.net"}/settings`}>Open account settings →</a>
          <p className="field-help">Sign out everywhere from BuildLock to end your connected product sessions.</p>
          <Link className="text-link" href="/account/export">Export your Modlock data →</Link>
          <RemoveSharedData />
        </section> : <SecuritySettings
          name={session.user.name}
          email={session.user.email}
          twoFactorEnabled={session.user.twoFactorEnabled ?? false}
        />}
      </main>
      <Footer />
    </>
  );
}
