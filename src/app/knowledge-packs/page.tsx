import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Optional Knowledge Packs",
  description:
    "Free public offline knowledge sources you can copy onto a USB stick or microSD for NEXUS OS and Cardputer ADV — optional, not hosted by us.",
};

export default function KnowledgePacksPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>Optional Knowledge Packs</h2>
        <p className="lede">
          Expand offline knowledge on a spare USB stick or microSD card — without
          us hosting huge files. The built-in starter Vault is enough to get
          going; these packs are for people who want more.
        </p>

        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          <strong>Optional.</strong> NEXUS OS, Pocket, and Cardputer ADV all work
          without any of these downloads. Use them only if you have spare space
          (a <strong>32 GB+</strong> stick or card is plenty for lots of text)
          and want Wikipedia-style pages, books, or other reference material the
          AI can look up offline.
        </div>

        <nav className="jump-chips" aria-label="On this page">
          <a href="#why">Why</a>
          <a href="#sources">Public sources</a>
          <a href="#how">How to load</a>
          <a href="#paths">Where files go</a>
          <Link href="/setup">Setup</Link>
          <Link href="/download">Download</Link>
        </nav>

        <div className="panel" id="why" style={{ marginTop: "1.5rem" }}>
          <h3>Why this exists</h3>
          <p>
            The image and firmware stay small. You already own storage — so we
            point you at free, public offline archives. You download a pack once,
            copy it onto the stick or card, and search it locally. No cloud
            account, and we do not host the large dumps.
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            Best fit: you have already flashed NEXUS OS (or Cardputer), tried the
            starter Vault notes, and want more reference text for offline
            lookup.
          </p>
        </div>

        <h3 className="subhead" id="sources" style={{ marginTop: "2rem" }}>
          Practical public sources
        </h3>
        <p className="lede" style={{ marginBottom: "1rem" }}>
          These projects publish free offline material. Prefer{" "}
          <strong>plain text</strong> (
          <code className="mono">.txt</code> / <code className="mono">.md</code>
          ) for the NEXUS Knowledge Vault and Cardputer. Large{" "}
          <code className="mono">.zim</code> archives are great with a Kiwix
          reader; for Vault search, extract or pick text editions.
        </p>

        <div className="panel">
          <h3>Kiwix — Wikipedia &amp; more (offline ZIM)</h3>
          <p>
            Popular offline snapshots of Wikipedia, Wiktionary, Stack Exchange,
            and other sites in the compressed <code className="mono">.zim</code>{" "}
            format. Browse with{" "}
            <a href="https://www.kiwix.org/" rel="noopener noreferrer">
              Kiwix
            </a>{" "}
            on a PC or Pi. For NEXUS Vault / Cardputer, convert or export useful
            articles to plain <code className="mono">.txt</code> /{" "}
            <code className="mono">.md</code> (a full English Wikipedia dump can
            be many gigabytes — start with a small language or “nopic” /
            “mini” pack if you try ZIM first).
          </p>
          <ul className="feature-list" style={{ marginTop: "0.75rem" }}>
            <li>
              <strong>Library</strong>
              <span>
                <a
                  href="https://library.kiwix.org/"
                  rel="noopener noreferrer"
                >
                  library.kiwix.org
                </a>{" "}
                — pick a wiki or topic, then download.
              </span>
            </li>
            <li>
              <strong>Direct ZIM index</strong>
              <span>
                <a
                  href="https://download.kiwix.org/zim/"
                  rel="noopener noreferrer"
                >
                  download.kiwix.org/zim/
                </a>{" "}
                — Wikipedia, Wiktionary, Gutenberg ZIMs, and more.
              </span>
            </li>
          </ul>
        </div>

        <div className="panel">
          <h3>Project Gutenberg — plain text books</h3>
          <p>
            Free public-domain books. Many titles offer a{" "}
            <strong>Plain Text UTF-8</strong> download — ideal for Vault and
            Cardputer. Copy a handful of favourites as{" "}
            <code className="mono">.txt</code> into your vault folder; a 32 GB
            stick can hold thousands of books if you want a larger library.
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            Start at{" "}
            <a href="https://www.gutenberg.org/" rel="noopener noreferrer">
              gutenberg.org
            </a>{" "}
            → open a book → download plain text. Kiwix also ships Gutenberg
            collections as ZIM under{" "}
            <a
              href="https://download.kiwix.org/zim/gutenberg/"
              rel="noopener noreferrer"
            >
              download.kiwix.org/zim/gutenberg/
            </a>
            .
          </p>
        </div>

        <div className="panel">
          <h3>Other useful free text</h3>
          <ul className="feature-list">
            <li>
              <strong>Wiktionary / Wikisource</strong>
              <span>
                Dictionaries and source texts via Kiwix (
                <a
                  href="https://download.kiwix.org/zim/wiktionary/"
                  rel="noopener noreferrer"
                >
                  wiktionary
                </a>
                ,{" "}
                <a
                  href="https://download.kiwix.org/zim/wikisource/"
                  rel="noopener noreferrer"
                >
                  wikisource
                </a>
                ) or exported article text for Vault.
              </span>
            </li>
            <li>
              <strong>Your own notes</strong>
              <span>
                Drop any short <code className="mono">.txt</code> /{" "}
                <code className="mono">.md</code> guides, cheatsheets, or class
                notes into the same vault folder — often the most useful pack of
                all.
              </span>
            </li>
            <li>
              <strong>Starter example (Cardputer)</strong>
              <span>
                Tiny sample layout in the repo:{" "}
                <code className="mono">nexus-cardputer/sd-example/</code> — see{" "}
                <Link href="/setup#cardputer">Cardputer setup</Link>.
              </span>
            </li>
          </ul>
        </div>

        <h3 className="subhead" id="how" style={{ marginTop: "2rem" }}>
          How to load a pack
        </h3>
        <ol className="steps">
          <li>
            <strong>Download</strong>
            <span>
              {" "}
              Grab plain text from Gutenberg (or extract text from a small
              Kiwix/wiki pack). Keep filenames simple.
            </span>
          </li>
          <li>
            <strong>Copy onto the media</strong>
            <span>
              {" "}
              Put the files where NEXUS expects them (see paths below). Do not
              overwrite the whole OS image — only add knowledge files beside it
              (or onto the Cardputer microSD).
            </span>
          </li>
          <li>
            <strong>Use it offline</strong>
            <span>
              {" "}
              <strong>PC / Pi:</strong> boot → Hub →{" "}
              <strong>Vault</strong> → rebuild the index if asked, then search.{" "}
              <strong>Cardputer ADV:</strong> Hub → <strong>Vault</strong> →
              browse or type a word + Enter to search.
            </span>
          </li>
        </ol>

        <div className="panel" id="paths" style={{ marginTop: "1.5rem" }}>
          <h3>Where files go</h3>
          <ul className="feature-list">
            <li>
              <strong>PC USB / Raspberry Pi</strong>
              <span>
                Add plain <code className="mono">.txt</code> /{" "}
                <code className="mono">.md</code> into the Knowledge Vault on the
                stick or card (data / vault area). Open Vault and rebuild the
                index so new files are searchable. Chat can use matching notes
                as context when that option is on.
              </span>
            </li>
            <li>
              <strong>Cardputer ADV microSD</strong>
              <span>
                FAT card. Preferred folder:{" "}
                <code className="mono">/nexus-vault/</code> at the card root
                (also accepts <code className="mono">/vault/</code> or a single{" "}
                <code className="mono">/nexus-vault.txt</code>). Keep files
                short — the screen is small and the hub lists a limited number
                of notes. Firmware still runs with no card.
              </span>
            </li>
            <li>
              <strong>Example layout</strong>
              <pre className="panel mono" style={{ marginTop: "0.5rem" }}>
{`USB or microSD (knowledge side)
├── vault/                 ← PC/Pi: your .txt / .md notes
│   ├── guide.txt
│   ├── glossary.txt
│   └── books/
│       └── frankenstein.txt
└── nexus-vault/           ← Cardputer ADV preferred path
    ├── 00-readme.txt
    └── cheatsheet.txt`}
              </pre>
            </li>
          </ul>
          <p style={{ marginTop: "0.75rem" }}>
            Tip: start with a few megabytes of text you care about. You can
            always fill the rest of a 32 GB card later. Huge media-heavy ZIM
            packs are better opened in Kiwix; Vault works best with searchable
            plain text.
          </p>
        </div>

        <div className="cta-row" style={{ marginTop: "2rem" }}>
          <Link className="btn" href="/download">
            Download NEXUS OS
          </Link>
          <Link className="btn btn-ghost" href="/setup">
            Setup guide
          </Link>
          <Link className="btn btn-quiet" href="/faq#vault">
            Vault FAQ
          </Link>
          <a className="btn btn-quiet" href="/guides/knowledge-packs.md">
            Short guide (markdown)
          </a>
        </div>
      </div>
    </section>
  );
}
