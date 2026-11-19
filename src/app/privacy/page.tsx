import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How the NEXUS OS website handles account data, and how the offline OS keeps your chats on your device.",
};

export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="shell legal">
        <h2>Privacy</h2>
        <p className="lede">
          Plain-language notes for this website and for NEXUS OS itself. Last
          updated: 19 November 2026.
        </p>

        <h3 className="subhead">The offline OS</h3>
        <p>
          When you run NEXUS OS from a USB stick or microSD card, AI Chat, notes,
          and related tools run on that machine. They are designed to work
          offline. This website does not receive your chat messages or files from
          the stick or card.
        </p>

        <h3 className="subhead">This website</h3>
        <p>
          You can browse Download, Setup, Docs, and most pages without creating
          an account. If you optionally sign up to reserve a future Network
          username, we store the username, email address, and a hashed password
          in the site database, plus a session cookie so you can stay signed in.
        </p>
        <ul className="feature-list">
          <li>
            <strong>What we use that for</strong>
            <span>
              Holding your reserved username for a future community, and letting
              you manage that account on this site. Chat rooms are not live yet.
            </span>
          </li>
          <li>
            <strong>Email</strong>
            <span>
              Email is for contact / account recovery once that is built. Addresses
              are not verified yet — please use an address you control.
            </span>
          </li>
          <li>
            <strong>What we do not sell</strong>
            <span>
              We do not sell your account information. There is no advertising
              tracker baked into these pages for that purpose.
            </span>
          </li>
        </ul>

        <h3 className="subhead">Hosting and logs</h3>
        <p>
          The site is hosted on Cursor’s app platform. Like most hosted sites,
          infrastructure may keep standard request logs (for example IP address,
          time, and URL) for reliability and abuse prevention.
        </p>

        <h3 className="subhead">Cookies</h3>
        <p>
          If you sign in, we set a session cookie so the site knows who you are.
          Theme preference may also be stored in your browser. We do not use that
          for advertising.
        </p>

        <h3 className="subhead">Children</h3>
        <p>
          This site and the optional Network signup are not directed at children
          under 13. Do not create an account for a child under 13.
        </p>

        <h3 className="subhead">Contact</h3>
        <p>
          Questions about this notice can go through the project channels linked
          from the site (for example GitHub for the open project). For account
          deletion on the published site, sign in and use account controls when
          available, or contact the project maintainers with your username.
        </p>

        <p className="legal-note">
          Related: <Link href="/terms">Terms of use</Link> ·{" "}
          <Link href="/faq">FAQ</Link> · <Link href="/network">Network</Link>
        </p>
      </div>
    </section>
  );
}
