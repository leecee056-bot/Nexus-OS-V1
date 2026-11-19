export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

/** Shared FAQ copy for the FAQ page and home teaser. */
export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "what-is-it",
    question: "What is NEXUS OS?",
    answer:
      "NEXUS OS is a ready-made system you write to a USB stick (PC) or microSD card (Raspberry Pi). Boot from that media and you get a simple on-screen menu with offline AI chat and tools — without installing onto your hard drive.",
  },
  {
    id: "need-account",
    question: "Do I need an account or internet to use it?",
    answer:
      "No. Download the image once, flash it, then boot. AI Chat and the other apps run on the machine in front of you. Internet is only needed to download the image (or to optionally reserve a future Network username on this website).",
  },
  {
    id: "pc-vs-pi",
    question: "Should I download the PC or Raspberry Pi image?",
    answer:
      "Use a PC USB image for Intel/AMD desktop or laptop machines (32-bit for older XP-era boxes, 64-bit for typical modern PCs). Use the Raspberry Pi image for Pi 4 (primary) or Pi 5 (best-effort) — including cyberdeck and portable builds. Flash the Pi image to a microSD card, not a USB stick meant for a PC.",
  },
  {
    id: "wipe",
    question: "Will flashing erase my USB stick or microSD card?",
    answer:
      "Yes. Writing the image with Etcher (or similar) erases everything already on that stick or card. It does not touch your computer’s hard drive unless you deliberately choose the wrong target — always double-check the device name before you flash.",
  },
  {
    id: "windows",
    question: "Does this install inside Windows?",
    answer:
      "No. NEXUS OS boots from the stick or card as its own environment. Your existing Windows (or other OS) stays on the hard drive unless you choose to change that yourself.",
  },
  {
    id: "models",
    question: "Which AI models are included?",
    answer:
      "The stick/card ships with a small local text model (SmolLM2) so low-spec machines can run Chat. You can add other open GGUF models later under the data partition. Image Lab / Pixel Art uses a lightweight procedural pixel generator — not a heavy cloud image model — so it stays usable on modest RAM.",
  },
  {
    id: "cyberdeck",
    question: "Is it good for cyberdecks?",
    answer:
      "Yes. The Raspberry Pi image is a natural fit for DIY cyberdecks, portable terminals, and classroom or makerspace kits: flash a card, boot, and you have offline AI in a compact case.",
  },
  {
    id: "network",
    question: "What is the Network signup on this site?",
    answer:
      "Optional only. Chat rooms are not live yet. Signing up here reserves a username for a future community. You can skip it entirely and still download and run NEXUS OS offline.",
  },
  {
    id: "secure-boot",
    question: "Why won’t my PC boot from the stick?",
    answer:
      "Try the USB boot menu (often F12, Esc, or F10), disable Secure Boot if the image is unsigned, and use the matching 32-bit or 64-bit image. See the Setup page for step-by-step checks.",
  },
  {
    id: "name",
    question: "Is this related to other products named Nexus?",
    answer:
      "No. This site is only for the NEXUS OS project (portable offline AI). It is not affiliated with unrelated companies or products that use the same word.",
  },
];

export const FAQ_TEASER_IDS = [
  "what-is-it",
  "need-account",
  "pc-vs-pi",
  "wipe",
] as const;
