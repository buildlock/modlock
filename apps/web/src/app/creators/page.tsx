import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Header, Footer } from "@/components/shell";
import { getCatalog } from "@/lib/catalog";
import { creatorDirectory } from "@/lib/creators";
export const metadata: Metadata = { title: "Community creators" };
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const creators = creatorDirectory((await getCatalog())?.mods ?? []);
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.trim().slice(0, 120) : "";
  const filtered = creators.filter((creator) =>
    creator.name.toLowerCase().includes(q.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 48));
  const page = Math.min(
    pages,
    typeof query.page === "string" && /^[1-9]\d{0,4}$/.test(query.page)
      ? Number(query.page)
      : 1,
  );
  const pageLink = (value: number) =>
    `/creators?${new URLSearchParams({ ...(q ? { q } : {}), page: String(value) })}`;
  return (
    <>
      <Header active="creators" />
      <main id="main" className="page-wrap utility-page">
        <span className="overline">THE PEOPLE WHO MAKE IT POSSIBLE</span>
        <h1>Made by the community.</h1>
        <p className="utility-lead">
          Meet the creators behind the mods in this catalog. Every page leads
          back to their original GameBanana profile.
        </p>
        <p className="creator-provenance">
          {creators.length} source creators represented in this import. These
          are GameBanana profiles, separate from Modlock member accounts.
        </p>
        <form action="/creators" className="account-form creator-search">
          <label htmlFor="creator-query">Search creators</label>
          <div className="button-row">
            <input
              id="creator-query"
              name="q"
              defaultValue={q}
              maxLength={120}
              placeholder="A name you know…"
            />
            <button className="button subtle-button">Find creators</button>
          </div>
        </form>
        <p className="field-help">
          {filtered.length} {filtered.length === 1 ? "creator" : "creators"}
          {q ? ` matching “${q}”` : ""} · Page {page} of {pages}
        </p>
        {filtered.length ? (
          <div className="creator-directory">
            {filtered.slice((page - 1) * 48, page * 48).map((creator) => (
              <Link
                key={creator.id}
                className="creator-card"
                href={`/creators/gamebanana-${creator.id}`}
              >
                <div className="creator-initial" aria-hidden="true">
                  {creator.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2>{creator.name}</h2>
                  <p>
                    {creator.count} {creator.count === 1 ? "mod" : "mods"} in
                    this catalog
                  </p>
                </div>
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        ) : (
          <p>
            {creators.length
              ? "No creators match that search."
              : "Creator pages will appear after the first catalog import."}
          </p>
        )}
        <nav className="button-row" aria-label="Creator pages">
          {page > 1 && (
            <Link className="button subtle-button" href={pageLink(page - 1)}>
              Previous page
            </Link>
          )}
          {page < pages && (
            <Link className="button subtle-button" href={pageLink(page + 1)}>
              Next page
            </Link>
          )}
        </nav>
      </main>
      <Footer />
    </>
  );
}
