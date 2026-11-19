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
          Files are <strong>.xz compressed</strong>. After download: decompress
          with <code className="mono">xz -d</code> (Linux/macOS) or 7-Zip
          (Windows), then flash the resulting <code className="mono">.img</code>{" "}
          with balenaEtcher or <code className="mono">dd</code>. Prefer{" "}
          <strong>i686</strong> for XP-era 32-bit PCs. Full steps:{" "}
          <Link href="/setup">Setup tutorial</Link>.
        </div>

        {ARTIFACTS.map((a) => (
          <div className="panel" key={a.arch}>
            <h3>{a.label}</h3>
            <p>{a.guidance}</p>
            <p>
              <strong>Download:</strong>{" "}
              <span className="mono">{a.downloadName}</span>
              <br />
              <strong>Size:</strong> {a.sizeLabel}
              <br />
              <strong>SHA256 (.xz):</strong>{" "}
              <span className="mono hash">{a.sha256xz}</span>
              <br />
              <strong>SHA256 (.img after decompress):</strong>{" "}
              <span className="mono hash">{a.sha256}</span>
            </p>
            <div className="cta-row" style={{ marginTop: "0.85rem" }}>
              <a className="btn" href={a.downloadUrl}>
                Download {a.arch}
              </a>
              <a className="btn btn-ghost" href={RELEASE_SHA256SUMS}>
                SHA256SUMS
              </a>
            </div>
          </div>
        ))}

        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <h3>Flash checklist</h3>
          <ol className="steps">
            <li>
              Download the <code className="mono">.img.xz</code> for your PC
              (i686 for XP-era 32-bit).
            </li>
            <li>
              Decompress:{" "}
              <code className="mono">xz -d portable-ai-os-*.img.xz</code> or
              extract with 7-Zip.
            </li>
            <li>
              Verify:{" "}
              <code className="mono">sha256sum -c SHA256SUMS</code> (raw{" "}
              <code className="mono">.img</code> lines after decompress).
            </li>
            <li>
              Flash with Etcher or{" "}
              <code className="mono">dd</code> — see{" "}
              <Link href="/setup">Setup</Link>.
            </li>
          </ol>
          <div className="cta-row" style={{ marginTop: "0.85rem" }}>
            <a className="btn btn-ghost" href={RELEASE_PAGE}>
              GitHub Release page
            </a>
            <a className="btn btn-ghost" href="/guides/usb-flash.md">
              Flash guide (markdown)
            </a>
            <a className="btn btn-ghost" href="/downloads/nexus-os-demo-package.tar.gz">
              Demo package (not bootable)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
