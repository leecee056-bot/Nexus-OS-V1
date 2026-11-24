"""Pocket Agent grammar JSON tool loop (HAP-103).

One tool per model step, constrained via llama.cpp GBNF when available,
with JSON extract + allow-list validation as fallback.

Tools: write_file, edit_file, read_file, list_dir, run, search_knowledge, finish.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from builder import projects_root, write_project_file
from checkpoints import (
    latest_checkpoint_id,
    maybe_checkpoint_after,
    restore_checkpoint,
)
from llm import completion_with_grammar, server_alive
from plan_rules import PLAN_REL, RULES_NAME, build_mode_context, save_plan
from post_write import StuckTracker, post_write_verify
from sandbox_run import sandbox_run
from vault import Vault

GRAMMAR_TOOLS = (
    "write_file",
    "edit_file",
    "read_file",
    "list_dir",
    "run",
    "search_knowledge",
    "finish",
)

MAX_STEPS = 8

# Constrains tool name; args object is free-form JSON strings.
TOOL_GBNF = r"""
root ::= "{" ws "\"tool\"" ws ":" ws tool ws "," ws "\"args\"" ws ":" ws object ws "}"
tool ::= "\"write_file\"" | "\"edit_file\"" | "\"read_file\"" | "\"list_dir\"" | "\"run\"" | "\"search_knowledge\"" | "\"finish\""
object ::= "{" ws (pair (ws "," ws pair)*)? ws "}"
pair ::= string ws ":" ws value
value ::= string | number | "true" | "false" | "null" | object | array
array ::= "[" ws (value (ws "," ws value)*)? ws "]"
string ::= "\"" ([^"\\] | "\\" ["\\/bfnrt] | "\\u" [0-9a-fA-F]{4})* "\""
number ::= "-"? ([0-9] | [1-9] [0-9]*) ("." [0-9]+)? ([eE] [+-]? [0-9]+)?
ws ::= [ \t\n\r]*
"""

SYSTEM = (
    "You are Tri-Cass Pocket Agent on the USB/Pi hub. "
    "Reply with ONE JSON object only — no markdown.\n"
    'Shape: {"tool":"<name>","args":{...}}\n'
    "Tools: write_file (path,content), edit_file (path,old,new), "
    "read_file (path), list_dir (path), "
    "run (project,command[,timeout]), search_knowledge (query), "
    "finish (message). Paths are relative under /data/projects/. "
    "run cwd is locked to that project; only python/python3/node. "
    "Call finish when done."
)


def _is_plan_or_rules_path(rel: str) -> bool:
    rel = (rel or "").strip().lstrip("/")
    if rel.endswith(str(PLAN_REL).replace("\\", "/")) or rel.endswith(".tri-cass/plan.md"):
        return True
    if rel.endswith(RULES_NAME) or rel == RULES_NAME:
        return True
    return False


def extract_json_object(text: str) -> str | None:
    start = text.find("{")
    if start < 0:
        return None
    depth = 0
    in_str = False
    esc = False
    for i, c in enumerate(text[start:], start):
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == '"':
                in_str = False
            continue
        if c == '"':
            in_str = True
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return text[start : i + 1]
    return None


def parse_tool_call(text: str) -> dict | None:
    raw = extract_json_object(text or "")
    if not raw:
        return None
    try:
        obj = json.loads(raw)
    except Exception:
        return None
    if not isinstance(obj, dict):
        return None
    tool = str(obj.get("tool") or obj.get("name") or "").strip()
    if tool not in GRAMMAR_TOOLS:
        return None
    args = obj.get("args") if isinstance(obj.get("args"), dict) else {}
    out_args = {}
    for k, v in args.items():
        if v is None:
            continue
        out_args[str(k)] = v if isinstance(v, str) else json.dumps(v)
    return {"tool": tool, "args": out_args}


def _safe_rel(rel: str) -> str | None:
    rel = (rel or "").strip().lstrip("/")
    if not rel or ".." in rel or rel.startswith("/"):
        return None
    return rel


def _list_dir(data_dir: Path, prefix: str) -> str:
    base = projects_root(data_dir)
    rel = (prefix or "").strip().lstrip("/")
    if ".." in rel:
        return "Path escapes sandbox"
    target = (base / rel).resolve() if rel else base.resolve()
    try:
        target.relative_to(base.resolve())
    except ValueError:
        return "Path escapes sandbox"
    if not target.exists():
        return f"(missing) {rel or '.'}"
    if target.is_file():
        return f"file {rel}"
    lines = []
    for p in sorted(target.iterdir()):
        if p.name.startswith(".") or p.name == ".tri-cass":
            continue
        mark = "/" if p.is_dir() else ""
        lines.append(f"{p.name}{mark}")
    return "\n".join(lines) or "(empty)"


def _read_file(data_dir: Path, rel: str) -> str:
    safe = _safe_rel(rel)
    if not safe:
        return "Bad path"
    path = (projects_root(data_dir) / safe).resolve()
    try:
        path.relative_to(projects_root(data_dir).resolve())
    except ValueError:
        return "Path escapes sandbox"
    if not path.is_file():
        return "not a file"
    if path.stat().st_size > 100_000:
        return "file too large"
    return path.read_text(encoding="utf-8", errors="replace")[:6000]


def _edit_file(data_dir: Path, rel: str, old: str, new: str) -> str:
    safe = _safe_rel(rel)
    if not safe:
        return "Bad path"
    if not old:
        return "edit_file needs non-empty old"
    path = (projects_root(data_dir) / safe).resolve()
    try:
        path.relative_to(projects_root(data_dir).resolve())
    except ValueError:
        return "Path escapes sandbox"
    if not path.is_file():
        return "not a file"
    text = path.read_text(encoding="utf-8", errors="replace")
    if old not in text:
        return f"old text not found in {safe}"
    path.write_text(text.replace(old, new, 1), encoding="utf-8")
    return f"Edited {safe}"


def _search_knowledge(data_dir: Path, query: str) -> str:
    v = Vault(data_dir)
    try:
        n_docs = v._conn.execute("SELECT COUNT(*) FROM docs").fetchone()[0]
    except Exception:
        n_docs = 0
    if n_docs == 0:
        v.rebuild()
    hits = v.search(query or "")
    v.close()
    if not hits:
        return "(no vault hits)"
    return "\n".join(f"{h['title']}: {h.get('snip')}" for h in hits)


def execute_tool(data_dir: Path, call: dict, *, mode: str = "act") -> str:
    tool = call["tool"]
    args = call.get("args") or {}
    if tool == "finish":
        return args.get("message") or args.get("text") or "Done."
    if mode == "plan" and tool in ("edit_file", "run"):
        return "Blocked in PLAN mode — write projects/<name>/.tri-cass/plan.md then finish; user types: accept"
    if tool == "list_dir":
        return _list_dir(data_dir, args.get("path") or args.get("prefix") or "")
    if tool == "read_file":
        return _read_file(data_dir, args.get("path") or "")
    if tool == "write_file":
        rel = args.get("path") or ""
        content = args.get("content") or ""
        if mode == "plan" and not _is_plan_or_rules_path(rel):
            # Allow write via save_plan when path is the plan file under a project
            bits = rel.strip().lstrip("/").split("/")
            if len(bits) >= 2 and bits[0] and "/".join(bits[1:]) in (
                str(PLAN_REL).replace("\\", "/"),
                ".tri-cass/plan.md",
            ):
                return save_plan(data_dir, bits[0], content)
            return (
                "PLAN mode: only write <project>/.tri-cass/plan.md "
                f"(got {rel!r})"
            )
        msg = write_project_file(data_dir, rel, content)
        if msg.lower().startswith("path") or "too large" in msg.lower():
            return msg
        ok, detail = post_write_verify(data_dir, rel, content)
        if not ok:
            return f"ERROR post-write: {detail}\n(after {msg})"
        proj = rel.strip().lstrip("/").split("/")[0]
        if proj:
            return maybe_checkpoint_after(
                data_dir, proj, f"write {rel}", f"{msg}\nCheck: {detail}"
            )
        return f"{msg}\nCheck: {detail}"
    if tool == "edit_file":
        rel = args.get("path") or ""
        msg = _edit_file(
            data_dir,
            rel,
            args.get("old") or args.get("old_str") or "",
            args.get("new") or args.get("new_str") or "",
        )
        if not msg.startswith("Edited"):
            return msg
        ok, detail = post_write_verify(data_dir, rel, None)
        if not ok:
            return f"ERROR post-write: {detail}\n(after {msg})"
        proj = rel.strip().lstrip("/").split("/")[0]
        if proj:
            return maybe_checkpoint_after(
                data_dir, proj, f"edit {rel}", f"{msg}\nCheck: {detail}"
            )
        return f"{msg}\nCheck: {detail}"
    if tool == "search_knowledge":
        return _search_knowledge(data_dir, args.get("query") or "")
    if tool == "run":
        project = args.get("project") or ""
        # Infer project from path like demo/main.py when project omitted
        if not project:
            path_hint = (args.get("path") or "").strip().lstrip("/")
            if path_hint and "/" in path_hint and ".." not in path_hint:
                project = path_hint.split("/", 1)[0]
        cmd = args.get("command") or args.get("cmd") or ""
        return sandbox_run(
            data_dir,
            project,
            cmd,
            args.get("timeout") or args.get("timeout_sec"),
        )
    return f"Unknown tool {tool}"


def run_grammar_loop(
    data_dir: Path,
    base: str,
    goal: str,
    *,
    max_steps: int = MAX_STEPS,
    use_grammar: bool = True,
    mode: str = "act",
    project: str = "",
) -> str:
    """Run the constrained tool loop; returns a user-facing summary."""
    if not server_alive(base):
        return "llama-server offline — start a model in Chat first, then: loop <goal>"
    goal = (goal or "").strip()
    if not goal:
        return "Usage: loop <goal>  — e.g. loop list projects and finish"

    extra = ""
    if project:
        extra = "\n\n" + build_mode_context(data_dir, project, mode)
    elif mode == "plan":
        extra = (
            "\n\n[Mode: PLAN] Write a short checklist under "
            "<project>/.tri-cass/plan.md then finish."
        )

    messages = [
        {"role": "system", "content": SYSTEM + extra},
        {"role": "user", "content": goal},
    ]
    log: list[str] = []
    finish_msg = ""
    stuck = StuckTracker()

    for i in range(max_steps):
        try:
            raw = completion_with_grammar(
                base,
                messages,
                grammar=TOOL_GBNF if use_grammar else None,
                temperature=0.2,
                max_tokens=768,
            )
        except Exception as e:
            return f"Model error: {e}\n" + "\n".join(log[-6:])

        call = parse_tool_call(raw)
        if not call:
            # One retry without grammar if first parse fails
            if use_grammar and i == 0:
                use_grammar = False
                messages.append({"role": "assistant", "content": raw[:500]})
                messages.append(
                    {
                        "role": "user",
                        "content": 'Invalid JSON. Reply with only {"tool":"...","args":{...}}.',
                    }
                )
                continue
            log.append(f"step {i + 1}: invalid JSON")
            break

        tool = call["tool"]
        if tool == "finish":
            finish_msg = execute_tool(data_dir, call, mode=mode)
            log.append(f"finish: {finish_msg[:120]}")
            break

        obs = execute_tool(data_dir, call, mode=mode)
        hint = (
            call["args"].get("path")
            or call["args"].get("command")
            or call["args"].get("query")
            or ""
        )
        log.append(f"{tool} {hint}: {obs.splitlines()[0][:100]}")
        failed = (
            obs.startswith("ERROR")
            or obs.startswith("Blocked")
            or obs.startswith("old text not found")
            or obs.startswith("Bad path")
            or obs.startswith("TIMEOUT")
            or (obs.startswith("exit ") and not obs.startswith("exit 0"))
        )
        if failed:
            streak = stuck.record(obs)
            if streak >= 3:
                rb = ""
                proj = project or call["args"].get("project") or ""
                if not proj:
                    path_hint = (call["args"].get("path") or "").strip().lstrip("/")
                    if path_hint:
                        proj = path_hint.split("/", 1)[0]
                if proj:
                    cid = latest_checkpoint_id(data_dir, proj)
                    if cid:
                        rb = restore_checkpoint(data_dir, cid)
                finish_msg = (
                    f"Stuck on the same error ×{streak}. Rolled back and stopped.\n"
                    f"{obs[:800]}\n{rb}"
                )
                log.append(f"stuck×{streak}: rollback")
                break
        messages.append(
            {"role": "assistant", "content": json.dumps({"tool": tool, "args": call["args"]})}
        )
        messages.append(
            {
                "role": "user",
                "content": (
                    f"[tool result]\n{obs[:3500]}\n\nNext: one JSON tool call, or finish."
                    if not failed
                    else f"[tool result]\n{obs[:3500]}\n\nCheck failed — try a different fix. Next: one JSON tool call, or finish."
                ),
            }
        )
    else:
        finish_msg = "Reached step limit."

    body = finish_msg or "Loop ended."
    if log:
        body += "\n\nSteps:\n" + "\n".join(f"• {line}" for line in log)
    return body
