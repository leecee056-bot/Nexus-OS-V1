/**
 * Built-in Plugin / Add-ons Library.
 * Same tool ids are intended for later Tri-Cass OS / Cardputer agent ports.
 */

import { AGENT_GUIDE_URL, COMPANION_GUIDE_URL } from "../updates/links";

export type PluginId =
  | "vault-search"
  | "pack-notes"
  | "coding-packs"
  | "files-browse"
  | "files-read"
  | "files-write"
  | "files-create"
  | "files-folder"
  | "files-rename"
  | "files-delete"
  | "checkpoints"
  | "sandbox-run"
  | "tricass-status";

export type PluginDef = {
  id: PluginId;
  name: string;
  blurb: string;
  category: "knowledge" | "files" | "system";
  /** Tool name the agent invokes */
  tool: string;
  defaultEnabled: boolean;
  /** Official guide / update page (we do not host binaries) */
  updateUrl: string;
};

export const PLUGIN_CATALOG: PluginDef[] = [
  {
    id: "vault-search",
    name: "Vault Search",
    blurb: "Search your Knowledge Vault notes while chatting.",
    category: "knowledge",
    tool: "search_vault",
    defaultEnabled: true,
    updateUrl: AGENT_GUIDE_URL,
  },
  {
    id: "pack-notes",
    name: "Knowledge Packs",
    blurb: "Prefer pack-imported Vault notes when looking things up.",
    category: "knowledge",
    tool: "search_packs",
    defaultEnabled: true,
    updateUrl: "https://nexus-os.apps.grok.bot/knowledge-packs",
  },
  {
    id: "coding-packs",
    name: "Coding Packs",
    blurb:
      "Search DevDocs / Stack Overflow excerpts you imported as coding packs (pack-coding-*).",
    category: "knowledge",
    tool: "search_coding_packs",
    defaultEnabled: true,
    updateUrl: "https://nexus-os.apps.grok.bot/knowledge-packs#coding",
  },
  {
    id: "files-browse",
    name: "Files Browse",
    blurb: "List folders and documents you have in Files.",
    category: "files",
    tool: "list_files",
    defaultEnabled: true,
    updateUrl: AGENT_GUIDE_URL,
  },
  {
    id: "files-read",
    name: "Files Read",
    blurb: "Open text files from your Files library.",
    category: "files",
    tool: "read_file",
    defaultEnabled: true,
    updateUrl: AGENT_GUIDE_URL,
  },
  {
    id: "files-write",
    name: "Files Write",
    blurb:
      "Create or update text/code files in the sandboxed workspace (or USB Files/).",
    category: "files",
    tool: "write_file",
    defaultEnabled: true,
    updateUrl: AGENT_GUIDE_URL,
  },
  {
    id: "files-create",
    name: "Files Create",
    blurb: "Same sandbox as Write — create_file alias for clear agent plans.",
    category: "files",
    tool: "create_file",
    defaultEnabled: true,
    updateUrl: AGENT_GUIDE_URL,
  },
  {
    id: "files-folder",
    name: "Folders",
    blurb: "Create folders in the workspace — e.g. a website/ project the agent can fill.",
    category: "files",
    tool: "ensure_folder",
    defaultEnabled: true,
    updateUrl: AGENT_GUIDE_URL,
  },
  {
    id: "files-rename",
    name: "Files Rename",
    blurb: "Rename or move files and folders inside the workspace sandbox.",
    category: "files",
    tool: "rename_file",
    defaultEnabled: true,
    updateUrl: AGENT_GUIDE_URL,
  },
  {
    id: "files-delete",
    name: "Files Delete",
    blurb: "Delete files or folders inside the workspace only (never outside).",
    category: "files",
    tool: "delete_file",
    defaultEnabled: true,
    updateUrl: AGENT_GUIDE_URL,
  },
  {
    id: "checkpoints",
    name: "Checkpoints",
    blurb:
      "Snapshot and restore the Files workspace after agent edits (Cline-style rollback).",
    category: "files",
    tool: "list_checkpoints",
    defaultEnabled: true,
    updateUrl: AGENT_GUIDE_URL,
  },
  {
    id: "sandbox-run",
    name: "Sandbox Run",
    blurb:
      "Run python/node inside projects/<name>/ with a timeout (desktop Companion).",
    category: "files",
    tool: "run",
    defaultEnabled: true,
    updateUrl: AGENT_GUIDE_URL,
  },
  {
    id: "tricass-status",
    name: "Tri-Cass Status",
    blurb: "Report companion status (model, plugins, workspace root).",
    category: "system",
    tool: "tricass_status",
    defaultEnabled: true,
    updateUrl: COMPANION_GUIDE_URL,
  },
];

export function pluginByTool(tool: string): PluginDef | undefined {
  return PLUGIN_CATALOG.find((p) => p.tool === tool);
}
