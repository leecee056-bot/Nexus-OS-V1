import type { Metadata } from "next";
import Link from "next/link";
import {
  ARTIFACTS,
  BUILD_NOTE,
  CARDPUTER_ARTIFACTS,
  CARDPUTER_README,
  CARDPUTER_REPO,
  CARDPUTER_VERSION,
  COMPANION_ANDROID_NOTES,
  COMPANION_ANDROID_URL,
  COMPANION_MAC_ARM64_URL,
  COMPANION_MAC_X64_URL,
  COMPANION_RELEASE_PAGE,
  COMPANION_USB_URL,
  COMPANION_VERSION,
  COMPANION_WEB_URL,
  COMPANION_WINDOWS_PORTABLE_URL,
  COMPANION_WINDOWS_URL,
  DESK_ARTIFACTS,
  DESK_RELEASE_PAGE,
  DESK_RELEASES_LATEST,
  DESK_REPO_URL,
  DESK_VERSION,
  TRI_CASS_AI_RELEASE_PAGE,
  TRI_CASS_AI_VERSION,
  TRI_CASS_AI_WINDOWS_PORTABLE_SIZE_LABEL,
  TRI_CASS_AI_WINDOWS_PORTABLE_URL,
  PI_ARTIFACTS,
  PI_RELEASE_PAGE,
  PI_RELEASE_SHA256SUMS,
  POCKET_ARTIFACTS,
  POCKET_README,
  POCKET_REPO,
  POCKET_VERSION,
  RELEASE_PAGE,
  RELEASE_SHA256SUMS,
} from "@/lib/artifacts";

export const metadata: Metadata = { title: "Download" };

