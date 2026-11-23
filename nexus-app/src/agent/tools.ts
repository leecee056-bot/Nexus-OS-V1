import { loadNotes, searchNotes } from "../vault/store";
import {
  deletePath,
  ensureFolder,
  listWorkspace,
  readTextFile,
  renamePath,
  writeTextFile,
} from "../files/store";
import {
  formatChangeSummary,
  type FileChange,
} from "../files/workspace";
import { diskInfo } from "../files/diskBridge";
import { loadPluginState, enabledTools } from "../plugins/store";
import type { AgentToolCall, AgentToolName } from "./schema";
import { guessScaffold, scaffoldFiles } from "./scaffolds";

export type ToolResult = {
  tool: AgentToolName;
  ok: boolean;
  text: string;
  change?: FileChange;
};

function keywords(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s_/.-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 12);
}

/** Heuristic plan — works with small local models that lack tool-calling. */
export function planTools(userMessage: string, allowed: string[]): AgentToolCall[] {
  const q = userMessage.trim().toLowerCase();
  const calls: AgentToolCall[] = [];
  const allow = new Set(allowed);

  const isChitchat =
    /^(hi|hello|hey|yo|sup|thanks|thank you|ok|okay|cool|great|nice|bye|good (morning|afternoon|evening)|how are you)[\s!.?]*$/i.test(
      q,
    );

  const wantsVault =
    !isChitchat &&
    /\b(vault|notes?|knowledge|remember|what did i|lookup|look up|search (my |the )?(vault|notes|knowledge))\b/.test(
      q,
    );
  const wantsCodingPacks =
    !isChitchat &&
    /\b(coding pack|devdocs|stack\s*overflow|stack exchange|api docs|documentation|look up (how|docs|syntax)|reference (for|on))\b/.test(
      q,
    );
  const wantsPacks =
    !isChitchat &&
    !wantsCodingPacks &&
    /\b(packs?|wiki|wikipedia|gutenberg|offline (knowledge|pack))\b/.test(q);
  const wantsFiles =
    !isChitchat &&
    /\b(file|folder|website|html|css|project|create|write|save|list files|in files|make (a |me )?(site|page|website)|rename|delete|remove|mkdir|organise|organize)\b/.test(
      q,
    );
  const wantsStatus =
    !isChitchat && /\b(status|what can you|plugins?|add-?ons?|workspace)\b/.test(q);

  if (wantsVault && allow.has("search_vault")) {
    calls.push({
      tool: "search_vault",
      args: { query: keywords(userMessage).join(" ") || userMessage.slice(0, 80) },
    });
  }
  if (wantsCodingPacks && allow.has("search_coding_packs")) {
    calls.push({
      tool: "search_coding_packs",
      args: {
        query: keywords(userMessage).join(" ") || userMessage.slice(0, 80),
      },
    });
  }
  if (wantsPacks && allow.has("search_packs")) {
    calls.push({
      tool: "search_packs",
      args: { query: keywords(userMessage).join(" ") || userMessage.slice(0, 80) },
    });
  }

  if (wantsFiles && allow.has("list_files")) {
    const folderMatch = q.match(/(?:in|folder|project)\s+([a-z0-9_./-]+)/i);
    calls.push({
      tool: "list_files",
      args: { prefix: folderMatch?.[1] ?? "" },
    });
  }

  const renameMatch = userMessage.match(
    /(?:rename|move)\s+(?:file\s+|folder\s+)?([a-z0-9_./-]+)\s+(?:to|as|->)\s+([a-z0-9_./-]+)/i,
  );
  if (renameMatch && allow.has("rename_file")) {
    calls.push({
      tool: "rename_file",
      args: { from: renameMatch[1], to: renameMatch[2] },
    });
  }

  const deleteMatch = userMessage.match(
    /(?:delete|remove|rm)\s+(?:file\s+|folder\s+)?([a-z0-9_./-]+)/i,
  );
  if (deleteMatch && allow.has("delete_file") && !renameMatch) {
    calls.push({ tool: "delete_file", args: { path: deleteMatch[1] } });
  }

  const writeMatch =
    userMessage.match(
      /(?:create|write|save|make)\s+(?:(?:a|an|the)\s+)?(?:file\s+)?([a-z0-9_./-]+\.[a-z0-9]+)\s*(?:with|containing|:)\s*([\s\S]+)/i,
    ) ||
    userMessage.match(
      /(?:create|write|save)\s+([a-z0-9_./-]+\.[a-z0-9]+)\s+as\s+([\s\S]+)/i,
    );

  if (writeMatch && (allow.has("write_file") || allow.has("create_file"))) {
    const path = writeMatch[1];
    let body = writeMatch[2].trim();
    if (
      /website|html page|landing/i.test(q) &&
      path.endsWith(".html") &&
      body.length < 40
    ) {
      body = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Tri-Cass site</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main>
    <h1>Tri-Cass</h1>
    <p>${body || "Built with your local agent."}</p>
  </main>
</body>
</html>`;
    }
    const tool = allow.has("write_file") ? "write_file" : "create_file";
    calls.push({ tool, args: { path, content: body } });
  }

  const folderMatch2 = userMessage.match(
    /(?:create|make|new)\s+(?:a\s+)?folder\s+(?:called\s+|named\s+)?([a-z0-9_./-]+)/i,
  );
  if (folderMatch2 && allow.has("ensure_folder")) {
    calls.push({ tool: "ensure_folder", args: { path: folderMatch2[1] } });
  }

  // Pocket Agent project scaffolds (timer / html / cli / flask)
  const pocket = guessScaffold(userMessage);
  if (
    pocket &&
    allow.has("ensure_folder") &&
    (allow.has("write_file") || allow.has("create_file"))
  ) {
    const writeTool = allow.has("write_file") ? "write_file" : "create_file";
    const folder = `projects/${pocket.name}`;
    calls.push({ tool: "ensure_folder", args: { path: folder } });
    for (const f of scaffoldFiles(pocket.kind, pocket.name)) {
      calls.push({ tool: writeTool, args: { path: f.path, content: f.content } });
    }
  }

  const wantsWebsite =
    /(?:make|create|build|spin up|scaffold)\s+(?:me\s+)?(?:a\s+|an\s+)?(?:simple\s+|small\s+|basic\s+)?(?:web\s*site|webpage|landing page|html site)/i.test(
      userMessage,
    ) || /(?:website|landing page).*(?:for|about|called)/i.test(userMessage);
  if (
    !pocket &&
    wantsWebsite &&
    allow.has("ensure_folder") &&
    (allow.has("write_file") || allow.has("create_file"))
  ) {
    const folder = "website";
    const topicMatch = userMessage.match(
      /(?:about|for|called|named)\s+["']?([^"'.\n]{2,48})/i,
    );
    const topic = (topicMatch?.[1] || "My site").trim();
    const writeTool = allow.has("write_file") ? "write_file" : "create_file";
    calls.push({ tool: "ensure_folder", args: { path: folder } });
    if (!writeMatch) {
      calls.push({
        tool: writeTool,
        args: {
          path: `${folder}/index.html`,
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${topic}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header><strong>Tri-Cass</strong> · ${topic}</header>
  <main>
    <h1>${topic}</h1>
    <p>Built locally by your Tri-Cass Companion agent. Edit these files in the Files tab.</p>
    <p class="hint">Ask the agent to tweak copy, add pages, or restyle — it writes real files in the workspace.</p>
  </main>
</body>
</html>`,
        },
      });
      calls.push({
        tool: writeTool,
        args: {
          path: `${folder}/styles.css`,
          content: `*{box-sizing:border-box}
body{font-family:ui-sans-serif,system-ui,sans-serif;background:radial-gradient(1200px 600px at 10% -10%,#163220,#040804 55%);color:#c8ffd0;margin:0;min-height:100vh;padding:2.5rem}
header{color:#39ff14;letter-spacing:.18em;text-transform:uppercase;font-size:.85rem;margin-bottom:2rem}
main{max-width:40rem;padding:1.5rem;border:1px solid rgba(57,255,20,.28);background:rgba(8,18,10,.72);backdrop-filter:blur(8px)}
h1{font-size:clamp(1.8rem,4vw,2.6rem);margin:0 0 .75rem;color:#eaffea}
p{line-height:1.55;color:#9ad4a4}
.hint{opacity:.75;font-size:.92rem}`,
        },
      });
      calls.push({
        tool: writeTool,
        args: {
          path: `${folder}/README.txt`,
          content: `${topic}\n\nOpen index.html in a browser.\nEdit files from Companion → Files → website/.\nOn USB portable kits, these live under Files/ on the stick.\n`,
        },
      });
    }
  }

  const readMatch = userMessage.match(
    /(?:read|open|show)\s+(?:file\s+)?([a-z0-9_./-]+\.[a-z0-9]+)/i,
  );
  if (readMatch && allow.has("read_file")) {
    calls.push({ tool: "read_file", args: { path: readMatch[1] } });
  }

  if (wantsStatus && allow.has("tricass_status")) {
    calls.push({ tool: "tricass_status", args: {} });
  }

  return calls;
}

