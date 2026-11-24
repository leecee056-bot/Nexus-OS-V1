"""Post-write smoke checks + stuck fingerprints (HAP-115)."""
from __future__ import annotations

import json
import re
from pathlib import Path

from sandbox_run import sandbox_run


def error_fingerprint(text: str) -> str:
    t = re.sub(r"\d+", "N", (text or "").lower())
    t = re.sub(r"\s+", " ", t).strip()
    return t[:160]


def _balance(text: str, open_c: str, close_c: str) -> bool:
    n = 0
    in_str = None
    esc = False
    for c in text:
        if in_str:
            if esc:
                esc = False
                continue
            if c == "\\":
                esc = True
                continue
            if c == in_str:
                in_str = None
            continue
        if c in "\"'`":
            in_str = c
            continue
        if c == open_c:
            n += 1
        elif c == close_c:
            n -= 1
            if n < 0:
                return False
    return n == 0


def verify_content(path: str, content: str) -> tuple[bool, str]:
    p = path.lower()
    if p.endswith(".json"):
        try:
            json.loads(content)
            return True, "json: ok"
        except Exception as e:
            return False, f"json: {e}"
    if p.endswith((".html", ".htm")):
        opens = len(re.findall(r"<[a-zA-Z][^/>]*>", content))
        closes = len(re.findall(r"</[a-zA-Z][^>]*>", content))
        selfc = len(re.findall(r"<[a-zA-Z][^>]*/>", content))
        if opens > closes + selfc + 8:
            return False, f"html: open={opens} close={closes}"
        return True, "html: smoke ok"
    if p.endswith((".js", ".mjs", ".cjs", ".ts", ".tsx", ".css")):
        kind = "js" if ".js" in p or p.endswith((".mjs", ".cjs")) else ("css" if p.endswith(".css") else "ts")
        if not (
            _balance(content, "{", "}")
            and _balance(content, "(", ")")
            and _balance(content, "[", "]")
        ):
            return False, f"{kind}: unbalanced brackets"
        return True, f"{kind}: brackets ok"
    if p.endswith(".py"):
        for i, line in enumerate(content.splitlines(), 1):
            if re.match(r"^\t+ +|^\t* +\t", line):
                return False, f"python: mixed tabs/spaces near line {i}"
        if not (
            _balance(content, "(", ")")
            and _balance(content, "[", "]")
            and _balance(content, "{", "}")
        ):
            return False, "python: unbalanced brackets"
        if (content.count('"""') + content.count("'''")) % 2:
            return False, "python: unclosed triple quote?"
        return True, "python: basic smoke ok"
    return True, "skip: no checker"


def post_write_verify(
    data_dir: Path, rel: str, content: str | None = None
) -> tuple[bool, str]:
    """Verify a project-relative file; optional compile via sandbox_run."""
    rel = (rel or "").strip().lstrip("/")
    if ".." in rel:
        return False, "bad path"
    path = Path(data_dir) / "projects" / rel
    # write_project_file uses projects_root — mirror that
    from builder import projects_root

    path = projects_root(data_dir) / rel
    if content is None:
        if not path.is_file():
            return False, "file missing after write"
        content = path.read_text(encoding="utf-8", errors="replace")
    ok, detail = verify_content(rel, content)
    if not ok:
        return ok, detail

    parts = rel.split("/")
    project = parts[0] if parts else ""
    inner = "/".join(parts[1:]) if len(parts) > 1 else parts[0]
    if project and rel.lower().endswith(".py"):
        out = sandbox_run(data_dir, project, f"python3 -m py_compile {inner}", 15)
        if out.startswith("TIMEOUT") or (
            out.startswith("exit ") and not out.startswith("exit 0")
        ):
            if "not allowed" not in out.lower() and "not found" not in out.lower():
                return False, f"py_compile: {out[:400]}"
        if out.startswith("exit 0"):
            return True, "python: py_compile ok"
    if project and re.search(r"\.(js|mjs|cjs)$", rel, re.I):
        out = sandbox_run(data_dir, project, f"node --check {inner}", 15)
        if out.startswith("TIMEOUT") or (
            out.startswith("exit ") and not out.startswith("exit 0")
        ):
            if "not allowed" not in out.lower() and "not found" not in out.lower():
                return False, f"node --check: {out[:400]}"
        if out.startswith("exit 0"):
            return True, "js: node --check ok"
    return ok, detail


class StuckTracker:
    def __init__(self) -> None:
        self.fingerprints: list[str] = []

    def record(self, text: str) -> int:
        fp = error_fingerprint(text)
        if not fp:
            return 0
        self.fingerprints.append(fp)
        n = 0
        for prev in reversed(self.fingerprints):
            if prev == fp:
                n += 1
            else:
                break
        return n
