import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "nexus.chat.history.v1";

export type StoredChatMsg = {
  id: string;
  role: "you" | "nexus";
  text: string;
};

const STARTER: StoredChatMsg[] = [
  {
    id: "0",
    role: "nexus",
    text: "Agent mode can search your Vault, use Add-ons, and write files. Pick a local model, then ask away.",
  },
];

export async function loadChatHistory(): Promise<StoredChatMsg[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [...STARTER];
    const parsed = JSON.parse(raw) as StoredChatMsg[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [...STARTER];
    return parsed.slice(-80);
  } catch {
    return [...STARTER];
  }
}

export async function saveChatHistory(msgs: StoredChatMsg[]): Promise<void> {
  try {
    const clipped = msgs.slice(-80);
    await AsyncStorage.setItem(KEY, JSON.stringify(clipped));
  } catch {
    /* ignore */
  }
}

export function chatToMarkdown(msgs: StoredChatMsg[]): string {
  const lines = [
    `# NEXUS Companion chat`,
    ``,
    `_Exported ${new Date().toISOString()}_`,
    ``,
  ];
  for (const m of msgs) {
    lines.push(`## ${m.role === "you" ? "You" : "NEXUS"}`);
    lines.push(m.text);
    lines.push("");
  }
  return lines.join("\n");
}
