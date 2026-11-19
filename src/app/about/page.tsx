import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>About NEXUS OS</h2>
        <p className="lede">
          NEXUS OS is a ready-made system you put on a USB stick (PC) or a
          microSD card (Raspberry Pi). Boot from that media and you get a simple
          on-screen menu with offline AI chat and helpful tools — without
          installing anything onto the hard drive.
        </p>

        <figure className="shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/nexus-os-hub-screen.jpg"
            alt="NEXUS OS hub menu shown on a computer screen"
          />
          <figcaption>
            The main menu on screen after you boot from the USB stick.
          </figcaption>
        </figure>

        <h3 className="subhead">What it is (in everyday words)</h3>
        <ul className="feature-list">
          <li>
            <strong>A portable AI computer</strong>
            <span>
              The stick carries a small operating system and an AI model. Chat
              runs on the PC in front of you — not in a cloud account — so it
              works without internet once set up.
            </span>
          </li>
          <li>
            <strong>Built for low-spec machines</strong>
            <span>
              Aimed at older Intel/AMD PCs (including many XP-era 32-bit boxes)
              as well as newer ones — and now <strong>Raspberry Pi 4</strong>{" "}
              (64-bit microSD image). Pi 5 uses the same file but is best-effort
              for this release. Public downloads: PC USB (32-bit and 64-bit) +
              Pi aarch64.
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
            <strong>Revive an old spare PC</strong>
            <span>
              Turn a dusty tower into something useful again without wiping
              Windows permanently — just boot from the stick when you want NEXUS.
            </span>
          </li>
          <li>
            <strong>Keep notes and search them</strong>
            <span>
              Drop text files into the Knowledge Vault and find them later; Chat
              can optionally use those notes as context.
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
              A friendly way to try a Linux-based AI USB without buying new
              hardware.
            </span>
          </li>
        </ul>

        <h3 className="subhead">Words you might see (jargon, explained)</h3>
        <ul className="feature-list">
          <li>
            <strong>Linux</strong>
            <span>
              The kind of operating system under the hood (like Windows or macOS,
              but different). You do not need to “know Linux” — you use the NEXUS
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
              small engine (llama.cpp). A starter model ships on the stick.
            </span>
          </li>
          <li>
            <strong>Knowledge Vault</strong>
            <span>
              Your searchable notebook on the stick — import .txt/.md files and
              look them up.
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
            <strong>NEXUS Network</strong>
            <span>
              Optional future online community. Not required for offline AI. You
              can reserve a username on this website; chat rooms are not live
              yet.
            </span>
          </li>
          <li>
            <strong>i686 vs x86_64 vs aarch64</strong>
            <span>
              <strong>i686</strong> = 32-bit / older XP-era PC;{" "}
              <strong>x86_64</strong> = typical 64-bit PC;{" "}
              <strong>aarch64</strong> = 64-bit Raspberry Pi image. Pick on
              Download.
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
            <strong>Raspberry Pi</strong>
            <span>
              <strong>Pi 4 primary</strong> (2 GB+ RAM; 4 GB+ preferred). Same
              aarch64 image may work on Pi 5 (best-effort). microSD 8 GB+
              recommended. Older Pi / 32-bit boards not in this release.
            </span>
          </li>
          <li>
            <strong>Memory (RAM)</strong>
            <span>
              About 1–2 GB free is the practical floor for the small bundled
              model; more RAM helps with larger models later.
            </span>
          </li>
          <li>
            <strong>PC BIOS</strong>
            <span>
              Ability to boot from USB; Secure Boot off (v1 images are unsigned).
            </span>
          </li>
          <li>
            <strong>Coming later</strong>
            <span>
              Stronger Pi 5 firmware support, older Pi / armv7, Apple Silicon as
              a target, and live Network chat.
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
