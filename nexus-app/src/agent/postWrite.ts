/**
 * Post-write smoke checks (HAP-115).
 * Fast in-process checks; optional sandboxed py_compile / node --check on desktop.
 */

import { runSandboxed } from "./sandboxRun";

export type VerifyResult = {
  ok: boolean;
  detail: string;
};

function balance(text: string, open: string, close: string): boolean {
  let n = 0;
  let inStr: '"' | "'" | "`" | null = null;
  let esc = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) {
        esc = false;
        continue;
      }
      if (c === "\\") {
        esc = true;
        continue;
      }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inStr = c;
      continue;
    }
    if (c === open) n++;
    else if (c === close) {
      n--;
      if (n < 0) return false;
    }
  }
  return n === 0;
}

function verifyJson(content: string): VerifyResult {
  try {
    JSON.parse(content);
    return { ok: true, detail: "json: ok" };
  } catch (e) {
    return {
      ok: false,
      detail: `json: ${e instanceof Error ? e.message : "parse error"}`,
    };
  }
}

function verifyHtml(content: string): VerifyResult {
  const lower = content.toLowerCase();
  if (!/<html[\s>]/i.test(lower) && !/<!doctype/i.test(lower) && content.length > 40) {
    // fragment OK
  }
  const openTags = (content.match(/<[a-zA-Z][^/>]*>/g) || []).length;
  const closeTags = (content.match(/<\/[a-zA-Z][^>]*>/g) || []).length;
  const selfClose = (content.match(/<[a-zA-Z][^>]*\/>/g) || []).length;
  if (openTags > closeTags + selfClose + 8) {
    return {
      ok: false,
      detail: `html: many more open tags (${openTags}) than close tags (${closeTags})`,
    };
  }
  if (!balance(content.replace(/<[^>]+>/g, ""), "{", "}")) {
    return { ok: false, detail: "html: unbalanced { } in script/style-ish text" };
  }
  return { ok: true, detail: "html: smoke ok" };
}

function verifyBraced(content: string, kind: string): VerifyResult {
  if (!balance(content, "{", "}") || !balance(content, "(", ")") || !balance(content, "[", "]")) {
    return { ok: false, detail: `${kind}: unbalanced brackets` };
  }
  return { ok: true, detail: `${kind}: brackets ok` };
}

function verifyPython(content: string): VerifyResult {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\t+ +|^\t* +\t/.test(line)) {
      return { ok: false, detail: `python: mixed tabs/spaces near line ${i + 1}` };
    }
  }
  if (
    !balance(content, "(", ")") ||
    !balance(content, "[", "]") ||
    !balance(content, "{", "}")
  ) {
    return { ok: false, detail: "python: unbalanced brackets" };
  }
  // crude: odd triple-quote count
  const triples = (content.match(/"""/g) || []).length + (content.match(/'''/g) || []).length;
  if (triples % 2 !== 0) {
    return { ok: false, detail: "python: unclosed triple-quoted string?" };
  }
  return { ok: true, detail: "python: basic smoke ok" };
}

/** In-process verification by extension. */
export function verifyContent(path: string, content: string): VerifyResult {
  const p = path.toLowerCase();
  if (p.endsWith(".json")) return verifyJson(content);
  if (p.endsWith(".html") || p.endsWith(".htm")) return verifyHtml(content);
  if (p.endsWith(".css")) return verifyBraced(content, "css");
  if (p.endsWith(".js") || p.endsWith(".mjs") || p.endsWith(".cjs")) {
    return verifyBraced(content, "js");
  }
  if (p.endsWith(".ts") || p.endsWith(".tsx")) return verifyBraced(content, "ts");
  if (p.endsWith(".py")) return verifyPython(content);
  return { ok: true, detail: "skip: no checker for this type" };
}

function projectFromPath(path: string): string | undefined {
  const parts = path.replace(/\\/g, "/").replace(/^\/+/, "").split("/");
  if (parts[0] === "projects" && parts[1]) return parts[1];
  return undefined;
}

/**
 * After a successful write/edit: in-process check, then optional desktop compile.
 */
export async function postWriteVerify(opts: {
  path: string;
  content: string;
}): Promise<VerifyResult> {
  const basic = verifyContent(opts.path, opts.content);
  if (!basic.ok) return basic;

  const project = projectFromPath(opts.path);
  const base = opts.path.replace(/\\/g, "/").split("/").pop() || opts.path;
  if (project && opts.path.toLowerCase().endsWith(".py")) {
    const rel =
      opts.path.replace(/\\/g, "/").replace(/^projects\/[^/]+\//, "") || base;
    const run = await runSandboxed({
      project,
      command: `python3 -m py_compile ${rel}`,
      timeout: "15",
    });
    // null bridge → keep basic ok
    if (run && !run.ok && !/desktop Companion|not found on PATH|needs a single/i.test(run.text)) {
      return { ok: false, detail: `py_compile: ${run.text.slice(0, 400)}` };
    }
    if (run?.ok) return { ok: true, detail: "python: py_compile ok" };
  }
  if (project && /\.(js|mjs|cjs)$/i.test(opts.path)) {
    const rel =
      opts.path.replace(/\\/g, "/").replace(/^projects\/[^/]+\//, "") || base;
    const run = await runSandboxed({
      project,
      command: `node --check ${rel}`,
      timeout: "15",
    });
    if (run && !run.ok && !/desktop Companion|not found on PATH|needs a single/i.test(run.text)) {
      return { ok: false, detail: `node --check: ${run.text.slice(0, 400)}` };
    }
    if (run?.ok) return { ok: true, detail: "js: node --check ok" };
  }
  return basic;
}

/** Normalize error text for stuck detection. */
export function errorFingerprint(text: string): string {
  return text
    .toLowerCase()
    .replace(/\d+/g, "N")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}
