"""Persist OS TUI chats under AI_DATA/notes/chats/."""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

SAFE = re.compile(r"[^a-zA-Z0-9_-]+")


def chats_dir(data_dir: Path) -> Path:
    p = Path(data_dir) / "notes" / "chats"
    p.mkdir(parents=True, exist_ok=True)
    return p


def _stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")


def title_from_log(lines: list[str]) -> str:
    for line in lines:
        if line.startswith("you:"):
            t = line[4:].strip()
            return (t[:40] + "…") if len(t) > 42 else (t or "chat")
    return "chat"


def save_session(data_dir: Path, lines: list[str]) -> str:
    meaningful = [ln for ln in lines if ln and not ln.startswith("system:")]
    if not meaningful:
        return "Nothing to save yet."
    name = f"{_stamp()}-{SAFE.sub('-', title_from_log(lines).lower())[:24].strip('-') or 'chat'}.txt"
    path = chats_dir(data_dir) / name
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return f"Saved {path}"


def list_sessions(data_dir: Path) -> list[Path]:
    root = chats_dir(data_dir)
    return sorted(root.glob("*.txt"), key=lambda p: p.stat().st_mtime, reverse=True)


def load_session(data_dir: Path, index: int) -> tuple[str, list[str]]:
    files = list_sessions(data_dir)
    if index < 1 or index > len(files):
        return f"No chat #{index}. Use /chats", []
    path = files[index - 1]
    text = path.read_text(encoding="utf-8", errors="replace")
    return f"Opened {path.name}", [ln for ln in text.splitlines() if ln.strip()]


def index_listing(data_dir: Path, limit: int = 12) -> list[str]:
    files = list_sessions(data_dir)[:limit]
    if not files:
        return ["(no saved chats — /save after talking)"]
    out = []
    for i, p in enumerate(files, 1):
        out.append(f"{i}. {p.name}")
    return out
