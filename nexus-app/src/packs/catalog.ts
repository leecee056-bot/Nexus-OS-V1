export type PackSource = {
  id: string;
  title: string;
  blurb: string;
  url: string;
  kind: "browse" | "books" | "wiki" | "coding";
};

/** Public archives — we do not host the large files. */
export const PACK_SOURCES: PackSource[] = [
  {
    id: "kiwix-devdocs",
    title: "DevDocs (via Kiwix)",
    blurb:
      "Offline API docs for many languages (.zim). Browse in Kiwix, then Import useful .txt/.md excerpts into Vault as coding packs for Agent.",
    url: "https://library.kiwix.org/?q=devdocs",
    kind: "coding",
  },
  {
    id: "kiwix-stackoverflow",
    title: "Stack Overflow / Stack Exchange ZIMs",
    blurb:
      "Offline Q&A dumps via Kiwix. Huge — start with a small topic ZIM or export a few threads to plain text before importing.",
    url: "https://download.kiwix.org/zim/stack_exchange/",
    kind: "coding",
  },
  {
    id: "kiwix-library-coding",
    title: "Kiwix library (search coding)",
    blurb:
      "Find DevDocs, Stack Exchange, and other tech ZIMs in the Kiwix library. We do not host these files.",
    url: "https://library.kiwix.org/",
    kind: "coding",
  },
  {
    id: "site-packs-coding",
    title: "Coding packs how-to (website)",
    blurb:
      "Site guide: download → USB Knowledge/coding/ → Import → Agent search_coding_packs. Optional; Chat works without packs.",
    url: "https://nexus-os.apps.grok.bot/knowledge-packs#coding",
    kind: "coding",
  },
  {
    id: "kiwix-library",
    title: "Kiwix library",
    blurb:
      "Offline Wikipedia and more (.zim). Browse on device browser, then import useful plain text into Vault.",
    url: "https://library.kiwix.org/",
    kind: "wiki",
  },
  {
    id: "kiwix-zim",
    title: "Kiwix ZIM downloads",
    blurb: "Direct index of Wikipedia, Wiktionary, Gutenberg ZIMs, and related dumps.",
    url: "https://download.kiwix.org/zim/",
    kind: "wiki",
  },
  {
    id: "gutenberg",
    title: "Project Gutenberg",
    blurb: "Public-domain books — download Plain Text UTF-8, then Import into Vault.",
    url: "https://www.gutenberg.org/",
    kind: "books",
  },
  {
    id: "gutenberg-kiwix",
    title: "Gutenberg via Kiwix",
    blurb: "Book collections packaged as ZIM archives.",
    url: "https://download.kiwix.org/zim/gutenberg/",
    kind: "books",
  },
  {
    id: "site-packs",
    title: "Tri-Cass Knowledge Packs guide (website)",
    blurb:
      "Optional website page — how packs fit USB/Pi, Cardputer, and Companion. Not required for Vault notes you already imported.",
    url: "https://nexus-os.apps.grok.bot/knowledge-packs",
    kind: "browse",
  },
];

export function packsByKind(kind: PackSource["kind"]): PackSource[] {
  return PACK_SOURCES.filter((p) => p.kind === kind);
}
