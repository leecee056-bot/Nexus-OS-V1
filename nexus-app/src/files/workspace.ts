/**
 * Sandboxed workspace paths for the agent / Files library.
 * Relative paths only — never escape the Companion workspace / USB Files/.
 */

export const ALLOWED_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".markdown",
  ".html",
  ".htm",
  ".css",
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".json",
  ".py",
  ".sh",
  ".bash",
  ".toml",
  ".yml",
  ".yaml",
  ".ini",
  ".csv",
  ".svg",
  ".xml",
  ".rs",
  ".go",
  ".c",
  ".h",
  ".cpp",
  ".hpp",
  ".java",
  ".kt",
  ".rb",
  ".php",
  ".sql",
  ".r",
  ".lua",
  ".vue",
  ".svelte",
]);

export function normalizeWorkspacePath(name: string): string {
  return name
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "");
}

/** Reject `..`, absolute paths, and empty segments. */
export function assertSafeRelPath(raw: string): string {
  const name = normalizeWorkspacePath(raw);
  if (!name) throw new Error("Path is empty.");
  if (name.startsWith("/") || /^[a-z]:/i.test(name)) {
    throw new Error("Absolute paths are not allowed.");
  }
  const parts = name.split("/");
  if (parts.some((p) => !p || p === "." || p === "..")) {
    throw new Error("Path must stay inside the workspace (no ..).");
  }
  return name;
}

export function assertAllowedFilePath(raw: string): string {
  const name = assertSafeRelPath(raw);
  const base = name.split("/").pop() || "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0) {
    throw new Error(
      "Files need an extension (e.g. .txt, .md, .py, .html).",
    );
  }
  const ext = base.slice(dot).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(
      `Extension ${ext} is not allowed in the agent workspace.`,
    );
  }
  return name;
}

export type FileChange = {
  action: "created" | "updated" | "renamed" | "deleted" | "folder";
  path: string;
  from?: string;
};

export function formatChangeSummary(changes: FileChange[]): string {
  if (changes.length === 0) return "";
  const lines = changes.map((c) => {
    if (c.action === "renamed" && c.from) {
      return `• Renamed ${c.from} → ${c.path}`;
    }
    if (c.action === "folder") return `• Folder ${c.path}`;
    if (c.action === "deleted") return `• Deleted ${c.path}`;
    if (c.action === "created") return `• Created ${c.path}`;
    return `• Updated ${c.path}`;
  });
  return `Changes:\n${lines.join("\n")}`;
}
