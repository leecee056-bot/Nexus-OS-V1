import { chatCompletion, type ChatMessage } from "../chat/ollama";
import { companionReply } from "../chat/tinychat";
import type { FileChange } from "../files/workspace";
import { enabledTools, loadPluginState } from "../plugins/store";
import {
  createCheckpoint,
  MUTATING_TOOLS,
  restoreCheckpoint,
  listCheckpoints,
} from "./checkpoints";
import { runGrammarLoop } from "./grammar";
import {
  buildModeContext,
  ensureDefaultRules,
  filterAllowedForMode,
  loadAgentMode,
  loadPlanText,
  loadRulesText,
  parseModeIntent,
  saveAgentMode,
  wantsBuildPlan,
  type AgentMode,
} from "./planRules";
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

async function resolveMode(
  userMessage: string,
  push: (s: AgentStep) => void,
): Promise<AgentMode> {
  let mode = await loadAgentMode();
  const intent = parseModeIntent(userMessage);
  if (intent === "accept") {
    mode = "act";
    await saveAgentMode("act");
    push(step("Mode", "Plan accepted → ACT", { ok: true }));
  } else if (intent === "plan") {
    mode = "plan";
    await saveAgentMode("plan");
    push(step("Mode", "PLAN — write .tri-cass/plan.md, no code edits", { ok: true }));
  } else if (intent === "act") {
    mode = "act";
    await saveAgentMode("act");
    push(step("Mode", "ACT", { ok: true }));
  } else if (mode === "act" && wantsBuildPlan(userMessage)) {
    const plan = await loadPlanText();
    if (!plan) {
      mode = "plan";
      await saveAgentMode("plan");
      push(
        step("Mode", "PLAN first (no checklist yet) — say accept plan when ready", {
          ok: true,
        }),
      );
    }
  }
  return mode;
}

/**
 * Agent turn: prefer grammar JSON one-tool loop when a model is ready;
 * fall back to heuristic planTools for offline / invalid JSON.
 * Plan mode blocks mutations until the user accepts the plan.
 */
export async function runAgentTurn(opts: {
  host: string;
  model: string;
  userMessage: string;
  history: ChatMessage[];
  modelReady: boolean;
  onStep?: (s: AgentStep, all: AgentStep[]) => void;
}): Promise<AgentRunResult> {
  const pluginState = await loadPluginState();
  const allAllowed = enabledTools(pluginState);

  const preSteps: AgentStep[] = [];
  const pushPre = (s: AgentStep) => {
    preSteps.push(s);
    opts.onStep?.(s, [...preSteps]);
  };

  try {
    await ensureDefaultRules();
  } catch {
    /* non-fatal */
  }

  const mode = await resolveMode(opts.userMessage, pushPre);
  const allowed = filterAllowedForMode(mode, allAllowed);
  const rules = await loadRulesText();
  const plan = await loadPlanText();
  const modeContext = buildModeContext({ mode, rules, plan });

  if (opts.modelReady) {
    const willLikelyMutate =
      mode === "act" &&
      (allowed.includes("write_file") ||
        allowed.includes("create_file") ||
        allowed.includes("edit_file"));
    let baselineId: string | undefined;
    if (willLikelyMutate) {
      try {
        const baseline = await createCheckpoint("before agent edits");
        baselineId = baseline.id;
        pushPre(step("Checkpoint", `baseline ${baselineId}`, { ok: true }));
      } catch {
        /* non-fatal */
      }
    }

    const grammar = await runGrammarLoop({
      host: opts.host,
      model: opts.model,
      userMessage: opts.userMessage,
      history: opts.history,
      allowed,
      mode,
      modeContext,
      onStep: (s, all) => opts.onStep?.(s, [...preSteps, ...all]),
    });

    if (grammar.usedGrammar) {
      const steps = [...preSteps, ...grammar.steps];
      const push = (s: AgentStep) => {
        steps.push(s);
        opts.onStep?.(s, [...steps]);
      };
      if (grammar.mutateFailed) {
        try {
          const items = await listCheckpoints();
          const target = baselineId || items[0]?.id;
          if (target) {
            const msg = await restoreCheckpoint(target);
            push(step("Rollback", msg.slice(0, 160), { ok: true }));
          }
        } catch {
          /* non-fatal */
        }
      } else if (grammar.mutatedOk) {
        try {
          const meta = await createCheckpoint("after agent edits");
          push(
            step("Checkpoint", `${meta.id} · ${meta.fileCount} files`, {
              ok: true,
            }),
          );
        } catch {
          /* non-fatal */
        }
      }
      const changeSummary = formatChangeSummary(grammar.changes);
      const withChanges = (body: string) =>
        changeSummary ? `${body}\n\n${changeSummary}` : body;
      push(step("Done", changeSummary || undefined));
      return {
        text: withChanges(grammar.text),
        steps,
        changes: grammar.changes,
      };
    }
    return runHeuristicTurn(
      opts,
      allowed,
      [...preSteps, ...grammar.steps],
      mode,
      modeContext,
    );
  }

  return runHeuristicTurn(opts, allowed, preSteps, mode, modeContext);
}

