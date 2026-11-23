import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "tricass.companion.files.v1";

export type DocItem = {
  id: string;
  /** Path-like name, e.g. website/index.html */
  name: string;
  uri: string;
  size?: number | null;
  mimeType?: string | null;
  addedAt: number;
  /** Inline text for agent-created / text imports */
  content?: string | null;
  kind?: "file" | "folder";
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

export function normalizePath(name: string): string {
  return name
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/");
}

export function guessMime(name: string): string {
  const n = name.toLowerCase();
  if (n.endsWith(".html") || n.endsWith(".htm")) return "text/html";
  if (n.endsWith(".css")) return "text/css";
  if (n.endsWith(".js")) return "text/javascript";
  if (n.endsWith(".json")) return "application/json";
  if (n.endsWith(".md")) return "text/markdown";
  if (n.endsWith(".txt")) return "text/plain";
  if (n.endsWith(".svg")) return "image/svg+xml";
  return "text/plain";
}

export async function ensureFolder(path: string): Promise<DocItem> {
  const name = normalizePath(path).replace(/\/$/, "");
  const docs = await loadDocs();
  const existing = docs.find(
    (d) => d.kind === "folder" && normalizePath(d.name) === name,
  );
  if (existing) return existing;
  const folder: DocItem = {
    id: `folder-${Date.now()}-${name}`,
    name,
    uri: `tri-cass-folder://${name}`,
    size: 0,
    mimeType: "inode/directory",
    addedAt: Date.now(),
    kind: "folder",
    content: null,
  };
  await saveDocs([folder, ...docs].slice(0, 200));
  return folder;
}

export async function writeTextFile(
  path: string,
  content: string,
): Promise<DocItem> {
  const name = normalizePath(path);
  const parts = name.split("/");
  if (parts.length > 1) {
    await ensureFolder(parts.slice(0, -1).join("/"));
  }
  const docs = await loadDocs();
  const mime = guessMime(name);
  const next: DocItem = {
    id: `file-${Date.now()}-${name}`,
    name,
    uri: `tri-cass-text://${encodeURIComponent(name)}`,
    size: content.length,
    mimeType: mime,
    addedAt: Date.now(),
    kind: "file",
    content,
  };
  const others = docs.filter(
    (d) => !(d.kind !== "folder" && normalizePath(d.name) === name),
  );
  await saveDocs([next, ...others].slice(0, 200));
  return next;
}

export async function readTextFile(
  path: string,
): Promise<{ ok: true; doc: DocItem; text: string } | { ok: false; error: string }> {
  const name = normalizePath(path);
  const docs = await loadDocs();
  const doc = docs.find(
    (d) => d.kind !== "folder" && normalizePath(d.name) === name,
  );
  if (!doc) return { ok: false, error: `No file named ${name}` };
  if (doc.content != null && doc.content !== "") {
    return { ok: true, doc, text: doc.content };
  }
  return {
    ok: false,
    error: `${name} has no readable text body (binary or external URI).`,
  };
}

export function listTree(docs: DocItem[], prefix = ""): string[] {
  const p = normalizePath(prefix);
  return docs
    .filter((d) => {
      const n = normalizePath(d.name);
      if (!p) return true;
      return n === p || n.startsWith(p + "/");
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((d) => `${d.kind === "folder" ? "📁" : "📄"} ${d.name}`);
}
