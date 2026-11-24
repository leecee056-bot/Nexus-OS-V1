/**
 * Grammar / JSON one-tool-at-a-time loop (HAP-103).
 * Spec tools: write_file, edit_file, read_file, list_dir, run, search_knowledge, finish.
 * Ollama: format=json + short prompt; parse/validate; execute one step; repeat.
 */

import type { ChatMessage } from "../chat/ollama";
import { chatCompletion } from "../chat/ollama";
import type { FileChange } from "../files/workspace";
import type { AgentStep, AgentToolCall, AgentToolName } from "./schema";
import { runTool, type ToolResult } from "./tools";

export const GRAMMAR_TOOLS = [
  "write_file",
  "edit_file",
  "read_file",
  "list_dir",
  "run",
  "search_knowledge",
  "finish",
] as const;

export type GrammarToolName = (typeof GRAMMAR_TOOLS)[number];

export type GrammarCall = {
  tool: GrammarToolName;
  args: Record<string, string>;
};

export const MAX_GRAMMAR_STEPS = 8;

export const GRAMMAR_SYSTEM = `You are Tri-Cass Pocket Agent. Reply with ONE JSON object only — no markdown, no prose.
Shape: {"tool":"<name>","args":{...}}
Tools (one per reply):
- write_file: args path, content — create/overwrite a workspace file
- edit_file: args path, old, new — replace first occurrence of old with new
- read_file: args path
- list_dir: args path (folder prefix; "" = root)
- run: args project, command — sandboxed; cwd=projects/<project>; python/node only; optional timeout
- search_knowledge: args query — Vault + coding packs
- finish: args message — done; message is the user-facing answer
Use relative paths only. Prefer short edits. After writes, run to check. Call finish when done.`;

const TOOL_SET = new Set<string>(GRAMMAR_TOOLS);

/** Extract first balanced JSON object from model text. */
export function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) {
        esc = false;
      } else if (c === "\\") {
        esc = true;
      } else if (c === '"') {
        inStr = false;
      }
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

export function parseGrammarCall(text: string): GrammarCall | null {
  const raw = extractJsonObject(text);
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as {
      tool?: unknown;
      args?: unknown;
      name?: unknown;
    };
    const tool = String(obj.tool ?? obj.name ?? "").trim();
    if (!TOOL_SET.has(tool)) return null;
    const argsIn =
      obj.args && typeof obj.args === "object" && !Array.isArray(obj.args)
        ? (obj.args as Record<string, unknown>)
        : {};
    const args: Record<string, string> = {};
    for (const [k, v] of Object.entries(argsIn)) {
      if (v == null) continue;
      args[k] = typeof v === "string" ? v : JSON.stringify(v);
    }
    return { tool: tool as GrammarToolName, args };
  } catch {
    return null;
  }
}

/** Map grammar tool → Companion plugin tool(s) that must be enabled. */
export function grammarAllowed(
  tool: GrammarToolName,
  allowed: Set<string>,
): boolean {
  if (tool === "finish") return true;
  if (tool === "write_file" || tool === "edit_file") {
    return allowed.has("write_file") || allowed.has("create_file");
  }
  if (tool === "read_file") return allowed.has("read_file");
  if (tool === "list_dir") return allowed.has("list_files");
  if (tool === "search_knowledge") {
    return (
      allowed.has("search_vault") ||
      allowed.has("search_coding_packs") ||
      allowed.has("search_packs")
    );
  }
  if (tool === "run") return allowed.has("run");
  return false;
}

function toPluginCalls(
  call: GrammarCall,
  allowed: Set<string>,
): AgentToolCall[] {
  switch (call.tool) {
    case "write_file": {
      const tool: AgentToolName = allowed.has("write_file")
        ? "write_file"
        : "create_file";
      return [
        {
          tool,
          args: {
            path: call.args.path || "",
            content: call.args.content ?? "",
          },
        },
      ];
    }
    case "edit_file":
      return [
        {
          tool: "edit_file",
          args: {
            path: call.args.path || "",
            old: call.args.old ?? call.args.old_str ?? "",
            new: call.args.new ?? call.args.new_str ?? "",
          },
        },
      ];
    case "read_file":
      return [{ tool: "read_file", args: { path: call.args.path || "" } }];
    case "list_dir":
      return [
        {
          tool: "list_files",
          args: {
            prefix: call.args.path || call.args.prefix || "",
          },
        },
      ];
    case "search_knowledge": {
      const q = call.args.query || "";
      const out: AgentToolCall[] = [];
      if (allowed.has("search_vault")) {
        out.push({ tool: "search_vault", args: { query: q } });
      }
      if (allowed.has("search_coding_packs")) {
        out.push({ tool: "search_coding_packs", args: { query: q } });
      } else if (allowed.has("search_packs") && out.length === 0) {
        out.push({ tool: "search_packs", args: { query: q } });
      }
      return out;
    }
    case "run":
      return [
        {
          tool: "run",
          args: {
            project: call.args.project || "",
            command: call.args.command || call.args.cmd || "",
            path: call.args.path || "",
            timeout: call.args.timeout || call.args.timeout_sec || "",
          },
        },
      ];
    case "finish":
      return [];
    default:
      return [];
  }
}

function step(
  phase: string,
  detail?: string,
  extra?: Partial<AgentStep>,
): AgentStep {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    phase,
    detail,
    ...extra,
  };
}

