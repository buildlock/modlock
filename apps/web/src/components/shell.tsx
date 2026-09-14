import Link from "next/link";
import { ArrowUpRight, Banana, Box, ChevronRight } from "lucide-react";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Modlock home">
      <svg viewBox="0 0 40 36" aria-hidden="true">
        <path
          d="M2 29V6h8l10 12L30 6h8v23H27V19l-7 8-7-8v10z"
          fill="currentColor"
        />
      </svg>
      <span>MODLOCK</span>
    </Link>
  );
}
export function Header({
  active = "discover",
}: {
  active?: "discover" | "about";
}) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav aria-label="Main navigation">
          <Link
            href="/"
            className={active === "discover" ? "nav-active" : undefined}
            aria-current={active === "discover" ? "page" : undefined}
          >
            Discover
          </Link>
          <Link href="/#catalog">Browse mods</Link>
          <Link
            href="/about"
            className={active === "about" ? "nav-active" : undefined}
            aria-current={active === "about" ? "page" : undefined}
          >
            About Modlock
          </Link>
        </nav>
        <a
          className="source-nav"
          href="https://gamebanana.com/games/20948"
          target="_blank"
          rel="noopener noreferrer"
        >
          GameBanana <ArrowUpRight size={15} />
        </a>
        <span className="preview-label">WEBSITE PREVIEW</span>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Brand />
        <p>A new home for your Deadlock setup.</p>
      </div>
      <div className="footer-source">
        <Banana size={19} />
        <p>
          Made by the community. Hosted by GameBanana.
          <br />
          <span>Discover here. Support the original creators.</span>
        </p>
      </div>
      <Link href="/about">
        About this preview <ChevronRight size={16} />
      </Link>
    </footer>
  );
}
export function EmptyCatalog() {
  return (
    <div className="empty-state">
      <Box size={34} />
      <h2>The catalog is warming up.</h2>
      <p>
        GameBanana listings will appear here after the first import finishes.
      </p>
      <a className="button" href="https://gamebanana.com/games/20948">
        Explore GameBanana <ArrowUpRight size={17} />
      </a>
    </div>
  );
}
