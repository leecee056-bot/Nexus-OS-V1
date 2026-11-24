import Link from "next/link";
import { BrandWordmark } from "@/components/BrandWordmark";
import { FAQ_ITEMS, FAQ_TEASER_IDS } from "@/lib/faq";

export default function HomePage() {
  const teaser = FAQ_ITEMS.filter((item) =>
    (FAQ_TEASER_IDS as readonly string[]).includes(item.id),
  );

  return (
    <>
      <section className="hero">
        <div className="shell hero-inner">
          <p className="brand-hero">
            {/* Plain <img>: hosted /_next/image serves Content-Disposition:attachment and breaks display */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="brand-hero-mark"
              src="/brand/tri-cass-rabbit-wizard.png?v=20261124c"
              alt="Tri-Cass rabbit wizard logo"
              width={72}
              height={140}
            />
            <BrandWordmark>Tri-Cass OS</BrandWordmark>
          </p>
          <h1>
            Offline AI that chats and codes — on USB, Pi, Desk, Companion, and
            tiny boards.
          </h1>
          <p>
            Private chat and a coding agent that stay on your machine. Flash a
            USB or microSD for the hub, or run <strong>Tri-Cass Desk</strong>{" "}
            (Windows / Linux / Pi / Android) with living glass windows, Ollama
            chat, and Agents that inspect / plan / build. Add{" "}
            <strong>Companion</strong>, <strong>Pocket</strong>, or{" "}
            <strong>Cardputer</strong> — we keep adding surfaces, not replacing
            them.
          </p>
          <div className="cta-row">
            <Link className="btn" href="/download">
              Download
            </Link>
            <Link className="btn btn-ghost" href="/setup">
              Setup guide
            </Link>
            <a className="btn btn-quiet" href="/demo/">
              Visual tour
            </a>
          </div>
          <p className="hero-note">
            Optional later:{" "}
            <Link href="/network">reserve a Network username</Link>{" "}
            (no password while chat is offline).
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <h2>The Tri-Cass family</h2>
          <p className="lede">
            We keep adding surfaces — nothing below replaces the bootable hub.
            Pick what fits the hardware in front of you.
          </p>
          <div className="req-grid">
            <div className="panel">
              <h3>USB / Pi hub</h3>
              <p>
                Bootable offline OS images (v1.0.3) — Chat, Knowledge Vault,
                tools, Cline-parity Pocket Agent. PC i686 / x86_64 and Pi 4/5
                aarch64.
              </p>
              <p>
                <Link href="/download#pc">PC USB</Link>
                {" · "}
                <Link href="/download#pi">Raspberry Pi</Link>
              </p>
            </div>
            <div className="panel">
              <h3>Tri-Cass Desk</h3>
              <p>
                Living desktop — frosted glass, Earthbound atmosphere from{" "}
                <em>machine</em> telemetry, local Ollama chat, Monaco editor,
                Notes, and Agents that can read a project and help write code
                (inspect / plan / build). Win / Linux / Pi / Android.
              </p>
              <p>
                <Link href="/download#desk">Desk downloads</Link>
                {" · "}
                <a href="/demo/#desk">Tour Desk shots</a>
              </p>
            </div>
            <div className="panel">
              <h3>Companion</h3>
              <p>
                Windows / Mac / Android / web app — Chat, Vault, Packs, Agent
                mode with local models through Ollama. Sideload APK on Android.
              </p>
              <p>
                <Link href="/download#companion">Companion downloads</Link>
              </p>
            </div>
            <div className="panel">
              <h3>Pocket &amp; Cardputer</h3>
              <p>
                ESP32-S3 Pocket (PSRAM + TinyStories over Serial) and Cardputer
                ADV hub (no PSRAM; TinyChat + optional microSD vault).
              </p>
              <p>
                <Link href="/download#pocket">Pocket</Link>
                {" · "}
                <Link href="/download#cardputer">Cardputer ADV</Link>
              </p>
            </div>
          </div>

          <h2>Quick start</h2>
          <ol className="quick-steps">
            <li>
              <strong>1. Download</strong>
              Pick a PC USB image, the Raspberry Pi microSD image, Pocket /
              Cardputer firmware, Companion, or Desk.
            </li>
            <li>
              <strong>2. Flash or install</strong>
              PC/Pi: unpack, then write with Etcher. Pocket/Cardputer: PlatformIO.
              Companion / Desk: run the installer or AppImage / APK.
            </li>
            <li>
              <strong>3. Boot / launch</strong>
              Start from USB or power a Pi — or open Serial / the desktop app.
              Optional Ollama on the same machine for larger models.
            </li>
          </ol>
          <nav className="jump-chips" aria-label="Jump to a build on Download">
            <Link href="/download#pc">PC USB</Link>
            <Link href="/download#pi">Raspberry Pi</Link>
            <Link href="/download#pocket">Pocket ESP32</Link>
            <Link href="/download#cardputer">Cardputer ADV</Link>
            <Link href="/download#companion">Companion</Link>
            <Link href="/download#desk">Tri-Cass Desk</Link>
            <a href="/demo/">Visual tour</a>
          </nav>
          <div className="cta-row" style={{ marginBottom: "2rem" }}>
            <Link className="btn" href="/download">
              Go to Download
            </Link>
            <Link className="btn btn-ghost" href="/setup">
              Full setup steps
            </Link>
          </div>

          <h2>Offline AI: chat + coding on your machine</h2>
          <p className="lede">
            Tri-Cass is built so the model never has to leave the box. Chat for
            writing and Q&amp;A; Agents for reading files, planning changes, and
            helping you build — with Ollama (Desk / Companion) or the bundled
            hub / Pocket models. Nothing here replaces the USB/Pi hub; Desk and
            Companion are extra ways in.
          </p>
          <div className="req-grid" style={{ marginBottom: "1.75rem" }}>
            <div className="panel">
              <h3>Chat</h3>
              <p>
                Local conversation in Desk, Companion, or the hub — draft text,
                ask questions, use Knowledge Vault notes as context. Pick a model
                in Ollama (or use the small model on the stick / Pocket).
              </p>
            </div>
            <div className="panel">
              <h3>Coding Agents</h3>
              <p>
                Desk Agents run an inspect → plan → build loop (Cline-slim): look
                at a project, propose steps, and help write or edit code in the
                Monaco workspace — sandboxed, still on your PC or Pi.
              </p>
            </div>
            <div className="panel">
              <h3>Hub Pocket Agent</h3>
              <p>
                On the USB / Pi image, Pocket Agent scaffolds small projects
                (timer / HTML / CLI / Flask) under{" "}
                <code className="mono">/data/projects/</code> — offline helpers
                with a fixed allow-list, not open access to the whole disk.
              </p>
            </div>
          </div>

          <h2>See the new Desk</h2>
          <p className="lede">
            Screenshots from the current Tri-Cass Desk build — living world,
            chat, and coding agents. The hub menu is still there when you boot
            USB/Pi. Full scroll:{" "}
            <a href="/demo/">visual tour</a>.
          </p>
          <figure className="shot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/desk/living.jpg?v=20261124c"
              alt="Tri-Cass Desk living desktop with glass windows"
            />
            <figcaption>
              Tri-Cass Desk — living world + frosted apps (mood and atmosphere
              from local telemetry).
            </figcaption>
          </figure>
          <figure className="shot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/desk/chat.jpg?v=20261124c"
              alt="Tri-Cass Desk local Ollama chat"
            />
            <figcaption>
              Desk Chat — local Ollama models, private conversation on the
              machine.
            </figcaption>
          </figure>
          <figure className="shot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/desk/agents.jpg?v=20261124c"
              alt="Tri-Cass Desk Agents inspect plan build coding loop"
            />
            <figcaption>
              Desk Agents — inspect / plan / build for local coding help.
            </figcaption>
          </figure>
          <figure className="shot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/tri-cass-os-hub-screen.jpg?v=20261124c"
              alt="Tri-Cass OS hub menu on a computer monitor"
            />
            <figcaption>
              USB / Pi hub menu — still the offline boot path; Desk sits
              alongside it.
            </figcaption>
          </figure>

          <h3 className="subhead">What you can use it for</h3>
          <ul className="feature-list">
            <li>
              <strong>Private AI chat without the internet</strong>
              <span>
                Draft text, ask questions, or explore ideas — answers stay on
                that device (hub, Desk, Companion, or Pocket).
              </span>
            </li>
            <li>
              <strong>Offline coding help</strong>
              <span>
                Desk Agents (inspect / plan / build) and hub Pocket Agent
                scaffolds — local models via Ollama or the stick, with a
                sandboxed tool allow-list.
              </span>
            </li>
            <li>
              <strong>Living desktop</strong>
              <span>
                Tri-Cass Desk brings Earthbound atmosphere, glass chrome, Notes,
                Monaco, and chat — optional Ollama on the same PC or Pi.
              </span>
            </li>
            <li>
              <strong>Cyberdecks and Pi handhelds</strong>
              <span>
                The Raspberry Pi image is a natural fit for DIY cyberdecks,
                portable terminals, and small field kits — offline AI in a
                compact case. Add Pocket as a tiny Serial board in the same kit.
              </span>
            </li>
            <li>
              <strong>ESP32 Pocket</strong> and a{" "}
              <Link href="/download#companion">Windows / Mac / Android companion</Link>
              {" · "}
              <Link href="/download#desk">Tri-Cass Desk</Link>
              <span>
                Flash Tri-Cass Pocket on an ESP32-S3 with PSRAM for offline
                TinyStories chat and tools over USB Serial — no full Linux image
                required. Cardputer ADV covers the no-PSRAM keyboard board.
              </span>
            </li>
            <li>
              <strong>Give an old PC a second life</strong>
              <span>
                Many XP-era and early 64-bit boxes can boot the stick. Great for
                a workshop, classroom spare, or home “AI terminal.” Desk also
                ships a Windows ia32 build for low-spec PCs.
              </span>
            </li>
            <li>
              <strong>Classroom / makerspace kits</strong>
              <span>
                Hand someone a stick or a Pi card and they get the same menu —
                no accounts to set up first.
              </span>
            </li>
            <li>
              <strong>Travel or low-connectivity work</strong>
              <span>
                Keep a notebook and chat available when Wi‑Fi is bad or you would
                rather not send text to a website.
              </span>
            </li>
            <li>
              <strong>Keep searchable notes with you</strong>
              <span>
                The Knowledge Vault is your on-device notebook. It ships with a
                small starter pack (guide, glossary, how-tos) — not a full wiki.
                Want more? See{" "}
                <Link href="/knowledge-packs">Optional Knowledge Packs</Link>{" "}
                for free public sources on a spare stick, or add your own text
                for Chat to search later (see <Link href="/about">About</Link>
                ).
              </span>
            </li>
          </ul>

          <h3 className="subhead">Minimum requirements (today&apos;s release)</h3>
          <div className="req-grid">
            <div className="panel">
              <h3>PC</h3>
              <p>
                Intel/AMD that can boot from USB. Choose <strong>32-bit (i686)</strong>{" "}
                for older XP-era machines or <strong>64-bit (x86_64)</strong> for
                typical modern PCs. Desk: Windows x64 / ia32 setup or portable.
              </p>
            </div>
            <div className="panel">
              <h3>Raspberry Pi</h3>
              <p>
                <strong>Pi 4 or Pi 5</strong> (2 GB+ RAM; same aarch64 image).
                Flash to a microSD card (8 GB+). Desk also ships a linux-arm64
                AppImage for Pi.
              </p>
            </div>
            <div className="panel">
              <h3>Tri-Cass Pocket</h3>
              <p>
                ESP32-S3 with PSRAM (16 MB flash preferred). PlatformIO + Serial
                at 115200. TinyStories stories260K by default.
              </p>
            </div>
            <div className="panel">
              <h3>USB stick / microSD</h3>
              <p>
                8 GB or larger recommended for PC/Pi. Flashing erases the stick
                or card.
              </p>
            </div>
            <div className="panel">
              <h3>Memory (PC / Pi)</h3>
              <p>
                About 1–2 GB RAM free for the small bundled model; more helps if
                you add bigger models later. Desk benefits from a local Ollama
                install for chat/agents.
              </p>
            </div>
          </div>

          <h2>FAQ</h2>
          <p className="lede">
            Common questions before you flash a stick or card.{" "}
            <Link href="/faq">See all FAQ answers</Link>.
          </p>
          <div className="faq-list faq-teaser">
            {teaser.map((item) => (
              <details key={item.id} className="faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
          <div className="cta-row" style={{ marginBottom: "2.5rem" }}>
            <Link className="btn btn-ghost" href="/faq">
              Full FAQ
            </Link>
          </div>

          <p className="lede" style={{ marginBottom: "1rem" }}>
            New here? Read <Link href="/about">About</Link> for plain-English
            explanations — then <Link href="/download">Download</Link> and follow{" "}
            <Link href="/setup">Setup</Link>, or scroll the{" "}
            <a href="/demo/">visual tour</a> first.
          </p>

          <div className="cta-row">
            <Link className="btn" href="/download">
              Download Tri-Cass OS
            </Link>
            <Link className="btn btn-ghost" href="/about">
              About &amp; glossary
            </Link>
            <a className="btn btn-quiet" href="/demo/">
              Visual tour
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
