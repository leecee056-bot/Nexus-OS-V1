"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/demo/", label: "Tour" },
  { href: "/download", label: "Download" },
  { href: "/tri-cass-ai", label: "Tri Cass AI" },
  { href: "/setup", label: "Setup" },
  { href: "/compat", label: "Compat" },
  { href: "/docs", label: "Docs" },
  { href: "/faq", label: "FAQ" },
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
          {/* Plain <img>: hosted /_next/image uses Content-Disposition:attachment */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="brand-mark"
            src="/brand/logo-mark.png?v=20261124c"
            alt=""
            width={40}
            height={40}
          />
          <span>Tri Cass OS</span>
        </Link>
        <nav
          id="primary-nav"
          className={`nav-links${open ? " is-open" : ""}`}
          aria-label="Primary"
        >
          {LINKS.map((link) =>
            link.href.endsWith("/demo/") || link.href.startsWith("/demo") ? (
              <a
                key={link.href}
                href={link.href}
                aria-current={pathname.startsWith("/demo") ? "page" : undefined}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ),
          )}
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
