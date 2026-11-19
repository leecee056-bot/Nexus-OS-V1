import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Setup" };

export default function SetupPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>How to set up NEXUS OS</h2>
        <p className="lede">
          NEXUS OS turns a USB stick into its own small computer with offline AI
          — aimed at everyday and older Intel/AMD PCs. It does{" "}
          <strong>not</strong> install inside Windows or Mac: you start the PC
          from the stick, and the NEXUS menu appears instead. New to the words
          we use? See <Link href="/about">About</Link>.
        </p>

        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          You will need: a spare USB stick (<strong>8 GB or larger</strong> is
          safest; 4 GB minimum), about 30–60 minutes the first time, and a PC you
          can restart. Flashing <strong>erases everything</strong> already on
          that USB stick.
        </div>

        <ol className="steps">
          <li>
            <strong>Choose which file to download</strong>
            <p>
              Go to the <Link href="/download">Download</Link> page and pick one:
            </p>
            <ul className="feature-list" style={{ marginTop: "0.75rem" }}>
              <li>
                <strong>i686 (32-bit)</strong>
                <span>
                  Best for older “XP-era” PCs that only run 32-bit software. If
                  you are not sure, and the computer is from the mid-2000s or
                  earlier, start here.
                </span>
              </li>
              <li>
                <strong>x86_64 (64-bit)</strong>
                <span>
                  For most newer PCs that already run 64-bit Windows or Linux.
                </span>
              </li>
            </ul>
            <p style={{ marginTop: "0.75rem" }}>
              You will download a file ending in <code className="mono">.img.xz</code>
              . That means it is compressed (zipped) to fit GitHub’s size limit.
            </p>
          </li>

          <li>
            <strong>Unpack the download (required)</strong>
            <p>
              Do <strong>not</strong> flash the <code className="mono">.xz</code>{" "}
              file. Unpack it first so you get a larger{" "}
              <code className="mono">.img</code> file (~3 GB).
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
              download was not cut off or corrupted. Grab{" "}
              <a href="https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/v1.0.0-usb/SHA256SUMS">
                SHA256SUMS
              </a>{" "}
              from the same Release, then compare.
            </p>
            <div className="panel" style={{ marginTop: "0.85rem" }}>
              <h3>Windows (PowerShell) — one command</h3>
              <p>
                After unpacking, open PowerShell in your Downloads folder (or
                put the full path in). Replace the filename if you chose 64-bit:
              </p>
              <pre className="panel mono" style={{ overflow: "auto" }}>
{`Get-FileHash .\\portable-ai-os-i686.img -Algorithm SHA256`}
              </pre>
              <p>
                Compare the hash to the{" "}
                <code className="mono">portable-ai-os-i686.img</code> line in
                SHA256SUMS (should match{" "}
                <code className="mono">b9a3820e…5104465</code> for i686, or{" "}
                <code className="mono">0d490700…6e8877</code> for x86_64). You
                can also hash the <code className="mono">.xz</code> before
                unpacking the same way.
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
            <strong>Write the image onto the USB stick (flash)</strong>
            <p>
              Easiest path for most people: free{" "}
              <strong>balenaEtcher</strong> from{" "}
              <a href="https://etcher.balena.io/" rel="noopener noreferrer">
                etcher.balena.io
              </a>
              .
            </p>
            <ol className="steps" style={{ marginTop: "0.75rem" }}>
              <li>Plug in the USB stick you are willing to erase.</li>
              <li>Open Etcher → Flash from file → choose the{" "}
                <code className="mono">.img</code> (not the{" "}
                <code className="mono">.xz</code>).
              </li>
              <li>Select your USB stick carefully (check the size/name).</li>
              <li>Click Flash and wait until it finishes successfully.</li>
            </ol>
            <p style={{ marginTop: "0.75rem" }}>
              Raspberry Pi Imager also works if you pick “Use custom” and select
              the same <code className="mono">.img</code>.
            </p>
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
            <strong>Prepare the PC to boot from USB</strong>
            <p>
              Put the stick in the computer you want to try, then restart it.
              You usually need to open a one-time boot menu or change BIOS
              settings:
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
                <strong>Secure Boot</strong>
                <span>
                  If the PC refuses to start from the stick, enter BIOS/UEFI
                  setup and turn <strong>Secure Boot</strong>{" "}
                  <strong>Off</strong>. NEXUS v1 images are not signed for
                  Secure Boot.
                </span>
              </li>
              <li>
                <strong>Older / UEFI machines</strong>
                <span>
                  Prefer “Legacy”, “CSM”, or “USB legacy” boot if a pure UEFI
                  boot fails.
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
          </li>

          <li>
            <strong>Using it day to day</strong>
            <p>
              Leave the stick plugged in, power on, boot from USB again. No
              internet is required for Chat, Files, Vault, Agents, or Games.
              Settings can change theme and models.{" "}
              <strong>NEXUS Network</strong> (online community chat) is listed
              but not live yet — ignore it for offline use, or{" "}
              <Link href="/network">reserve a name</Link> on this website for
              later.
            </p>
          </li>
        </ol>

        <div className="panel" style={{ marginTop: "1.5rem" }}>
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
              <strong>Stick not large enough</strong>
              <span>
                Use 8 GB+ after unpacking. The raw image is about 3 GB; the
                stick also needs room for your files and settings.
              </span>
            </li>
            <li>
              <strong>Want a second opinion on steps</strong>
              <span>
                See the shorter <Link href="/guides/usb-flash.md">flash guide</Link>{" "}
                or <Link href="/docs">Docs</Link>.
              </span>
            </li>
          </ul>
        </div>

        <figure className="shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/nexus-os-hub-screen.jpg"
            alt="NEXUS OS hub menu on a computer screen"
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
