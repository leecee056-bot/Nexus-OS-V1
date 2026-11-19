import type { Metadata } from "next";
import Link from "next/link";
import {
  ARTIFACTS,
  BUILD_NOTE,
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
          <code className="mono">.img</code> with balenaEtcher. Prefer the{" "}
          <strong>32-bit / older PC</strong> build for XP-era machines. Step-by-step:{" "}
          <Link href="/setup">Setup guide</Link>.
        </div>

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
                Checksums file
              </a>
            </div>
          </div>
        ))}

        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <h3>After you download</h3>
          <ol className="steps">
            <li>Unpack the <code className="mono">.xz</code> → get a{" "}
              <code className="mono">.img</code>.</li>
            <li>
              Optional: verify with the checksums file (see{" "}
              <Link href="/setup">Setup</Link>).
            </li>
            <li>
              Flash the <code className="mono">.img</code> to a USB stick with
              Etcher (erases the stick).
            </li>
            <li>Restart the PC from USB — details in Setup.</li>
          </ol>
          <div className="cta-row" style={{ marginTop: "0.85rem" }}>
            <Link className="btn" href="/setup">
              Open Setup guide
            </Link>
            <a className="btn btn-ghost" href={RELEASE_PAGE}>
              All files on GitHub
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
