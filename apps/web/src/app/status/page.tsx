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
          The current catalogue of public Deadlock Mod and Sound submissions
          from GameBanana.
        </p>
        {catalog ? (
          <>
            <dl className="status-grid">
              {[
                ["Published listings", catalog.mods.length],
                ["Source entries indexed", catalog.discovered],
                ["Profiles due for a check", catalog.pending],
                ["Excluded at import", catalog.excluded],
                ["Older profiles retained", catalog.retained ?? 0],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value.toLocaleString()}</dd>
                </div>
              ))}
            </dl>
            <p className="status-detail">
              Last complete source-index refresh:{" "}
              {new Date(catalog.syncedAt).toLocaleString("en-US", {
                timeZone: "UTC",
              })}{" "}
              UTC.
              <br />
              {catalog.pages} index pages traversed. Profile checks unavailable
              in this run: {catalog.errors}.
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
              An incomplete source index leaves the last catalogue in place.
              Profile checks run in bounded batches. A listing with an
              unchanged, still-public source entry may retain its last checked
              profile for up to seven days; its detail page keeps the original
              check date. Changed, restricted or omitted entries are withheld
              until eligible. Failed checks stay queued for a later run.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
