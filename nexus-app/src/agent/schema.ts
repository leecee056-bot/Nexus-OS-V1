/**
 * Portable agent tool schema — companion today; USB/Pi / Cardputer later.
 * Keep names stable across ports.
 */

export type AgentToolName =
  | "search_vault"
  | "search_packs"
  | "search_coding_packs"
  | "list_files"
  | "read_file"
  | "write_file"
  | "create_file"
  | "edit_file"
  | "ensure_folder"
  | "rename_file"
  | "delete_file"
  | "list_checkpoints"
  | "create_checkpoint"
  | "restore_checkpoint"
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
Tool results (if any) are already attached from their Vault, coding packs, or Files workspace.
Use them when present. For greetings and small talk, reply warmly — do not invent tool activity.
If you created, updated, renamed, or deleted files, name the paths clearly and invite them to open Files.
The workspace is sandboxed (Companion Files / USB kit Files/) — you cannot touch arbitrary host paths.
Be concise and practical. Offline-first: prefer their local knowledge over inventing facts.
Small-model workflow (~1.5B and smaller): (1) search coding packs / Vault, (2) use file tools, (3) scaffold from templates (timer / html-app / python-cli) under projects/, then make short edits — not large greenfield apps. Say when something is beyond a small local model.
Checkpoints: successful file edits are snapshotted under .tri-cass/checkpoints/. On a failed edit the agent may restore the last good snapshot. Users can ask to list or restore checkpoints.
When Agent uses the grammar JSON loop, the model emits one tool JSON object per step (write_file / edit_file / read_file / list_dir / search_knowledge / finish).`;