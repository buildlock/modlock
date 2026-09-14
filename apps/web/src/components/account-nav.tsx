import Link from "next/link";
import { Bookmark, Flag, ShieldCheck, UserRound } from "lucide-react";
export function AccountNav({
  active,
}: {
  active: "profile" | "security" | "reports" | "library";
}) {
  return (
    <nav className="account-nav" aria-label="Your account">
      {[
        {
          key: "library",
          label: "Saved mods",
          href: "/library",
          icon: Bookmark,
        },
        { key: "profile", label: "Profile", href: "/account", icon: UserRound },
        {
          key: "security",
          label: "Security",
          href: "/account/security",
          icon: ShieldCheck,
        },
        {
          key: "reports",
          label: "Your reports",
          href: "/account/reports",
          icon: Flag,
        },
      ].map(({ key, label, href, icon: Icon }) => (
        <Link
          key={key}
          href={href}
          aria-current={active === key ? "page" : undefined}
        >
          <Icon size={17} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
