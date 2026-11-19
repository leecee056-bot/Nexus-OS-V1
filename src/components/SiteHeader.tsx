"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="shell nav">
        <Link href="/" className="brand">
          NEXUS OS
        </Link>
        <nav
          id="primary-nav"
          className={`nav-links${open ? " is-open" : ""}`}
          aria-label="Primary"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-toolbar">
          <ThemeToggle />
          <button
            type="button"
            className="nav-menu-btn"
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>
  );
}
