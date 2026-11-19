import type { Metadata } from "next";
import Link from "next/link";
import { ARTIFACTS, BUILD_NOTE } from "@/lib/artifacts";

export const metadata: Metadata = { title: "Download" };

export default function DownloadPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>Download NEXUS OS</h2>
        <p className="lede">{BUILD_NOTE}</p>

        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          Full USB images (~3 GiB each) live on the image-builder host at{" "}
          <code className="mono">/agent/portable-ai-os-images/</code>. This site
          hosts checksums, artifact metadata, flash docs, and a small demo
          package you can download now.
        </div>

        {ARTIFACTS.map((a) => (
          <div className="panel" key={a.arch}>
            <h3>{a.label}</h3>
            <p>{a.guidance}</p>
            <p>
              <strong>File:</strong> <span className="mono">{a.filename}</span>
              <br />
              <strong>Size:</strong> {a.sizeLabel} ({a.sizeBytes.toLocaleString()}{" "}
              bytes)
              <br />
              <strong>SHA256:</strong>{" "}
              <span className="mono hash">{a.sha256}</span>
            </p>
            <p className="hint" style={{ color: "var(--fg-dim)" }}>
              Builder path: <span className="mono">{a.builderPath}</span>
            </p>
            <div className="cta-row" style={{ marginTop: "0.85rem" }}>
              <a className="btn btn-ghost" href={`/downloads/ARTIFACT-${a.arch}.txt`}>
                Artifact metadata
              </a>
              <a className="btn btn-ghost" href="/downloads/SHA256SUMS">
                SHA256SUMS
              </a>
            </div>
          </div>
        ))}

        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <h3>Get the image from the builder</h3>
          <ol className="steps">
            <li>
              Ask the NEXUS image builder / release channel for{" "}
              <code className="mono">portable-ai-os-x86_64.img</code> or{" "}
              <code className="mono">portable-ai-os-i686.img</code>.
            </li>
            <li>
              Verify:{" "}
              <code className="mono">
                sha256sum -c SHA256SUMS
              </code>{" "}
              using the sums from this page.
            </li>
            <li>
              Flash with dd or balenaEtcher — see the{" "}
              <Link href="/setup">Setup tutorial</Link>.
            </li>
          </ol>
        </div>

        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <h3>Demo package (available now)</h3>
          <p>
            Small sample bundle: checksums, flash guide, hub smoke frame text, and
            PXG sample art. Not a bootable image — use it to verify your download
            pipeline and learn the flash steps.
          </p>
          <div className="cta-row" style={{ marginTop: "0.85rem" }}>
            <a className="btn" href="/downloads/nexus-os-demo-package.tar.gz">
              Download demo package
            </a>
            <a className="btn btn-ghost" href="/guides/usb-flash.md">
              Flash guide (markdown)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
