import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Setup" };

export default function SetupPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>How to set up Tri-Cass OS</h2>
        <p className="lede">
          Tri-Cass OS turns a USB stick (PC) or microSD card (Raspberry Pi) into
          its own small computer with offline AI.{" "}
          <strong>Tri-Cass Pocket</strong> is the ESP32-S3 path: a USB-Serial
          companion with a tiny on-device model. Disk images do{" "}
          <strong>not</strong> install inside Windows or Mac — you boot from
          that media and the Tri-Cass menu appears. New to the words we use? See{" "}
          <Link href="/about">About</Link>.
        </p>

        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          <strong>PC / Pi:</strong> spare USB stick or microSD (
          <strong>8 GB+</strong>), ~30–60 minutes, machine you can restart.
          Flashing <strong>erases</strong> that stick or card.{" "}
          <strong>Pocket:</strong> ESP32-S3 with PSRAM, PlatformIO, and a data
          USB cable — jumps to <Link href="#pocket">Pocket setup</Link>.
        </div>
        <nav className="jump-chips" aria-label="Jump in this guide">
          <a href="#pc-pi-steps">PC / Pi steps</a>
          <a href="#pocket">Pocket ESP32</a>
          <a href="#cardputer">Cardputer ADV</a>
          <a href="#knowledge-packs">Knowledge packs</a>
          <a href="#companion">Companion app</a>
          <a href="#troubleshoot">Troubleshooting</a>
          <Link href="/compat">Hardware compat</Link>
          <Link href="/download#cardputer">Cardputer download</Link>
        </nav>

        <ol className="steps" id="pc-pi-steps">
          <li>
            <strong>Choose which file to download</strong>
            <p>
              Go to the <Link href="/download">Download</Link> page and pick one:
            </p>
            <ul className="feature-list" style={{ marginTop: "0.75rem" }}>
              <li>
                <strong>i686 (32-bit) — PC USB</strong>
                <span>
                  Best for older “XP-era” PCs that only run 32-bit software. If
                  you are not sure, and the computer is from the mid-2000s or
                  earlier, start here.
                </span>
              </li>
              <li>
                <strong>x86_64 (64-bit) — PC USB</strong>
                <span>
                  For most newer PCs that already run 64-bit Windows or Linux.
                </span>
              </li>
              <li>
                <strong>aarch64 — Raspberry Pi / cyberdeck microSD</strong>
                <span>
                  <strong>Pi 4 primary</strong> (also great for DIY cyberdecks).
                  Same aarch64 file for Pi 4 and Pi 5. Flash to a microSD
                  card, not a USB stick.
                </span>
              </li>
              <li>
                <strong>Tri-Cass Pocket — ESP32-S3</strong>
                <span>
                  Tiny USB-Serial companion (not a disk image). Needs{" "}
                  <strong>PSRAM</strong>. Follow{" "}
                  <Link href="#pocket">Pocket setup</Link> below.
                </span>
              </li>
              <li>
                <strong>Tri-Cass Cardputer ADV</strong>
                <span>
                  M5Stack Cardputer ADV only — on-device green hub.{" "}
                  <strong>No PSRAM</strong>; cannot run USB/Pi images. Follow{" "}
                  <Link href="#cardputer">Cardputer setup</Link>.
                </span>
              </li>
            </ul>
            <p style={{ marginTop: "0.75rem" }}>
              PC / Pi downloads end in <code className="mono">.img.xz</code>{" "}
              (compressed for GitHub). Unpack the same way for PC and Pi. Pocket
              uses source + PlatformIO instead.
            </p>
          </li>

          <li>
            <strong>Unpack the download (required)</strong>
            <p>
              Do <strong>not</strong> flash the <code className="mono">.xz</code>{" "}
              file. Unpack it first so you get a larger{" "}
              <code className="mono">.img</code> file (~3 GB for PC, ~4 GB for
              Pi).
            </p>
            <div className="panel" style={{ marginTop: "0.85rem" }}>
              <h3>On Windows</h3>
              <p>
                Install free <strong>7-Zip</strong> from{" "}
                <a href="https://www.7-zip.org/" rel="noopener noreferrer">
                  7-zip.org
                </a>
                . Right-click the <code className="mono">.img.xz</code> file →
                7-Zip → Extract Here. You should see{" "}
                <code className="mono">portable-ai-os-….img</code>.
              </p>
            </div>
            <div className="panel" style={{ marginTop: "0.85rem" }}>
              <h3>On Mac</h3>
              <p>
                Double-click may work in recent macOS. If not, open Terminal and
                run:
              </p>
              <pre className="panel mono" style={{ overflow: "auto" }}>
{`xz -d ~/Downloads/portable-ai-os-i686.img.xz`}
              </pre>
              <p>
                (Install xz with Homebrew if needed:{" "}
                <code className="mono">brew install xz</code>.)
              </p>
            </div>
            <div className="panel" style={{ marginTop: "0.85rem" }}>
              <h3>On Linux</h3>
              <pre className="panel mono" style={{ overflow: "auto" }}>
{`xz -d portable-ai-os-i686.img.xz`}
              </pre>
            </div>
          </li>

          <li>
            <strong>Optional: check the download (checksum)</strong>
            <p>
              A checksum is a fingerprint of the file. Matching it means your
              download was not cut off or corrupted. Grab SHA256SUMS from the
              same Release (
              <a href="https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/v1.0.2-usb/SHA256SUMS">
                PC
              </a>
              {" · "}
              <a href="https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/v1.0.2-pi/SHA256SUMS">
                Pi
              </a>
              ), then compare.
            </p>
            <div className="panel" style={{ marginTop: "0.85rem" }}>
              <h3>Windows (PowerShell) — one command</h3>
              <p>
                After unpacking, open PowerShell in your Downloads folder. Use
                the filename you downloaded:
              </p>
              <pre className="panel mono" style={{ overflow: "auto" }}>
{`Get-FileHash .\\portable-ai-os-i686.img -Algorithm SHA256
# or: portable-ai-os-x86_64.img / portable-ai-os-aarch64.img`}
              </pre>
              <p>
                Compare the hash to the matching{" "}
                <code className="mono">.img</code> line in SHA256SUMS. You can
                also hash the <code className="mono">.xz</code> before unpacking
                the same way.
              </p>
            </div>
            <div className="panel" style={{ marginTop: "0.85rem" }}>
              <h3>Linux / macOS</h3>
              <pre className="panel mono" style={{ overflow: "auto" }}>
{`sha256sum -c SHA256SUMS
# Look for “OK” on your .img line after unpacking`}
              </pre>
            </div>
            <p>
              Skipping the check does not stop the stick from working — it only
              skips the safety double-check.
            </p>
          </li>

          <li>
            <strong>Write the image (flash)</strong>
            <p>
              Easiest path for most people: free{" "}
              <strong>balenaEtcher</strong> from{" "}
              <a href="https://etcher.balena.io/" rel="noopener noreferrer">
                etcher.balena.io
              </a>
              .
            </p>
            <ul className="feature-list" style={{ marginTop: "0.75rem" }}>
              <li>
                <strong>PC builds</strong>
                <span>Flash to a USB stick you are willing to erase.</span>
              </li>
              <li>
                <strong>Raspberry Pi build</strong>
                <span>
                  Flash to a <strong>microSD card</strong> (not a USB stick).
                  Raspberry Pi Imager also works: pick “Use custom” and select
                  the <code className="mono">.img</code>.
                </span>
              </li>
            </ul>
            <ol className="substeps">
              <li>Insert the USB stick or microSD (via a reader) to erase.</li>
              <li>
                Open Etcher → Flash from file → choose the{" "}
                <code className="mono">.img</code> (not the{" "}
                <code className="mono">.xz</code>).
              </li>
              <li>Select that stick or card carefully (check size/name).</li>
              <li>Click Flash and wait until it finishes successfully.</li>
            </ol>
            <div className="panel" style={{ marginTop: "0.85rem" }}>
              <h3>Advanced: Linux/macOS command line</h3>
              <p>
                Only if you know your disk name (wrong disk = wipe the wrong
                drive). Example:
              </p>
              <pre className="panel mono" style={{ overflow: "auto" }}>
{`# Find the USB (look at SIZE). Example: /dev/sdX or /dev/diskN
lsblk          # Linux
diskutil list  # macOS

sudo dd if=portable-ai-os-i686.img \\
  of=/dev/sdX bs=4M status=progress conv=fsync
sync`}
              </pre>
            </div>
          </li>

          <li>
            <strong>Boot the machine</strong>
            <p>
              <strong>Raspberry Pi / cyberdeck:</strong> insert the microSD,
              connect power (and display/keyboard). You should reach the same hub
              menu after a short load. Same image for <strong>Pi 4</strong> and{" "}
              <strong>Pi 5</strong> (Pi 4 is the well-tested sweet spot).
            </p>
            <p style={{ marginTop: "0.75rem" }}>
              <strong>PC:</strong> put the stick in, then restart. You usually
              need a one-time boot menu or BIOS change:
            </p>
            <ul className="feature-list" style={{ marginTop: "0.75rem" }}>
              <li>
                <strong>Boot menu keys (common)</strong>
                <span>
                  Right after power-on, try Esc, F10, F12, F9, or F2 (depends on
                  the brand). Choose the USB / Removable drive.
                </span>
              </li>
              <li>
                <strong>Honest boot note (v1)</strong>
                <span>
                  Current v1 images are <strong>unsigned</strong> and work best
                  with <strong>legacy / BIOS (CSM)</strong> USB boot. Pure UEFI
                  machines (especially post-2020 boards with no CSM) may not
                  start the stick yet — signed UEFI + Secure Boot is planned.
                </span>
              </li>
              <li>
                <strong>Secure Boot (last resort)</strong>
                <span>
                  Only if your firmware still offers legacy USB boot but blocks
                  the stick: enter setup and try Secure Boot{" "}
                  <strong>Off</strong>. That is a temporary workaround for
                  unsigned v1 images — not the long-term product path.
                </span>
              </li>
            </ul>
            <p style={{ marginTop: "0.75rem" }}>
              Your normal Windows/Mac install on the hard drive is not removed
              by booting the stick — you are only starting from USB for this
              session (unless you later choose to change disks yourself).
            </p>
          </li>

          <li>
            <strong>First boot — what you should see</strong>
            <p>
              After a short load, a text-style menu appears (the “hub”). The
              first time, a short wizard may ask you to:
            </p>
            <ul className="feature-list" style={{ marginTop: "0.75rem" }}>
              <li>
                <strong>Theme</strong>
                <span>Matrix (green) or basic (high-contrast).</span>
              </li>
              <li>
                <strong>Image / pixel art option</strong>
                <span>Optional; you can leave it off to save resources.</span>
              </li>
              <li>
                <strong>AI model</strong>
                <span>
                  A small bundled model is included so Chat works offline. You
                  can add larger models later under storage on the stick.
                </span>
              </li>
            </ul>
            <p style={{ marginTop: "0.75rem" }}>
              Then you land on the <strong>main menu</strong>. Use letter keys
              (or arrows + Enter, depending on the screen) to open Chat, Files,
              Vault, Agents, Games, Settings, and Pixel Art.
            </p>
            <p style={{ marginTop: "0.75rem" }}>
              <strong>Knowledge Vault</strong> already includes a small starter
              pack (guide, glossary, flash/boot and Chat how-tos) — not a full
              wiki. Open Vault to read them, or add your own{" "}
              <span className="mono">.txt</span> / <span className="mono">.md</span>{" "}
              files and rebuild the index. Want Wikipedia-style dumps or free
              books on a larger stick? See{" "}
              <Link href="/knowledge-packs">Optional Knowledge Packs</Link> or
              the <Link href="/faq#vault">FAQ</Link>.
            </p>
          </li>

          <li>
            <strong>Using it day to day</strong>
            <p>
              Leave the stick plugged in, power on, boot from USB again. No
              internet is required for Chat, Files, Vault, Agents, or Games.
              Settings can change theme and models.{" "}
              <strong>Tri-Cass Network</strong> (online community chat) is listed
              but not live yet — ignore it for offline use, or{" "}
              <Link href="/network">reserve a name</Link> on this website for
              later.
            </p>
          </li>
        </ol>

        <div className="panel" id="companion" style={{ marginTop: "2rem" }}>
          <h3>Windows · Mac · Android · web companion</h3>
          <p>
            Easiest:{" "}
            <Link href="/download#companion">Download → Companion</Link> —{" "}
            <strong>Windows setup/portable .exe</strong>,{" "}
            <strong>Mac Apple Silicon or Intel .dmg</strong>,{" "}
            <a href="/companion/">web</a>, or Android APK (sideload — not Play
            Store). In Chat, pick a local model and download it once via Ollama,
            then chat offline. There is no public iPhone/iPad download yet;
            developers can run the Expo project with{" "}
            <code className="mono">npm run ios</code>. See{" "}
            <a href="/guides/companion-app.md">companion-app.md</a>.
          </p>
        </div>

        <div className="panel" id="knowledge-packs" style={{ marginTop: "2rem" }}>
          <h3>Optional Knowledge Packs</h3>
          <p>
            You do <strong>not</strong> need these. If your USB stick or microSD
            has spare room (32 GB+ works well), you can download free public
            offline knowledge — Kiwix Wikipedia snapshots, Project Gutenberg
            plain-text books, and similar — then copy{" "}
            <code className="mono">.txt</code> / <code className="mono">.md</code>{" "}
            into the Vault folder (PC/Pi) or{" "}
            <code className="mono">/tri-cass-vault/</code> (Cardputer ADV). We
            point at public archives; we do not host the large files.
          </p>
          <ol className="steps" style={{ marginTop: "0.75rem" }}>
            <li>
              <strong>Download</strong>
              <span> a pack or a few plain-text books from the sources list.</span>
            </li>
            <li>
              <strong>Copy</strong>
              <span>
                {" "}
                onto the stick/card vault path (see the Knowledge Packs page).
              </span>
            </li>
            <li>
              <strong>Boot → Vault</strong>
              <span>
                {" "}
                — rebuild the index on PC/Pi if prompted; on Cardputer, browse
                or search from the hub.
              </span>
            </li>
          </ol>
          <div className="cta-row" style={{ marginTop: "0.85rem" }}>
            <Link className="btn" href="/knowledge-packs">
              Optional Knowledge Packs
            </Link>
            <a className="btn btn-ghost" href="/guides/knowledge-packs.md">
              Markdown guide
            </a>
          </div>
        </div>

        <div className="panel" id="pocket" style={{ marginTop: "2rem" }}>
          <h3>Tri-Cass Pocket (ESP32-S3) setup</h3>
          <p>
            Pocket is a separate build from the USB/Pi images: firmware in{" "}
            <code className="mono">nexus-esp32/</code>, flashed with PlatformIO.
            Default model is TinyStories <strong>stories260K</strong> on SPIFFS.
            Prefer an <strong>ESP32-S3 with 8 MB PSRAM</strong> (N16R8 / 16 MB
            flash). Boards with 8 MB flash use the{" "}
            <code className="mono">nexus-pocket-s3-8mb</code> env.
          </p>
          <ol className="steps">
            <li>
              <strong>Install PlatformIO</strong>
              <span>
                {" "}
                (VS Code extension or CLI) and connect the board with a data USB
                cable.
              </span>
            </li>
            <li>
              <strong>Get the firmware</strong>
              <pre className="panel mono">
{`git clone https://github.com/leecee056-bot/Nexus-OS-V1.git
cd Nexus-OS-V1/nexus-esp32
chmod +x scripts/fetch_model.sh
./scripts/fetch_model.sh`}
              </pre>
            </li>
            <li>
              <strong>Flash app + filesystem</strong>
              <pre className="panel mono">
{`pio run -e nexus-pocket-s3 -t upload
pio run -e nexus-pocket-s3 -t uploadfs
pio device monitor`}
              </pre>
              <p style={{ marginTop: "0.5rem" }}>
                Use <code className="mono">nexus-pocket-s3-8mb</code> instead if
                your board has 8 MB flash. Serial is <strong>115200</strong> baud.
              </p>
            </li>
            <li>
              <strong>Try the hub</strong>
              <p style={{ marginTop: "0.5rem" }}>
                Type <code className="mono">help</code>,{" "}
                <code className="mono">status</code>, then{" "}
                <code className="mono">chat Once upon a time</code>. Tools:{" "}
                <code className="mono">tool mem</code>,{" "}
                <code className="mono">tool note …</code>,{" "}
                <code className="mono">tool calc 12*7</code>. If the model is
                missing, chat still runs in demo mode.
              </p>
            </li>
          </ol>
          <p style={{ marginTop: "0.85rem" }}>
            Short checklist:{" "}
            <a href="/guides/pocket-flash.md">pocket-flash.md</a>
            {" · "}
            <Link href="/faq#pocket">FAQ</Link>
            {" · "}
            <Link href="/download">Download → Pocket</Link>
          </p>
        </div>

        <div className="panel" id="cardputer" style={{ marginTop: "2rem" }}>
          <h3>Tri-Cass Cardputer ADV setup</h3>
          <p>
            Dedicated firmware in <code className="mono">nexus-cardputer/</code>{" "}
            for the M5Stack Cardputer ADV (ESP32-S3FN8, 8 MB flash,{" "}
            <strong>no PSRAM</strong>, 240×135 display + 56-key keyboard). This
            is separate from Pocket: Chat is <strong>TinyChat</strong> (flash
            phrase corpus), not stories260K. An optional{" "}
            <strong>Knowledge Vault</strong> can live on microSD — the hub still
            works with no card.
          </p>
          <ol className="steps">
            <li>
              <strong>Install PlatformIO</strong>
              <span> and connect the Cardputer with a USB-C data cable.</span>
            </li>
            <li>
              <strong>Build &amp; flash</strong>
              <pre className="panel mono">
{`git clone https://github.com/leecee056-bot/Nexus-OS-V1.git
cd Nexus-OS-V1/nexus-cardputer
pio run -e cardputer-adv -t upload`}
              </pre>
            </li>
            <li>
              <strong>Use the on-screen hub</strong>
              <p style={{ marginTop: "0.5rem" }}>
                <code className="mono">;</code> / <code className="mono">,</code>{" "}
                up · <code className="mono">&apos;</code> /{" "}
                <code className="mono">.</code> down · Enter opens ·{" "}
                <code className="mono">`</code> back to hub. Menu: Chat, Vault,
                Notes, Status, About.
              </p>
            </li>
            <li>
              <strong>Optional: microSD Vault</strong>
              <p style={{ marginTop: "0.5rem" }}>
                Copy <code className="mono">sd-example/tri-cass-vault/</code> to the
                root of a FAT microSD card, insert it, then open{" "}
                <strong>Vault</strong>. Enter opens a file; type a word + Enter
                to search. Without a card, Vault just shows a hint. Larger free
                packs (Gutenberg, Kiwix text):{" "}
                <Link href="/knowledge-packs">Optional Knowledge Packs</Link>.
              </p>
            </li>
          </ol>
          <p style={{ marginTop: "0.85rem" }}>
            Checklist:{" "}
            <a href="/guides/cardputer-flash.md">cardputer-flash.md</a>
            {" · "}
            <Link href="/faq#cardputer">FAQ</Link>
            {" · "}
            <Link href="/download#cardputer">Download</Link>
          </p>
        </div>

        <div className="panel" id="troubleshoot" style={{ marginTop: "1.5rem" }}>
          <h3>If something goes wrong</h3>
          <ul className="feature-list">
            <li>
              <strong>Etcher / PC can’t open the file</strong>
              <span>
                You probably still have the <code className="mono">.xz</code>.
                Unpack it first, then select the <code className="mono">.img</code>.
              </span>
            </li>
            <li>
              <strong>PC boots straight into Windows</strong>
              <span>
                Use the boot menu key at power-on, or set USB first in BIOS.
                Confirm Secure Boot is off.
              </span>
            </li>
            <li>
              <strong>Black screen or freeze</strong>
              <span>
                Try the other architecture (i686 vs x86_64). On very old PCs,
                i686 is the right choice.
              </span>
            </li>
            <li>
              <strong>Stick / card not large enough</strong>
              <span>
                Use 8 GB+. Raw images are about 3 GB (PC) or 4 GB (Pi); you also
                need room for files and settings.
              </span>
            </li>
            <li>
              <strong>Pi 5 will not boot</strong>
              <span>
                v1.0.2 uses one aarch64 image for Pi 4 and Pi 5 (
                <code className="mono">[pi5]</code> in{" "}
                <code className="mono">config.txt</code>). Check power supply,
                HDMI/keyboard, and that you flashed the latest{" "}
                <code className="mono">v1.0.2-pi</code> card. Pi 4 remains the
                easiest first board if something still fails.
              </span>
            </li>
            <li>
              <strong>Pocket Serial is empty / chat says demo</strong>
              <span>
                Confirm 115200 baud and the right COM/tty port. Run{" "}
                <code className="mono">uploadfs</code> after{" "}
                <code className="mono">fetch_model.sh</code> so{" "}
                <code className="mono">model.bin</code> lands on SPIFFS. Boards
                without PSRAM may stay in demo for chat — use Cardputer ADV
                firmware on that device instead of Pocket.
              </span>
            </li>
            <li>
              <strong>Cardputer ADV blank / won’t flash</strong>
              <span>
                Use a data USB-C cable, hold the reset/boot combo your board
                docs describe, and flash{" "}
                <code className="mono">-e cardputer-adv</code> from{" "}
                <code className="mono">nexus-cardputer/</code> — not the Pocket
                env.
              </span>
            </li>
            <li>
              <strong>Want a second opinion on steps</strong>
              <span>
                See the shorter{" "}
                <a href="/guides/usb-flash.md">USB/Pi flash guide</a>,{" "}
                <a href="/guides/pocket-flash.md">Pocket checklist</a>, or{" "}
                <Link href="/docs">Docs</Link>.
              </span>
            </li>
          </ul>
        </div>

        <figure className="shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/tri-cass-os-hub-screen.jpg?v=20261124"
            alt="Tri-Cass OS hub menu on a computer screen"
          />
          <figcaption>
            Example of the hub menu after a successful USB boot.
          </figcaption>
        </figure>

        <div className="cta-row" style={{ marginTop: "1.5rem" }}>
          <Link className="btn" href="/download">
            Go to Download
          </Link>
          <Link className="btn btn-ghost" href="/features">
            What it can do
          </Link>
        </div>
      </div>
    </section>
  );
}
