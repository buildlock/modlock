import type { Metadata } from "next";
import { Header, Footer } from "@/components/shell";
import { getCatalog } from "@/lib/catalog";
export const metadata: Metadata = { title: "Catalog status" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const catalog = await getCatalog();
  return (
    <>
      <Header />
      <main id="main" className="page-wrap utility-page">
        <span className="overline">WHAT’S IN THE CATALOG</span>
        <h1>A clear view of the source.</h1>
        <p className="utility-lead">
          The current local import of public Deadlock Mod and Sound submissions
          from GameBanana.
        </p>
        {catalog ? (
          <>
            <dl className="status-grid">
              {[
                ["Published listings", catalog.mods.length],
                ["Source entries indexed", catalog.discovered],
                ["Awaiting profile checks", catalog.pending],
                ["Excluded at import", catalog.excluded],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value.toLocaleString()}</dd>
                </div>
              ))}
            </dl>
            <p className="status-detail">
              Last successful import:{" "}
              {new Date(catalog.syncedAt).toLocaleString("en-US", {
                timeZone: "UTC",
              })}{" "}
              UTC.
              <br />
              {catalog.pages} index pages traversed. Profile errors at
              publication: {catalog.errors}.
            </p>
          </>
        ) : (
          <p>No successful catalog import is available yet.</p>
        )}
        <div className="help-sections">
          <section>
            <h2>What these numbers mean</h2>
            <p>
              A source entry is an indexed submission. A published listing has
              also passed the importer’s public-profile checks. Restricted,
              obsolete, rated, or otherwise ineligible records are excluded. A
              source index changes during traversal, so these figures are a
              dated pass rather than an immutable snapshot.
            </p>
            <p>
              Local moderation can hide a listing from the website without
              changing the original source or the importer’s recorded totals.
              Saved references to unavailable listings remain private in their
              owner’s library.
            </p>
          </section>
          <section>
            <h2>When the source is unavailable</h2>
            <p>
              The importer preserves the last successful catalog if a request or
              profile check fails, or if an index walk is incomplete. The
              website shows that catalog’s refresh time. New imports currently
              run manually; there is no deployed scheduler.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
