import type { Metadata } from "next";
import Link from "next/link";
import {
  ARTIFACTS,
  BUILD_NOTE,
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
          <strong>Pocket (ESP32):</strong> clone the firmware and flash with
          PlatformIO — see Setup. Full steps:{" "}
          <Link href="/setup">Setup guide</Link>.
        </div>

        <h3 className="subhead">1. Choose your machine</h3>
        <p className="lede" style={{ marginBottom: "1rem" }}>
          Not sure? Old XP-era PC → 32-bit. Normal modern PC → 64-bit. Raspberry
          Pi / cyberdeck → Pi image (Pi 4 first). Tiny board companion → NEXUS
          Pocket (ESP32-S3).
        </p>
        <nav className="jump-chips" aria-label="Jump to a build">
          <a href="#pc">PC USB</a>
          <a href="#pi">Raspberry Pi</a>
          <a href="#pocket">Pocket ESP32</a>
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
          </div>
        </div>
      </div>
    </section>
  );
}
