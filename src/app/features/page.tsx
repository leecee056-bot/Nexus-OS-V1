import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Features" };

export default function FeaturesPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>What NEXUS OS does</h2>
        <p className="lede">
          Honest list of what works on the USB stick today. Optional online
          Network chat is called out separately — it is not required for offline
          AI.
        </p>
        <ul className="feature-list">
          <li>
            <strong>Boots from USB</strong>
            <span>
              Turns a flash drive into a small Linux system you start instead of
              (or alongside) Windows. Works offline after you flash it.
            </span>
          </li>
          <li>
            <strong>Local AI Chat</strong>
            <span>
              Talk to an AI that runs on the PC itself (llama.cpp). A small
              starter model is included; you can add others later on the stick.
            </span>
          </li>
          <li>
            <strong>Main menu hub</strong>
            <span>
              Keyboard-friendly full-screen menu. Open one app at a time. Themes:
              Matrix green or plain high-contrast.
            </span>
          </li>
          <li>
            <strong>Files</strong>
            <span>
              Browse and manage files on the stick’s data area — docs, images,
              and extra models.
            </span>
          </li>
          <li>
            <strong>Knowledge Vault</strong>
            <span>
              Import text/markdown notes, search them, and optionally use them
              as context in Chat.
            </span>
          </li>
          <li>
            <strong>Agents &amp; tools</strong>
            <span>
              Small helpers with a fixed allow-list (calculator, vault, files,
              notes, system info, models, pixel art) — not open shell access.
            </span>
          </li>
          <li>
            <strong>Games</strong>
            <span>Simple built-ins (Snake, Minesweeper) that unload when you leave.</span>
          </li>
          <li>
            <strong>Pixel art lab</strong>
            <span>
              Optional tiny pixel-style image toys. Not a full cloud image
              generator.
            </span>
          </li>
          <li>
            <strong>Settings &amp; monitor</strong>
            <span>Theme, model choice, storage prefs, and basic hardware info.</span>
          </li>
          <li>
            <strong>
              NEXUS Network
              <span className="badge badge-coming">coming</span>
            </strong>
            <span>
              Future optional community chat. On the stick it is only a stub for
              now. You can{" "}
              <Link href="/network">reserve a name</Link> on this website; online
              rooms are not live yet.
            </span>
          </li>
        </ul>

        <div className="cta-row" style={{ marginTop: "1.5rem" }}>
          <Link className="btn" href="/setup">
            Read the setup guide
          </Link>
          <Link className="btn btn-ghost" href="/download">
            Download
          </Link>
        </div>

        <figure className="shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/nexus-os-mockup-offline.png"
            alt="NEXUS OS offline hub design mockup"
          />
          <figcaption>
            Design mockup of the offline hub. The live stick uses a text menu
            with the same job: pick an app and go.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
