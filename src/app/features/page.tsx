import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Features" };

export default function FeaturesPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>What ships today</h2>
        <p className="lede">
          Honest inventory from hub smoke tests. Mockups are design targets —
          claims below match the working USB hub TUI.
        </p>
        <ul className="feature-list">
          <li>
            <strong>USB boot + offline AI</strong>
            <span>
              Flashable Linux images (x86_64 / i686). llama.cpp on loopback;
              bundled SmolLM2 135M. Works without internet.
            </span>
          </li>
          <li>
            <strong>NEXUS hub TUI</strong>
            <span>
              Main menu, one maximised app at a time, Matrix + basic themes,
              letter shortcuts. Host smoke: SMOKE_HUB_OK.
            </span>
          </li>
          <li>
            <strong>AI Chat</strong>
            <span>Local chat against llama-server; optional vault RAG cites.</span>
          </li>
          <li>
            <strong>File Manager</strong>
            <span>AI_DATA-scoped browse, preview, import paths for models/docs.</span>
          </li>
          <li>
            <strong>Knowledge Vault</strong>
            <span>SQLite FTS5; import txt/md; rebuild index; search UI.</span>
          </li>
          <li>
            <strong>Agents &amp; Tools</strong>
            <span>
              Allowlisted tools only (calc, vault, files, notes, sysinfo, models,
              PXG) — no arbitrary shell.
            </span>
          </li>
          <li>
            <strong>Games</strong>
            <span>Snake + Minesweeper; Esc unloads; no AI when idle.</span>
          </li>
          <li>
            <strong>Pixel Art / Image Lab</strong>
            <span>
              PXG pixel generation + prompt surface. Not neural Image Lab
              generation.
            </span>
          </li>
          <li>
            <strong>Settings &amp; System Monitor</strong>
            <span>Theme, model, storage prefs; hardware probe views.</span>
          </li>
          <li>
            <strong>
              NEXUS Network
              <span className="badge badge-coming">coming</span>
            </strong>
            <span>
              Menu stub + Settings toggle only. Real XMPP client is not shipped.
              Reserve an identity on the{" "}
              <Link href="/network">Network page</Link> — servers launch later.
            </span>
          </li>
        </ul>

        <figure className="shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/nexus-os-mockup-offline.png"
            alt="NEXUS OS offline hub design mockup"
          />
          <figcaption>
            Design mockup — offline hub vision. Live UI is the curses TUI on the
            USB image.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
