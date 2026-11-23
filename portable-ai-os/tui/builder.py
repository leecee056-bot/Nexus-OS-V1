"""Pocket Agent builder — scaffold projects under /data/projects (sandboxed)."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

SAFE_NAME = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_-]{0,47}$")


def templates_root(os_root: Path) -> Path:
    return Path(os_root) / "projects" / "templates"


def projects_root(data_dir: Path) -> Path:
    p = Path(data_dir) / "projects"
    p.mkdir(parents=True, exist_ok=True)
    return p


def list_templates(os_root: Path) -> list[str]:
    root = templates_root(os_root)
    if not root.is_dir():
        return []
    return sorted(
        d.name for d in root.iterdir() if d.is_dir() and not d.name.startswith(".")
    )


def scaffold(os_root: Path, data_dir: Path, template: str, name: str) -> str:
    template = template.strip()
    name = name.strip()
    if not SAFE_NAME.match(name):
        return "Bad project name — use letters, numbers, _ or - (max 48)."
    src = templates_root(os_root) / template
    if not src.is_dir():
        avail = ", ".join(list_templates(os_root)) or "(none)"
        return f"Unknown template '{template}'. Available: {avail}"
    dest = projects_root(data_dir) / name
    if dest.exists():
        return f"Already exists: {dest}"
    shutil.copytree(src, dest)
    # Fix relative ui-kit path for copied html-app
    return f"Scaffolded {template} → {dest}\nOpen files there or ask Chat to edit."


def mkdir_project_path(data_dir: Path, rel: str) -> str:
    rel = rel.strip().lstrip("/")
    if ".." in rel or rel.startswith("/"):
        return "Path must stay under projects/"
    base = projects_root(data_dir)
    target = (base / rel).resolve()
    try:
        target.relative_to(base.resolve())
    except ValueError:
        return "Path escapes sandbox"
    target.mkdir(parents=True, exist_ok=True)
    return f"mkdir {target}"


def write_project_file(data_dir: Path, rel: str, content: str) -> str:
    rel = rel.strip().lstrip("/")
    if ".." in rel or rel.startswith("/"):
        return "Path must stay under projects/"
    base = projects_root(data_dir)
    target = (base / rel).resolve()
    try:
        target.relative_to(base.resolve())
    except ValueError:
        return "Path escapes sandbox"
    target.parent.mkdir(parents=True, exist_ok=True)
    if len(content) > 400_000:
        return "Content too large"
    target.write_text(content, encoding="utf-8")
    return f"Wrote {target} ({len(content)} bytes)"


def guess_scaffold(line: str) -> tuple[str, str] | None:
    """Heuristic: 'make me a timer app called foo' → (timer-app, foo)."""
    q = line.lower()
    name_m = re.search(r"(?:called|named|as)\s+([a-z0-9_-]+)", q)
    name = name_m.group(1) if name_m else "my-app"
    if "timer" in q or "countdown" in q or "pomodoro" in q:
        return ("timer-app", name)
    if "cli" in q or "command line" in q or "python script" in q:
        return ("python-cli", name)
    if "flask" in q or "http server" in q or "local server" in q:
        return ("flask-app", name)
    if re.search(r"\b(app|website|web app|html|tool)\b", q):
        return ("html-app", name)
    return None