export default function DownloadPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>Download Tri-Cass OS</h2>
        <p className="lede">{BUILD_NOTE}</p>

        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          <strong>PC / Pi:</strong> files end in{" "}
          <code className="mono">.img.xz</code> — unpack first, then flash the{" "}
          <code className="mono">.img</code> with balenaEtcher (
          <strong>USB stick</strong> for PC, <strong>microSD</strong> for Pi).{" "}
          <strong>Pocket / Cardputer:</strong> clone firmware and flash with
          PlatformIO — see Setup. Full steps:{" "}
          <Link href="/setup">Setup guide</Link>. Will it boot on your PC?{" "}
          <Link href="/compat">Hardware compatibility</Link> (honest v1 matrix).
        </div>

        <h3 className="subhead">1. Choose your machine</h3>
        <p className="lede" style={{ marginBottom: "1rem" }}>
          Not sure? Old XP-era PC → 32-bit. Normal modern PC → 64-bit. Raspberry
          Pi / cyberdeck → Pi image (Pi 4 first). ESP32 with PSRAM → Pocket.
          M5Stack Cardputer ADV → Cardputer firmware (no PSRAM).
        </p>
        <nav className="jump-chips" aria-label="Jump to a build">
          <a href="#pc">PC USB</a>
          <a href="#pi">Raspberry Pi</a>
          <a href="#pocket">Pocket ESP32</a>
          <a href="#cardputer">Cardputer ADV</a>
          <a href="#knowledge-packs">Knowledge packs</a>
          <a href="#tri-cass-ai">Tri Cass AI</a>
          <a href="#companion">Companion app</a>
          <a href="#desk">Tri-Cass Desk</a>
          <a href="#companion-usb">Companion USB kit</a>
        </nav>

        <h3 className="subhead" id="pc">
          PC (USB stick)
        </h3>
        {ARTIFACTS.map((a) => (
          <div className="panel" key={a.arch}>
            <h3>{a.label}</h3>
            <p>{a.guidance}</p>
            <p>
              <strong>File:</strong> <span className="mono">{a.downloadName}</span>
              <br />
              <strong>Size:</strong> {a.sizeLabel}
            </p>
            <div className="cta-row" style={{ marginTop: "0.85rem" }}>
              <a className="btn" href={a.downloadUrl}>
                Download {a.label}
              </a>
              <a className="btn btn-ghost" href={RELEASE_SHA256SUMS}>
                View SHA256 checksums
              </a>
            </div>
            <details className="verify-block">
              <summary>Verify this download (optional)</summary>
              <p>
                <strong>Checksum (.xz):</strong>{" "}
                <span className="mono hash">{a.sha256xz}</span>
                <br />
                <strong>Checksum (.img after unpack):</strong>{" "}
                <span className="mono hash">{a.sha256}</span>
              </p>
              <p style={{ marginTop: "0.5rem" }}>
                Windows PowerShell after unpack:{" "}
                <code className="mono">
                  Get-FileHash .\\{a.filename} -Algorithm SHA256
                </code>
              </p>
            </details>
          </div>
        ))}

        <h3 className="subhead" id="pi" style={{ marginTop: "2rem" }}>
          Raspberry Pi / cyberdeck (microSD)
        </h3>
        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          <strong>One aarch64 image for Pi 4 and Pi 5</strong> — including DIY
          cyberdecks and portable Pi kits. Pi 4 (2 GB+) is the well-tested sweet
          spot; Pi 5 uses the same file. Use a <strong>microSD card</strong>, not
          a USB stick.
        </div>
        {PI_ARTIFACTS.map((a) => (
          <div className="panel" key={a.arch}>
            <h3>{a.label}</h3>
            <p>{a.guidance}</p>
            <p>
              <strong>File:</strong> <span className="mono">{a.downloadName}</span>
              <br />
              <strong>Size:</strong> {a.sizeLabel}
            </p>
            <div className="cta-row" style={{ marginTop: "0.85rem" }}>
              <a className="btn" href={a.downloadUrl}>
                Download Raspberry Pi image
              </a>
              <a className="btn btn-ghost" href={PI_RELEASE_SHA256SUMS}>
                View SHA256 checksums
              </a>
            </div>
            <details className="verify-block">
              <summary>Verify this download (optional)</summary>
              <p>
                <strong>Checksum (.xz):</strong>{" "}
                <span className="mono hash">{a.sha256xz}</span>
                <br />
                <strong>Checksum (.img after unpack):</strong>{" "}
                <span className="mono hash">{a.sha256}</span>
              </p>
              <p style={{ marginTop: "0.5rem" }}>
                Windows PowerShell after unpack:{" "}
                <code className="mono">
                  Get-FileHash .\\{a.filename} -Algorithm SHA256
                </code>
              </p>
            </details>
          </div>
        ))}

        <h3 className="subhead" id="pocket" style={{ marginTop: "2rem" }}>
          Tri-Cass Pocket (ESP32-S3)
        </h3>
        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          Pocket is a <strong>USB-Serial</strong> offline tiny-ML companion — not
          a disk image. You flash firmware with PlatformIO, then upload a small
          TinyStories model to the board. Needs an ESP32-S3 with PSRAM.
        </div>
        {POCKET_ARTIFACTS.map((a) => (
          <div className="panel" key={a.arch}>
            <h3>
              {a.label}{" "}
              <span className="mono" style={{ fontWeight: 400, fontSize: "0.9em" }}>
                v{POCKET_VERSION}
              </span>
            </h3>
            <p>{a.guidance}</p>
            <p>
              <strong>Source:</strong> <span className="mono">{a.filename}/</span> in
              the GitHub repo
              <br />
              <strong>Size:</strong> {a.sizeLabel}
            </p>
            <div className="cta-row" style={{ marginTop: "0.85rem" }}>
              <a className="btn" href={POCKET_REPO}>
                Open Pocket firmware
              </a>
              <a className="btn btn-ghost" href={POCKET_README}>
                README on GitHub
              </a>
              <Link className="btn btn-quiet" href="/setup#pocket">
                Pocket setup steps
              </Link>
            </div>
          </div>
        ))}

        <h3 className="subhead" id="cardputer" style={{ marginTop: "2rem" }}>
          Tri-Cass Cardputer ADV
        </h3>
        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          Dedicated firmware for the <strong>M5Stack Cardputer ADV</strong>{" "}
          (ESP32-S3FN8, 8 MB flash, <strong>no PSRAM</strong>, 240×135 +
          keyboard). It cannot run USB/Pi images or Pocket’s stories260K model —
          Chat is TinyChat (flash corpus). Optional{" "}
          <strong>Knowledge Vault</strong> on microSD (
          <code className="mono">/tri-cass-vault</code>) — no card required.
        </div>
        {CARDPUTER_ARTIFACTS.map((a) => (
          <div className="panel" key={a.arch}>
            <h3>
              {a.label}{" "}
              <span className="mono" style={{ fontWeight: 400, fontSize: "0.9em" }}>
                v{CARDPUTER_VERSION}
              </span>
            </h3>
            <p>{a.guidance}</p>
            <p>
              <strong>Source:</strong> <span className="mono">{a.filename}/</span> in
              the GitHub repo
              <br />
              <strong>Size:</strong> {a.sizeLabel}
            </p>
            <div className="cta-row" style={{ marginTop: "0.85rem" }}>
              <a className="btn" href={CARDPUTER_REPO}>
                Open Cardputer firmware
              </a>
              <a className="btn btn-ghost" href={CARDPUTER_README}>
                README on GitHub
              </a>
              <Link className="btn btn-quiet" href="/setup#cardputer">
                Cardputer setup steps
              </Link>
            </div>
          </div>
        ))}

        <div className="panel" id="tri-cass-ai" style={{ marginTop: "1.5rem" }}>
          <h3>
            Tri Cass AI — local coder that builds on disk (v{TRI_CASS_AI_VERSION})
          </h3>
          <p>
            <strong>Tri Cass AI</strong> is a standalone Windows app: chat with
            local models, then create websites and apps as real folders and files
            on your PC — no coding required. Template library (~1000), knowledge
            base, ASCII &amp; image tools, Android scaffolds, and glass
            Appearance. Separate from Desk and the USB hub. Needs{" "}
            <a href="https://ollama.com/download">Ollama</a> (~8&nbsp;GB RAM
            household PC).
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            v{TRI_CASS_AI_VERSION} ships as a Windows x64 portable zip (
            {TRI_CASS_AI_WINDOWS_PORTABLE_SIZE_LABEL}) — New chat / rename /
            save, coherent scaffolds, template pick, create-on-disk verify,
            Plan/Act, checkpoints, KB, and run panel. Unzip and run{" "}
            <code className="mono">Tri Cass AI.exe</code>.
          </p>
          <div className="cta-row" style={{ marginTop: "0.85rem" }}>
            <a className="btn" href={TRI_CASS_AI_WINDOWS_PORTABLE_URL}>
              Download Windows portable ({TRI_CASS_AI_WINDOWS_PORTABLE_SIZE_LABEL})
            </a>
            <Link className="btn btn-ghost" href="/tri-cass-ai">
              Tri Cass AI product page
            </Link>
            <a className="btn btn-quiet" href={TRI_CASS_AI_RELEASE_PAGE}>
              Release notes
            </a>
          </div>
        </div>

        <div className="panel" id="companion" style={{ marginTop: "1.5rem" }}>
          <h3>
            Companion apps (Windows · Mac · Android) — v{COMPANION_VERSION}
          </h3>
          <p>
            <strong>Tri-Cass Companion</strong> is a normal app with real{" "}
            <strong>local AI Chat</strong>: pick a lightweight model (Qwen,
            TinyLlama, and more), download it once via{" "}
            <a href="https://ollama.com/download">Ollama</a>, then chat offline.
            The <strong>downloadable release is v{COMPANION_VERSION}</strong>{" "}
            (Windows setup + portable, Mac arm64/x64 <code className="mono">.dmg</code>,
            Android APK, USB kit, web). It includes local Chat via Ollama, Vault,
            Packs, Files, Agent mode, themes, and desktop extras in that build.
            Newer hub features that landed in source after v{COMPANION_VERSION}{" "}
            (for example latest chat chrome / Pocket Agent scaffolds) ship in the{" "}
            <strong>next Companion release</strong> and on the web build when
            republished — not automatically in older installers.
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            <strong>Windows:</strong> use the{" "}
            <code className="mono">0.12.2-setup.exe</code> installer (Desktop +
            Start Menu shortcuts). Delete any older{" "}
            <code className="mono">0.12.0</code>/<code className="mono">0.12.1</code>{" "}
            portable files first — those crash with a missing{" "}
            <code className="mono">browsers</code> module. Portable{" "}
            <code className="mono">.exe</code> is also available.{" "}
            <strong>Mac:</strong> pick Apple Silicon or Intel{" "}
            <code className="mono">.dmg</code> below. <strong>Web:</strong> open
            instantly. <strong>Android:</strong> sideload APK — point Chat at
            Ollama on your PC if needed. Not on the App Store / Play Store yet.
          </p>
          <div className="cta-row" style={{ marginTop: "0.85rem" }}>
            <a className="btn" href={COMPANION_WINDOWS_URL}>
              Download Windows setup (.exe)
            </a>
            <a className="btn btn-ghost" href={COMPANION_WINDOWS_PORTABLE_URL}>
              Windows portable (.exe)
            </a>
            <a className="btn" href={COMPANION_MAC_ARM64_URL}>
              Download Mac Apple Silicon (.dmg)
            </a>
            <a className="btn btn-ghost" href={COMPANION_MAC_X64_URL}>
              Download Mac Intel (.dmg)
            </a>
            <a className="btn" href={COMPANION_USB_URL}>
              Download USB kit (.zip)
            </a>
            <a className="btn" href={COMPANION_ANDROID_URL}>
              Download Android (.apk)
            </a>
            <a className="btn" href={COMPANION_WEB_URL}>
              Open web companion
            </a>
            <a className="btn btn-ghost" href={COMPANION_RELEASE_PAGE}>
              All companion releases
            </a>
            <a className="btn btn-quiet" href={COMPANION_ANDROID_NOTES}>
              Android sideload notes
            </a>
            <a className="btn btn-quiet" href="/guides/companion-app.md">
              Local AI + build notes
            </a>
            <a className="btn btn-quiet" href="/guides/companion-usb.md">
              USB portable kit
            </a>
            <a className="btn btn-quiet" href="/guides/companion-agent.md">
              Agent + Add-ons
            </a>
          </div>
        </div>

        <div className="panel" id="desk" style={{ marginTop: "1.5rem" }}>
          <h3>Tri-Cass Desk — living desktop + offline AI (v{DESK_VERSION})</h3>
          <p>
            <strong>Tri-Cass Desk</strong> is the living desktop companion:
            frosted glass windows, Monaco editor, local{" "}
            <strong>Ollama chat</strong>, and{" "}
            <strong>Agents that can inspect / plan / build code</strong>{" "}
            (Cline-slim loop) — all on your machine. Knowledge Vault, Notes, and
            an Earthbound world driven by <em>machine</em> telemetry (not outdoor
            weather APIs). Install, launch <strong>Tri-Cass OS · Desk</strong>,
            then point it at{" "}
            <a href="https://ollama.com/download">Ollama</a> for chat and coding.
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            v{DESK_VERSION} ships for Windows (x64 + ia32 setup/portable), Linux
            x64 (AppImage + .deb), Raspberry Pi / arm64 AppImage, and an Android
            / Android TV sideload APK. Source:{" "}
            <a href={DESK_REPO_URL}>Tri-Cass-Desk</a>.
          </p>
          <div className="req-grid" style={{ marginTop: "1rem" }}>
            {DESK_ARTIFACTS.map((a) => (
              <div className="panel" key={a.id} style={{ margin: 0 }}>
                <h3 style={{ fontSize: "1rem" }}>{a.label}</h3>
                <p>
                  <code className="mono">{a.filename}</code>
                  <br />
                  {a.guidance}
                </p>
                <div className="cta-row" style={{ marginTop: "0.65rem" }}>
                  <a className="btn" href={a.url}>
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="cta-row" style={{ marginTop: "0.85rem" }}>
            <a className="btn btn-ghost" href={DESK_RELEASE_PAGE}>
              Desk v{DESK_VERSION} release
            </a>
            <a className="btn btn-quiet" href={DESK_RELEASES_LATEST}>
              Latest Desk releases
            </a>
            <a className="btn btn-quiet" href={DESK_REPO_URL}>
              Desk source on GitHub
            </a>
            <a className="btn btn-quiet" href="/demo/#desk">
              Desk screenshots
            </a>
          </div>
        </div>

        <div
          className="panel"
          id="companion-usb"
          style={{ marginTop: "1.5rem" }}
        >
          <h3>Companion USB kit — portable desktop (v{COMPANION_VERSION})</h3>
          <p>
            Unzip onto a USB stick or external drive, open{" "}
            <strong>START-HERE</strong> (Tri-Cass logo), then{" "}
            <code className="mono">Start-Tri-Cass</code> — a few clicks, no full
            install. Settings, Vault, Knowledge/, chats, and Files stay on the
            stick so you can unplug and move PCs. Same Companion features as the
            desktop apps; heavier than the bootable OS images. Host PC still
            needs <a href="https://ollama.com/download">Ollama</a> for local
            models.
          </p>
          <div className="cta-row" style={{ marginTop: "0.85rem" }}>
            <a className="btn" href={COMPANION_USB_URL}>
              Download USB kit (.zip)
            </a>
            <a className="btn btn-ghost" href="/guides/companion-usb.md">
              USB kit guide
            </a>
            <a className="btn btn-quiet" href={COMPANION_RELEASE_PAGE}>
              Release page
            </a>
          </div>
        </div>

        <div className="panel" id="knowledge-packs" style={{ marginTop: "1.5rem" }}>
          <h3>Optional Knowledge Packs</h3>
          <p>
            The images already include a small Vault starter pack. If you have
            spare space on a USB stick or microSD (32 GB+ is ideal), you can add
            free public offline knowledge — Wikipedia-style dumps, Gutenberg
            books, and your own notes — so the AI can look things up locally. We
            do not host those large files; you download them from public
            archives. <strong>Completely optional</strong> — everything still
            works without them.
          </p>
          <div className="cta-row" style={{ marginTop: "0.85rem" }}>
            <Link className="btn" href="/knowledge-packs">
              Optional Knowledge Packs
            </Link>
            <a className="btn btn-ghost" href="/guides/knowledge-packs.md">
              Short markdown guide
            </a>
            <Link className="btn btn-quiet" href="/faq#vault">
              Vault FAQ
            </Link>
          </div>
        </div>

        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <h3>After you download</h3>
          <ol className="steps">
            <li>
              <strong>PC / Pi:</strong> unpack the{" "}
              <code className="mono">.xz</code> → get a{" "}
              <code className="mono">.img</code> (7-Zip on Windows).
            </li>
            <li>
              <strong>PC / Pi:</strong> flash with Etcher —{" "}
              <strong>USB stick</strong> for PC, <strong>microSD</strong> for Pi
              / cyberdeck — then boot into the hub menu.
            </li>
            <li>
              <strong>Pocket:</strong> run{" "}
              <code className="mono">fetch_model.sh</code>,{" "}
              <code className="mono">pio … upload</code> +{" "}
              <code className="mono">uploadfs</code>, then open a Serial monitor
              at 115200 — details in Setup.
            </li>
            <li>
              <strong>Cardputer ADV:</strong>{" "}
              <code className="mono">pio run -e cardputer-adv -t upload</code>{" "}
              from <code className="mono">nexus-cardputer/</code> — hub appears
              on the built-in screen.
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
            <a className="btn btn-ghost" href={POCKET_REPO}>
              Pocket on GitHub
            </a>
            <a className="btn btn-ghost" href={CARDPUTER_REPO}>
              Cardputer on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
