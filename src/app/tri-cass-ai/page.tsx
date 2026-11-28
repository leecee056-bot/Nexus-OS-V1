import type { Metadata } from "next";
import Link from "next/link";
import {
  TRI_CASS_AI_ARTIFACTS,
  TRI_CASS_AI_RELEASE_PAGE,
  TRI_CASS_AI_RELEASES_LATEST,
  TRI_CASS_AI_REPO_URL,
  TRI_CASS_AI_VERSION,
  TRI_CASS_AI_WINDOWS_PORTABLE_FILENAME,
  TRI_CASS_AI_WINDOWS_PORTABLE_SIZE_LABEL,
  TRI_CASS_AI_WINDOWS_PORTABLE_URL,
} from "@/lib/artifacts";

export const metadata: Metadata = {
  title: "Tri Cass AI",
  description:
    "Download Tri Cass AI — local AI that creates websites and apps on disk. No coding required. Windows x64 portable, Ollama chat, templates, knowledge base, and glass Appearance.",
};

const SCREENSHOTS = [
  {
    src: "/images/tri-cass-ai/ui-splash.png?v=20261127",
    alt: "Tri Cass AI splash screen with wizard-hat brand mark",
    caption: "Splash — Tri Cass AI brand mark",
  },
  {
    src: "/images/tri-cass-ai/ui-shell.png?v=20261127",
    alt: "Tri Cass AI main chat shell",
    caption: "Chat shell — ask for a site or app, get real files on disk",
  },
  {
    src: "/images/tri-cass-ai/ui-models.png?v=20261127",
    alt: "Tri Cass AI model catalog",
    caption: "Models — one-click Ollama catalog (Qwen, Granite, and more)",
  },
  {
    src: "/images/tri-cass-ai/ui-templates.png?v=20261127",
    alt: "Tri Cass AI template library",
    caption: "Templates — ~1000 starter packs the AI can edit",
  },
  {
    src: "/images/tri-cass-ai/ui-ascii.png?v=20261127",
    alt: "Tri Cass AI ASCII art tools",
    caption: "ASCII — figlet text and image→ASCII",
  },
  {
    src: "/images/tri-cass-ai/ui-glass-digital.png?v=20261127",
    alt: "Tri Cass AI glass digital Appearance",
    caption: "Appearance — glass over wallpaper (digital texture)",
  },
  {
    src: "/images/tri-cass-ai/ui-settings-appearance.png?v=20261127",
    alt: "Tri Cass AI Appearance settings",
    caption: "Settings — light / dark / system plus five bundled textures",
  },
  {
    src: "/images/tri-cass-ai/ui-about.png?v=20261127",
    alt: "Tri Cass AI About dialog",
    caption: "About — version and product info",
  },
] as const;

