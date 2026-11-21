/**
 * Portable agent tool schema — companion today; USB/Pi / Cardputer later.
 * Keep names stable across ports.
 */

export type AgentToolName =
  | "search_vault"
  | "search_packs"
  | "list_files"
  | "read_file"
  | "write_file"
  | "ensure_folder"
  | "nexus_status";

export type AgentToolCall = {
  tool: AgentToolName;
  args: Record<string, string>;
};

export type AgentStep = {
  id: string;
  phase: string;
  detail?: string;
  tool?: AgentToolName;
  ok?: boolean;
};

export const AGENT_SYSTEM = `You are NEXUS Agent on the user's personal companion.
You have already been given tool results from their Knowledge Vault, knowledge packs, and Files library.
Use those results. Be concise and practical. If you created or updated files, say the paths clearly.
You are offline-first: prefer their local knowledge over inventing facts.`;
