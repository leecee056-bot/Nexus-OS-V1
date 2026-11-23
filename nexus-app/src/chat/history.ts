import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVE_KEY = "tricass.chat.history.v1";
const SESSIONS_KEY = "tricass.chat.sessions.v1";

export type StoredChatMsg = {
  id: string;
  role: "you" | "tricass";
  text: string;
};

export type ChatSessionMeta = {
  id: string;
  title: string;
  updatedAt: string;
  preview: string;
};

export type ChatSession = ChatSessionMeta & {
  messages: StoredChatMsg[];
};

const STARTER: StoredChatMsg[] = [
  {
    id: "0",
    role: "tricass",
    text: "Agent mode can search your Vault, use Add-ons, and write files. Pick a local model, then ask away.",
  },
];

function titleFromMessages(msgs: StoredChatMsg[]): string {
  const firstYou = msgs.find((m) => m.role === "you" && m.text.trim());
  if (firstYou) {
    const t = firstYou.text.trim().replace(/\s+/g, " ");
    return t.length > 42 ? `${t.slice(0, 40)}…` : t;
  }
  return "New chat";
}

function previewFromMessages(msgs: StoredChatMsg[]): string {
  const last = [...msgs].reverse().find((m) => m.text.trim() && m.id !== "0");
  if (!last) return "Empty chat";
  const t = last.text.trim().replace(/\s+/g, " ");
  return t.length > 64 ? `${t.slice(0, 62)}…` : t;
}

export function starterMessages(): StoredChatMsg[] {
  return [...STARTER];
}

export async function loadChatHistory(): Promise<StoredChatMsg[]> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_KEY);
    if (!raw) return starterMessages();
    const parsed = JSON.parse(raw) as StoredChatMsg[];
    if (!Array.isArray(parsed) || parsed.length === 0) return starterMessages();
    return parsed.slice(-200);
  } catch {
    return starterMessages();
  }
}

export async function saveChatHistory(msgs: StoredChatMsg[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(msgs.slice(-200)));
  } catch {
    /* ignore */
  }
}

async function readSessions(): Promise<ChatSession[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatSession[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s) => s && typeof s.id === "string" && Array.isArray(s.messages))
      .slice(0, 40);
  } catch {
    return [];
  }
}

async function writeSessions(sessions: ChatSession[]): Promise<void> {
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 40)));
}

/** Persist current transcript into the session library (Save / archive). */
export async function archiveChatSession(
  msgs: StoredChatMsg[],
): Promise<ChatSessionMeta | null> {
  const meaningful = msgs.filter((m) => m.id !== "0" && m.text.trim());
  if (meaningful.length === 0) return null;
  const session: ChatSession = {
    id: `chat-${Date.now()}`,
    title: titleFromMessages(msgs),
    updatedAt: new Date().toISOString(),
    preview: previewFromMessages(msgs),
    messages: msgs.slice(-200),
  };
  const all = await readSessions();
  all.unshift(session);
  await writeSessions(all);
  return {
    id: session.id,
    title: session.title,
    updatedAt: session.updatedAt,
    preview: session.preview,
  };
}

export async function listChatSessions(): Promise<ChatSessionMeta[]> {
  const all = await readSessions();
  return all.map(({ id, title, updatedAt, preview }) => ({
    id,
    title,
    updatedAt,
    preview,
  }));
}

export async function openChatSession(
  id: string,
): Promise<StoredChatMsg[] | null> {
  const all = await readSessions();
  const hit = all.find((s) => s.id === id);
  if (!hit) return null;
  await saveChatHistory(hit.messages);
  return hit.messages;
}

export async function deleteChatSession(id: string): Promise<void> {
  const all = await readSessions();
  await writeSessions(all.filter((s) => s.id !== id));
}

export function chatToMarkdown(msgs: StoredChatMsg[]): string {
  const lines = [
    `# Tri-Cass Companion chat`,
    ``,
    `_Exported ${new Date().toISOString()}_`,
    ``,
  ];
  for (const m of msgs) {
    lines.push(`## ${m.role === "you" ? "You" : "Tri-Cass"}`);
    lines.push(m.text);
    lines.push("");
  }
  return lines.join("\n");
}
