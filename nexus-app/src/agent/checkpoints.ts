/**
 * Pocket Agent checkpoints (Companion) — Cline-style snapshots of the
 * sandboxed Files workspace so failed agent edits can roll back.
 */
import {
  deletePath,
  ensureFolder,
  listWorkspace,
  loadDocs,
  readTextFile,
  writeTextFile,
  type DocItem,
} from "../files/store";
import { normalizeWorkspacePath } from "../files/workspace";

const INDEX = ".tri-cass/checkpoints/index.json";
const MAX = 20;
const MAX_FILES = 80;
const MAX_BYTES = 1_500_000;

export type CheckpointMeta = {
  id: string;
  label: string;
  createdAt: number;
  fileCount: number;
};

type SnapshotFile = { path: string; content: string; kind?: "file" | "folder" };

type Snapshot = {
  meta: CheckpointMeta;
  files: SnapshotFile[];
};

function snapPath(id: string): string {
  return `.tri-cass/checkpoints/${id}/snapshot.json`;
}

async function readJson<T>(path: string): Promise<T | null> {
  const res = await readTextFile(path);
  if (!res.ok) return null;
  try {
    return JSON.parse(res.text) as T;
  } catch {
    return null;
  }
}

async function writeJson(path: string, data: unknown): Promise<void> {
  await writeTextFile(path, JSON.stringify(data, null, 2));
}

export async function listCheckpoints(): Promise<CheckpointMeta[]> {
  const idx = await readJson<CheckpointMeta[]>(INDEX);
  return Array.isArray(idx) ? idx : [];
}

/** Snapshot current workspace files (skips .tri-cass/checkpoints bodies). */
export async function createCheckpoint(label: string): Promise<CheckpointMeta> {
  const docs = await loadDocs();
  const files: SnapshotFile[] = [];
  let bytes = 0;
  for (const d of docs) {
    const name = normalizeWorkspacePath(d.name);
    if (!name || name.startsWith(".tri-cass/checkpoints/")) continue;
    if (d.kind === "folder") {
      files.push({ path: name, content: "", kind: "folder" });
      continue;
    }
    if (files.length >= MAX_FILES) break;
    let content = d.content ?? "";
    if (!content && d.uri) {
      const r = await readTextFile(name);
      if (r.ok) content = r.text;
    }
    if (content.length > 200_000) continue;
    if (bytes + content.length > MAX_BYTES) break;
    bytes += content.length;
    files.push({ path: name, content, kind: "file" });
  }

  const id =
    new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14) +
    "-" +
    Math.random().toString(36).slice(2, 6);
  const meta: CheckpointMeta = {
    id,
    label: (label || "agent step").slice(0, 120),
    createdAt: Date.now(),
    fileCount: files.filter((f) => f.kind !== "folder").length,
  };
  const snap: Snapshot = { meta, files };
  await ensureFolder(`.tri-cass/checkpoints/${id}`);
  await writeJson(snapPath(id), snap);

  let index = await listCheckpoints();
  index = [meta, ...index];
  const drop = index.slice(MAX);
  index = index.slice(0, MAX);
  for (const old of drop) {
    try {
      await deletePath(`.tri-cass/checkpoints/${old.id}`);
    } catch {
      /* ignore */
    }
  }
  await ensureFolder(".tri-cass/checkpoints");
  await writeJson(INDEX, index);
  return meta;
}

export async function restoreCheckpoint(id: string): Promise<string> {
  const snap = await readJson<Snapshot>(snapPath(id));
  if (!snap?.meta || !Array.isArray(snap.files)) {
    return `Unknown checkpoint '${id}'. Ask to list checkpoints.`;
  }

  const docs = await loadDocs();
  // Remove user files outside checkpoint store
  for (const d of docs) {
    const name = normalizeWorkspacePath(d.name);
    if (!name || name.startsWith(".tri-cass/")) continue;
    try {
      await deletePath(name);
    } catch {
      /* ignore */
    }
  }

  // Recreate folders first
  const folders = snap.files
    .filter((f) => f.kind === "folder")
    .map((f) => f.path)
    .sort((a, b) => a.length - b.length);
  for (const f of folders) {
    await ensureFolder(f);
  }
  for (const f of snap.files) {
    if (f.kind === "folder") continue;
    const parts = f.path.split("/");
    if (parts.length > 1) {
      await ensureFolder(parts.slice(0, -1).join("/"));
    }
    await writeTextFile(f.path, f.content ?? "");
  }
  return `Restored checkpoint ${id} (${snap.meta.label}) — ${snap.meta.fileCount} files.`;
}

export function formatCheckpointList(items: CheckpointMeta[]): string {
  if (items.length === 0) {
    return "(no checkpoints yet — agent file edits will create them)";
  }
  return items
    .map(
      (c) =>
        `• ${c.id}  ${c.fileCount}f  ${c.label}  ${new Date(c.createdAt).toISOString()}`,
    )
    .join("\n");
}

export const MUTATING_TOOLS = new Set([
  "write_file",
  "create_file",
  "edit_file",
  "ensure_folder",
  "rename_file",
  "delete_file",
]);
