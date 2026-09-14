import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { Header, Footer } from "@/components/shell";
import { Gallery } from "@/components/gallery";
export const dynamic = "force-dynamic";
async function findMod(key: string) {
  if (!/^(mod|sound)-[1-9]\d{0,9}$/.test(key)) return undefined;
  return (await getCatalog())?.mods.find((mod) => mod.key === key);
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const mod = await findMod((await params).key);
  return {
    title: mod?.title ?? "Mod not found",
    description: mod?.description || "A community creation for Deadlock.",
  };
}
export default async function ModPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const mod = await findMod((await params).key);
  if (!mod) notFound();
  return (
    <>
      <Header />
      <main id="main" className="page-wrap">
        <div className="breadcrumbs">
          <Link href="/#catalog">Browse mods</Link>
          <ChevronRight size={12} />
          <span>{mod.category}</span>
          <ChevronRight size={12} />
          <span>{mod.categoryName}</span>
        </div>
        <div className="detail-title">
          <div>
            <span className="overline">
              DEADLOCK / {mod.category.toUpperCase()}
            </span>
            <h1>{mod.title}</h1>
            <p>
              Submitted by{" "}
              <a
                href={mod.submitter.url!}
                target="_blank"
                rel="noopener noreferrer"
              >
                {mod.submitter.name} <ArrowUpRight size={11} />
              </a>{" "}
              · Hosted by GameBanana
            </p>
          </div>
        </div>
        <div className="detail-layout">
          <div>
            <Gallery images={mod.images} title={mod.title} />
            <section className="detail-copy">
              <h2>About this mod</h2>
              {mod.description && (
                <p className="description-lead">{mod.description}</p>
              )}
              <p>
                {mod.body ||
                  "Read the original GameBanana submission for the author’s description and instructions."}
              </p>
            </section>
            {mod.credits.length > 0 && (
              <section className="detail-copy">
                <h2>The people behind it</h2>
                <ul className="credits-list">
                  {mod.credits.map((credit, i) => (
                    <li key={i}>
                      {credit.url ? (
                        <a
                          href={credit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {credit.name} <ArrowUpRight size={12} />
                        </a>
                      ) : (
                        <strong>{credit.name}</strong>
                      )}
                      <span>{credit.role || credit.group}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
          <aside className="detail-sidebar">
            <div className="source-panel">
              <span className="overline">ORIGINAL SOURCE</span>
              <h2>Get it on GameBanana.</h2>
              <p>
                See the latest files, installation instructions, and updates
                from the author.
              </p>
              <a
                className="button primary-button"
                href={mod.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GameBanana <ArrowUpRight size={17} />
              </a>
              <p>
                Downloads stay with the original creator. Modlock’s desktop
                installer is planned.
              </p>
              <dl>
                <dt>Downloads</dt>
                <dd>{mod.downloads?.toLocaleString() ?? "Not reported"}</dd>
                <dt>Likes</dt>
                <dd>{mod.likes?.toLocaleString() ?? "Not reported"}</dd>
                <dt>Files at source</dt>
                <dd>{mod.fileCount}</dd>
                <dt>Version</dt>
                <dd>{mod.version || "Not specified"}</dd>
                <dt>Last checked</dt>
                <dd>
                  {new Date(mod.checkedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </dd>
              </dl>
              <p className="compatibility-note">
                No content warnings were reported by the source at import.
                Current game compatibility and file safety have not been
                verified by Modlock.
              </p>
            </div>
            <section className="license-section">
              <h3>Creator permissions</h3>
              {(["yes", "ask", "no"] as const).map(
                (state) =>
                  mod.permissions[state].length > 0 && (
                    <div key={state}>
                      <strong>
                        {state === "yes"
                          ? "Allowed by the author"
                          : state === "ask"
                            ? "Ask the author first"
                            : "Not permitted"}
                      </strong>
                      <ul>
                        {mod.permissions[state].map((permission, i) => (
                          <li key={i}>{permission}</li>
                        ))}
                      </ul>
                    </div>
                  ),
              )}
              {mod.license && <p>{mod.license}</p>}
              <a
                className="text-link"
                href={mod.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Check current terms at the source <ArrowUpRight size={13} />
              </a>
            </section>
          </aside>
        </div>
        <div className="detail-bottom">
          <Link className="text-link" href="/#catalog">
            <ArrowLeft size={16} /> Back to all mods
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
