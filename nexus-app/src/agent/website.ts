import { enabledTools, loadPluginState } from "../plugins/store";
import { planTools, runTool } from "./tools";

/**
 * One-shot website scaffold usable from Agent or plain Chat.
 * Returns a user-facing summary, or null if the message isn't a site request.
 */
export async function tryBuildWebsiteFromMessage(
  userMessage: string,
): Promise<string | null> {
  const pluginState = await loadPluginState();
  const allowed = enabledTools(pluginState);
  // Ensure file tools are considered even if user disabled others.
  const allow = new Set([
    ...allowed,
    "ensure_folder",
    "write_file",
  ]);
  const plan = planTools(userMessage, [...allow]).filter((c) =>
    ["ensure_folder", "write_file"].includes(c.tool),
  );
  const isSite = plan.some(
    (c) =>
      c.tool === "write_file" &&
      (c.args.path?.startsWith("website/") || c.args.path === "website"),
  ) || plan.some((c) => c.tool === "ensure_folder" && c.args.path === "website");
  if (!isSite && plan.length === 0) {
    if (
      !/(?:make|create|build|spin up|scaffold)\s+(?:me\s+)?(?:a\s+|an\s+)?(?:simple\s+|small\s+|basic\s+)?(?:web\s*site|webpage|landing page|html site)/i.test(
        userMessage,
      )
    ) {
      return null;
    }
  }
  if (plan.length === 0) {
    // Force website plan with all tools temporarily allowed
    const forced = planTools(userMessage, [
      "ensure_folder",
      "write_file",
      "list_files",
      "search_vault",
      "search_packs",
      "read_file",
      "tricass_status",
      "create_file",
    ]).filter((c) =>
      ["ensure_folder", "write_file", "create_file"].includes(c.tool),
    );
    if (forced.length === 0) return null;
    const notes: string[] = [];
    for (const call of forced) {
      const r = await runTool(call);
      notes.push(r.ok ? `✓ ${call.tool} ${call.args.path || ""}` : `✗ ${r.text}`);
    }
    return `Created a starter site in Files → website/.\n${notes.join("\n")}\nOpen index.html in a browser, or ask me to change the copy.`;
  }

  const notes: string[] = [];
  for (const call of plan) {
    const r = await runTool(call);
    notes.push(
      r.ok
        ? `✓ ${call.tool}${call.args.path ? ` → ${call.args.path}` : ""}`
        : `✗ ${r.text}`,
    );
  }
  return `Created a starter site in Files → website/.\n${notes.join("\n")}\nOpen index.html in a browser, or ask me to tweak it.`;
}
