"""Plan mode + project rules (HAP-114) for Pocket Agent hub.

- .tri-cass-rules under /data/projects/<name>/ (and optional workspace copy)
- Plan checklist at /data/projects/<name>/.tri-cass/plan.md
- PLAN mode: explore + write plan only; ACT after accept
"""
from __future__ import annotations

import json
from pathlib import Path

from builder import projects_root

RULES_NAME = ".tri-cass-rules"
PLAN_REL = Path(".tri-cass") / "plan.md"
MODE_FILE = ".tri-cass"  # under data_dir: agent-mode.json

DEFAULT_RULES = """# Tri-Cass project rules
- Prefer templates under /data/projects/ (timer-app / html-app / python-cli / flask-app).
- Keep files small; one concern per file.
- Relative paths only; never escape the project sandbox.
- After edits, use: run <project> | python3 … when checking.
- Ask at most one clarifying question before a multi-file plan.
"""


def _mode_path(data_dir: Path) -> Path:
    p = Path(data_dir) / ".tri-cass"
    p.mkdir(parents=True, exist_ok=True)
    return p / "agent-mode.json"


def load_mode(data_dir: Path) -> str:
    path = _mode_path(data_dir)
    if not path.is_file():
        return "act"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        mode = str(data.get("mode") or "act")
        return mode if mode in ("plan", "act") else "act"
    except Exception:
        return "act"


def save_mode(data_dir: Path, mode: str) -> str:
    mode = "plan" if mode == "plan" else "act"
    path = _mode_path(data_dir)
    path.write_text(json.dumps({"mode": mode}, indent=2), encoding="utf-8")
    return mode


def project_dir(data_dir: Path, project: str) -> Path | str:
    project = (project or "").strip().strip("/")
    if not project or "/" in project or ".." in project:
        return "Need a single project name under /data/projects"
    root = projects_root(data_dir) / project
    if not root.is_dir():
        return f"No project '{project}' — scaffold one first"
    return root


def rules_path(data_dir: Path, project: str) -> Path | str:
    root = project_dir(data_dir, project)
    if isinstance(root, str):
        return root
    return root / RULES_NAME


def plan_path(data_dir: Path, project: str) -> Path | str:
    root = project_dir(data_dir, project)
    if isinstance(root, str):
        return root
    return root / PLAN_REL


def load_rules(data_dir: Path, project: str) -> str:
    path = rules_path(data_dir, project)
    if isinstance(path, str):
        return ""
    if path.is_file():
        return path.read_text(encoding="utf-8", errors="replace").strip()
    return ""


def ensure_rules(data_dir: Path, project: str) -> str:
    path = rules_path(data_dir, project)
    if isinstance(path, str):
        return path
    if path.is_file() and path.read_text(encoding="utf-8").strip():
        return f"Rules already at {path}"
    path.write_text(DEFAULT_RULES, encoding="utf-8")
    return f"Wrote default rules → {path}"


def load_plan(data_dir: Path, project: str) -> str:
    path = plan_path(data_dir, project)
    if isinstance(path, str):
        return ""
    if path.is_file():
        return path.read_text(encoding="utf-8", errors="replace").strip()
    return ""


def save_plan(data_dir: Path, project: str, content: str) -> str:
    path = plan_path(data_dir, project)
    if isinstance(path, str):
        return path
    path.parent.mkdir(parents=True, exist_ok=True)
    text = content if content.endswith("\n") else content + "\n"
    path.write_text(text, encoding="utf-8")
    return f"Wrote plan → {path}"


def build_mode_context(data_dir: Path, project: str, mode: str) -> str:
    parts = []
    if mode == "plan":
        parts.append(
            "[Mode: PLAN] Only explore and write projects/<name>/.tri-cass/plan.md. "
            "No other writes/edits/run. Short checklist, then finish asking user to: accept"
        )
    else:
        parts.append(
            "[Mode: ACT] Execute the accepted plan one tool at a time."
        )
    rules = load_rules(data_dir, project)
    if rules:
        parts.append(f"[Project rules]\n{rules[:2500]}")
    plan = load_plan(data_dir, project)
    if plan:
        parts.append(f"[Plan checklist]\n{plan[:3000]}")
    elif mode == "act":
        parts.append("[Plan] (none — keep changes small or: plan <goal>)")
    return "\n\n".join(parts)


def parse_mode_intent(line: str) -> str | None:
    q = (line or "").strip().lower()
    if q in ("accept", "accept plan", "approve", "go", "go ahead", "lgtm"):
        return "accept"
    if q in ("plan mode", "plan") or q.startswith("plan "):
        return "plan"
    if q in ("act", "act mode", "build"):
        return "act"
    return None
