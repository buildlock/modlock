import Link from "next/link";
import {
  ArrowUpRight,
  Banana,
  Bookmark,
  Box,
  ChevronRight,
  UserRound,
} from "lucide-react";
import { currentSession } from "@/server/session";
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
export async function Header({
  active,
}: {
  active?: "discover" | "about" | "creators" | "tools";
}) {
  const session = await currentSession();
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
          <Link
            href="/creators"
            className={active === "creators" ? "nav-active" : undefined}
            aria-current={active === "creators" ? "page" : undefined}
          >
            Creators
          </Link>
          <Link
            href="/tools"
            className={active === "tools" ? "nav-active" : undefined}
            aria-current={active === "tools" ? "page" : undefined}
          >
            Tools
          </Link>
          <Link
            href="/about"
            className={active === "about" ? "nav-active" : undefined}
            aria-current={active === "about" ? "page" : undefined}
          >
            About Modlock
          </Link>
        </nav>
        <div className="header-account">
          {session?.user.verified && (
            <Link
              href="/library"
              className="header-library"
              aria-label="Your saved mods"
            >
              <Bookmark size={18} />
              <span>Saved mods</span>
            </Link>
          )}
          <Link
            href={session?.user.verified ? "/account" : "/sign-in"}
            className="account-link"
          >
            <UserRound size={17} />
            <span>
              {session?.user.verified ? session.user.name : "Sign in"}
            </span>
          </Link>
        </div>
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
      <nav className="footer-links" aria-label="More about Modlock">
        <Link href="/help">Help</Link>
        <Link href="/status">Catalog status</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/about">
          About <ChevronRight size={14} />
        </Link>
      </nav>
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