async function runHeuristicTurn(
  opts: {
    host: string;
    model: string;
    userMessage: string;
    history: ChatMessage[];
    modelReady: boolean;
    onStep?: (s: AgentStep, all: AgentStep[]) => void;
  },
  allowed: string[],
  priorSteps: AgentStep[],
  mode: AgentMode,
  modeContext: string,
): Promise<AgentRunResult> {
  const steps: AgentStep[] = [...priorSteps];
  const push = (s: AgentStep) => {
    steps.push(s);
    opts.onStep?.(s, [...steps]);
  };

  let plan = planTools(opts.userMessage, allowed);
  if (mode === "plan") {
    // Heuristic writes only if clearly targeting the plan file
    plan = plan.filter((c) => {
      if (c.tool === "write_file" || c.tool === "create_file") {
        return (c.args.path || "").includes(".tri-cass/plan");
      }
      return ![
        "edit_file",
        "rename_file",
        "delete_file",
        "run",
        "ensure_folder",
      ].includes(c.tool);
    });
  }

  if (plan.length === 0) {
    push(step("Ready", mode === "plan" ? "Planning…" : "Just chatting — no tools needed."));
  } else {
    push(
      step(
        "Planning",
        `Running ${plan.length} tool${plan.length === 1 ? "" : "s"}…`,
      ),
    );
  }

  const toolTexts: string[] = [];
  const changes: FileChange[] = [];
  let baselineId: string | undefined;
  let mutatedOk = false;
  let mutateFailed = false;
  const willMutate =
    mode === "act" && plan.some((c) => MUTATING_TOOLS.has(c.tool));
  if (willMutate) {
    try {
      const baseline = await createCheckpoint("before agent edits");
      baselineId = baseline.id;
    } catch {
      /* non-fatal */
    }
  }
  for (const call of plan) {
    push(
      step(`Using ${call.tool}`, summarizeArgs(call.args), {
        tool: call.tool,
      }),
    );
    const result = await runTool(call, { mode });
    const mutating = MUTATING_TOOLS.has(call.tool);
    if (result.ok && mutating) mutatedOk = true;
    if (!result.ok && mutating) {
      mutateFailed = true;
      try {
        const items = await listCheckpoints();
        const target = baselineId || items[0]?.id;
        if (target) {
          const msg = await restoreCheckpoint(target);
          push(step("Rollback", msg.slice(0, 160), { ok: true }));
          toolTexts.push(`Auto-rollback: ${msg}`);
        }
      } catch {
        /* non-fatal */
      }
    }
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
  if (mutatedOk && !mutateFailed) {
    try {
      const meta = await createCheckpoint("after agent edits");
      push(
        step("Checkpoint", `${meta.id} · ${meta.fileCount} files`, {
          ok: true,
        }),
      );
    } catch {
      /* non-fatal */
    }
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
    { role: "system", content: `${AGENT_SYSTEM}\n\n${modeContext}` },
    ...opts.history.slice(-40),
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
  const path = args.path || args.prefix || args.query || args.command;
  if (path) return path.slice(0, 80);
  const keys = Object.keys(args);
  if (keys.length === 0) return undefined;
  return keys.join(", ");
}
