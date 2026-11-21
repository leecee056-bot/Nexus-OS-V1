/**
 * Built-in Plugin / Add-ons Library.
 * Same tool ids are intended for later NEXUS OS / Cardputer agent ports.
 */

export type PluginId =
  | "vault-search"
  | "pack-notes"
  | "files-browse"
  | "files-read"
  | "files-write"
  | "files-folder"
  | "nexus-status";

export type PluginDef = {
  id: PluginId;
  name: string;
  blurb: string;
  category: "knowledge" | "files" | "system";
  /** Tool name the agent invokes */
  tool: string;
  defaultEnabled: boolean;
};

export const PLUGIN_CATALOG: PluginDef[] = [
  {
    id: "vault-search",
    name: "Vault Search",
    blurb: "Search your Knowledge Vault notes while chatting.",
    category: "knowledge",
    tool: "search_vault",
    defaultEnabled: true,
  },
  {
    id: "pack-notes",
    name: "Knowledge Packs",
    blurb: "Prefer pack-imported Vault notes when looking things up.",
    category: "knowledge",
    tool: "search_packs",
    defaultEnabled: true,
  },
  {
    id: "files-browse",
    name: "Files Browse",
    blurb: "List folders and documents you have in Files.",
    category: "files",
    tool: "list_files",
    defaultEnabled: true,
  },
  {
    id: "files-read",
    name: "Files Read",
    blurb: "Open text files from your Files library.",
    category: "files",
    tool: "read_file",
    defaultEnabled: true,
  },
  {
    id: "files-write",
    name: "Files Write",
    blurb: "Create or update text files (HTML, CSS, MD, …) in Files.",
    category: "files",
    tool: "write_file",
    defaultEnabled: true,
  },
  {
    id: "files-folder",
    name: "Folders",
    blurb: "Create folders in Files — e.g. a website/ project the agent can fill.",
    category: "files",
    tool: "ensure_folder",
    defaultEnabled: true,
  },
  {
    id: "nexus-status",
    name: "NEXUS Status",
    blurb: "Report companion status (model, plugins enabled).",
    category: "system",
    tool: "nexus_status",
    defaultEnabled: true,
  },
];

export function pluginByTool(tool: string): PluginDef | undefined {
  return PLUGIN_CATALOG.find((p) => p.tool === tool);
}