export type GrammarLoopResult = {
  ok: boolean;
  /** True when the model produced at least one valid grammar call. */
  usedGrammar: boolean;
  text: string;
  steps: AgentStep[];
  changes: FileChange[];
  toolTexts: string[];
  mutatedOk: boolean;
  mutateFailed: boolean;
};

/**
 * Model-driven one-tool loop. Returns usedGrammar=false if the first reply
 * is not valid JSON so the caller can fall back to heuristic planTools.
 */
export async function runGrammarLoop(opts: {
  host: string;
  model: string;
  userMessage: string;
  history: ChatMessage[];
  allowed: string[];
  onStep?: (s: AgentStep, all: AgentStep[]) => void;
}): Promise<GrammarLoopResult> {
  const steps: AgentStep[] = [];
  const push = (s: AgentStep) => {
    steps.push(s);
    opts.onStep?.(s, [...steps]);
  };
  const allow = new Set(opts.allowed);
  const changes: FileChange[] = [];
  const toolTexts: string[] = [];
  let mutatedOk = false;
  let mutateFailed = false;
  let usedGrammar = false;
  let finishMessage = "";

  push(step("Grammar", "One JSON tool per step…"));

  const transcript: ChatMessage[] = [
    { role: "system", content: GRAMMAR_SYSTEM },
    ...opts.history.slice(-12),
    { role: "user", content: opts.userMessage },
  ];

  for (let i = 0; i < MAX_GRAMMAR_STEPS; i++) {
    push(step("Thinking", `Step ${i + 1}/${MAX_GRAMMAR_STEPS}…`));
    const reply = await chatCompletion(opts.host, opts.model, transcript, {
      temperature: 0.2,
      numPredict: 1024,
      format: "json",
    });
    if (!reply.ok) {
      if (!usedGrammar) {
        return {
          ok: false,
          usedGrammar: false,
          text: reply.error,
          steps,
          changes,
          toolTexts,
          mutatedOk,
          mutateFailed,
        };
      }
      finishMessage = reply.error;
      break;
    }

    const call = parseGrammarCall(reply.text);
    if (!call) {
      if (!usedGrammar) {
        push(step("Grammar", "Invalid JSON — falling back to heuristics", {
          ok: false,
        }));
        return {
          ok: false,
          usedGrammar: false,
          text: "",
          steps,
          changes,
          toolTexts,
          mutatedOk,
          mutateFailed,
        };
      }
      // Retry once mid-loop
      transcript.push({ role: "assistant", content: reply.text });
      transcript.push({
        role: "user",
        content:
          'Invalid. Reply with only {"tool":"...","args":{...}} using an allowed tool.',
      });
      continue;
    }

    usedGrammar = true;

    if (call.tool === "finish") {
      finishMessage = call.args.message || call.args.text || "Done.";
      push(
        step("Finish", finishMessage.slice(0, 160), {
          ok: true,
        }),
      );
      break;
    }

    if (!grammarAllowed(call.tool, allow)) {
      const obs = `Tool ${call.tool} is disabled in Add-ons. Pick another or finish.`;
      toolTexts.push(obs);
      push(step(`Blocked · ${call.tool}`, obs.slice(0, 160), { ok: false }));
      transcript.push({ role: "assistant", content: JSON.stringify(call) });
      transcript.push({ role: "user", content: `[tool result]\n${obs}` });
      continue;
    }

    const pathHint =
      call.args.path ||
      call.args.command ||
      call.args.query ||
      call.args.prefix ||
      call.tool;
    push(
      step(`Using ${call.tool}`, String(pathHint).slice(0, 80), {
        tool:
          call.tool === "list_dir"
            ? "list_files"
            : (call.tool as AgentToolName),
      }),
    );

    const pluginCalls = toPluginCalls(call, allow);
    const results: ToolResult[] = [];
    for (const pc of pluginCalls) {
      const result = await runTool(pc);
      results.push(result);
      if (result.change) changes.push(result.change);
      const mutating =
        pc.tool === "write_file" ||
        pc.tool === "create_file" ||
        pc.tool === "edit_file" ||
        pc.tool === "ensure_folder" ||
        pc.tool === "rename_file" ||
        pc.tool === "delete_file";
      if (result.ok && mutating) mutatedOk = true;
      if (!result.ok && mutating) mutateFailed = true;
    }

    const obs =
      results.length > 0
        ? results.map((r) => r.text).join("\n---\n")
        : "(no result)";
    toolTexts.push(obs);
    const allOk = results.every((r) => r.ok);
    push(
      step(
        allOk ? `Done · ${call.tool}` : `Failed · ${call.tool}`,
        obs.slice(0, 160),
        {
          tool:
            call.tool === "list_dir"
              ? "list_files"
              : (call.tool as AgentToolName),
          ok: allOk,
        },
      ),
    );

    transcript.push({
      role: "assistant",
      content: JSON.stringify({ tool: call.tool, args: call.args }),
    });
    transcript.push({
      role: "user",
      content: `[tool result]\n${obs.slice(0, 3500)}\n\nNext: one JSON tool call, or finish.`,
    });
  }

  if (!finishMessage) {
    finishMessage =
      toolTexts.length > 0
        ? "Reached step limit. Review tool results above or ask again."
        : "No tools ran.";
    push(step("Done", "step limit"));
  }

  return {
    ok: true,
    usedGrammar,
    text: finishMessage,
    steps,
    changes,
    toolTexts,
    mutatedOk,
    mutateFailed,
  };
}
