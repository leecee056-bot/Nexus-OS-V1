import { loadNotes, searchNotes } from "../vault/store";
import {
  ensureFolder,
  listTree,
  loadDocs,
  readTextFile,
  writeTextFile,
} from "../files/store";
import { loadPluginState, enabledTools } from "../plugins/store";
import type { AgentToolCall, AgentToolName } from "./schema";

export type ToolResult = { tool: AgentToolName; ok: boolean; text: string };

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

  // Greetings / small talk must never open Vault or Packs.
  const isChitchat =
    /^(hi|hello|hey|yo|sup|thanks|thank you|ok|okay|cool|great|nice|bye|good (morning|afternoon|evening)|how are you)[\s!.?]*$/i.test(
      q,
    );

  const wantsVault =
    !isChitchat &&
    /\b(vault|notes?|knowledge|remember|what did i|lookup|look up|search (my |the )?(vault|notes|knowledge))\b/.test(
      q,
    );
  const wantsPacks =
    !isChitchat &&
    /\b(packs?|wiki|wikipedia|gutenberg|offline (knowledge|pack))\b/.test(q);
  const wantsFiles =
    !isChitchat &&
    /\b(file|folder|website|html|css|project|create|write|save|list files|in files|make (a |me )?(site|page|website))\b/.test(
      q,
    );
  const wantsStatus =
    !isChitchat && /\b(status|what can you|plugins?|add-?ons?)\b/.test(q);

  if (wantsVault && allow.has("search_vault")) {
    calls.push({
      tool: "search_vault",
      args: { query: keywords(userMessage).join(" ") || userMessage.slice(0, 80) },
    });
  }
  if (wantsPacks && allow.has("search_packs")) {
    calls.push({
      tool: "search_packs",
      args: { query: keywords(userMessage).join(" ") || userMessage.slice(0, 80) },
    });
  }

  if (wantsFiles && allow.has("list_files")) {
    const folderMatch = q.match(
      /(?:in|folder|project)\s+([a-z0-9_./-]+)/i,
    );
    calls.push({
      tool: "list_files",
      args: { prefix: folderMatch?.[1] ?? "" },
    });
  }

  // Explicit write: "create website/index.html with ..." or "write file X: ..."
  const writeMatch =
    userMessage.match(
      /(?:create|write|save|make)\s+(?:(?:a|an|the)\s+)?(?:file\s+)?([a-z0-9_./-]+\.[a-z0-9]+)\s*(?:with|containing|:)\s*([\s\S]+)/i,
    ) ||
    userMessage.match(
      /(?:create|write|save)\s+([a-z0-9_./-]+\.[a-z0-9]+)\s+as\s+([\s\S]+)/i,
    );

  if (writeMatch && allow.has("write_file")) {
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
    calls.push({ tool: "write_file", args: { path, content: body } });
  }

  const folderMatch2 = userMessage.match(
    /(?:create|make|new)\s+(?:a\s+)?folder\s+(?:called\s+|named\s+)?([a-z0-9_./-]+)/i,
  );
  if (folderMatch2 && allow.has("ensure_folder")) {
    calls.push({ tool: "ensure_folder", args: { path: folderMatch2[1] } });
  }

  // Website project shortcut — one ask → files on disk.
  const wantsWebsite =
    /(?:make|create|build|spin up|scaffold)\s+(?:me\s+)?(?:a\s+|an\s+)?(?:simple\s+|small\s+|basic\s+)?(?:web\s*site|webpage|landing page|html site)/i.test(
      userMessage,
    ) || /(?:website|landing page).*(?:for|about|called)/i.test(userMessage);
  if (
    wantsWebsite &&
    allow.has("ensure_folder") &&
    allow.has("write_file")
  ) {
    const folder = "website";
    const topicMatch = userMessage.match(
      /(?:about|for|called|named)\s+["']?([^"'.\n]{2,48})/i,
    );
    const topic = (topicMatch?.[1] || "My site").trim();
    calls.push({ tool: "ensure_folder", args: { path: folder } });
    if (!writeMatch) {
      calls.push({
        tool: "write_file",
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
    <p class="hint">Ask the agent to tweak copy, add pages, or restyle — it writes real files.</p>
  </main>
</body>
</html>`,
        },
      });
      calls.push({
        tool: "write_file",
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
        tool: "write_file",
        args: {
          path: `${folder}/README.txt`,
          content: `${topic}\n\nOpen index.html in a browser.\nEdit files from Companion → Files → website/.\n`,
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

  // Do not auto-search Vault/Packs for casual messages — only explicit intents above.
  return calls;
}

export async function runTool(call: AgentToolCall): Promise<ToolResult> {
  switch (call.tool) {
    case "search_vault": {
      const notes = await loadNotes();
      const hits = searchNotes(notes, call.args.query || "").slice(0, 6);
      if (hits.length === 0) {
        return {
          tool: call.tool,
          ok: true,
          text: "Vault: no matching notes.",
        };
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
    case "list_files": {
      const docs = await loadDocs();
      const lines = listTree(docs, call.args.prefix || "");
      return {
        tool: call.tool,
        ok: true,
        text:
          lines.length > 0
            ? `Files:\n${lines.join("\n")}`
            : "Files: empty library.",
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
    case "write_file": {
      const path = call.args.path || "";
      const content = call.args.content ?? "";
      if (!path) {
        return { tool: call.tool, ok: false, text: "write_file needs a path" };
      }
      const doc = await writeTextFile(path, content);
      return {
        tool: call.tool,
        ok: true,
        text: `Wrote ${doc.name} (${doc.size ?? 0} bytes) into Files.`,
      };
    }
    case "ensure_folder": {
      const path = call.args.path || "";
      if (!path) {
        return { tool: call.tool, ok: false, text: "ensure_folder needs a path" };
      }
      const folder = await ensureFolder(path);
      return {
        tool: call.tool,
        ok: true,
        text: `Folder ready: ${folder.name}`,
      };
    }
    case "tricass_status": {
      const state = await loadPluginState();
      const tools = enabledTools(state);
      const docs = await loadDocs();
      const notes = await loadNotes();
      return {
        tool: call.tool,
        ok: true,
        text: `Tri-Cass Agent status\nPlugins/tools: ${tools.join(", ") || "(none)"}\nVault notes: ${notes.length}\nFiles entries: ${docs.length}`,
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
