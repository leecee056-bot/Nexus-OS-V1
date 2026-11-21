import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "nexus.companion.files.v1";

export type DocItem = {
  id: string;
  name: string;
  uri: string;
  size?: number | null;
  mimeType?: string | null;
  addedAt: number;
};

export async function loadDocs(): Promise<DocItem[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as DocItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveDocs(docs: DocItem[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(docs));
}