export async function runTool(call: AgentToolCall): Promise<ToolResult> {
  switch (call.tool) {
    case "search_vault": {
      const notes = await loadNotes();
      const hits = searchNotes(notes, call.args.query || "").slice(0, 6);
      if (hits.length === 0) {
        return { tool: call.tool, ok: true, text: "Vault: no matching notes." };
      }
      return {
        tool: call.tool,
        ok: true,
        text:
          "Vault hits:\n" +
          hits
            .map(
              (n) =>
                `• ${n.title}\n${n.body.slice(0, 400)}${n.body.length > 400 ? "…" : ""}`,
            )
            .join("\n\n"),
      };
    }
    case "search_packs": {
      const notes = await loadNotes();
      const packs = notes.filter((n) => n.id.startsWith("pack-"));
      const hits = searchNotes(packs, call.args.query || "").slice(0, 6);
      if (hits.length === 0) {
        return {
          tool: call.tool,
          ok: true,
          text: "Packs: no matching imported pack notes.",
        };
      }
      return {
        tool: call.tool,
        ok: true,
        text:
          "Pack hits:\n" +
          hits
            .map(
              (n) =>
                `• ${n.title}\n${n.body.slice(0, 400)}${n.body.length > 400 ? "…" : ""}`,
            )
            .join("\n\n"),
      };
    }
    case "search_coding_packs": {
      const notes = await loadNotes();
      const coding = notes.filter((n) => n.id.startsWith("pack-coding-"));
      const pool =
        coding.length > 0
          ? coding
          : notes.filter((n) => n.id.startsWith("pack-"));
      const hits = searchNotes(pool, call.args.query || "").slice(0, 6);
      if (hits.length === 0) {
        return {
          tool: call.tool,
          ok: true,
          text:
            "Coding packs: no matches. Import .txt/.md via Packs → Import as coding pack " +
            "(or copy excerpts from DevDocs / Stack Overflow ZIMs — we don’t host dumps).",
        };
      }
      return {
        tool: call.tool,
        ok: true,
        text:
          (coding.length > 0
            ? "Coding pack hits:\n"
            : "Pack hits (no coding-tagged imports yet — using general packs):\n") +
          hits
            .map(
              (n) =>
                `• ${n.title}\n${n.body.slice(0, 400)}${n.body.length > 400 ? "…" : ""}`,
            )
            .join("\n\n"),
      };
    }
    case "list_files": {
      const lines = await listWorkspace(call.args.prefix || "");
      return {
        tool: call.tool,
        ok: true,
        text:
          lines.length > 0
            ? `Files:\n${lines.join("\n")}`
            : "Files: empty workspace.",
      };
    }
    case "read_file": {
      const res = await readTextFile(call.args.path || "");
      if (!res.ok) return { tool: call.tool, ok: false, text: res.error };
      return {
        tool: call.tool,
        ok: true,
        text: `File ${res.doc.name}:\n${res.text.slice(0, 6000)}`,
      };
    }
    case "write_file":
    case "create_file": {
      const path = call.args.path || "";
      const content = call.args.content ?? "";
      if (!path) {
        return { tool: call.tool, ok: false, text: "write_file needs a path" };
      }
      try {
        const { doc, change } = await writeTextFile(path, content);
        return {
          tool: call.tool,
          ok: true,
          text: `Wrote ${doc.name} (${doc.size ?? 0} bytes) into the workspace.`,
          change,
        };
      } catch (e) {
        return {
          tool: call.tool,
          ok: false,
          text: e instanceof Error ? e.message : "write failed",
        };
      }
    }
    case "ensure_folder": {
      const path = call.args.path || "";
      if (!path) {
        return { tool: call.tool, ok: false, text: "ensure_folder needs a path" };
      }
      try {
        const folder = await ensureFolder(path);
        return {
          tool: call.tool,
          ok: true,
          text: `Folder ready: ${folder.name}`,
          change: { action: "folder", path: folder.name },
        };
      } catch (e) {
        return {
          tool: call.tool,
          ok: false,
          text: e instanceof Error ? e.message : "folder failed",
        };
      }
    }
    case "rename_file": {
      const from = call.args.from || call.args.path || "";
      const to = call.args.to || "";
      if (!from || !to) {
        return {
          tool: call.tool,
          ok: false,
          text: "rename_file needs from and to paths",
        };
      }
      try {
        const { change } = await renamePath(from, to);
        return {
          tool: call.tool,
          ok: true,
          text: `Renamed ${change.from} → ${change.path}`,
          change,
        };
      } catch (e) {
        return {
          tool: call.tool,
          ok: false,
          text: e instanceof Error ? e.message : "rename failed",
        };
      }
    }
    case "delete_file": {
      const path = call.args.path || "";
      if (!path) {
        return { tool: call.tool, ok: false, text: "delete_file needs a path" };
      }
      try {
        const { change } = await deletePath(path);
        return {
          tool: call.tool,
          ok: true,
          text: `Deleted ${change.path}`,
          change,
        };
      } catch (e) {
        return {
          tool: call.tool,
          ok: false,
          text: e instanceof Error ? e.message : "delete failed",
        };
      }
    }
    case "tricass_status": {
      const state = await loadPluginState();
      const tools = enabledTools(state);
      const lines = await listWorkspace("");
      const notes = await loadNotes();
      const info = await diskInfo();
      const root =
        info && "root" in info && info.root
          ? `\nWorkspace disk: ${info.root}${info.portable ? " (USB portable)" : ""}`
          : "\nWorkspace disk: in-app library (mobile/web) or desktop Workspace folder";
      return {
        tool: call.tool,
        ok: true,
        text: `Tri-Cass Agent status\nPlugins/tools: ${tools.join(", ") || "(none)"}\nVault notes: ${notes.length}\nFiles entries: ${lines.length}${root}`,
      };
    }
    default:
      return {
        tool: call.tool,
        ok: false,
        text: `Unknown tool: ${call.tool}`,
      };
  }
}

export { formatChangeSummary };
