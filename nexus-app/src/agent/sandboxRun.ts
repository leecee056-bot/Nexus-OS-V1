/**
 * Sandboxed project command runner (HAP-104) — desktop Companion via Electron.
 * Mobile/web: not available (no host process spawn).
 */

import { diskRun } from "../files/diskBridge";

export const RUN_ALLOWED = ["python", "python3", "py", "node"] as const;
export const DEFAULT_RUN_TIMEOUT_SEC = 20;
export const MAX_RUN_TIMEOUT_SEC = 60;

export type SandboxRunResult = {
  ok: boolean;
  text: string;
  exitCode?: number;
  timedOut?: boolean;
};

/** Split a simple command line without a real shell. */
export function splitCommand(command: string): string[] | null {
  const s = command.trim();
  if (!s || s.length > 500 || /[\n\r]/.test(s)) return null;
  const out: string[] = [];
  let cur = "";
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === "\\" && quote === '"' && i + 1 < s.length) {
        cur += s[++i];
        continue;
      }
      if (c === quote) {
        quote = null;
        continue;
      }
      cur += c;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (/\s/.test(c)) {
      if (cur) {
        out.push(cur);
        cur = "";
      }
      continue;
    }
    cur += c;
  }
  if (quote) return null;
  if (cur) out.push(cur);
  return out.length ? out : null;
}

export function parseTimeout(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_RUN_TIMEOUT_SEC;
  return Math.min(MAX_RUN_TIMEOUT_SEC, Math.max(1, Math.floor(n)));
}

/**
 * Run allowlisted interpreter in projects/<project>/ (desktop) or explain unavailability.
 */
export async function runSandboxed(args: {
  project: string;
  command: string;
  timeout?: string;
}): Promise<SandboxRunResult> {
  const project = (args.project || "").trim().replace(/^\/+|\/+$/g, "");
  if (!project || project.includes("..") || project.includes("/")) {
    return {
      ok: false,
      text: "run needs a single project folder under projects/ (e.g. demo).",
    };
  }
  const argv = splitCommand(args.command || "");
  if (!argv) {
    return { ok: false, text: "run needs a single-line command." };
  }
  const bin = argv[0].replace(/^.*[/\\]/, "").toLowerCase();
  if (!(RUN_ALLOWED as readonly string[]).includes(bin)) {
    return {
      ok: false,
      text: `binary '${bin}' not allowed — use: ${RUN_ALLOWED.join(", ")}`,
    };
  }

  const timeoutSec = parseTimeout(args.timeout);
  const res = await diskRun({
    project,
    command: args.command.trim(),
    timeoutSec,
  });
  if (!res) {
    return {
      ok: false,
      text:
        "Sandboxed run needs the desktop Companion (Electron). " +
        "Mobile/web builds cannot spawn host processes.",
    };
  }
  if (!res.ok) {
    return {
      ok: false,
      text: res.error || "run failed",
      exitCode: res.exitCode,
      timedOut: res.timedOut,
    };
  }
  const header = res.timedOut
    ? `TIMEOUT after ${timeoutSec}s`
    : `exit ${res.exitCode ?? 0}`;
  const body = (res.output || "").trim();
  return {
    ok: !res.timedOut && (res.exitCode ?? 1) === 0,
    text: body ? `${header}\n${body}` : header,
    exitCode: res.exitCode,
    timedOut: res.timedOut,
  };
}
