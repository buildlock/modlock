import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, ArrowUpRight } from "lucide-react";
import { Header, Footer } from "@/components/shell";
import { AccountNav } from "@/components/account-nav";
import { SaveModButton } from "@/components/save-mod";
import { PrivateNote } from "@/components/private-note";
import { ModImage } from "@/components/mod-image";
import { requirePageSession } from "@/server/session";
import { savedMods } from "@/server/community";
import { getCatalog } from "@/lib/catalog";
export const metadata: Metadata = { title: "Saved mods" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const session = await requirePageSession("/library"),
    [saved, catalog] = await Promise.all([
      savedMods(session.user.id),
      getCatalog(),
    ]);
  const byKey = new Map(catalog?.mods.map((mod) => [mod.key, mod]));
  return (
    <>
      <Header />
      <main id="main" className="page-wrap member-page">
        <div className="member-heading">
          <div>
            <span className="overline">THE ONES YOU WANT TO KEEP</span>
            <h1>Your next favorites.</h1>
            <p>
              {saved.length} saved {saved.length === 1 ? "mod" : "mods"}. Your
              library and notes are private.
            </p>
          </div>
          <Link className="button subtle-button" href="/#catalog">
            Find more mods <ArrowUpRight size={16} />
          </Link>
        </div>
        <AccountNav active="library" />
        {saved.length ? (
          <div className="saved-library">
            {saved.map((item) => {
              const mod = byKey.get(item.mod_key),
                updated =
                  !!mod?.modifiedAt &&
                  !!item.seen_modified_at &&
                  new Date(mod.modifiedAt) > new Date(item.seen_modified_at);
              return (
                <article key={item.mod_key} className="saved-entry">
                  <div className="saved-image">
                    <ModImage
                      src={mod?.images[0]?.thumbnail}
                      alt={mod?.title || "Unavailable mod"}
                    />
                  </div>
                  <div className="saved-main">
                    <span className="overline">
                      {mod?.category || "UNAVAILABLE LISTING"}
                    </span>
                    <h2>
                      {mod ? (
                        <Link href={`/mods/${mod.key}`}>{mod.title}</Link>
                      ) : (
                        item.mod_key
                      )}
                    </h2>
                    <p>
                      {mod
                        ? `Submitted by ${mod.submitter.name}`
                        : "This listing is no longer available in the current catalog."}
                    </p>
                    {updated && (
                      <span className="small-status">
                        Updated since you saved it
                      </span>
                    )}
                    <PrivateNote modKey={item.mod_key} note={item.note} />
                  </div>
                  <SaveModButton modKey={item.mod_key} signedIn initialSaved />
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Bookmark size={34} />
            <h2>Good finds belong here.</h2>
            <p>
              Save a mod while browsing and it will be waiting here next time.
            </p>
            <Link className="button primary-button" href="/#catalog">
              Explore the mods →
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
