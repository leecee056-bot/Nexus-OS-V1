"""File Manager — AI_DATA scoped by default."""
from __future__ import annotations

import os
import shutil
from pathlib import Path


TEXT_EXTS = {
    ".txt", ".md", ".markdown", ".toml", ".json", ".csv", ".log",
    ".py", ".sh", ".cfg", ".ini", ".yml", ".yaml", ".gguf",
}


class FileBrowser:
    def __init__(self, data_dir: Path, allow_host: bool = False):
        self.data_dir = Path(data_dir).resolve()
        self.allow_host = allow_host
        self.cwd = self.data_dir
        self.entries: list[Path] = []
        self.idx = 0
        self.status = ""
        self.preview = ""
        self.confirm: str | None = None  # pending destructive op
        self.pending_path: Path | None = None
        self.refresh()

    def _safe(self, path: Path) -> bool:
        try:
            p = path.resolve()
        except OSError:
            return False
        if self.allow_host:
            return True
        try:
            p.relative_to(self.data_dir)
            return True
        except ValueError:
            return False

    def refresh(self):
        try:
            items = sorted(self.cwd.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower()))
        except OSError as e:
            self.status = str(e)
            items = []
        self.entries = items
        self.idx = min(self.idx, max(0, len(self.entries) - 1))
        self._update_preview()

    def _update_preview(self):
        self.preview = ""
        if not self.entries:
            return
        p = self.entries[self.idx]
        if p.is_dir():
            try:
                n = sum(1 for _ in p.iterdir())
            except OSError:
                n = "?"
            self.preview = f"[dir] {p.name}/  ({n} items)"
            return
        suf = p.suffix.lower()
        try:
            sz = p.stat().st_size
        except OSError:
            self.preview = "(unreadable)"
            return
        if suf == ".gguf":
            self.preview = f"[model] {sz / (1024*1024):.1f} MB GGUF"
            return
        if suf in TEXT_EXTS and sz < 200_000:
            try:
                text = p.read_text(encoding="utf-8", errors="replace")
                self.preview = "\n".join(text.splitlines()[:18])
            except OSError:
                self.preview = "(unreadable)"
        else:
            self.preview = f"[file] {sz} bytes"

    def move_idx(self, delta: int):
        if not self.entries:
            return
        self.idx = (self.idx + delta) % len(self.entries)
        self._update_preview()

    def enter(self):
        if not self.entries:
            return
        p = self.entries[self.idx]
        if p.is_dir():
            if not self._safe(p):
                self.status = "Blocked: outside AI_DATA (enable allow_host_fs in Settings)"
                return
            self.cwd = p
            self.idx = 0
            self.refresh()

    def up(self):
        parent = self.cwd.parent
        if not self._safe(parent) and parent != self.data_dir and not self.allow_host:
            # stay within data_dir
            if self.cwd != self.data_dir:
                self.cwd = self.data_dir
                self.idx = 0
                self.refresh()
            return
        if self.cwd == self.data_dir and not self.allow_host:
            self.status = "At AI_DATA root"
            return
        self.cwd = parent
        self.idx = 0
        self.refresh()

    def mkdir(self, name: str):
        name = name.strip().replace("/", "_")
        if not name:
            return
        dest = self.cwd / name
        if not self._safe(dest):
            self.status = "Blocked path"
            return
        dest.mkdir(exist_ok=True)
        self.status = f"Created {name}/"
        self.refresh()

    def rename(self, new_name: str):
        if not self.entries:
            return
        new_name = new_name.strip().replace("/", "_")
        src = self.entries[self.idx]
        dest = src.parent / new_name
        if not self._safe(src) or not self._safe(dest):
            self.status = "Blocked path"
            return
        src.rename(dest)
        self.status = f"Renamed → {new_name}"
        self.refresh()

    def delete_request(self):
        if not self.entries:
            return
        self.pending_path = self.entries[self.idx]
        self.confirm = "delete"
        self.status = f"Delete {self.pending_path.name}? [y/N]"

    def copy_to(self, dest_dir: Path):
        if not self.entries:
            return
        src = self.entries[self.idx]
        if not self._safe(src) or not self._safe(dest_dir):
            self.status = "Blocked path"
            return
        dest = dest_dir / src.name
        if src.is_dir():
            shutil.copytree(src, dest, dirs_exist_ok=True)
        else:
            shutil.copy2(src, dest)
        self.status = f"Copied to {dest}"
        self.refresh()

    def import_model(self, models_dir: Path) -> str:
        if not self.entries:
            return "No selection"
        src = self.entries[self.idx]
        if src.suffix.lower() != ".gguf":
            return "Select a .gguf file"
        models_dir = Path(models_dir)
        models_dir.mkdir(parents=True, exist_ok=True)
        dest = models_dir / src.name
        shutil.copy2(src, dest)
        self.status = f"Imported model → {dest}"
        return self.status

    def confirm_yes(self):
        if self.confirm == "delete" and self.pending_path:
            p = self.pending_path
            if not self._safe(p):
                self.status = "Blocked"
            else:
                if p.is_dir():
                    shutil.rmtree(p)
                else:
                    p.unlink()
                self.status = f"Deleted {p.name}"
            self.confirm = None
            self.pending_path = None
            self.refresh()

    def confirm_no(self):
        self.confirm = None
        self.pending_path = None
        self.status = "Cancelled"

    def search(self, query: str) -> list[Path]:
        q = query.lower().strip()
        if not q:
            return []
        hits = []
        for root, dirs, files in os.walk(self.data_dir):
            rp = Path(root)
            for name in files + dirs:
                if q in name.lower():
                    hits.append(rp / name)
                    if len(hits) >= 50:
                        return hits
        return hits
