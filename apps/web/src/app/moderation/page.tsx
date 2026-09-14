import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/shell";
import { ModerationForm } from "@/components/moderation-form";
import { requirePageSession } from "@/server/session";
import { moderationQueue, StaffAccessError } from "@/server/moderation";
import { reportReasons } from "@/server/community";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Moderation",
  robots: { index: false, follow: false },
};
export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requirePageSession("/moderation"),
    query = await searchParams;
  const page = /^[1-9]\d{0,3}$/.test(query.page ?? "") ? Number(query.page) : 1;
  let reports;
  try {
    reports = await moderationQueue(session.user.id, session.session.id, page);
  } catch (e) {
    if (e instanceof StaffAccessError) notFound();
    throw e;
  }
  return (
    <>
      <Header />
      <main id="main" className="page-wrap member-page">
        <div className="member-heading">
          <div>
            <span className="overline">LOCAL TRUST DESK</span>
            <h1>Review with care.</h1>
            <p>Private reports. Every decision leaves an audit record.</p>
          </div>
        </div>
        <p className="panel-copy">
          Decisions require a sign-in within the last five minutes. Reporters
          can read your response; their email stays out of this queue.
        </p>
        <div className="report-list">
          {reports.slice(0, 25).map((r) => (
            <section className="settings-panel" key={r.id}>
              <div className="report-heading">
                <Link className="text-link" href={`/mods/${r.mod_key}`}>
                  {r.mod_key}
                </Link>
                <span className="small-status">
                  {r.status} · {r.hidden ? "Hidden" : "Visible"}
                </span>
              </div>
              <h2>{reportReasons[r.reason]}</h2>
              <p className="report-detail">{r.detail}</p>
              <p className="field-help">
                Reference {r.id} · {r.created_at.toLocaleDateString("en-US")}
              </p>
              <ModerationForm
                id={r.id}
                updatedAt={r.updated_at.toISOString()}
                status={r.status}
                response={r.response}
              />
            </section>
          ))}
          {!reports.length && (
            <p className="panel-copy">No reports in the review queue.</p>
          )}
        </div>
        <div className="button-row">
          {page > 1 && (
            <Link href={`/moderation?page=${page - 1}`}>Previous page</Link>
          )}
          {reports.length > 25 && (
            <Link href={`/moderation?page=${page + 1}`}>Next page</Link>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
