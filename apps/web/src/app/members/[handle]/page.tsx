import { notFound } from "next/navigation";
import { UserRound, ArrowUpRight } from "lucide-react";
import { Header, Footer } from "@/components/shell";
import { publicMember } from "@/server/community";
import { readAccountConfig } from "@/server/config";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  if (!readAccountConfig().enabled) notFound();
  const member = await publicMember((await params).handle);
  if (!member) notFound();
  return (
    <>
      <Header />
      <main id="main" className="page-wrap public-profile">
        <div className="member-avatar">
          <UserRound size={42} />
        </div>
        <span className="overline">MODLOCK MEMBER</span>
        <h1>{member.name}</h1>
        <p className="profile-handle">@{member.handle}</p>
        <p className="profile-bio">
          {member.bio || "This member hasn’t added a bio yet."}
        </p>
        {member.website && (
          <a
            href={member.website}
            className="text-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit website <ArrowUpRight size={15} />
          </a>
        )}
        <p className="field-help">
          Member profile. This does not verify ownership of any GameBanana
          submission.
        </p>
      </main>
      <Footer />
    </>
  );
}
