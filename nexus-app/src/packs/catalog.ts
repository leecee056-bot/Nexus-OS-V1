export type PackSource = {
  id: string;
  title: string;
  blurb: string;
  url: string;
  kind: "browse" | "books" | "wiki";
};

/** Public archives — we do not host the large files. */
export const PACK_SOURCES: PackSource[] = [
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
    title: "NEXUS Knowledge Packs guide (website)",
    blurb:
      "Optional website page — how packs fit USB/Pi, Cardputer, and Companion. Not required for Vault notes you already imported.",
    url: "https://nexus-os.apps.grok.bot/knowledge-packs",
    kind: "browse",
  },
];
