import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "nexus.companion.vault.v1";

export type VaultNote = {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
};

const STARTER: VaultNote[] = [
  {
    id: "starter-guide",
    title: "NEXUS companion guide",
    body:
      "This app mirrors the Knowledge Vault idea from the bootable OS.\n\n" +
      "Add short notes here. Search from the Vault screen.\n" +
      "For larger libraries, see Optional Knowledge Packs on the website.",
    updatedAt: Date.now(),
  },
  {
    id: "starter-glossary",
    title: "Glossary",
    body:
      "Hub — main menu on the USB/Pi image.\n" +
      "Vault — searchable notes.\n" +
      "Companion — this Windows/iOS app (secondary to the bootable OS).\n" +
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
