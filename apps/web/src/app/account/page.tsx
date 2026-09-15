import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, UserRound } from "lucide-react";
import { Header, Footer } from "@/components/shell";
import { AccountNav } from "@/components/account-nav";
import { MemberProfileForm } from "@/components/member-profile-form";
import { SignOutButton } from "@/components/sign-out";
import { requirePageSession, staffRole } from "@/server/session";
import { getMemberProfile } from "@/server/community";
import { readAccountConfig } from "@/server/config";
export const metadata: Metadata = { title: "Your profile" };
export const dynamic = "force-dynamic";
export default async function AccountPage() {
  const shared = readAccountConfig().mode === "shared";
  const settingsUrl = `${process.env.PORTFOLIO_ISSUER || "https://buildlock.net"}/settings`;
  const session = await requirePageSession(),
    profile = await getMemberProfile(session.user.id),
    role = await staffRole(session.user.id);
  return (
    <>
      <Header />
      <main id="main" className="page-wrap member-page">
        <div className="member-heading">
          <div>
            <span className="overline">YOUR CORNER OF MODLOCK</span>
            <h1>Make yourself known.</h1>
            <p>Your profile is yours to share.</p>
          </div>
          <SignOutButton shared={shared} />
        </div>
        <AccountNav active="profile" />
        <div className="settings-layout">
          <section className="settings-panel">
            <h2>Your public profile</h2>
            <MemberProfileForm
              shared={shared}
              settingsUrl={settingsUrl}
              profile={{
                handle: profile.handle,
                bio: profile.bio,
                website: profile.website,
                is_public: profile.is_public,
              }}
            />
          </section>
          <aside className="profile-summary">
            <div className="member-avatar">
              {session.user.image ? <img src={session.user.image} alt="" width={76} height={76} referrerPolicy="no-referrer" /> : <UserRound size={38} />}
            </div>
            <span className="overline">MODLOCK MEMBER</span>
            <h2>{session.user.name}</h2>
            <p>@{profile.handle}</p>
            <span className="small-status">
              {profile.is_public ? "Public profile" : "Private profile"}
            </span>
            <p className="field-help">
              A Modlock account is separate from a GameBanana creator account.
              Matching names do not verify authorship.
            </p>
            {profile.is_public && (
              <Link className="text-link" href={`/members/${profile.handle}`}>
                View public profile <ArrowUpRight size={15} />
              </Link>
            )}
            <Link className="text-link" href="/account/security">
              Edit display name and security →
            </Link>
            {role && (
              <Link className="text-link" href="/moderation">
                Open moderation queue →
              </Link>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
