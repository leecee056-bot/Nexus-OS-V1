import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  diskList,
  diskMkdir,
  diskRead,
  diskRemove,
  diskRename,
  diskWrite,
  hasWorkspaceDisk,
} from "./diskBridge";
import {
  assertAllowedFilePath,
  assertSafeRelPath,
  normalizeWorkspacePath,
  type FileChange,
} from "./workspace";

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

export { normalizeWorkspacePath as normalizePath } from "./workspace";
export type { FileChange };

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

export function guessMime(name: string): string {
  const n = name.toLowerCase();
  if (n.endsWith(".html") || n.endsWith(".htm")) return "text/html";
  if (n.endsWith(".css")) return "text/css";
  if (n.endsWith(".js") || n.endsWith(".mjs") || n.endsWith(".cjs")) {
    return "text/javascript";
  }
  if (n.endsWith(".ts") || n.endsWith(".tsx")) return "text/typescript";
  if (n.endsWith(".json")) return "application/json";
  if (n.endsWith(".md") || n.endsWith(".markdown")) return "text/markdown";
  if (n.endsWith(".txt")) return "text/plain";
  if (n.endsWith(".svg")) return "image/svg+xml";
  if (n.endsWith(".py")) return "text/x-python";
  if (n.endsWith(".sh") || n.endsWith(".bash")) return "text/x-shellscript";
  return "text/plain";
}

export async function ensureFolder(path: string): Promise<DocItem> {
  const name = assertSafeRelPath(path);
  const disk = await diskMkdir(name);
  if (disk && !disk.ok) {
    throw new Error(disk.error || "Could not create folder on disk.");
  }
  const docs = await loadDocs();
  const existing = docs.find(
    (d) => d.kind === "folder" && normalizeWorkspacePath(d.name) === name,
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
  await saveDocs([folder, ...docs].slice(0, 400));
  return folder;
}

export async function writeTextFile(
  path: string,
  content: string,
): Promise<{ doc: DocItem; change: FileChange }> {
  const name = assertAllowedFilePath(path);
  const parts = name.split("/");
  if (parts.length > 1) {
    await ensureFolder(parts.slice(0, -1).join("/"));
  }

  const disk = await diskWrite(name, content);
  if (disk && !disk.ok) {
    throw new Error(disk.error || "Could not write file on disk.");
  }

  const docs = await loadDocs();
  const prev = docs.find(
    (d) => d.kind !== "folder" && normalizeWorkspacePath(d.name) === name,
  );
  const mime = guessMime(name);
  const next: DocItem = {
    id: prev?.id || `file-${Date.now()}-${name}`,
    name,
    uri: `tri-cass-text://${encodeURIComponent(name)}`,
    size: content.length,
    mimeType: mime,
    addedAt: Date.now(),
    kind: "file",
    content,
  };
  const others = docs.filter(
    (d) => !(d.kind !== "folder" && normalizeWorkspacePath(d.name) === name),
  );
  await saveDocs([next, ...others].slice(0, 400));
  return {
    doc: next,
    change: {
      action: prev ? "updated" : "created",
      path: name,
    },
  };
}

/** Alias used by agent schema — same as writeTextFile. */
export async function createTextFile(path: string, content = "") {
  return writeTextFile(path, content);
}

export async function readTextFile(
  path: string,
): Promise<{ ok: true; doc: DocItem; text: string } | { ok: false; error: string }> {
  let name: string;
  try {
    name = assertSafeRelPath(path);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Bad path",
    };
  }

  const disk = await diskRead(name);
  if (disk?.ok && typeof disk.text === "string") {
    const docs = await loadDocs();
    let doc = docs.find(
      (d) => d.kind !== "folder" && normalizeWorkspacePath(d.name) === name,
    );
    if (!doc) {
      doc = {
        id: `file-disk-${name}`,
        name,
        uri: `tri-cass-text://${encodeURIComponent(name)}`,
        size: disk.text.length,
        mimeType: guessMime(name),
        addedAt: Date.now(),
        kind: "file",
        content: disk.text,
      };
    }
    return { ok: true, doc, text: disk.text };
  }

  const docs = await loadDocs();
  const doc = docs.find(
    (d) => d.kind !== "folder" && normalizeWorkspacePath(d.name) === name,
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

export async function renamePath(
  fromRaw: string,
  toRaw: string,
): Promise<{ change: FileChange }> {
  const from = assertSafeRelPath(fromRaw);
  const toBase = assertSafeRelPath(toRaw);
  // If renaming a file, enforce extension on destination
  const docs = await loadDocs();
  const src = docs.find((d) => normalizeWorkspacePath(d.name) === from);
  let isFolder = src?.kind === "folder";
  if (!src && hasWorkspaceDisk()) {
    const listed = await diskList(from);
    const hit = listed?.entries?.find((e) => e.name === from);
    if (hit?.kind === "folder") isFolder = true;
    // Disk-only file: still require allowed extension on destination
  }
  const to = isFolder ? toBase : assertAllowedFilePath(toRaw);

  const disk = await diskRename(from, to);
  if (disk && !disk.ok) {
    throw new Error(disk.error || "Could not rename on disk.");
  }

  const next = docs
    .map((d) => {
      const n = normalizeWorkspacePath(d.name);
      if (n === from) {
        return {
          ...d,
          name: to,
          uri:
            d.kind === "folder"
              ? `tri-cass-folder://${to}`
              : `tri-cass-text://${encodeURIComponent(to)}`,
        };
      }
      if (n.startsWith(from + "/")) {
        const renamed = to + n.slice(from.length);
        return {
          ...d,
          name: renamed,
          uri:
            d.kind === "folder"
              ? `tri-cass-folder://${renamed}`
              : `tri-cass-text://${encodeURIComponent(renamed)}`,
        };
      }
      return d;
    })
    .slice(0, 400);
  await saveDocs(next);
  return { change: { action: "renamed", path: to, from } };
}

export async function deletePath(
  pathRaw: string,
): Promise<{ change: FileChange }> {
  const name = assertSafeRelPath(pathRaw);
  const disk = await diskRemove(name);
  if (disk && !disk.ok) {
    throw new Error(disk.error || "Could not delete on disk.");
  }
  const docs = await loadDocs();
  const next = docs.filter((d) => {
    const n = normalizeWorkspacePath(d.name);
    return !(n === name || n.startsWith(name + "/"));
  });
  await saveDocs(next);
  return { change: { action: "deleted", path: name } };
}

export function listTree(docs: DocItem[], prefix = ""): string[] {
  const p = normalizeWorkspacePath(prefix);
  return docs
    .filter((d) => {
      const n = normalizeWorkspacePath(d.name);
      if (!p) return true;
      return n === p || n.startsWith(p + "/");
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((d) => `${d.kind === "folder" ? "📁" : "📄"} ${d.name}`);
}

/** Merge AsyncStorage index with optional on-disk listing. */
export async function listWorkspace(prefix = ""): Promise<string[]> {
  const docs = await loadDocs();
  const virtual = listTree(docs, prefix);
  if (!hasWorkspaceDisk()) return virtual;

  const disk = await diskList(prefix);
  if (!disk?.ok || !disk.entries) return virtual;

  const seen = new Set(
    virtual.map((line) => line.replace(/^[📁📄]\s+/, "")),
  );
  const extra = disk.entries
    .filter((e) => !seen.has(e.name))
    .map((e) => `${e.kind === "folder" ? "📁" : "📄"} ${e.name}`);
  return [...virtual, ...extra].sort((a, b) =>
    a.replace(/^[📁📄]\s+/, "").localeCompare(b.replace(/^[📁📄]\s+/, "")),
  );
}
