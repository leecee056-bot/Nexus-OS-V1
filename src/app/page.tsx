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
            Offline AI on a USB stick or Raspberry Pi — for old PCs, cyberdecks,
            and other low‑spec machines.
          </h1>
          <p>
            Download the system, write it to a USB stick or microSD card, boot,
            and chat with a local AI from the on‑screen menu. No cloud account
            and no install onto your hard drive.
          </p>
          <div className="cta-row">
            <Link className="btn" href="/download">
              Download
            </Link>
            <Link className="btn btn-ghost" href="/setup">
              Setup guide
            </Link>
            <Link className="btn btn-quiet" href="/network">
              Optional: reserve a username for later
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <h2>Quick start</h2>
          <ol className="quick-steps">
            <li>
              <strong>1. Download</strong>
              Pick a PC USB image or the Raspberry Pi microSD image.
            </li>
            <li>
              <strong>2. Flash</strong>
              Unpack the file, then write it with Etcher (erases the stick or
              card).
            </li>
            <li>
              <strong>3. Boot</strong>
              Start from USB on a PC, or power a Pi 4 with the card inserted.
            </li>
          </ol>
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
            full screen, works offline.
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
                compact case you can carry.
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
                The Knowledge Vault is your on-device notebook — import text and
                find it later (see <Link href="/about">About</Link> for the
                word list).
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
              <h3>USB stick / microSD</h3>
              <p>
                8 GB or larger recommended. Flashing erases the stick or card.
              </p>
            </div>
            <div className="panel">
              <h3>Memory</h3>
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
