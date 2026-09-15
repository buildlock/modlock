import Link from "next/link";
import { Header, Footer } from "@/components/shell";
import { FileInspector } from "@/components/file-inspector";
export const metadata = { title: "KeyValues inspector" };
export default function KeyValuesPage() {
  return (
    <>
      <Header active="tools" />
      <main id="main" className="page-wrap utility-page">
        <Link className="text-link" href="/tools">
          ← All tools
        </Link>
        <h1>Read between the keys.</h1>
        <p className="utility-lead">
          Inspect a supported subset of Valve KeyValues text. Your source stays
          local and unchanged.
        </p>
        <FileInspector mode="keyvalues" />
      </main>
      <Footer />
    </>
  );
}
