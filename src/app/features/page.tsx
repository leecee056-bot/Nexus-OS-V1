import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Features" };

export default function FeaturesPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>What&apos;s included</h2>
        <p className="lede">
          Plain list of what works today on the USB / Pi hub and on NEXUS Pocket
          (ESP32). For “what is a Vault?” and similar words, see{" "}
          <Link href="/about">About</Link>.
        </p>

        <figure className="shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/nexus-os-hub-screen.jpg"
            alt="NEXUS OS hub menu on a computer screen"
          />
          <figcaption>Main menu after booting from USB or Pi microSD.</figcaption>
        </figure>

        <ul className="feature-list">
          <li>
            <strong>Boots on low-spec PCs, Pi 4, and cyberdeck builds</strong>
            <span>
              32-bit and 64-bit Intel/AMD USB images, plus a 64-bit Raspberry Pi
              microSD image (Pi 4 primary; Pi 5 best-effort). Aimed at spare PCs,
              portable Pi kits, and DIY cyberdecks.
            </span>
          </li>
          <li>
            <strong>NEXUS Pocket (ESP32-S3)</strong>
            <span>
              USB-Serial companion firmware: offline TinyStories chat, status,
              and tools (mem, notes, calc). Flash with PlatformIO; default model
              stories260K on SPIFFS. See{" "}
              <Link href="/setup#pocket">Pocket setup</Link>.
            </span>
          </li>
          <li>
            <strong>Local AI Chat</strong>
            <span>
              On PC/Pi: talk to an AI on the machine itself (SmolLM2 starter). On
              Pocket: Serial <code className="mono">chat</code> with TinyStories.
              Both stay offline once flashed.
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
              Searchable notes with a small bundled starter pack (guide,
              glossary, how-tos). Import more text/markdown, rebuild the index,
              optionally use hits in Chat. Not a full Wikipedia dump.
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
          <a className="btn btn-ghost" href="/demo/">
            Try hub demo
          </a>
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
