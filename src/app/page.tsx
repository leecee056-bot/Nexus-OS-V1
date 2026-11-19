import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="shell hero-inner">
          <p className="brand-hero cursor-blink">NEXUS OS</p>
          <h1>
            Offline AI on a USB stick — for old PCs and other low‑spec machines.
          </h1>
          <p>
            Download the system, write it to a stick, boot, and chat with a local
            AI from the on‑screen menu. No cloud account and no install onto your
            hard drive.
          </p>
          <div className="cta-row">
            <Link className="btn" href="/download">
              Download
            </Link>
            <Link className="btn btn-ghost" href="/setup">
              Setup guide
            </Link>
            <Link className="btn btn-quiet" href="/network">
              Reserve Network name
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <h2>See it on a computer</h2>
          <p className="lede">
            After you boot from the stick, this is the kind of menu you get —
            keyboard-friendly, full screen, works offline.
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
                the answers stay on that PC.
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
              <strong>Keep searchable notes on the stick</strong>
              <span>
                The Knowledge Vault is your on-stick notebook — import text and
                find it later.
              </span>
            </li>
            <li>
              <strong>Carry tools with you</strong>
              <span>
                Files, small helpers (“Agents”), settings, and simple games live
                on the USB so your setup travels.
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
              <h3>USB stick</h3>
              <p>8 GB or larger recommended (4 GB minimum). Flashing erases the stick.</p>
            </div>
            <div className="panel">
              <h3>Memory</h3>
              <p>
                About 1–2 GB RAM free for the small bundled model; more helps if
                you add bigger models later.
              </p>
            </div>
            <div className="panel">
              <h3>Coming next</h3>
              <p>
                Raspberry Pi 4/5 images are being built now. Live Network chat
                and older Pi boards come later. PC USB downloads work today.
              </p>
            </div>
          </div>

          <p className="lede" style={{ marginBottom: "1rem" }}>
            New here? Read <Link href="/about">About</Link> for plain-English
            explanations of words like Linux, Vault, and Agents — then{" "}
            <Link href="/download">Download</Link> and follow{" "}
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
