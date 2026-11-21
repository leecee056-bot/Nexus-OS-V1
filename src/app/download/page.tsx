import type { Metadata } from "next";
import Link from "next/link";
import {
  ARTIFACTS,
  BUILD_NOTE,
  CARDPUTER_ARTIFACTS,
  CARDPUTER_README,
  CARDPUTER_REPO,
  CARDPUTER_VERSION,
  PI_ARTIFACTS,
  PI_RELEASE_PAGE,
  PI_RELEASE_SHA256SUMS,
  POCKET_ARTIFACTS,
  POCKET_README,
  POCKET_REPO,
  POCKET_VERSION,
  RELEASE_PAGE,
  RELEASE_SHA256SUMS,
} from "@/lib/artifacts";

export const metadata: Metadata = { title: "Download" };

export default function DownloadPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>Download NEXUS OS</h2>
        <p className="lede">{BUILD_NOTE}</p>

        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          <strong>PC / Pi:</strong> files end in{" "}
          <code className="mono">.img.xz</code> — unpack first, then flash the{" "}
          <code className="mono">.img</code> with balenaEtcher (
          <strong>USB stick</strong> for PC, <strong>microSD</strong> for Pi).{" "}
          <strong>Pocket / Cardputer:</strong> clone firmware and flash with
          PlatformIO — see Setup. Full steps:{" "}
          <Link href="/setup">Setup guide</Link>.
        </div>

        <h3 className="subhead">1. Choose your machine</h3>
        <p className="lede" style={{ marginBottom: "1rem" }}>
          Not sure? Old XP-era PC → 32-bit. Normal modern PC → 64-bit. Raspberry
          Pi / cyberdeck → Pi image (Pi 4 first). ESP32 with PSRAM → Pocket.
          M5Stack Cardputer ADV → Cardputer firmware (no PSRAM).
        </p>
        <nav className="jump-chips" aria-label="Jump to a build">
          <a href="#pc">PC USB</a>
          <a href="#pi">Raspberry Pi</a>
          <a href="#pocket">Pocket ESP32</a>
          <a href="#cardputer">Cardputer ADV</a>
          <a href="#knowledge-packs">Knowledge packs</a>
          <a href="#companion">Companion app</a>
        </nav>

        <h3 className="subhead" id="pc">
          PC (USB stick)
        </h3>
        {ARTIFACTS.map((a) => (
          <div className="panel" key={a.arch}>
            <h3>{a.label}</h3>
            <p>{a.guidance}</p>
            <p>
              <strong>File:</strong> <span className="mono">{a.downloadName}</span>
              <br />
              <strong>Size:</strong> {a.sizeLabel}
            </p>
            <div className="cta-row" style={{ marginTop: "0.85rem" }}>
              <a className="btn" href={a.downloadUrl}>
                Download {a.label}
              </a>
              <a className="btn btn-ghost" href={RELEASE_SHA256SUMS}>
                View SHA256 checksums
              </a>
            </div>
            <details className="verify-block">
              <summary>Verify this download (optional)</summary>
              <p>
                <strong>Checksum (.xz):</strong>{" "}
                <span className="mono hash">{a.sha256xz}</span>
                <br />
                <strong>Checksum (.img after unpack):</strong>{" "}
                <span className="mono hash">{a.sha256}</span>
              </p>
              <p style={{ marginTop: "0.5rem" }}>
                Windows PowerShell after unpack:{" "}
                <code className="mono">
                  Get-FileHash .\\{a.filename} -Algorithm SHA256
                </code>
              </p>
            </details>
          </div>
        ))}

        <h3 className="subhead" id="pi" style={{ marginTop: "2rem" }}>
          Raspberry Pi / cyberdeck (microSD)
        </h3>
        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          <strong>Pi 4 is the primary target</strong> — including DIY cyberdecks
          and portable Pi kits. The same image may boot on Pi 5, but that is
          best-effort for now (some boards may need a software update later). Use
          a <strong>microSD card</strong>, not a USB stick.
        </div>
        {PI_ARTIFACTS.map((a) => (
          <div className="panel" key={a.arch}>
            <h3>{a.label}</h3>
            <p>{a.guidance}</p>
            <p>
              <strong>File:</strong> <span className="mono">{a.downloadName}</span>
              <br />
              <strong>Size:</strong> {a.sizeLabel}
            </p>
            <div className="cta-row" style={{ marginTop: "0.85rem" }}>
              <a className="btn" href={a.downloadUrl}>
                Download Raspberry Pi image
              </a>
              <a className="btn btn-ghost" href={PI_RELEASE_SHA256SUMS}>
                View SHA256 checksums
              </a>
            </div>
            <details className="verify-block">
              <summary>Verify this download (optional)</summary>
              <p>
                <strong>Checksum (.xz):</strong>{" "}
                <span className="mono hash">{a.sha256xz}</span>
                <br />
                <strong>Checksum (.img after unpack):</strong>{" "}
                <span className="mono hash">{a.sha256}</span>
              </p>
              <p style={{ marginTop: "0.5rem" }}>
                Windows PowerShell after unpack:{" "}
                <code className="mono">
                  Get-FileHash .\\{a.filename} -Algorithm SHA256
                </code>
              </p>
            </details>
          </div>
        ))}

        <h3 className="subhead" id="pocket" style={{ marginTop: "2rem" }}>
          NEXUS Pocket (ESP32-S3)
        </h3>
        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          Pocket is a <strong>USB-Serial</strong> offline tiny-ML companion — not
          a disk image. You flash firmware with PlatformIO, then upload a small
          TinyStories model to the board. Needs an ESP32-S3 with PSRAM.
        </div>
        {POCKET_ARTIFACTS.map((a) => (
          <div className="panel" key={a.arch}>
            <h3>
              {a.label}{" "}
              <span className="mono" style={{ fontWeight: 400, fontSize: "0.9em" }}>
                v{POCKET_VERSION}
              </span>
            </h3>
            <p>{a.guidance}</p>
            <p>
              <strong>Source:</strong> <span className="mono">{a.filename}/</span> in
              the GitHub repo
              <br />
              <strong>Size:</strong> {a.sizeLabel}
            </p>
            <div className="cta-row" style={{ marginTop: "0.85rem" }}>
              <a className="btn" href={POCKET_REPO}>
                Open Pocket firmware
              </a>
              <a className="btn btn-ghost" href={POCKET_README}>
                README on GitHub
              </a>
              <Link className="btn btn-quiet" href="/setup#pocket">
                Pocket setup steps
              </Link>
            </div>
          </div>
        ))}

        <h3 className="subhead" id="cardputer" style={{ marginTop: "2rem" }}>
          NEXUS Cardputer ADV
        </h3>
        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          Dedicated firmware for the <strong>M5Stack Cardputer ADV</strong>{" "}
          (ESP32-S3FN8, 8 MB flash, <strong>no PSRAM</strong>, 240×135 +
          keyboard). It cannot run USB/Pi images or Pocket’s stories260K model —
          Chat is TinyChat (flash corpus). Optional{" "}
          <strong>Knowledge Vault</strong> on microSD (
          <code className="mono">/nexus-vault</code>) — no card required.
        </div>
        {CARDPUTER_ARTIFACTS.map((a) => (
          <div className="panel" key={a.arch}>
            <h3>
              {a.label}{" "}
              <span className="mono" style={{ fontWeight: 400, fontSize: "0.9em" }}>
                v{CARDPUTER_VERSION}
              </span>
            </h3>
            <p>{a.guidance}</p>
            <p>
              <strong>Source:</strong> <span className="mono">{a.filename}/</span> in
              the GitHub repo
              <br />
              <strong>Size:</strong> {a.sizeLabel}
            </p>
            <div className="cta-row" style={{ marginTop: "0.85rem" }}>
              <a className="btn" href={CARDPUTER_REPO}>
                Open Cardputer firmware
              </a>
              <a className="btn btn-ghost" href={CARDPUTER_README}>
                README on GitHub
              </a>
              <Link className="btn btn-quiet" href="/setup#cardputer">
                Cardputer setup steps
              </Link>
            </div>
          </div>
        ))}

        <div className="panel" id="companion" style={{ marginTop: "1.5rem" }}>
          <h3>Windows + iOS companion app (secondary)</h3>
          <p>
            Prefer a normal app window instead of flashing a stick?{" "}
            <strong>NEXUS Companion</strong> in{" "}
            <code className="mono">nexus-app/</code> is a Windows / iPhone /
            iPad preview with Chat (lightweight offline stub), Knowledge Vault
            notes, and simple document browsing. It is{" "}
            <strong>not</strong> the bootable OS or Cardputer firmware — those
            stay the main path.
          </p>
          <div className="cta-row" style={{ marginTop: "0.85rem" }}>
            <a
              className="btn"
              href="https://github.com/leecee056-bot/Nexus-OS-V1/tree/main/nexus-app"
            >
              Open companion source
            </a>
            <a className="btn btn-ghost" href="/guides/companion-app.md">
              Build / run notes
            </a>
            <Link className="btn btn-quiet" href="/setup#companion">
              Setup mention
            </Link>
          </div>
        </div>

        <div className="panel" id="knowledge-packs" style={{ marginTop: "1.5rem" }}>
          <h3>Optional Knowledge Packs</h3>
          <p>
            The images already include a small Vault starter pack. If you have
            spare space on a USB stick or microSD (32 GB+ is ideal), you can add
            free public offline knowledge — Wikipedia-style dumps, Gutenberg
            books, and your own notes — so the AI can look things up locally. We
            do not host those large files; you download them from public
            archives. <strong>Completely optional</strong> — everything still
            works without them.
          </p>
          <div className="cta-row" style={{ marginTop: "0.85rem" }}>
            <Link className="btn" href="/knowledge-packs">
              Optional Knowledge Packs
            </Link>
            <a className="btn btn-ghost" href="/guides/knowledge-packs.md">
              Short markdown guide
            </a>
            <Link className="btn btn-quiet" href="/faq#vault">
              Vault FAQ
            </Link>
          </div>
        </div>

        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <h3>After you download</h3>
          <ol className="steps">
            <li>
              <strong>PC / Pi:</strong> unpack the{" "}
              <code className="mono">.xz</code> → get a{" "}
              <code className="mono">.img</code> (7-Zip on Windows).
            </li>
            <li>
              <strong>PC / Pi:</strong> flash with Etcher —{" "}
              <strong>USB stick</strong> for PC, <strong>microSD</strong> for Pi
              / cyberdeck — then boot into the hub menu.
            </li>
            <li>
              <strong>Pocket:</strong> run{" "}
              <code className="mono">fetch_model.sh</code>,{" "}
              <code className="mono">pio … upload</code> +{" "}
              <code className="mono">uploadfs</code>, then open a Serial monitor
              at 115200 — details in Setup.
            </li>
            <li>
              <strong>Cardputer ADV:</strong>{" "}
              <code className="mono">pio run -e cardputer-adv -t upload</code>{" "}
              from <code className="mono">nexus-cardputer/</code> — hub appears
              on the built-in screen.
            </li>
          </ol>
          <div className="cta-row" style={{ marginTop: "0.85rem" }}>
            <Link className="btn" href="/setup">
              Open Setup guide
            </Link>
            <a className="btn btn-ghost" href={RELEASE_PAGE}>
              PC files on GitHub
            </a>
            <a className="btn btn-ghost" href={PI_RELEASE_PAGE}>
              Pi files on GitHub
            </a>
            <a className="btn btn-ghost" href={POCKET_REPO}>
              Pocket on GitHub
            </a>
            <a className="btn btn-ghost" href={CARDPUTER_REPO}>
              Cardputer on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