export default function TriCassAiPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>Tri Cass AI</h2>
        <p className="lede">
          Local AI that creates websites and apps on your disk — no coding
          required. Chat, pick a model, and say what you want; Tri Cass AI writes
          real folders and files on your PC.
        </p>

        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          <strong>Standalone app</strong> — separate from Tri-Cass Desk and the
          USB hub. Windows x64 portable first. Needs{" "}
          <a href="https://ollama.com/download">Ollama</a> on the same machine
          (~8&nbsp;GB RAM household PC).{" "}
          <strong>v{TRI_CASS_AI_VERSION}</strong> adds New chat / rename / save,
          coherent scaffolds, and template pick — plus create-on-disk verify,
          Plan/Act, checkpoints, per-chat KB, and the run panel.
        </div>

        {TRI_CASS_AI_ARTIFACTS.map((a) => (
          <div className="panel" id="download" key={a.id}>
            <h3>
              Download — {a.label}{" "}
              <span
                className="mono"
                style={{ fontWeight: 400, fontSize: "0.9em" }}
              >
                v{TRI_CASS_AI_VERSION}
              </span>
            </h3>
            <p>{a.guidance}</p>
            <p style={{ marginTop: "0.75rem" }}>
              <strong>File:</strong> <span className="mono">{a.filename}</span>
              <br />
              <strong>Size:</strong> {a.sizeLabel} (exact GitHub Release asset)
              <br />
              <strong>Platform:</strong> Windows x64 portable
              <br />
              <strong>Version:</strong> v{TRI_CASS_AI_VERSION}
            </p>
            <div className="cta-row" style={{ marginTop: "0.85rem" }}>
              <a className="btn" href={a.url}>
                Download Windows portable ({a.sizeLabel})
              </a>
              <a className="btn btn-ghost" href={TRI_CASS_AI_RELEASE_PAGE}>
                Release notes
              </a>
              <a className="btn btn-quiet" href={TRI_CASS_AI_RELEASES_LATEST}>
                Latest releases
              </a>
              <a className="btn btn-quiet" href={TRI_CASS_AI_REPO_URL}>
                Source on GitHub
              </a>
            </div>
            <details className="verify-block" style={{ marginTop: "0.85rem" }}>
              <summary>Verify this download (optional)</summary>
              <p>
                <strong>Checksum (SHA256):</strong>{" "}
                <span className="mono hash">{a.sha256}</span>
              </p>
              <p style={{ marginTop: "0.5rem" }}>
                Windows PowerShell:{" "}
                <code className="mono">
                  Get-FileHash .\\{a.filename} -Algorithm SHA256
                </code>
              </p>
            </details>
          </div>
        ))}

        <h3 className="subhead" style={{ marginTop: "2rem" }}>
          Features
        </h3>
        <ul className="feature-list">
          <li>
            <strong>Chat → real projects</strong>
            <span>
              Ask for a website or app; Tri Cass AI creates folders and files on
              disk — no cloud coding sandbox.
            </span>
          </li>
          <li>
            <strong>Model catalog</strong>
            <span>
              One-click / dropdown models via Ollama (Qwen, Granite, 3B / 8B /
              larger when your PC allows).
            </span>
          </li>
          <li>
            <strong>Knowledge base</strong>
            <span>
              Attach docs to the current chat so answers stay grounded in your
              notes and project files.
            </span>
          </li>
          <li>
            <strong>~1000 templates</strong>
            <span>
              Free starter packs the AI can edit — sites, scaffolds, and more —
              without starting from a blank folder.
            </span>
          </li>
          <li>
            <strong>ASCII &amp; image tools</strong>
            <span>
              Figlet-style ASCII art, image→ASCII, and local image generation
              when you enable it.
            </span>
          </li>
          <li>
            <strong>Android scaffolds</strong>
            <span>
              No-code prompts for Android-oriented project starters alongside
              website scaffolds.
            </span>
          </li>
          <li>
            <strong>Appearance glass</strong>
            <span>
              Light / dark / system themes with glass over wallpaper — five
              bundled textures (digital, wild/jungle, clean modern, geometric,
              cosmic) plus custom user textures.
            </span>
          </li>
        </ul>

        <h3 className="subhead" style={{ marginTop: "2rem" }}>
          System requirements
        </h3>
        <div className="panel">
          <ul className="steps" style={{ listStyle: "disc", paddingLeft: "1.25rem" }}>
            <li>
              <strong>OS:</strong> Windows 10/11 x64 (portable zip first)
            </li>
            <li>
              <strong>RAM:</strong> about 8&nbsp;GB for a typical household PC
              (more helps larger models)
            </li>
            <li>
              <strong>Ollama:</strong> install{" "}
              <a href="https://ollama.com/download">Ollama</a> on the same
              machine; recommended starter model{" "}
              <code className="mono">qwen2.5-coder:3b</code>
            </li>
            <li>
              <strong>Disk:</strong> room for the app (
              {TRI_CASS_AI_WINDOWS_PORTABLE_SIZE_LABEL} download) plus models you
              pull
            </li>
          </ul>
        </div>

        <h3 className="subhead" id="screenshots" style={{ marginTop: "2rem" }}>
          Screenshots
        </h3>
        {SCREENSHOTS.map((shot) => (
          <figure className="shot" key={shot.src}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shot.src} alt={shot.alt} />
            <figcaption>{shot.caption}</figcaption>
          </figure>
        ))}

        <h3 className="subhead" style={{ marginTop: "2rem" }}>
          After you download
        </h3>
        <ol className="steps">
          <li>
            Unzip <code className="mono">{TRI_CASS_AI_WINDOWS_PORTABLE_FILENAME}</code>
            .
          </li>
          <li>
            Install and start <a href="https://ollama.com/download">Ollama</a>,
            then pull a model (e.g.{" "}
            <code className="mono">ollama pull qwen2.5-coder:3b</code>).
          </li>
          <li>
            Run <code className="mono">Tri Cass AI.exe</code>, open Chat, and ask
            it to make a website or app on disk.
          </li>
        </ol>

        <div className="cta-row" style={{ marginTop: "1.25rem" }}>
          <a className="btn" href={TRI_CASS_AI_WINDOWS_PORTABLE_URL}>
            Download Tri Cass AI
          </a>
          <Link className="btn btn-ghost" href="/download">
            All Tri-Cass downloads
          </Link>
          <Link className="btn btn-quiet" href="/download#desk">
            Tri-Cass Desk
          </Link>
        </div>
      </div>
    </section>
  );
}
