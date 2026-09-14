import Link from "next/link";
import { Crosshair, FileCode2, PackageSearch } from "lucide-react";
import { Header, Footer } from "@/components/shell";
export const metadata = { title: "Tools" };
export default function ToolsPage() {
  return (
    <>
      <Header active="tools" />
      <main id="main" className="page-wrap utility-page">
        <span className="overline">THE WORKBENCH</span>
        <h1>A closer look.</h1>
        <p className="utility-lead">
          Shape a crosshair, understand a config, or look inside an archive.
          Start with what you can see.
        </p>
        <div className="utility-grid">
          {[
            {
              path: "crosshair",
              title: "Crosshair studio",
              copy: "Tune a design with a live preview. Save it to your account or share its settings.",
              icon: Crosshair,
            },
            {
              path: "keyvalues",
              title: "KeyValues inspector",
              copy: "Read Valve text configuration as ordered JSON. Preserve repeated keys and see syntax errors.",
              icon: FileCode2,
            },
            {
              path: "vpk",
              title: "VPK inspector",
              copy: "Explore an archive directory, inspect entry sizes, and spot suspicious or duplicate paths.",
              icon: PackageSearch,
            },
          ].map((t) => (
            <section className="utility-card" key={t.path}>
              <t.icon size={30} />
              <h2>{t.title}</h2>
              <p>{t.copy}</p>
              <Link className="text-link" href={`/tools/${t.path}`}>
                Open tool →
              </Link>
            </section>
          ))}
        </div>
        <p className="field-help">
          Inspection files stay in your browser. Crosshair previews do not
          change game files.
        </p>
      </main>
      <Footer />
    </>
  );
}
