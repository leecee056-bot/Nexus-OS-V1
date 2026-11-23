import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>About Tri-Cass OS</h2>
        <p className="lede">
          Tri-Cass OS is a ready-made offline AI system for a USB stick (PC), a
          microSD card (Raspberry Pi), or <strong>Tri-Cass Pocket</strong> on an
          ESP32-S3. Boot the stick/card for the full on-screen hub, or flash
          Pocket for USB-Serial chat on a tiny board — without installing onto
          your hard drive.
        </p>

        <figure className="shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/tri-cass-os-hub-screen.jpg"
            alt="Tri-Cass OS hub menu shown on a computer screen"
          />
          <figcaption>
            The main menu after you boot from a USB stick or Pi microSD card.
          </figcaption>
        </figure>

        <h3 className="subhead">What it is (in everyday words)</h3>
        <ul className="feature-list">
          <li>
            <strong>A portable AI computer</strong>
            <span>
              The stick or card carries a small operating system and an AI model.
              Chat runs on the machine in front of you — not in a cloud account —
              so it works without internet once set up.
            </span>
          </li>
          <li>
            <strong>Built for low-spec machines</strong>
            <span>
              Aimed at older Intel/AMD PCs (including many XP-era 32-bit boxes),
              newer PCs, <strong>Raspberry Pi 4</strong> (cyberdecks and portable
              kits; Pi 5 best-effort), and <strong>ESP32-S3 Pocket</strong> for a
              Serial companion board.
            </span>
          </li>
          <li>
            <strong>Keyboard-first, full-screen menus</strong>
            <span>
              You pick apps from a text-style hub (themes: Matrix green or plain
              high-contrast). One app at a time, easy to follow.
            </span>
          </li>
        </ul>

        <h3 className="subhead">What you can use it for</h3>
        <ul className="feature-list">
          <li>
            <strong>Private offline chat</strong>
            <span>
              Ask questions, draft notes, or brainstorm when you have no Wi‑Fi
              or prefer not to send text to a website.
            </span>
          </li>
          <li>
            <strong>Cyberdecks and portable Pi builds</strong>
            <span>
              Popular DIY “cyberdeck” projects need a small OS that boots fast
              and stays offline. The Pi image is made for that — flash a card,
              drop it in a Pi 4 deck or handheld case, and you have a local AI
              terminal you can take anywhere.
            </span>
          </li>
          <li>
            <strong>Revive an old spare PC</strong>
            <span>
              Turn a dusty tower into something useful again without wiping
              Windows permanently — just boot from the stick when you want Tri-Cass.
            </span>
          </li>
          <li>
            <strong>Classroom, club, or makerspace kits</strong>
            <span>
              Prepare sticks or Pi cards once, hand them out, and everyone gets
              the same menu — no student cloud accounts required for basic Chat.
            </span>
          </li>
          <li>
            <strong>Travel / field / low-connectivity work</strong>
            <span>
              Keep notes and chat available on trains, camps, or workshops where
              the network is unreliable.
            </span>
          </li>
          <li>
            <strong>Keep notes and search them</strong>
            <span>
              The Knowledge Vault ships with a small starter pack (Tri-Cass guide,
              glossary, flash/boot and Chat how-tos). Drop in more{" "}
              <span className="mono">.txt</span> / <span className="mono">.md</span>{" "}
              files and rebuild the index; Chat can optionally use those notes as
              context. This is a personal offline notebook — not a full Wikipedia.
            </span>
          </li>
          <li>
            <strong>Small helpers and simple games</strong>
            <span>
              Calculator-style tools, file browsing, system info, and a couple
              of classic games when you need a break.
            </span>
          </li>
          <li>
            <strong>Learning / tinkering</strong>
            <span>
              A friendly way to try a Linux-based AI USB or Pi card without buying
              a new laptop.
            </span>
          </li>
        </ul>

        <h3 className="subhead">Words you might see (jargon, explained)</h3>
        <ul className="feature-list">
          <li>
            <strong>Linux</strong>
            <span>
              The kind of operating system under the hood (like Windows or macOS,
              but different). You do not need to “know Linux” — you use the Tri-Cass
              menu.
            </span>
          </li>
          <li>
            <strong>USB / SD image / .img</strong>
            <span>
              A disk picture of the whole system. You write it to a USB stick
              (PC) or microSD card (Pi) with a tool like balenaEtcher (after
              unpacking the download).
            </span>
          </li>
          <li>
            <strong>Flash / Etcher</strong>
            <span>
              “Flashing” means copying that image onto the stick or card. Etcher
              is a free app that does it with a few clicks.
            </span>
          </li>
          <li>
            <strong>Cyberdeck</strong>
            <span>
              A homemade portable computer — often a Raspberry Pi in a custom
              case with a small screen and keyboard. Tri-Cass OS on microSD is aimed
              at that kind of build as well as plain Pi boards.
            </span>
          </li>
          <li>
            <strong>TUI / hub</strong>
            <span>
              Text user interface — the full-screen keyboard menu you see after
              boot. The hub is that main menu.
            </span>
          </li>
          <li>
            <strong>AI model / llama.cpp</strong>
            <span>
              The “brain” files that answer in Chat. They run locally via a
              small engine (llama.cpp). A starter model ships on the stick/card.
            </span>
          </li>
          <li>
            <strong>Knowledge Vault</strong>
            <span>
              Your searchable notebook on the device. Comes with a short starter
              pack (guide + glossary + how-tos); import more .txt/.md and look
              them up. Not a full offline wiki dump.
            </span>
          </li>
          <li>
            <strong>Agents &amp; tools</strong>
            <span>
              Small assistants limited to safe built-in actions (files, vault,
              calculator, and similar) — not free rein on your whole PC.
            </span>
          </li>
          <li>
            <strong>Tri-Cass Network</strong>
            <span>
              Optional future online community. Not required for offline AI. You
              can <Link href="/network">reserve a username</Link> on this website;
              chat rooms are not live yet.
            </span>
          </li>
          <li>
            <strong>i686 vs x86_64 vs aarch64 vs Pocket</strong>
            <span>
              <strong>i686</strong> = 32-bit / older XP-era PC;{" "}
              <strong>x86_64</strong> = typical 64-bit PC;{" "}
              <strong>aarch64</strong> = 64-bit Raspberry Pi / cyberdeck image;{" "}
              <strong>Pocket</strong> = ESP32-S3 Serial firmware. Pick on
              Download.
            </span>
          </li>
          <li>
            <strong>Tri-Cass Pocket</strong>
            <span>
              ESP32-S3 firmware with a USB-Serial hub, TinyStories stories260K
              chat, and small tools. Flash with PlatformIO — see{" "}
              <Link href="/setup#pocket">Setup</Link>.
            </span>
          </li>
          <li>
            <strong>Checksum / SHA256</strong>
            <span>
              A fingerprint of the file so you can confirm the download was not
              corrupted. Setup includes a Windows PowerShell one-liner.
            </span>
          </li>
        </ul>

        <h3 className="subhead">Minimum requirements (this release)</h3>
        <ul className="feature-list">
          <li>
            <strong>PC</strong>
            <span>
              Intel or AMD that can boot from USB. 32-bit (i686) or 64-bit
              (x86_64) image available. USB stick 8 GB+ recommended.
            </span>
          </li>
          <li>
            <strong>Raspberry Pi / cyberdeck</strong>
            <span>
              <strong>Pi 4 primary</strong> (2 GB+ RAM; 4 GB+ preferred). Same
              image may work on Pi 5 (best-effort). microSD 8 GB+ recommended.
              Older Pi / 32-bit boards not in this release.
            </span>
          </li>
          <li>
            <strong>Tri-Cass Pocket (ESP32-S3)</strong>
            <span>
              Board with PSRAM (8 MB preferred). 16 MB flash for the default
              PlatformIO env; 8 MB flash boards use the alternate env. USB data
              cable + PlatformIO.
            </span>
          </li>
          <li>
            <strong>Memory (RAM) — PC / Pi</strong>
            <span>
              About 1–2 GB free is the practical floor for the small bundled
              model; more RAM helps with larger models later.
            </span>
          </li>
          <li>
            <strong>PC boot (v1 honesty)</strong>
            <span>
              USB boot with legacy / BIOS (CSM) is the proven path. Images are
              unsigned today. UEFI + Secure Boot dual-signed boot is planned —
              do not expect every modern Secure Boot laptop to start v1 yet.
            </span>
          </li>
          <li>
            <strong>CPU note</strong>
            <span>
              The current x86_64 image targets modern-enough 64-bit CPUs. Very
              old 64-bit towers (pre–SSE4.2 era) may need a future all-CPU
              llama.cpp build before chat runs well.
            </span>
          </li>
          <li>
            <strong>Coming later</strong>
            <span>
              UEFI Secure Boot, broader CPU coverage, stronger Pi 5 / cyberdeck
              layouts, larger Pocket models, and live Network chat.
            </span>
          </li>
        </ul>

        <div className="cta-row" style={{ marginTop: "2rem" }}>
          <Link className="btn" href="/download">
            Download
          </Link>
          <Link className="btn btn-ghost" href="/setup">
            Setup guide
          </Link>
          <Link className="btn btn-ghost" href="/features">
            Feature list
          </Link>
        </div>
      </div>
    </section>
  );
}
