import Link from "next/link";
import { Header, Footer } from "@/components/shell";
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="page-wrap about-page">
        <h1>That mod isn’t in this catalog.</h1>
        <p>
          It may not have been imported yet, or its source availability may have
          changed.
        </p>
        <Link className="button primary-button" href="/#catalog">
          Browse available mods
        </Link>
      </main>
      <Footer />
    </>
  );
}
