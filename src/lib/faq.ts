export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

/** Shared FAQ copy for the FAQ page and home teaser. */
export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "what-is-it",
    question: "What is Tri-Cass OS?",
    answer:
      "Tri-Cass OS is a ready-made offline AI system. On PC you write it to a USB stick; on Raspberry Pi you write it to a microSD card. Boot from that media for a full on-screen hub (Chat, Vault, tools). Tri-Cass Pocket is the ESP32-S3 companion: a USB-Serial tiny-ML board with its own chat hub — same project family, smaller hardware.",
  },
  {
    id: "need-account",
    question: "Do I need an account or internet to use it?",
    answer:
      "No. Download (or clone Pocket firmware) once, flash it, then boot or open Serial. AI Chat and the other apps run on the machine in front of you. Internet is only needed to download images or the TinyStories model (or to optionally reserve a future Network username on this website).",
  },
  {
    id: "pc-vs-pi",
    question: "Should I download PC, Raspberry Pi, or Pocket?",
    answer:
      "Use a PC USB image for Intel/AMD desktop or laptop machines (32-bit for older XP-era boxes, 64-bit for typical modern PCs). Use the Raspberry Pi image for Pi 4 (primary) or Pi 5 (best-effort) — including cyberdeck and portable builds — flashed to a microSD card. Use Tri-Cass Pocket when you have an ESP32-S3 with PSRAM and want a pocket USB-Serial companion instead of a full Linux hub.",
  },
  {
    id: "pocket",
    question: "What is Tri-Cass Pocket (ESP32)?",
    answer:
      "Pocket is the ESP32-S3 firmware in the nexus-esp32 folder: a Serial hub with offline chat (TinyStories stories260K by default), status, and small tools (mem, notes, calc). It needs PSRAM. Flash with PlatformIO, upload the model to SPIFFS, then open a 115200 baud monitor. It is not a USB/Pi disk image and does not replace the full hub — it is the tiny-board path for PSRAM boards.",
  },
  {
    id: "cardputer",
    question: "What about the M5Stack Cardputer ADV?",
    answer:
      "Use the dedicated Tri-Cass Cardputer ADV firmware in nexus-cardputer/. That device has 8 MB flash and no PSRAM, so it cannot run USB/Pi Linux images or Pocket’s stories260K weights. It boots a green terminal-style hub on the 240×135 screen with keyboard navigation, TinyChat (flash phrase corpus), Notes, Status, and an optional Knowledge Vault on microSD (copy sd-example/tri-cass-vault/ to the card — no card required). See Setup → Cardputer ADV.",
  },
  {
    id: "wipe",
    question: "Will flashing erase my USB stick or microSD card?",
    answer:
      "Yes for PC/Pi disk images. Writing with Etcher (or similar) erases everything already on that stick or card. It does not touch your computer’s hard drive unless you deliberately choose the wrong target — always double-check the device name before you flash. Pocket flashing updates the ESP32 flash/SPIFFS only, not a PC USB stick.",
  },
  {
    id: "windows",
    question: "Does this install inside Windows?",
    answer:
      "No. Tri-Cass OS boots from the stick or card as its own environment. Your existing Windows (or other OS) stays on the hard drive unless you choose to change that yourself. Pocket runs on the ESP32 over USB Serial from any host that can open a serial terminal.",
  },
  {
    id: "models",
    question: "Which AI models are included?",
    answer:
      "PC/Pi sticks ship with a small local text model (SmolLM2) so low-spec machines can run Chat; you can add other open GGUF models later under the data partition. Image Lab / Pixel Art uses a lightweight procedural pixel generator — not a heavy cloud image model. Pocket uses Karpathy-style TinyStories stories260K (~1 MB) on SPIFFS by default; larger ESP32 checkpoints are a later path on 16 MB boards.",
  },
  {
    id: "vault",
    question: "Is there an offline wiki or knowledge base?",
    answer:
      "On PC/Pi: yes — the Knowledge Vault is a searchable notebook on the stick/card. It ships with a small starter pack (Tri-Cass guide, glossary, and short how-tos for flash/boot, Chat, models, and Pi/cyberdecks). It is not a full Wikipedia dump. Add your own .txt/.md files and rebuild the index from the Vault menu; Chat can optionally use matching notes as context. Cardputer ADV can optionally mount the same idea on microSD (/tri-cass-vault plain .txt/.md — streamed, no card required). Pocket has a simple on-device notes tool over Serial, not the full Vault UI. For larger free packs (Kiwix Wikipedia snapshots, Project Gutenberg books), see Optional Knowledge Packs — we point at public archives; we do not host the large files.",
  },
  {
    id: "knowledge-packs",
    question: "What are Optional Knowledge Packs?",
    answer:
      "Free public offline knowledge you can copy onto a spare USB stick or microSD (32 GB+ is plenty for lots of text). Examples: Kiwix Wikipedia/Wiktionary ZIM archives, Project Gutenberg plain-text books, and coding packs (DevDocs / Stack Overflow via Kiwix — extract .txt/.md; we do not host multi-GB dumps). They are completely optional — Tri-Cass works without them. Prefer .txt/.md for Vault, Cardputer, and Companion Agent (Packs → Import as coding pack). Open large .zim files with Kiwix or extract text first. See Knowledge Packs → Coding packs.",
  },
  {
    id: "companion",
    question: "Is there a Windows, Mac, iPhone, or Android app?",
    answer:
      "Yes — Tri-Cass Companion (nexus-app/) for Windows, Mac, iPhone/iPad, and Android. Chat uses real local models through Ollama. Agent mode can search your Knowledge Vault / packs, use the Add-ons library, and create files in Files. Desktop builds use the Tri-Cass logo icon. Android is a sideload APK via GitHub Releases for now (not Play Store yet).",
  },
  {
    id: "cyberdeck",
    question: "Is it good for cyberdecks?",
    answer:
      "Yes. The Raspberry Pi image is a natural fit for DIY cyberdecks, portable terminals, and classroom or makerspace kits: flash a card, boot, and you have offline AI in a compact case. Pocket can sit alongside as a tiny Serial companion board in the same kit.",
  },
  {
    id: "network",
    question: "What is the Network signup on this site?",
    answer:
      "Optional only. Chat rooms are not live yet. Signing up here reserves a username for a future community. You can skip it entirely and still download and run Tri-Cass OS offline (including Pocket).",
  },
  {
    id: "secure-boot",
    question: "Why won’t my PC boot from the stick?",
    answer:
      "Try the USB boot menu (often F12, Esc, or F10), disable Secure Boot if the image is unsigned, and use the matching 32-bit or 64-bit image. See the Setup page for step-by-step checks. (This does not apply to Pocket — that uses a Serial monitor, not PC BIOS boot.)",
  },
  {
    id: "name",
    question: "Is this related to other products with a similar name?",
    answer:
      "No. This site is only for the Tri-Cass OS project (portable offline AI). It is not affiliated with unrelated companies or products that use a similar name.",
  },
];

export const FAQ_TEASER_IDS = [
  "what-is-it",
  "need-account",
  "pc-vs-pi",
  "pocket",
] as const;
