import type { Metadata } from "next";
import Link from "next/link";
import {
  CARDPUTER_README,
  CARDPUTER_REPO,
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
          Start with Setup if you are putting Tri-Cass OS on a stick, microSD, or
          ESP32 Pocket for the first time. Everything else is extra detail.
        </p>

        <div className="docs-group">
          <h3>Getting started</h3>
          <ul className="docs-list">
            <li>
              <Link href="/about">
                About Tri-Cass OS
                <small>
                  What it is, use cases (including cyberdecks), minimum
                  requirements, jargon explained
                </small>
              </Link>
            </li>
            <li>
              <a href="/demo/">
                Interactive hub demo
                <small>
                  Browser tutorial of the terminal menu — Chat, Vault, Files,
                  and more (no download)
                </small>
              </a>
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
                  PC USB, Raspberry Pi microSD, and Tri-Cass Pocket (ESP32-S3)
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
                <small>PlatformIO upload + SPIFFS model for ESP32-S3 + PSRAM</small>
              </a>
            </li>
            <li>
              <a href="/guides/cardputer-flash.md">
                Cardputer ADV flash checklist
                <small>On-device hub for M5Stack Cardputer ADV (no PSRAM)</small>
              </a>
            </li>
            <li>
              <Link href="/faq#pocket">
                FAQ — Tri-Cass Pocket
                <small>What Pocket is vs the full USB/Pi hub</small>
              </Link>
            </li>
            <li>
              <Link href="/faq#cardputer">
                FAQ — Cardputer ADV
                <small>Why ADV needs its own firmware</small>
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
            <li>
              <Link href="/knowledge-packs">
                Optional Knowledge Packs
                <small>
                  Free public offline sources (Kiwix, Gutenberg) for USB / SD —
                  we do not host the large files
                </small>
              </Link>
            </li>
            <li>
              <a href="/guides/knowledge-packs.md">
                Knowledge packs short guide
                <small>Paths for PC/Pi Vault and Cardputer /tri-cass-vault</small>
              </a>
            </li>
            <li>
              <Link href="/download#companion">
                Windows · iOS · Android companion
                <small>
                  Secondary Expo app — Chat / Vault / Packs / Files; Android APK
                  sideload
                </small>
              </Link>
            </li>
            <li>
              <a href="/guides/companion-app.md">
                Companion app short guide
                <small>Build/run for Windows, iOS Expo, and Android</small>
              </a>
            </li>
            <li>
              <a href="/guides/android-apk.md">
                Android APK sideload
                <small>EAS preview APK, GitHub Releases hosting, install tips</small>
              </a>
            </li>
          </ul>
        </div>

        <div className="docs-group">
          <h3>Network (optional)</h3>
          <ul className="docs-list">
            <li>
              <Link href="/network">
                Tri-Cass Network
                <small>
                  Reserve a username (no password while chat is offline)
                </small>
              </Link>
            </li>
          </ul>
        </div>

        <div className="docs-group">
          <h3>Trust &amp; hardware</h3>
          <ul className="docs-list">
            <li>
              <Link href="/compat">
                Hardware compatibility
                <small>
                  Honest v1 matrix — BIOS vs UEFI, Pi, Pocket, planned work
                </small>
              </Link>
            </li>
            <li>
              <a href="/guides/sources.md">
                Source / GPL note
                <small>
                  MIT product code vs GPL image components; SBOM pointers
                </small>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/leecee056-bot/Nexus-OS-V1/tree/main/portable-ai-os"
                rel="noopener noreferrer"
              >
                Image build tree
                <small>
                  portable-ai-os/ scripts, hub, SBOM (not the .img blobs)
                </small>
              </a>
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
                Tri-Cass Pocket — ESP32-S3 (v0.1.0)
                <small>Firmware source in nexus-esp32/ (PlatformIO)</small>
              </a>
            </li>
            <li>
              <a href={POCKET_README}>
                Pocket README
                <small>Hardware notes, fetch_model, Serial hub commands</small>
              </a>
            </li>
            <li>
              <a href={CARDPUTER_REPO}>
                Tri-Cass Cardputer ADV — v0.2.0
                <small>Firmware source in nexus-cardputer/ (PlatformIO)</small>
              </a>
            </li>
            <li>
              <a href={CARDPUTER_README}>
                Cardputer ADV README
                <small>TinyChat, optional SD Vault, keyboard hub</small>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
