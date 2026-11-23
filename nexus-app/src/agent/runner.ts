import { chatCompletion, type ChatMessage } from "../chat/ollama";
import { companionReply } from "../chat/tinychat";
import type { FileChange } from "../files/workspace";
import { enabledTools, loadPluginState } from "../plugins/store";
import { AGENT_SYSTEM, type AgentStep } from "./schema";
import { formatChangeSummary, planTools, runTool } from "./tools";

export type AgentRunResult = {
  text: string;
  steps: AgentStep[];
  changes: FileChange[];
};

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

/**
 * Agent turn: plan tools → run with status → answer with local model (+ context).
 */
export async function runAgentTurn(opts: {
  host: string;
  model: string;
  userMessage: string;
  history: ChatMessage[];
  modelReady: boolean;
  onStep?: (s: AgentStep, all: AgentStep[]) => void;
}): Promise<AgentRunResult> {
  const steps: AgentStep[] = [];
  const push = (s: AgentStep) => {
    steps.push(s);
    opts.onStep?.(s, [...steps]);
  };

  const pluginState = await loadPluginState();
  const allowed = enabledTools(pluginState);
  const plan = planTools(opts.userMessage, allowed);

  if (plan.length === 0) {
    push(step("Ready", "Just chatting — no tools needed."));
  } else {
    push(step("Planning", `Running ${plan.length} tool${plan.length === 1 ? "" : "s"}…`));
  }

  const toolTexts: string[] = [];
  const changes: FileChange[] = [];
  for (const call of plan) {
    push(
      step(`Using ${call.tool}`, summarizeArgs(call.args), {
        tool: call.tool,
      }),
    );
    const result = await runTool(call);
    push(
      step(
        result.ok ? `Done · ${call.tool}` : `Failed · ${call.tool}`,
        result.text.slice(0, 160),
        { tool: call.tool, ok: result.ok },
      ),
    );
    toolTexts.push(result.text);
    if (result.change) changes.push(result.change);
  }

  const changeSummary = formatChangeSummary(changes);
  const toolBlock =
    toolTexts.length > 0
      ? `\n\n[Local tool results]\n${toolTexts.join("\n---\n")}\n[/Local tool results]`
      : "";

  push(step("Thinking", opts.modelReady ? "Local model…" : "Fallback reply…"));

  const withChanges = (body: string) =>
    changeSummary ? `${body}\n\n${changeSummary}` : body;

  if (!opts.modelReady) {
    const text = withChanges(
      companionReply(opts.userMessage) +
        (toolBlock
          ? `\n\n(Agent tools ran locally.)\n${toolTexts.map((t) => t.split("\n")[0]).join("\n")}`
          : "\n\n(Enable a downloaded model in Chat for fuller Agent answers.)"),
    );
    push(step("Done", changeSummary || undefined));
    return { text, steps, changes };
  }

  const messages: ChatMessage[] = [
    { role: "system", content: AGENT_SYSTEM },
    ...opts.history.slice(-10),
    {
      role: "user",
      content: opts.userMessage + toolBlock,
    },
  ];

  const result = await chatCompletion(opts.host, opts.model, messages);
  push(step("Done", result.ok ? changeSummary || undefined : result.error));
  const base = result.ok
    ? result.text
    : `${result.error}${toolBlock ? "\n\nTool notes:\n" + toolTexts.join("\n") : ""}`;
  return {
    text: withChanges(base),
    steps,
    changes,
  };
}

function summarizeArgs(args: Record<string, string>): string | undefined {
  const path = args.path || args.prefix || args.query;
  if (path) return path.slice(0, 80);
  const keys = Object.keys(args);
  if (keys.length === 0) return undefined;
  return keys.join(", ");
}
