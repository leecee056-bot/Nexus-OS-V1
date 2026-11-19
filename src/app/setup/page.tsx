import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Setup" };

export default function SetupPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>Setup / Tutorial</h2>
        <p className="lede">
          NEXUS OS is a real Linux USB OS — it does not run inside Windows.
          Cold-boot from the stick into the hub TUI.
        </p>

        <ol className="steps">
          <li>
            <strong>Pick an architecture</strong>
            <p>
              Prefer <strong>i686</strong> for true 32-bit XP-era boxes;{" "}
              <strong>x86_64</strong> for 64-bit capable CPUs (SSE4.2+). Get the{" "}
              <code className="mono">.img.xz</code> from{" "}
              <Link href="/download">Download</Link>.
            </p>
          </li>
          <li>
            <strong>Decompress</strong>
            <p>
              GitHub serves compressed images. Unpack before flashing:
            </p>
            <pre className="panel mono" style={{ overflow: "auto" }}>
{`xz -d portable-ai-os-i686.img.xz
# Windows: extract with 7-Zip → portable-ai-os-i686.img`}
            </pre>
          </li>
          <li>
            <strong>Verify the image</strong>
            <pre className="panel mono" style={{ overflow: "auto" }}>
{`sha256sum -c SHA256SUMS
# expect: portable-ai-os-*.img: OK (after xz -d)`}
            </pre>
          </li>
          <li>
            <strong>Flash with dd or Etcher</strong>
            <p>
              Identify the stick carefully (<code className="mono">lsblk</code>
              ). Whole disk, not a partition — this erases the USB:
            </p>
            <pre className="panel mono" style={{ overflow: "auto" }}>
{`sudo dd if=portable-ai-os-i686.img \\
  of=/dev/sdX bs=4M status=progress conv=fsync
sync`}
            </pre>
            <p>
              Or use <strong>balenaEtcher</strong> / Raspberry Pi Imager and
              select the decompressed <code className="mono">.img</code> (not
              the <code className="mono">.xz</code>).
            </p>
          </li>
          <li>
            <strong>BIOS / Secure Boot</strong>
            <p>
              Set USB / Removable first. Disable <strong>Secure Boot</strong>{" "}
              (v1 images are unsigned). Prefer legacy/CSM USB boot on UEFI
              machines.
            </p>
          </li>
          <li>
            <strong>First-boot wizard</strong>
            <p>
              Choose theme (Matrix / basic) · image gen · model → land on the{" "}
              <strong>main menu hub</strong>.
            </p>
          </li>
          <li>
            <strong>Explore the hub</strong>
            <p>
              Letter shortcuts open Chat, Files, Vault, Agents, Games, Settings,
              Pixel Art. Network appears as a labeled stub until servers launch.
            </p>
          </li>
        </ol>

        <figure className="shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/nexus-os-mockup-offline.png"
            alt="Offline hub mockup used as tutorial visual"
          />
          <figcaption>
            Offline hub mockup (design target). Live experience is the Matrix /
            basic curses TUI after first-boot.
          </figcaption>
        </figure>

        <figure className="shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/pxg-matrix-cat-pixel-0f5d7d9f97.png"
            alt="Sample PXG pixel art from NEXUS OS"
            style={{ imageRendering: "pixelated", width: 256, maxWidth: "100%" }}
          />
          <figcaption>
            Sample PXG pixel output from the OS image-gen path (tiny demo asset).
          </figcaption>
        </figure>

        <div className="panel">
          <h3>On the stick</h3>
          <p>
            <strong>AI_SYS</strong> — OS, kernel, llama, hub TUI, bundled
            SmolLM2.
            <br />
            <strong>AI_DATA</strong> — writable config, images, vault, extra
            models under <code className="mono">/data/models/</code>.
          </p>
          <p>
            Full guide:{" "}
            <Link href="/guides/usb-flash.md">usb-flash.md</Link> ·{" "}
            <Link href="/docs">Docs index</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
