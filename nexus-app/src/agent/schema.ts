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
  | "tricass_status";

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

export const AGENT_SYSTEM = `You are Tri-Cass Agent on the user's personal companion.
Tool results (if any) are already attached from their Vault, packs, or Files.
Use them when present. For greetings and small talk, reply warmly — do not invent tool activity.
If you created or updated files (including a website/), name the paths clearly and invite them to open Files.
Be concise and practical. Offline-first: prefer their local knowledge over inventing facts.`;
