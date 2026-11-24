import AsyncStorage from "@react-native-async-storage/async-storage";
import { mergeCodingPackV1 } from "../packs/codingPackV1";

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
      "Add-ons — plugins the Agent may use (Files, Vault, Coding Packs…).\n" +
      "Coding packs — DevDocs / Stack Overflow excerpts tagged pack-coding-* for Agent.\n" +
      "Pocket / Cardputer — ESP32 firmware paths.",
    updatedAt: Date.now(),
  },
  {
    id: "starter-coding-packs",
    title: "Coding packs + small models",
    body:
      "With a ~1.5B (or smaller) local model, prefer:\n" +
      "1) Look up docs in coding packs you imported\n" +
      "2) Use Agent file tools (list / read / write)\n" +
      "3) Make short edits, scripts, or starters — not large apps\n\n" +
      "Packs → Import as coding pack. USB kit tip: Knowledge/coding/*.txt\n" +
      "We don’t host multi-GB ZIMs — download via Kiwix (DevDocs / Stack Exchange).",
    updatedAt: Date.now(),
  },
];

export async function loadNotes(): Promise<VaultNote[]> {
  const raw = await AsyncStorage.getItem(KEY);
  let notes: VaultNote[];
  if (!raw) {
    notes = [...STARTER];
  } else {
    try {
      const parsed = JSON.parse(raw) as VaultNote[];
      notes = Array.isArray(parsed) ? parsed : [...STARTER];
    } catch {
      notes = [...STARTER];
    }
  }
  const { notes: merged, added } = mergeCodingPackV1(notes);
  if (added > 0 || !raw) {
    await AsyncStorage.setItem(KEY, JSON.stringify(merged));
  }
  return merged;
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
