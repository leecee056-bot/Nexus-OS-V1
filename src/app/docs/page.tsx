import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Docs" };

export default function DocsPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>Docs</h2>
        <p className="lede">
          Short links into flash and product documentation mirrored with this
          site.
        </p>
        <ul className="docs-list">
          <li>
            <a href="/guides/usb-flash.md">
              USB flash guide
              <small>dd / Etcher, BIOS, first-boot, partitions</small>
            </a>
          </li>
          <li>
            <Link href="/setup">
              Setup tutorial
              <small>Step-by-step with screenshots and checksums</small>
            </Link>
          </li>
          <li>
            <Link href="/download">
              Download &amp; checksums
              <small>x86_64 vs i686, SHA256, builder paths</small>
            </Link>
          </li>
          <li>
            <Link href="/features">
              Features (honest)
              <small>What works today vs Network coming soon</small>
            </Link>
          </li>
          <li>
            <Link href="/network">
              NEXUS Network
              <small>XMPP vision + reserve your @user@nexus.network</small>
            </Link>
          </li>
          <li>
            <a href="/downloads/SHA256SUMS">
              SHA256SUMS
              <small>Image digests for release verification</small>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
