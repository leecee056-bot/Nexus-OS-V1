import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hardware compatibility",
  description:
    "Honest Tri-Cass OS v1 hardware matrix — BIOS vs UEFI, RAM floors, Pi, Pocket, and what is planned next.",
};

export default function CompatPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>Hardware compatibility (honest)</h2>
        <p className="lede">
          What Tri-Cass OS <strong>v1</strong> actually runs on today — and what
          is still planned. Prefer this page over marketing shorthand.
        </p>

        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          Key: <strong>Works now</strong> · <strong>Works with steps</strong> ·{" "}
          <strong>Planned</strong> · <strong>Not v1</strong>. Speeds and old-PC
          CPU coverage improve with later image work (all-CPU llama.cpp, UEFI +
          Secure Boot).
        </div>

        <nav className="jump-chips" aria-label="On this page">
          <a href="#summary">Summary</a>
          <a href="#pc">PC USB</a>
          <a href="#pi">Raspberry Pi</a>
          <a href="#pocket">Pocket / Cardputer</a>
          <a href="#companion">Companion apps</a>
          <a href="#planned">Planned</a>
          <Link href="/download">Download</Link>
          <Link href="/setup">Setup</Link>
        </nav>

        <div className="panel" id="summary" style={{ marginTop: "1.5rem" }}>
          <h3>Short answer</h3>
          <ul className="feature-list">
            <li>
              <strong>Best fit today</strong>
              <span>
                PCs that can boot USB in <strong>legacy / BIOS (CSM)</strong>{" "}
                mode, about <strong>2 GB+ RAM</strong>, matching 32-bit or
                64-bit image. Raspberry Pi <strong>4</strong> (2 GB+; 4 GB+
                nicer). Companion apps on a normal desktop/phone with Ollama.
              </span>
            </li>
            <li>
              <strong>Hard today</strong>
              <span>
                Many <strong>post-2020 UEFI-only</strong> PCs (no CSM) — v1 has
                no signed UEFI bootloader yet. Turning Secure Boot off does{" "}
                <em>not</em> help if there is nothing UEFI to start.
              </span>
            </li>
            <li>
              <strong>Partial / careful</strong>
              <span>
                Very old 64-bit towers may hit a <strong>SSE4.2-oriented</strong>{" "}
                llama.cpp build; i686 image is for true 32-bit / XP-era boxes.
                Pi 5 is best-effort on the current image.
              </span>
            </li>
          </ul>
        </div>

        <h3 className="subhead" id="pc" style={{ marginTop: "2rem" }}>
          PC USB stick (v1 images)
        </h3>
        <div className="panel">
          <table className="compat-table">
            <thead>
              <tr>
                <th>Machine</th>
                <th>Boot</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2008–2019 PC with CSM / legacy USB</td>
                <td>BIOS / Legacy</td>
                <td>Works now</td>
                <td>Primary v1 path. Use boot menu → USB.</td>
              </tr>
              <tr>
                <td>Modern PC with CSM still enabled</td>
                <td>Legacy USB</td>
                <td>Works with steps</td>
                <td>
                  Enable CSM/legacy USB if available. Secure Boot off only as
                  last resort for unsigned v1.
                </td>
              </tr>
              <tr>
                <td>UEFI-only (no CSM), Secure Boot on</td>
                <td>UEFI</td>
                <td>Not v1</td>
                <td>Needs signed shim/GRUB — planned HAP-64.</td>
              </tr>
              <tr>
                <td>True 32-bit / XP-era</td>
                <td>BIOS</td>
                <td>Works with steps</td>
                <td>Use <span className="mono">i686</span> image.</td>
              </tr>
              <tr>
                <td>Old 64-bit without SSE4.2</td>
                <td>BIOS</td>
                <td>Partial</td>
                <td>
                  Stick may boot; chat may fail until all-CPU llama.cpp
                  (HAP-65).
                </td>
              </tr>
              <tr>
                <td>~1–2 GB free RAM</td>
                <td>—</td>
                <td>Works with steps</td>
                <td>Small bundled model only; keep other apps closed.</td>
              </tr>
              <tr>
                <td>4 GB+ RAM</td>
                <td>—</td>
                <td>Works now</td>
                <td>Comfortable for starter chat + Vault.</td>
              </tr>
              <tr>
                <td>Apple Silicon Mac</td>
                <td>USB boot</td>
                <td>Not v1</td>
                <td>Use Companion + Ollama on macOS instead.</td>
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: "0.75rem", color: "var(--fg-dim)" }}>
            Common one-time boot keys: Esc, F10, F12, F9, F2 (brand-specific).
            Full flash steps: <Link href="/setup">Setup</Link>.
          </p>
        </div>

        <h3 className="subhead" id="pi" style={{ marginTop: "2rem" }}>
          Raspberry Pi
        </h3>
        <div className="panel">
          <table className="compat-table">
            <thead>
              <tr>
                <th>Board</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pi 4 (2 GB+)</td>
                <td>Works now</td>
                <td>Primary Pi target. 4 GB+ preferred for chat comfort.</td>
              </tr>
              <tr>
                <td>Pi 5 / CM5</td>
                <td>Best-effort</td>
                <td>May need later kernel/DT updates; not the v1 focus.</td>
              </tr>
              <tr>
                <td>Pi 3 / Zero</td>
                <td>Not v1</td>
                <td>Too tight for the current image + model path.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="subhead" id="pocket" style={{ marginTop: "2rem" }}>
          Tri-Cass Pocket &amp; Cardputer
        </h3>
        <div className="panel">
          <table className="compat-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ESP32-S3 Pocket (PSRAM)</td>
                <td>Works now</td>
                <td>
                  Firmware via PlatformIO / Serial — not a PC USB boot image.
                  Tiny on-device model; honest “toy chat” limits.
                </td>
              </tr>
              <tr>
                <td>Cardputer ADV</td>
                <td>Works now</td>
                <td>
                  Firmware + optional microSD Vault (
                  <span className="mono">/tri-cass-vault/</span>).
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="subhead" id="companion" style={{ marginTop: "2rem" }}>
          Companion apps (no USB boot)
        </h3>
        <div className="panel">
          <p>
            Windows / Mac / Android / web Companion talks to{" "}
            <strong>local Ollama</strong> (or a tiny fallback). Hardware floor
            is “whatever runs your OS + a small model” — typically{" "}
            <strong>~1.5B and under</strong> for agent + coding-pack workflows.
            USB kit carries Vault/Files; it does not replace the bootable OS
            image.
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            Android TV and Kodi paths are queued separately (HAP-60 / HAP-61).
          </p>
        </div>

        <h3 className="subhead" id="planned" style={{ marginTop: "2rem" }}>
          Planned (not in v1 images yet)
        </h3>
        <div className="panel">
          <ul className="feature-list">
            <li>
              <strong>UEFI + Secure Boot on</strong>
              <span>Dual-signed shim; keep BIOS path (HAP-64).</span>
            </li>
            <li>
              <strong>All-CPU llama.cpp variants</strong>
              <span>Drop SSE4.2-only floor for older 64-bit PCs (HAP-65).</span>
            </li>
            <li>
              <strong>RAM-based model ladder</strong>
              <span>Pick model + threads from free RAM at first boot (HAP-66).</span>
            </li>
            <li>
              <strong>Signed offline updates</strong>
              <span>Sneakernet-friendly bundles + rollback (HAP-68).</span>
            </li>
          </ul>
          <p style={{ marginTop: "0.75rem" }}>
            Build scripts + SBOM for current images:{" "}
            <a
              href="https://github.com/leecee056-bot/Nexus-OS-V1/tree/main/portable-ai-os"
              rel="noopener noreferrer"
            >
              portable-ai-os/
            </a>{" "}
            · <Link href="/guides/sources.md">Source / GPL note</Link>.
          </p>
        </div>

        <div className="cta-row" style={{ marginTop: "2rem" }}>
          <Link className="btn" href="/download">
            Download
          </Link>
          <Link className="btn btn-ghost" href="/setup">
            Setup
          </Link>
          <Link className="btn btn-quiet" href="/faq#secure-boot">
            Boot FAQ
          </Link>
        </div>
      </div>
    </section>
  );
}
