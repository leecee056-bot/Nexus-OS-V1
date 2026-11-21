/**
 * In-app guides so Help works without the website.
 * Website links remain optional for downloads / fresh installs.
 */

export type OfflineGuide = {
  id: string;
  title: string;
  body: string;
};

export const OFFLINE_GUIDES: OfflineGuide[] = [
  {
    id: "offline",
    title: "Offline independence",
    body:
      "Chat, Agent, Vault, Files, Games, Image Lab, and themes run on this device. " +
      "They talk to local Ollama (or the tiny offline fallback) — not a NEXUS cloud API.\n\n" +
      "The website (nexus-os.apps.grok.bot) is only for downloads, release notes, and optional guides. " +
      "You can ignore every “Downloads / Check for updates” button and still use Companion fully once a model is on disk.\n\n" +
      "First-time model install uses Ollama’s library (one download). After that, chat stays local.",
  },
  {
    id: "quick",
    title: "Quick start (no cloud account)",
    body:
      "1) Install Ollama on this PC (one-time).\n" +
      "2) Chat → Model → Get a lightweight model.\n" +
      "3) Chat offline. Toggle Agent when you want Vault / Files / a website scaffold.\n" +
      "4) No NEXUS Network signup is required for local AI.",
  },
  {
    id: "agent",
    title: "Agent (local tools)",
    body:
      "Agent uses your local model plus on-device tools: Vault search, Packs index, Files, and website scaffolding.\n" +
      "Saying hi never triggers pack searches. Ask explicitly to search or to “make a website…”.",
  },
  {
    id: "packs",
    title: "Knowledge Packs without hosting",
    body:
      "Pack cards open public archives (Kiwix, Gutenberg) when you choose — we do not host the large files.\n" +
      "Import plain .txt / .md into Vault; after import, search stays offline forever.",
  },
  {
    id: "usb",
    title: "USB portable kit",
    body:
      "Unzip the kit onto a stick. Windows\\Start-NEXUS.bat or Mac\\Start-NEXUS.command.\n" +
      "Data/, Knowledge/, Files/, and Chats/ travel with the drive. Ollama can stay on the host PC.",
  },
];

export function guideById(id: string): OfflineGuide | undefined {
  return OFFLINE_GUIDES.find((g) => g.id === id);
}
