import type { Metadata } from "next";
import { Header, Footer } from "@/components/shell";
import { AccountNav } from "@/components/account-nav";
import { SecuritySettings } from "@/components/security-settings";
import { requirePageSession } from "@/server/session";
export const metadata: Metadata = { title: "Account security" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const session = await requirePageSession("/account/security");
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
        <SecuritySettings
          name={session.user.name}
          email={session.user.email}
          twoFactorEnabled={session.user.twoFactorEnabled ?? false}
        />
      </main>
      <Footer />
    </>
  );
}
