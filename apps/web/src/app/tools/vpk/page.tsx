import Link from "next/link";
import { Header, Footer } from "@/components/shell";
import { FileInspector } from "@/components/file-inspector";
export const metadata = { title: "VPK inspector" };
export default function VpkPage() {
  return (
    <>
      <Header active="tools" />
      <main id="main" className="page-wrap utility-page">
        <Link className="text-link" href="/tools">
          ← All tools
        </Link>
        <h1>Look inside the package.</h1>
        <p className="utility-lead">
          Read directory metadata from a VPK v1 or v2 file without unpacking its
          contents.
        </p>
        <FileInspector mode="vpk" />
      </main>
      <Footer />
    </>
  );
}
