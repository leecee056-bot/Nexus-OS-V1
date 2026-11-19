import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Features" };

export default function FeaturesPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>What&apos;s on the stick</h2>
        <p className="lede">
          Plain list of what works today on the USB system. For “what is a
          Vault?” and similar words, see <Link href="/about">About</Link>.
        </p>

        <figure className="shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/nexus-os-hub-screen.jpg"
            alt="NEXUS OS hub menu on a computer screen"
          />
          <figcaption>Main menu after booting from USB.</figcaption>
        </figure>

        <ul className="feature-list">
          <li>
            <strong>Boots from USB on low-spec PCs</strong>
            <span>
              32-bit and 64-bit Intel/AMD images. Aimed at older spare machines
              as well as newer ones. Raspberry Pi images are not in this release.
            </span>
          </li>
          <li>
            <strong>Local AI Chat</strong>
            <span>
              Talk to an AI that runs on the PC itself. A small starter model is
              included so Chat works offline out of the box.
            </span>
          </li>
          <li>
            <strong>Main menu (hub)</strong>
            <span>
              Full-screen keyboard menu. Themes: Matrix green or plain
              high-contrast. One app open at a time.
            </span>
          </li>
          <li>
            <strong>Files</strong>
            <span>
              Browse folders on the stick — documents, images, and extra AI
              models you add later.
            </span>
          </li>
          <li>
            <strong>Knowledge Vault</strong>
            <span>
              Your searchable notes: import text/markdown, search, optionally use
              them in Chat.
            </span>
          </li>
          <li>
            <strong>Agents &amp; tools</strong>
            <span>
              Small helpers with a fixed allow-list (calculator, vault, files,
              notes, system info, models, pixel art) — not open access to
              everything on the PC.
            </span>
          </li>
          <li>
            <strong>Games</strong>
            <span>Simple built-ins (Snake, Minesweeper) that unload when you leave.</span>
          </li>
          <li>
            <strong>Pixel art lab</strong>
            <span>Optional tiny pixel-style toys — not a cloud image generator.</span>
          </li>
          <li>
            <strong>Settings &amp; monitor</strong>
            <span>Theme, model choice, storage prefs, basic hardware info.</span>
          </li>
          <li>
            <strong>
              NEXUS Network
              <span className="badge badge-coming">coming</span>
            </strong>
            <span>
              Future optional online community. Stub on the stick for now. You may{" "}
              <Link href="/network">reserve a username</Link> on this site; rooms
              are not live yet.
            </span>
          </li>
        </ul>

        <div className="cta-row" style={{ marginTop: "1.5rem" }}>
          <Link className="btn" href="/download">
            Download
          </Link>
          <Link className="btn btn-ghost" href="/setup">
            Setup guide
          </Link>
          <Link className="btn btn-ghost" href="/about">
            About &amp; glossary
          </Link>
        </div>
      </div>
    </section>
  );
}
