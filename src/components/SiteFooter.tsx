import Image from "next/image";
import Link from "next/link";

const PRODUCT = [
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/demo/", label: "Interactive demo" },
  { href: "/download", label: "Download" },
  { href: "/setup", label: "Setup" },
];

const RESOURCES = [
  { href: "/docs", label: "Docs" },
  { href: "/faq", label: "FAQ" },
  { href: "/network", label: "Network" },
];

const ACCOUNT = [
  { href: "/signin", label: "Sign in" },
  { href: "/network", label: "Reserve a username" },
  { href: "/account", label: "Account" },
];

const LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms of use" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-brand-link">
              <Image
                className="footer-mark"
                src="/brand/logo-mark.png"
                alt=""
                width={36}
                height={36}
              />
              <span>NEXUS OS</span>
            </Link>
            <p>
              Offline AI on a USB stick, Raspberry Pi, or ESP32 Pocket — for old
              PCs, cyberdecks, and tiny boards.
            </p>
          </div>

          <nav className="footer-col" aria-label="Product">
            <h3>Product</h3>
            <ul>
              {PRODUCT.map((link) => (
                <li key={link.href + link.label}>
                  {link.href.includes("/demo") ? (
                    <a href={link.href}>{link.label}</a>
                  ) : (
                    <Link href={link.href}>{link.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer-col" aria-label="Resources">
            <h3>Resources</h3>
            <ul>
              {RESOURCES.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer-col" aria-label="Account">
            <h3>Account</h3>
            <ul>
              {ACCOUNT.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer-col" aria-label="Legal">
            <h3>Legal</h3>
            <ul>
              {LEGAL.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer-bottom">
          <p className="disclaimer">
            NEXUS OS boots from a USB stick (PC) or microSD card (Raspberry Pi),
            or runs as NEXUS Pocket on ESP32-S3 over USB Serial. AI Chat and the
            other apps run on that device with no cloud required. Online Network
            chat is optional and not live yet — signing up here only reserves a
            future username.
          </p>
          <p className="disclaimer">
            Not affiliated with unrelated products or companies that use the name
            “Nexus.” This site is the product home for the NEXUS OS project.
          </p>
          <p className="footer-copy">
            © {new Date().getFullYear()} NEXUS OS ·{" "}
            <Link href="/privacy">Privacy</Link>
            {" · "}
            <Link href="/terms">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
