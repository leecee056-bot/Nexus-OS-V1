import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "tricass.companion.vault.v1";

export type VaultNote = {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
};

const STARTER: VaultNote[] = [
  {
    id: "starter-guide",
    title: "Tri-Cass companion guide",
    body:
      "This app mirrors the Knowledge Vault idea from the bootable OS.\n\n" +
      "Add short notes here. Search from the Vault screen.\n" +
      "Everything in Vault stays on this device — no cloud account.\n" +
      "Optional: import plain text from Kiwix / Gutenberg via Packs when you want a bigger library.",
    updatedAt: Date.now(),
  },
  {
    id: "starter-offline",
    title: "Offline independence",
    body:
      "Chat and Agent use local Ollama (or a tiny phrase fallback). " +
      "No Tri-Cass Network signup is required.\n\n" +
      "The website is only for downloading Companion builds and OS images. " +
      "Once installed, this app runs without it.",
    updatedAt: Date.now(),
  },
  {
    id: "starter-glossary",
    title: "Glossary",
    body:
      "Hub — main menu on the USB/Pi image.\n" +
      "Vault — searchable notes the Agent can read.\n" +
      "Companion — this Windows/Mac/Android app with Chat + Agent.\n" +
      "Add-ons — plugins the Agent may use (Files, Vault, …).\n" +
      "Pocket / Cardputer — ESP32 firmware paths.",
    updatedAt: Date.now(),
  },
];

export async function loadNotes(): Promise<VaultNote[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    await AsyncStorage.setItem(KEY, JSON.stringify(STARTER));
    return STARTER;
  }
  try {
    const parsed = JSON.parse(raw) as VaultNote[];
    return Array.isArray(parsed) ? parsed : STARTER;
  } catch {
    return STARTER;
  }
}

export async function saveNotes(notes: VaultNote[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(notes));
}

export function searchNotes(notes: VaultNote[], query: string): VaultNote[] {
  const q = query.trim().toLowerCase();
  if (!q) return notes;
  return notes.filter(
    (n) =>
      n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
  );
}
