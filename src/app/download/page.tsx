import type { Metadata } from "next";
import Link from "next/link";
import {
  ARTIFACTS,
  BUILD_NOTE,
  PI_ARTIFACTS,
  PI_RELEASE_PAGE,
  PI_RELEASE_SHA256SUMS,
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
          These files are <strong>compressed</strong> (
          <code className="mono">.img.xz</code>). Unpack them first (7-Zip on
          Windows, or <code className="mono">xz -d</code>), then flash the{" "}
          <code className="mono">.img</code> with balenaEtcher.{" "}
          <strong>PC builds</strong> go on a USB stick; the{" "}
          <strong>Pi build</strong> goes on a <strong>microSD card</strong>.
          Prefer the <strong>32-bit / older PC</strong> build for XP-era
          machines. Step-by-step: <Link href="/setup">Setup guide</Link>.
        </div>

        <h3 className="subhead">PC (USB stick)</h3>
        {ARTIFACTS.map((a) => (
          <div className="panel" key={a.arch}>
            <h3>{a.label}</h3>
            <p>{a.guidance}</p>
            <p>
              <strong>File:</strong> <span className="mono">{a.downloadName}</span>
              <br />
              <strong>Size:</strong> {a.sizeLabel}
              <br />
              <strong>Checksum (.xz):</strong>{" "}
              <span className="mono hash">{a.sha256xz}</span>
              <br />
              <strong>Checksum (.img after unpack):</strong>{" "}
              <span className="mono hash">{a.sha256}</span>
            </p>
            <div className="cta-row" style={{ marginTop: "0.85rem" }}>
              <a className="btn" href={a.downloadUrl}>
                Download {a.label}
              </a>
              <a className="btn btn-ghost" href={RELEASE_SHA256SUMS}>
                PC checksums
              </a>
            </div>
          </div>
        ))}

        <h3 className="subhead" style={{ marginTop: "2rem" }}>
          Raspberry Pi (microSD)
        </h3>
        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          <strong>Pi 4 is the primary target.</strong> The same image may boot
          on Pi 5, but that is best-effort for now (firmware / device-tree
          caveat). Use a microSD card — not a USB stick — for Raspberry Pi.
        </div>
        {PI_ARTIFACTS.map((a) => (
          <div className="panel" key={a.arch}>
            <h3>{a.label}</h3>
            <p>{a.guidance}</p>
            <p>
              <strong>File:</strong> <span className="mono">{a.downloadName}</span>
              <br />
              <strong>Size:</strong> {a.sizeLabel}
              <br />
              <strong>Checksum (.xz):</strong>{" "}
              <span className="mono hash">{a.sha256xz}</span>
              <br />
              <strong>Checksum (.img after unpack):</strong>{" "}
              <span className="mono hash">{a.sha256}</span>
            </p>
            <div className="cta-row" style={{ marginTop: "0.85rem" }}>
              <a className="btn" href={a.downloadUrl}>
                Download Raspberry Pi image
              </a>
              <a className="btn btn-ghost" href={PI_RELEASE_SHA256SUMS}>
                Pi checksums
              </a>
            </div>
          </div>
        ))}

        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <h3>After you download</h3>
          <ol className="steps">
            <li>
              Unpack the <code className="mono">.xz</code> → get a{" "}
              <code className="mono">.img</code> (7-Zip on Windows).
            </li>
            <li>
              Optional Windows check — PowerShell (PC example):
              <pre className="panel mono" style={{ overflow: "auto", marginTop: "0.5rem" }}>
{`Get-FileHash .\\portable-ai-os-i686.img -Algorithm SHA256`}
              </pre>
              For Pi, hash{" "}
              <code className="mono">portable-ai-os-aarch64.img</code> the same
              way. Match against SHA256SUMS (full steps in{" "}
              <Link href="/setup">Setup</Link>).
            </li>
            <li>
              Flash the <code className="mono">.img</code> with Etcher:{" "}
              <strong>USB stick</strong> for PC builds,{" "}
              <strong>microSD card</strong> for Pi (erases the media).
            </li>
            <li>
              Boot the PC from USB, or insert the card and power the Pi — details
              in Setup.
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
            <a className="btn btn-ghost" href="/guides/usb-flash.md">
              Short flash notes
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
