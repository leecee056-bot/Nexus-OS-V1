/**
 * Lightweight offline chat stub for the companion app (v1).
 * Not a neural model — keyword + phrase replies, same idea as Cardputer TinyChat.
 * Later builds can plug in a local GGUF / on-device runtime.
 */

type Rule = { keys: string[]; reply: string };

const RULES: Rule[] = [
  {
    keys: ["hello", "hi", "hey"],
    reply:
      "Hello. I am the NEXUS Companion offline stub. Ask about vault, boot, pocket, or knowledge packs.",
  },
  {
    keys: ["vault", "notes", "knowledge"],
    reply:
      "Knowledge Vault holds plain .txt/.md notes. Add packs from Gutenberg or your own files — optional, offline.",
  },
  {
    keys: ["boot", "usb", "flash", "etcher"],
    reply:
      "The full OS boots from a USB stick or Pi microSD (Etcher). This app is a companion — no flashing required.",
  },
  {
    keys: ["pocket", "esp32", "cardputer"],
    reply:
      "Pocket needs ESP32-S3 + PSRAM. Cardputer ADV uses TinyChat + optional SD vault. This app runs on Windows/iOS.",
  },
  {
    keys: ["model", "llm", "ai", "smol"],
    reply:
      "v1 chat here is a phrase stub (no heavy model). The USB/Pi image ships SmolLM2; a local model path can come later.",
  },
  {
    keys: ["network", "chat room", "xmpp"],
    reply:
      "NEXUS Network community chat is optional and not live yet. This app can wire to it later without changing the offline core.",
  },
  {
    keys: ["help", "what can"],
    reply:
      "Try: vault, boot, pocket, model, network. Or open Vault / Files from the tab bar.",
  },
];

export function companionReply(prompt: string): string {
  const q = prompt.trim().toLowerCase();
  if (!q) return "Type a short question, then send.";
  for (const rule of RULES) {
    if (rule.keys.some((k) => q.includes(k))) return rule.reply;
  }
  return (
    "No strong match in the offline stub. Try words like vault, boot, pocket, or model — " +
    "or add notes in Vault for your own reference."
  );
}
