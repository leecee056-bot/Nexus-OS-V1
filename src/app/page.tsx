import Image from "next/image";
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
            <Image
              className="brand-hero-mark"
              src="/brand/logo.png"
              alt=""
              width={72}
              height={140}
              priority
            />
            <BrandWordmark>NEXUS OS</BrandWordmark>
          </p>
          <h1>
            Offline AI on a USB stick, Raspberry Pi, or ESP32 Pocket — for old
            PCs, cyberdecks, and tiny boards.
          </h1>
          <p>
            Download a PC or Pi image and boot the on‑screen hub, or flash NEXUS
            Pocket on an ESP32-S3 for USB-Serial chat. No cloud account and no
            install onto your hard drive.
          </p>
          <div className="cta-row">
            <Link className="btn" href="/download">
              Download
            </Link>
            <Link className="btn btn-ghost" href="/setup">
              Setup guide
            </Link>
            <a className="btn btn-quiet" href="/demo/">
              Try the hub demo
            </a>
          </div>
          <p className="hero-note">
            Optional later:{" "}
            <Link href="/network">reserve a Network username</Link>.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <h2>Quick start</h2>
          <ol className="quick-steps">
            <li>
              <strong>1. Download</strong>
              Pick a PC USB image, the Raspberry Pi microSD image, or Pocket
              (ESP32-S3 firmware).
            </li>
            <li>
              <strong>2. Flash</strong>
              PC/Pi: unpack, then write with Etcher. Pocket: PlatformIO upload +
              SPIFFS model.
            </li>
            <li>
              <strong>3. Boot / connect</strong>
              Start from USB or power a Pi 4 — or open a Serial monitor for
              Pocket.
            </li>
          </ol>
          <nav className="jump-chips" aria-label="Jump to a build on Download">
            <Link href="/download#pc">PC USB</Link>
            <Link href="/download#pi">Raspberry Pi</Link>
            <Link href="/download#pocket">Pocket ESP32</Link>
            <Link href="/download#cardputer">Cardputer ADV</Link>
            <Link href="/setup#cardputer">Cardputer setup</Link>
          </nav>
          <div className="cta-row" style={{ marginBottom: "2rem" }}>
            <Link className="btn" href="/download">
              Go to Download
            </Link>
            <Link className="btn btn-ghost" href="/setup">
              Full setup steps
            </Link>
          </div>

          <h2>See it on a computer</h2>
          <p className="lede">
            After you boot, this is the kind of menu you get — keyboard-friendly,
            full screen, works offline. Or{" "}
            <a href="/demo/">try the interactive hub demo</a> in your browser
            first (arrows + Enter, Esc to go back).
          </p>
          <figure className="shot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/nexus-os-hub-screen.jpg"
              alt="NEXUS OS running: hub menu on a computer monitor"
            />
            <figcaption>NEXUS OS hub menu on a PC screen.</figcaption>
          </figure>

          <h3 className="subhead">What you can use it for</h3>
          <ul className="feature-list">
            <li>
              <strong>Private AI chat without the internet</strong>
              <span>
                Draft text, ask questions, or explore ideas on a spare machine —
                the answers stay on that device.
              </span>
            </li>
            <li>
              <strong>Cyberdecks and Pi handhelds</strong>
              <span>
                The Raspberry Pi image is a natural fit for DIY cyberdecks,
                portable terminals, and small field kits — offline AI in a
                compact case you can carry. Add Pocket as a tiny Serial board in
                the same kit.
              </span>
            </li>
            <li>
              <strong>ESP32 Pocket companion</strong>
              <span>
                Flash NEXUS Pocket on an ESP32-S3 with PSRAM for offline
                TinyStories chat and tools over USB Serial — no full Linux image
                required.
              </span>
            </li>
            <li>
              <strong>Give an old PC a second life</strong>
              <span>
                Many XP-era and early 64-bit boxes can boot the stick. Great for
                a workshop, classroom spare, or home “AI terminal.”
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
                typical modern PCs.
              </p>
            </div>
            <div className="panel">
              <h3>Raspberry Pi</h3>
              <p>
                <strong>Pi 4 primary</strong> (2 GB+ RAM). Same image may work on
                Pi 5 (best-effort). Flash to a microSD card (8 GB+). Ideal for
                cyberdeck builds.
              </p>
            </div>
            <div className="panel">
              <h3>NEXUS Pocket</h3>
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
                you add bigger models later.
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
            <Link href="/setup">Setup</Link>.
          </p>

          <div className="cta-row">
            <Link className="btn" href="/download">
              Download NEXUS OS
            </Link>
            <Link className="btn btn-ghost" href="/about">
              About &amp; glossary
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
