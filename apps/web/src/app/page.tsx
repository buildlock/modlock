import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Banana,
  CornerDownRight,
} from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { Header, Footer, EmptyCatalog } from "@/components/shell";
import { CatalogBrowser } from "@/components/catalog";
import { ModImage } from "@/components/mod-image";
import { currentSession } from "@/server/session";
import { savedMods } from "@/server/community";
export const dynamic = "force-dynamic";
export default async function Home() {
  const catalog = await getCatalog();
  const session = await currentSession();
  const savedKeys = session?.user.emailVerified
    ? (await savedMods(session.user.id)).map((m) => m.mod_key)
    : [];
  const featured = catalog?.mods
    .filter((mod) => mod.images.length && mod.category === "Skins")
    .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))[0];
  const second = catalog?.mods.find(
    (mod) => mod.images.length && mod.category === "Models",
  );
  const age = catalog ? Date.now() - Date.parse(catalog.syncedAt) : 0;
  return (
    <>
      <Header active="discover" />
      <main id="main" className="page-wrap">
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span /> THE DEADLOCK MODDING COMMUNITY
            </div>
            <h1>
              MAKE DEADLOCK
              <br />
              <span>YOUR OWN.</span>
            </h1>
            <p>
              A different look. A familiar sound. A little more you.
              <br className="desktop-break" /> Discover what the community is
              making.
            </p>
            <a className="button primary-button" href="#catalog">
              Explore the mods <ArrowDown size={17} />
            </a>
            <div className="hero-source">
              <Banana size={17} />
              <span>
                Powered by the creators on{" "}
                <a
                  href="https://gamebanana.com/games/20948"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GameBanana <ArrowUpRight size={12} />
                </a>
              </span>
            </div>
          </div>
          <div className="hero-stage">
            {featured ? (
              <Link href={`/mods/${featured.key}`} className="feature-art">
                <ModImage
                  src={featured.images[0].url}
                  alt={featured.title}
                  priority
                  sizes="(max-width: 800px) 100vw, 48vw"
                />
                <div className="feature-shade" />
                <div className="feature-topline">
                  <span>COMMUNITY SPOTLIGHT</span>
                  <ArrowUpRight size={20} />
                </div>
                <div className="feature-caption">
                  <span>
                    {featured.categoryName.toUpperCase()} /{" "}
                    {featured.category.toUpperCase()}
                  </span>
                  <h2>{featured.title}</h2>
                  <p>Submitted by {featured.submitter.name}</p>
                </div>
              </Link>
            ) : (
              <div className="hero-stamp">
                <span>
                  MADE TO
                  <br />
                  BE MODDED.
                </span>
                <CornerDownRight size={65} />
              </div>
            )}
            {second && (
              <Link className="feature-ticket" href={`/mods/${second.key}`}>
                <div className="ticket-image">
                  <ModImage
                    src={second.images[0].thumbnail}
                    alt={second.title}
                  />
                </div>
                <div>
                  <span>A LITTLE LESS ORDINARY</span>
                  <strong>{second.title}</strong>
                  <small>Explore model replacements</small>
                </div>
                <ArrowRight size={19} />
              </Link>
            )}
          </div>
        </section>
        <div className="catalog-status">
          <span>
            <i className={age > 86400_000 ? "status-stale" : ""} />
            {catalog
              ? `${catalog.mods.length.toLocaleString()} listings in the catalog`
              : "Catalog awaiting its first import"}
          </span>
          <p>
            {catalog
              ? `${catalog.discovered.toLocaleString()} source entries indexed · ${catalog.pending.toLocaleString()} awaiting profile checks`
              : "Original files and downloads stay with their creators."}
          </p>
          <span>
            {catalog
              ? `${age > 86400_000 ? "Snapshot dated" : "Refreshed"} ${new Date(catalog.syncedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })} · UTC`
              : ""}
          </span>
        </div>
        {catalog ? (
          <CatalogBrowser
            savedKeys={savedKeys}
            signedIn={!!session?.user.emailVerified}
            mods={catalog.mods.map(
              ({
                key,
                title,
                description,
                category,
                categoryName,
                hero,
                model,
                modifiedAt,
                downloads,
                likes,
                images,
                submitter,
              }) => ({
                key,
                title,
                description,
                category,
                categoryName,
                hero,
                model,
                modifiedAt,
                downloads,
                likes,
                images: images.slice(0, 1),
                submitter: { name: submitter.name, url: submitter.url },
              }),
            )}
          />
        ) : (
          <EmptyCatalog />
        )}
        <section className="creator-banner">
          <div>
            <span className="overline">BUILT ON THE COMMUNITY</span>
            <h2>Good mods deserve to be found.</h2>
            <p>
              Every listing takes you back to its source, with the people behind
              it credited.
            </p>
          </div>
          <a
            className="text-link"
            href="https://gamebanana.com/games/20948"
            target="_blank"
            rel="noopener noreferrer"
          >
            Meet the creators on GameBanana <ArrowUpRight size={18} />
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
