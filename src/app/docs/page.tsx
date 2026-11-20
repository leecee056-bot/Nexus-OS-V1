import type { Metadata } from "next";
import Link from "next/link";
import {
  PI_RELEASE_PAGE,
  POCKET_README,
  POCKET_REPO,
  RELEASE_PAGE,
} from "@/lib/artifacts";

export const metadata: Metadata = { title: "Docs" };

export default function DocsPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>Docs</h2>
        <p className="lede">
          Start with Setup if you are putting NEXUS OS on a stick, microSD, or
          ESP32 Pocket for the first time. Everything else is extra detail.
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
                  Download, unpack, checksum, Etcher, PC BIOS or Pi boot, Pocket
                  PlatformIO flash, troubleshooting
                </small>
              </Link>
            </li>
            <li>
              <Link href="/download">
                Download
                <small>
                  PC USB, Raspberry Pi microSD, and NEXUS Pocket (ESP32-S3)
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
                Short flash notes (USB / Pi)
                <small>Compact checklist for Etcher / dd</small>
              </a>
            </li>
            <li>
              <a href="/guides/pocket-flash.md">
                Pocket flash checklist
                <small>PlatformIO upload + SPIFFS model for ESP32-S3</small>
              </a>
            </li>
            <li>
              <Link href="/faq#pocket">
                FAQ — NEXUS Pocket
                <small>What Pocket is vs the full USB/Pi hub</small>
              </Link>
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
            <li>
              <a href={POCKET_REPO}>
                NEXUS Pocket — ESP32-S3 (v0.1.0)
                <small>Firmware source in nexus-esp32/ (PlatformIO)</small>
              </a>
            </li>
            <li>
              <a href={POCKET_README}>
                Pocket README
                <small>Hardware notes, fetch_model, Serial hub commands</small>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
