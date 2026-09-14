import type { Metadata } from "next";
import Link from "next/link";
import { Flag } from "lucide-react";
import { Header, Footer } from "@/components/shell";
import { AccountNav } from "@/components/account-nav";
import { requirePageSession } from "@/server/session";
import { reportsForMember, reportReasons } from "@/server/community";
import { getCatalog } from "@/lib/catalog";
export const metadata: Metadata = { title: "Your reports" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const session = await requirePageSession("/account/reports"),
    [reports, catalog] = await Promise.all([
      reportsForMember(session.user.id),
      getCatalog(),
    ]);
  const names = new Map(catalog?.mods.map((m) => [m.key, m.title]));
  return (
    <>
      <Header />
      <main id="main" className="page-wrap member-page">
        <div className="member-heading">
          <div>
            <span className="overline">A LITTLE COMMUNITY CARE</span>
            <h1>Your reports.</h1>
            <p>Private reports and responses from the review queue.</p>
          </div>
        </div>
        <AccountNav active="reports" />
        <p className="panel-copy">Showing your most recent 100 reports. Download your full history from account security.</p>
        {reports.length ? (
          <div className="report-list">
            {reports.map((report) => (
              <article key={report.id} className="settings-panel">
                <div className="report-heading">
                  <span className="overline">
                    {reportReasons[report.reason]}
                  </span>
                  <span className="small-status">{report.status}</span>
                </div>
                <h2>
                  {names.has(report.mod_key) ? (
                    <Link href={`/mods/${report.mod_key}`}>
                      {names.get(report.mod_key)}
                    </Link>
                  ) : (
                    report.mod_key
                  )}
                </h2>
                <p className="report-detail">{report.detail}</p>
                {report.response && (
                  <div className="review-response">
                    <strong>Response</strong>
                    <p>{report.response}</p>
                  </div>
                )}
                <p className="field-help">
                  {new Date(report.created_at).toLocaleDateString("en-US", {
                    timeZone: "UTC",
                  })}{" "}
                  · Reference {report.id}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Flag size={32} />
            <h2>Nothing to report.</h2>
            <p>
              If a listing needs attention, use “Report a concern” on its detail
              page.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
