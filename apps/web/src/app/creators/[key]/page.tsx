import { notFound } from "next/navigation";
import { ArrowUpRight, UserRound } from "lucide-react";
import { Header, Footer } from "@/components/shell";
import { CatalogBrowser } from "@/components/catalog";
import { getCatalog } from "@/lib/catalog";
import { creatorDirectory, sourceCreatorId } from "@/lib/creators";
import { currentSession } from "@/server/session";
import { savedMods } from "@/server/community";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  if (!/^gamebanana-[1-9]\d*$/.test(key)) notFound();
  const id = key.slice("gamebanana-".length),
    catalog = await getCatalog(),
    creator = creatorDirectory(catalog?.mods ?? []).find((c) => c.id === id);
  if (!creator) notFound();
  const mods = (catalog?.mods ?? []).filter(
      (m) => sourceCreatorId(m.submitter.url) === id,
    ),
    session = await currentSession(),
    saved = session?.user.emailVerified
      ? (await savedMods(session.user.id)).map((s) => s.mod_key)
      : [];
  return (
    <>
      <Header active="creators" />
      <main id="main" className="page-wrap">
        <div className="creator-heading">
          <div className="member-avatar">
            <UserRound size={35} />
          </div>
          <div>
            <span className="overline">GAMEBANANA CREATOR</span>
            <h1>{creator.name}</h1>
            <p>
              {creator.count}{" "}
              {creator.count === 1 ? "submission" : "submissions"} in the
              current Modlock catalog
            </p>
          </div>
        </div>
        <div className="creator-provenance">
          <p>
            Attribution comes from the original GameBanana submissions. This
            profile is not a claimed or verified Modlock account.
          </p>
          <a
            className="text-link"
            href={creator.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit the original creator <ArrowUpRight size={15} />
          </a>
        </div>
        <CatalogBrowser
          mods={mods.map(
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
          savedKeys={saved}
          signedIn={!!session?.user.emailVerified}
        />
      </main>
      <Footer />
    </>
  );
}
