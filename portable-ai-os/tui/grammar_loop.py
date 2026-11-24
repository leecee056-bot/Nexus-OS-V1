"""Pocket Agent grammar JSON tool loop (HAP-103).

One tool per model step, constrained via llama.cpp GBNF when available,
with JSON extract + allow-list validation as fallback.

Tools: write_file, edit_file, read_file, list_dir, search_knowledge, finish.
(run is reserved for HAP-104 — not enabled here.)
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from builder import projects_root, write_project_file
from checkpoints import maybe_checkpoint_after
from llm import completion_with_grammar, server_alive
from vault import Vault

GRAMMAR_TOOLS = (
    "write_file",
    "edit_file",
    "read_file",
    "list_dir",
    "search_knowledge",
    "finish",
)

MAX_STEPS = 8

# Constrains tool name; args object is free-form JSON strings.
TOOL_GBNF = r"""
root ::= "{" ws "\"tool\"" ws ":" ws tool ws "," ws "\"args\"" ws ":" ws object ws "}"
tool ::= "\"write_file\"" | "\"edit_file\"" | "\"read_file\"" | "\"list_dir\"" | "\"search_knowledge\"" | "\"finish\""
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
    "read_file (path), list_dir (path), search_knowledge (query), "
    "finish (message). Paths are relative under /data/projects/. "
    "Call finish when done."
)


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


def execute_tool(data_dir: Path, call: dict) -> str:
    tool = call["tool"]
    args = call.get("args") or {}
    if tool == "finish":
        return args.get("message") or args.get("text") or "Done."
    if tool == "list_dir":
        return _list_dir(data_dir, args.get("path") or args.get("prefix") or "")
    if tool == "read_file":
        return _read_file(data_dir, args.get("path") or "")
    if tool == "write_file":
        rel = args.get("path") or ""
        content = args.get("content") or ""
        msg = write_project_file(data_dir, rel, content)
        proj = rel.strip().lstrip("/").split("/")[0]
        if proj and not msg.lower().startswith("path") and "too large" not in msg.lower():
            return maybe_checkpoint_after(data_dir, proj, f"write {rel}", msg)
        return msg
    if tool == "edit_file":
        rel = args.get("path") or ""
        msg = _edit_file(
            data_dir,
            rel,
            args.get("old") or args.get("old_str") or "",
            args.get("new") or args.get("new_str") or "",
        )
        proj = rel.strip().lstrip("/").split("/")[0]
        if proj and msg.startswith("Edited"):
            return maybe_checkpoint_after(data_dir, proj, f"edit {rel}", msg)
        return msg
    if tool == "search_knowledge":
        return _search_knowledge(data_dir, args.get("query") or "")
    return f"Unknown tool {tool}"


def run_grammar_loop(
    data_dir: Path,
    base: str,
    goal: str,
    *,
    max_steps: int = MAX_STEPS,
    use_grammar: bool = True,
) -> str:
    """Run the constrained tool loop; returns a user-facing summary."""
    if not server_alive(base):
        return "llama-server offline — start a model in Chat first, then: loop <goal>"
    goal = (goal or "").strip()
    if not goal:
        return "Usage: loop <goal>  — e.g. loop list projects and finish"

    messages = [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": goal},
    ]
    log: list[str] = []
    finish_msg = ""

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
            finish_msg = execute_tool(data_dir, call)
            log.append(f"finish: {finish_msg[:120]}")
            break

        obs = execute_tool(data_dir, call)
        hint = call["args"].get("path") or call["args"].get("query") or ""
        log.append(f"{tool} {hint}: {obs.splitlines()[0][:100]}")
        messages.append(
            {"role": "assistant", "content": json.dumps({"tool": tool, "args": call["args"]})}
        )
        messages.append(
            {
                "role": "user",
                "content": f"[tool result]\n{obs[:3500]}\n\nNext: one JSON tool call, or finish.",
            }
        )
    else:
        finish_msg = "Reached step limit."

    body = finish_msg or "Loop ended."
    if log:
        body += "\n\nSteps:\n" + "\n".join(f"• {line}" for line in log)
    return body
