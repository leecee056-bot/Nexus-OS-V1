import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Features" };

export default function FeaturesPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>What&apos;s included</h2>
        <p className="lede">
          Plain list of what works today across the Tri-Cass family — USB / Pi
          hub, Tri Cass AI (local coder), Tri-Cass Desk (chat + coding agents),
          Companion, Pocket, and Cardputer. We add surfaces; we do not take the
          hub away. For glossary words, see <Link href="/about">About</Link>.
        </p>

        <figure className="shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/desk/chat.jpg?v=20261124c"
            alt="Tri-Cass Desk local chat with Ollama"
          />
          <figcaption>
            Desk Chat — private offline conversation via local Ollama models.
          </figcaption>
        </figure>
        <figure className="shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/desk/agents.jpg?v=20261124c"
            alt="Tri-Cass Desk coding Agents"
          />
          <figcaption>
            Desk Agents — inspect / plan / build coding loop on your machine.
          </figcaption>
        </figure>

        <ul className="feature-list">
          <li>
            <strong>Tri Cass AI (standalone local coder)</strong>
            <span>
              Chat → websites and apps as real files on disk. Model catalog,
              knowledge base, ~1000 templates, ASCII &amp; image tools, Android
              scaffolds, glass Appearance. Windows x64 portable.{" "}
              <Link href="/tri-cass-ai">Download Tri Cass AI</Link>.
            </span>
          </li>
          <li>
            <strong>Offline AI chat</strong>
            <span>
              Talk to a model that stays on the device: Tri Cass AI, Desk, and
              Companion via <a href="https://ollama.com/download">Ollama</a>,
              USB/Pi hub with the bundled starter model, Pocket with TinyStories
              over Serial. Draft, Q&amp;A, and vault-backed context without
              sending text to a website.
            </span>
          </li>
          <li>
            <strong>Coding Agents (Desk + hub)</strong>
            <span>
              Tri-Cass Desk Agents run a Cline-slim inspect → plan → build loop
              with Monaco in a frosted workspace — help read a project and write
              code locally. On the USB/Pi hub,{" "}
              <strong>Pocket Agent</strong> scaffolds (timer / HTML / CLI /
              Flask) land under <code className="mono">/data/projects/</code>{" "}
              with a fixed tool allow-list.
            </span>
          </li>
          <li>
            <strong>Tri-Cass Desk living desktop</strong>
            <span>
              Frosted glass windows, Earthbound atmosphere from{" "}
              <em>machine</em> telemetry, Notes, Knowledge Vault, and chat —
              Windows (x64 + ia32), Linux x64, Pi arm64 AppImage, and Android /
              Android TV APK. See{" "}
              <Link href="/download#desk">Download → Desk</Link>.
            </span>
          </li>
          <li>
            <strong>Boots on low-spec PCs, Pi 4, and cyberdeck builds</strong>
            <span>
              32-bit and 64-bit Intel/AMD USB images, plus a 64-bit Raspberry Pi
              microSD image (Pi 4 and Pi 5 share the same aarch64 file). Aimed at
              spare PCs, portable Pi kits, and DIY cyberdecks.
            </span>
          </li>
          <li>
            <strong>Tri-Cass Pocket (ESP32-S3 + PSRAM)</strong>
            <span>
              USB-Serial companion firmware: offline TinyStories chat, status,
              and tools (mem, notes, calc). Flash with PlatformIO; default model
              stories260K on SPIFFS. See{" "}
              <Link href="/setup#pocket">Pocket setup</Link>.
            </span>
          </li>
          <li>
            <strong>Tri-Cass Cardputer ADV</strong>
            <span>
              On-device green hub for the M5Stack Cardputer ADV (no PSRAM):
              TinyChat, Notes, Status, and an optional microSD Knowledge Vault
              on the 240×135 screen with keyboard nav. Separate from Pocket —
              see <Link href="/setup#cardputer">Cardputer setup</Link>.
            </span>
          </li>
          <li>
            <strong>Windows · Mac · Android · web companion</strong>
            <span>
              Normal app (<code className="mono">nexus-app/</code>) with real
              local AI Chat via Ollama, Vault, Packs, and Files — matrix boot
              splash, rabbit logo, and desktop icon. Published installers are on
              the companion Release; iOS is developer/Expo only (no App Store
              build). See{" "}
              <Link href="/download#companion">Download → Companion</Link>.
            </span>
          </li>
          <li>
            <strong>Hub local AI Chat</strong>
            <span>
              On PC/Pi: talk to an AI on the machine itself (SmolLM2 starter). On
              Pocket: Serial <code className="mono">chat</code> with TinyStories.
              Desk / Companion add richer Ollama chat on top of the same
              local-first idea.
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
              optionally use hits in Chat. Want a larger offline library? See{" "}
              <Link href="/knowledge-packs">Optional Knowledge Packs</Link>{" "}
              (Kiwix, Gutenberg, your own notes — optional).
            </span>
          </li>
          <li>
            <strong>Hub agents &amp; tools</strong>
            <span>
              Small helpers with a fixed allow-list (calculator, vault, files,
              notes, system info, models, pixel art) — not open access to
              everything on the PC. Pocket Agent scaffolds via{" "}
              <code className="mono">scaffold</code> /{" "}
              <code className="mono">make</code> ship on current USB and Pi
              images. For the full coding agent UI, use{" "}
              <Link href="/download#desk">Tri-Cass Desk</Link>.
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
              Tri-Cass Network
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
            Visual tour
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
