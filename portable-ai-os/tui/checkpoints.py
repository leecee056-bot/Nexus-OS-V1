"""Pocket Agent checkpoints — snapshot / restore under /data/projects.

Cline-style safety for small models: save a good tree after each successful
builder step; roll back instead of asking the model to untangle a mess.
"""
from __future__ import annotations

import json
import shutil
import time
from pathlib import Path

from builder import projects_root

MAX_CHECKPOINTS = 24
SKIP_NAMES = {".tri-cass", ".git", "__pycache__", "node_modules"}


def _cp_root(data_dir: Path) -> Path:
    p = projects_root(data_dir) / ".tri-cass" / "checkpoints"
    p.mkdir(parents=True, exist_ok=True)
    return p


def _index_path(data_dir: Path) -> Path:
    return _cp_root(data_dir) / "index.json"


def _load_index(data_dir: Path) -> list[dict]:
    path = _index_path(data_dir)
    if not path.is_file():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except Exception:
        return []


def _save_index(data_dir: Path, items: list[dict]) -> None:
    _index_path(data_dir).write_text(
        json.dumps(items, indent=2), encoding="utf-8"
    )


def _copy_tree(src: Path, dest: Path) -> int:
    """Copy project files; returns file count."""
    count = 0
    dest.mkdir(parents=True, exist_ok=True)
    for item in src.iterdir():
        if item.name in SKIP_NAMES or item.name.startswith("."):
            continue
        target = dest / item.name
        if item.is_dir():
            count += _copy_tree(item, target)
        elif item.is_file():
            if item.stat().st_size > 400_000:
                continue
            shutil.copy2(item, target)
            count += 1
    return count


def create_checkpoint(
    data_dir: Path, project: str, label: str = ""
) -> str:
    project = project.strip().strip("/")
    if not project or ".." in project or "/" in project:
        return "checkpoint needs a single project name under /data/projects"
    src = projects_root(data_dir) / project
    if not src.is_dir():
        return f"No project '{project}' — scaffold one first"
    cid = time.strftime("%Y%m%d-%H%M%S") + f"-{int(time.time() * 1000) % 1000:03d}"
    dest = _cp_root(data_dir) / cid / "tree" / project
    n = _copy_tree(src, dest)
    meta = {
        "id": cid,
        "project": project,
        "label": (label or f"after {project}").strip()[:120],
        "created": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "files": n,
    }
    ( _cp_root(data_dir) / cid / "meta.json").write_text(
        json.dumps(meta, indent=2), encoding="utf-8"
    )
    items = [meta] + _load_index(data_dir)
    # prune
    for old in items[MAX_CHECKPOINTS:]:
        old_dir = _cp_root(data_dir) / old["id"]
        if old_dir.is_dir():
            shutil.rmtree(old_dir, ignore_errors=True)
    items = items[:MAX_CHECKPOINTS]
    _save_index(data_dir, items)
    return f"Checkpoint {cid} · {project} ({n} files) — {meta['label']}"


def latest_checkpoint_id(data_dir: Path, project: str = "") -> str | None:
    items = _load_index(data_dir)
    if project:
        project = project.strip()
        items = [i for i in items if i.get("project") == project]
    return items[0]["id"] if items else None


def list_checkpoints(data_dir: Path, project: str = "") -> str:
    items = _load_index(data_dir)
    if project:
        project = project.strip()
        items = [i for i in items if i.get("project") == project]
    if not items:
        return "(no checkpoints yet — scaffold/write will create them)"
    lines = []
    for i in items[:MAX_CHECKPOINTS]:
        lines.append(
            f"{i.get('id')}  {i.get('project')}  {i.get('files')}f  {i.get('label')}"
        )
    return "\n".join(lines)


def restore_checkpoint(data_dir: Path, checkpoint_id: str) -> str:
    cid = checkpoint_id.strip()
    if not cid:
        return "Usage: restore <checkpoint-id>"
    meta_path = _cp_root(data_dir) / cid / "meta.json"
    if not meta_path.is_file():
        return f"Unknown checkpoint '{cid}'. Try: checkpoints"
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    project = meta.get("project") or ""
    tree = _cp_root(data_dir) / cid / "tree" / project
    if not tree.is_dir():
        return f"Checkpoint {cid} has no tree"
    dest = projects_root(data_dir) / project
    # wipe project (keep sibling projects); recreate from snapshot
    if dest.exists():
        shutil.rmtree(dest)
    n = _copy_tree(tree, dest)
    return f"Restored {project} from {cid} ({n} files)"


def maybe_checkpoint_after(
    data_dir: Path, project: str, label: str, ok_msg: str
) -> str:
    """Append checkpoint line when a builder step succeeded."""
    if ok_msg.startswith("Error") or ok_msg.startswith("Bad ") or ok_msg.startswith("Unknown") or ok_msg.startswith("Already") or ok_msg.startswith("Usage") or ok_msg.startswith("Path ") or ok_msg.startswith("Could not") or ok_msg.startswith("Content "):
        return ok_msg
    if not project:
        return ok_msg
    try:
        note = create_checkpoint(data_dir, project, label)
        return f"{ok_msg}\n{note}"
    except Exception as e:
        return f"{ok_msg}\n(checkpoint skipped: {e})"
