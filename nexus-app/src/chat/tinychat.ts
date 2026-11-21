/**
 * Offline phrase fallback when Ollama / a local model is not available yet.
 * Real neural chat goes through src/chat/ollama.ts once a model is installed.
 */

type Rule = { keys: string[]; reply: string };

const RULES: Rule[] = [
  {
    keys: ["hello", "hi", "hey"],
    reply:
      "Hello. Open the Model selector to install a local AI (TinyLlama, Qwen, …) via Ollama, then chat for real.",
  },
  {
    keys: ["vault", "notes", "knowledge", "pack", "kiwix", "gutenberg"],
    reply:
      "Knowledge Vault holds plain .txt/.md notes. Open Packs for Kiwix/Gutenberg links, then Import text into Vault — optional, offline.",
  },
  {
    keys: ["android", "apk", "sideload"],
    reply:
      "Android companion installs as a sideload APK. For local AI, run Ollama on a PC on the same Wi‑Fi and set that host in Chat.",
  },
  {
    keys: ["boot", "usb", "flash", "etcher"],
    reply:
      "The full OS boots from a USB stick or Pi microSD (Etcher). This app runs Chat, Vault, Packs, and Files without flashing.",
  },
  {
    keys: ["pocket", "esp32", "cardputer"],
    reply:
      "Pocket needs ESP32-S3 + PSRAM. Cardputer ADV uses TinyChat + optional SD vault. This Companion app runs on Windows, Mac, and Android.",
  },
  {
    keys: ["model", "llm", "ai", "ollama", "qwen", "tinyllama"],
    reply:
      "Tap Model in Chat, pick a lightweight local model, then Get model (Ollama). After that, chat stays offline on your machine.",
  },
  {
    keys: ["mac", "windows", "desktop"],
    reply:
      "Desktop builds are normal apps with the NEXUS logo. Install Ollama once, then download a model from Chat.",
  },
  {
    keys: ["network", "chat room", "xmpp"],
    reply:
      "NEXUS Network community chat is optional and separate. Local model chat does not need it.",
  },
  {
    keys: ["help", "what can"],
    reply:
      "Try: model, vault, boot, android. Or open the Model selector to download a real local AI.",
  },
];

export function companionReply(prompt: string): string {
  const q = prompt.trim().toLowerCase();
  if (!q) return "Type a short question, then send.";
  for (const rule of RULES) {
    if (rule.keys.some((k) => q.includes(k))) return rule.reply;
  }
  return (
    "No strong match in the offline fallback. Open Model → Get a local AI via Ollama, " +
    "or try words like vault, boot, or model."
  );
}
