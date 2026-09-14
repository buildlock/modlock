import Link from "next/link";
import { Header, Footer } from "@/components/shell";
import { CrosshairEditor } from "@/components/crosshair-editor";
import { currentSession } from "@/server/session";
import { savedCrosshairs } from "@/server/crosshairs";
export const metadata = { title: "Crosshair studio" };
export default async function CrosshairPage() {
  const session = await currentSession(),
    saved = session ? await savedCrosshairs(session.user.id) : [];
  return (
    <>
      <Header active="tools" />
      <main id="main" className="page-wrap utility-page">
        <Link className="text-link" href="/tools">
          ← All tools
        </Link>
        <h1>Find your focus.</h1>
        <p className="utility-lead">
          Build a crosshair design, save variations, and share your settings.
        </p>
        <CrosshairEditor
          signedIn={!!session}
          saved={saved.map(({ id, name, document }) => ({
            id,
            name,
            document,
          }))}
        />
      </main>
      <Footer />
    </>
  );
}
