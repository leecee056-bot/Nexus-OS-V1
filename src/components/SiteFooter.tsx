import Link from "next/link";

const PRODUCT = [
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/demo/", label: "Visual tour" },
  { href: "/download", label: "Download" },
  { href: "/setup", label: "Setup" },
];

const RESOURCES = [
  { href: "/docs", label: "Docs" },
  { href: "/compat", label: "Hardware compat" },
  { href: "/knowledge-packs", label: "Knowledge packs" },
  { href: "/download#companion", label: "Companion app" },
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="footer-mark"
                src="/brand/logo-mark.png"
                alt=""
                width={36}
                height={36}
              />
              <span>Tri Cass OS</span>
            </Link>
            <p>
              Offline AI hub, Tri-Cass Desk, Companion apps, Pocket &amp;
              Cardputer — local-first for PCs, Pi, cyberdecks, and tiny boards.
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
            Tri-Cass OS boots from a USB stick (PC) or microSD card (Raspberry Pi),
            or runs as Tri-Cass Pocket on ESP32-S3 over USB Serial. AI Chat and the
            other apps run on that device with no cloud required. Online Network
            chat is optional and not live yet — signing up here only reserves a
            future username.
          </p>
          <p className="disclaimer">
            Not affiliated with unrelated products or companies that use the name
            This site is the product home for the Tri-Cass OS project.
          </p>
          <p className="footer-copy">
            © {new Date().getFullYear()} Tri-Cass OS ·{" "}
            <Link href="/privacy">Privacy</Link>
            {" · "}
            <Link href="/terms">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
