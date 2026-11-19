"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/download", label: "Download" },
  { href: "/setup", label: "Setup" },
  { href: "/docs", label: "Docs" },
  { href: "/network", label: "Network" },
  { href: "/signin", label: "Sign in" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="shell nav">
        <Link href="/" className="brand">
          NEXUS OS
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
