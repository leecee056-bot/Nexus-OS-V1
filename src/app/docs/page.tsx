import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Docs" };

export default function DocsPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>Docs</h2>
        <p className="lede">
          Start with Setup if you are putting NEXUS OS on a stick for the first
          time. Everything else is extra detail.
        </p>
        <ul className="docs-list">
          <li>
            <Link href="/setup">
              Setup guide (recommended)
              <small>
                Plain-English steps: download, unpack, flash, BIOS, first boot,
                troubleshooting
              </small>
            </Link>
          </li>
          <li>
            <Link href="/download">
              Download
              <small>64-bit and 32-bit USB images plus checksums</small>
            </Link>
          </li>
          <li>
            <a href="/guides/usb-flash.md">
              Short flash notes
              <small>Compact checklist for Etcher / dd</small>
            </a>
          </li>
          <li>
            <Link href="/features">
              What it can do
              <small>Honest list of apps on the stick vs Network coming soon</small>
            </Link>
          </li>
          <li>
            <Link href="/network">
              NEXUS Network
              <small>Reserve a future @user@nexus.network name (chat not live yet)</small>
            </Link>
          </li>
          <li>
            <a href="https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/v1.0.0-usb">
              GitHub Release v1.0.0-usb
              <small>Same image files the Download page links to</small>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
