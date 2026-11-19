import type { Metadata } from "next";
import Link from "next/link";
import { PI_RELEASE_PAGE, RELEASE_PAGE } from "@/lib/artifacts";

export const metadata: Metadata = { title: "Docs" };

export default function DocsPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>Docs</h2>
        <p className="lede">
          Start with Setup if you are putting NEXUS OS on a stick or microSD for
          the first time. Everything else is extra detail.
        </p>

        <div className="docs-group">
          <h3>Getting started</h3>
          <ul className="docs-list">
            <li>
              <Link href="/about">
                About NEXUS OS
                <small>
                  What it is, use cases (including cyberdecks), minimum
                  requirements, jargon explained
                </small>
              </Link>
            </li>
            <li>
              <Link href="/setup">
                Setup guide (recommended)
                <small>
                  Download, unpack, checksum, Etcher, PC BIOS or Pi boot,
                  troubleshooting
                </small>
              </Link>
            </li>
            <li>
              <Link href="/download">
                Download
                <small>
                  PC USB images (32-bit and 64-bit) and Raspberry Pi microSD image
                </small>
              </Link>
            </li>
          </ul>
        </div>

        <div className="docs-group">
          <h3>Guides</h3>
          <ul className="docs-list">
            <li>
              <a href="/guides/usb-flash.md">
                Short flash notes
                <small>Compact checklist for Etcher / dd</small>
              </a>
            </li>
            <li>
              <Link href="/features">
                What it can do
                <small>Honest list of apps vs Network coming soon</small>
              </Link>
            </li>
            <li>
              <Link href="/faq#vault">
                Knowledge Vault starter pack
                <small>
                  On-device guide, glossary, and how-tos — not a full wiki
                </small>
              </Link>
            </li>
          </ul>
        </div>

        <div className="docs-group">
          <h3>Network (optional)</h3>
          <ul className="docs-list">
            <li>
              <Link href="/network">
                NEXUS Network
                <small>
                  Reserve a future username — chat rooms not live yet
                </small>
              </Link>
            </li>
          </ul>
        </div>

        <div className="docs-group">
          <h3>GitHub Releases</h3>
          <ul className="docs-list">
            <li>
              <a href={RELEASE_PAGE}>
                PC USB — v1.0.1-usb
                <small>
                  x86_64 and i686 compressed images (Vault starter pack)
                </small>
              </a>
            </li>
            <li>
              <a href={PI_RELEASE_PAGE}>
                Raspberry Pi — v1.0.1-pi
                <small>
                  aarch64 microSD image (Pi 4 primary; Vault starter pack)
                </small>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
