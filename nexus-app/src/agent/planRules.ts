/**
 * Plan mode + project rules (HAP-114).
 * Clarify → write checklist to .tri-cass/plan.md → user accepts → act.
 * Load .tri-cass-rules (workspace and/or projects/<name>/) every turn.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { readTextFile, writeTextFile, ensureFolder } from "../files/store";

const MODE_KEY = "tricass.companion.agentMode.v1";

export type AgentMode = "plan" | "act";

export const PLAN_PATH = ".tri-cass/plan.md";
export const RULES_FILE = ".tri-cass-rules";

export const DEFAULT_RULES = `# Tri-Cass project rules
- Prefer templates under projects/ (timer / html-app / python-cli / flask).
- Keep files small; one concern per file.
- Use relative paths only; never touch paths outside the workspace.
- After edits, prefer short run checks (python/node) when Sandbox Run is on.
- Ask at most one clarifying question before planning a multi-file app.
`;

export async function loadAgentMode(): Promise<AgentMode> {
  try {
    const raw = await AsyncStorage.getItem(MODE_KEY);
    if (raw === "plan" || raw === "act") return raw;
  } catch {
    /* ignore */
  }
  return "act";
}

export async function saveAgentMode(mode: AgentMode): Promise<void> {
  await AsyncStorage.setItem(MODE_KEY, mode);
}

/** Detect explicit mode switches from the user message. */
export function parseModeIntent(
  userMessage: string,
): "plan" | "accept" | "act" | null {
  const q = userMessage.trim().toLowerCase();
  if (
    /^(accept( plan)?|approve( plan)?|looks good|lgtm|go ahead|execute plan|start building)\b/.test(
      q,
    ) ||
    /\b(accept|approve)\s+(the\s+)?plan\b/.test(q)
  ) {
    return "accept";
  }
  if (
    /^(plan mode|enter plan|switch to plan)\b/.test(q) ||
    /\b(enter|start|use)\s+plan\s+mode\b/.test(q)
  ) {
    return "plan";
  }
  if (
    /^(act mode|execute mode|build mode)\b/.test(q) ||
    /\b(enter|start|use|switch to)\s+act\s+mode\b/.test(q)
  ) {
    return "act";
  }
  if (/^plan\b/.test(q) && !/\baccept\b/.test(q)) {
    return "plan";
  }
  return null;
}

/** Heuristic: multi-file build asks should plan first when no plan exists. */
export function wantsBuildPlan(userMessage: string): boolean {
  const q = userMessage.toLowerCase();
  return (
    /\b(build|scaffold|create|make|write)\b/.test(q) &&
    /\b(app|website|project|timer|flask|cli|site|game)\b/.test(q)
  );
}

export async function loadPlanText(): Promise<string> {
  const res = await readTextFile(PLAN_PATH);
  if (!res.ok) return "";
  return res.text.trim();
}

export async function savePlanText(content: string): Promise<string> {
  await ensureFolder(".tri-cass");
  await writeTextFile(PLAN_PATH, content.endsWith("\n") ? content : content + "\n");
  return PLAN_PATH;
}

export async function loadRulesText(project?: string): Promise<string> {
  const chunks: string[] = [];
  const root = await readTextFile(RULES_FILE);
  if (root.ok && root.text.trim()) chunks.push(root.text.trim());
  const proj = (project || "").trim().replace(/^\/+|\/+$/g, "");
  if (proj && !proj.includes("..") && !proj.includes("/")) {
    const nested = await readTextFile(`projects/${proj}/${RULES_FILE}`);
    if (nested.ok && nested.text.trim()) chunks.push(nested.text.trim());
  }
  return chunks.join("\n\n---\n\n");
}

export async function ensureDefaultRules(): Promise<string> {
  const existing = await readTextFile(RULES_FILE);
  if (existing.ok && existing.text.trim()) return RULES_FILE;
  await writeTextFile(RULES_FILE, DEFAULT_RULES);
  return RULES_FILE;
}

/** Tools allowed while planning (no real code/run mutations). */
export function filterAllowedForMode(
  mode: AgentMode,
  allowed: string[],
): string[] {
  if (mode === "act") return allowed;
  const planOk = new Set([
    "read_file",
    "list_files",
    "search_vault",
    "search_packs",
    "search_coding_packs",
    "list_checkpoints",
    "tricass_status",
    "write_file", // only for plan path — enforced in runTool / grammar
    "create_file",
    "ensure_folder",
  ]);
  return allowed.filter((t) => planOk.has(t));
}

export function isPlanPath(path: string): boolean {
  const p = path.replace(/\\/g, "/").replace(/^\/+/, "");
  return p === PLAN_PATH || p.endsWith("/.tri-cass/plan.md");
}

export function isRulesPath(path: string): boolean {
  const p = path.replace(/\\/g, "/").replace(/^\/+/, "");
  return (
    p === RULES_FILE ||
    p.endsWith(`/${RULES_FILE}`) ||
    /(^|\/)\.tri-cass-rules$/.test(p)
  );
}

export function buildModeContext(opts: {
  mode: AgentMode;
  rules: string;
  plan: string;
}): string {
  const parts: string[] = [];
  parts.push(
    opts.mode === "plan"
      ? "[Mode: PLAN] You may only explore and write/update .tri-cass/plan.md. No other writes, edits, or run. Restate the goal briefly, ask at most one question if needed, then write a short checklist plan and finish asking the user to say accept plan."
      : "[Mode: ACT] Execute the accepted plan with one tool per step. Do not rewrite the whole plan unless asked.",
  );
  if (opts.rules.trim()) {
    parts.push(`[Project rules]\n${opts.rules.trim().slice(0, 2500)}`);
  }
  if (opts.plan.trim()) {
    parts.push(`[Plan checklist — re-inject each turn]\n${opts.plan.trim().slice(0, 3000)}`);
  } else if (opts.mode === "act") {
    parts.push("[Plan] (none yet — keep changes small or ask to enter plan mode)");
  }
  return parts.join("\n\n");
}
