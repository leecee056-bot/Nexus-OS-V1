"""Knowledge Vault — SQLite FTS5 on AI_DATA (txt/md; optional pdf text)."""
from __future__ import annotations

import hashlib
import sqlite3
from pathlib import Path


SCHEMA = """
CREATE TABLE IF NOT EXISTS docs (
  id INTEGER PRIMARY KEY,
  path TEXT UNIQUE NOT NULL,
  title TEXT,
  mtime REAL,
  size INTEGER,
  sha1 TEXT
);
CREATE VIRTUAL TABLE IF NOT EXISTS docs_fts USING fts5(
  title, body, path UNINDEXED
);
"""


class Vault:
    def __init__(self, data_dir: Path):
        self.root = Path(data_dir) / "knowledge"
        self.raw = self.root / "raw"
        self.db_path = self.root / "vault.db"
        self.root.mkdir(parents=True, exist_ok=True)
        self.raw.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(str(self.db_path))
        self._conn.row_factory = sqlite3.Row
        self._conn.executescript(SCHEMA)
        self._conn.commit()

    def close(self):
        self._conn.close()

    def _read_text(self, path: Path) -> str | None:
        suf = path.suffix.lower()
        if suf in (".txt", ".md", ".markdown", ".csv", ".log", ".toml", ".json", ".py", ".sh"):
            try:
                return path.read_text(encoding="utf-8", errors="replace")
            except OSError:
                return None
        if suf == ".pdf":
            # Light optional: try pdftotext if present; else skip
            import shutil
            import subprocess
            import tempfile

            if not shutil.which("pdftotext"):
                return None
            try:
                out = subprocess.check_output(
                    ["pdftotext", "-q", str(path), "-"], stderr=subprocess.DEVNULL, timeout=30
                )
                return out.decode("utf-8", errors="replace")
            except Exception:
                return None
        return None

    def import_file(self, src: Path) -> str:
        src = Path(src)
        if not src.is_file():
            raise FileNotFoundError(str(src))
        body = self._read_text(src)
        if body is None:
            raise ValueError(f"unsupported or unreadable: {src.name}")
        dest = self.raw / src.name
        n = 1
        while dest.exists() and dest.resolve() != src.resolve():
            dest = self.raw / f"{src.stem}_{n}{src.suffix}"
            n += 1
        if dest.resolve() != src.resolve():
            dest.write_text(body, encoding="utf-8")
        else:
            dest = src
        return self.index_path(dest, body)

    def index_path(self, path: Path, body: str | None = None) -> str:
        path = Path(path)
        if body is None:
            body = self._read_text(path) or ""
        st = path.stat()
        sha = hashlib.sha1(body.encode("utf-8", errors="replace")).hexdigest()
        title = path.stem.replace("_", " ").replace("-", " ")
        rel = str(path)
        cur = self._conn.cursor()
        row = cur.execute("SELECT id, sha1 FROM docs WHERE path=?", (rel,)).fetchone()
        if row and row["sha1"] == sha:
            return rel
        if row:
            cur.execute("DELETE FROM docs_fts WHERE rowid=?", (row["id"],))
            cur.execute(
                "UPDATE docs SET title=?, mtime=?, size=?, sha1=? WHERE id=?",
                (title, st.st_mtime, st.st_size, sha, row["id"]),
            )
            doc_id = row["id"]
        else:
            cur.execute(
                "INSERT INTO docs(path, title, mtime, size, sha1) VALUES (?,?,?,?,?)",
                (rel, title, st.st_mtime, st.st_size, sha),
            )
            doc_id = cur.lastrowid
        cur.execute(
            "INSERT INTO docs_fts(rowid, title, body, path) VALUES (?,?,?,?)",
            (doc_id, title, body, rel),
        )
        self._conn.commit()
        return rel

    def _index_tree(self, root: Path) -> int:
        n = 0
        if not root.is_dir():
            return 0
        for p in root.rglob("*"):
            if not p.is_file():
                continue
            if p.name.startswith("."):
                continue
            try:
                self.index_path(p)
                n += 1
            except Exception:
                pass
        return n

    def rebuild(self) -> int:
        cur = self._conn.cursor()
        cur.execute("DELETE FROM docs_fts")
        cur.execute("DELETE FROM docs")
        self._conn.commit()
        n = 0
        n += self._index_tree(self.raw)
        # Curated coding pack v1 — prefer AI_DATA copy, else bundled under OS tree
        pack = self.root / "coding-pack-v1"
        if pack.is_dir():
            n += self._index_tree(pack)
        else:
            bundled = (
                Path(__file__).resolve().parents[1] / "knowledge" / "coding-pack-v1"
            )
            n += self._index_tree(bundled)
        return n

    def search(self, query: str, limit: int = 8) -> list[dict]:
        q = query.strip()
        if not q:
            return []
        # Simple FTS query — quote tokens safely
        tokens = [t for t in q.replace('"', " ").split() if t]
        if not tokens:
            return []
        fts_q = " ".join(tokens)
        cur = self._conn.cursor()
        try:
            rows = cur.execute(
                """
                SELECT docs.path, docs.title, docs.size,
                       snippet(docs_fts, 1, '[', ']', '…', 12) AS snip
                FROM docs_fts
                JOIN docs ON docs.id = docs_fts.rowid
                WHERE docs_fts MATCH ?
                LIMIT ?
                """,
                (fts_q, limit),
            ).fetchall()
        except sqlite3.OperationalError:
            # Fallback LIKE
            rows = cur.execute(
                """
                SELECT path, title, size, '' AS snip FROM docs
                WHERE title LIKE ? OR path LIKE ?
                LIMIT ?
                """,
                (f"%{q}%", f"%{q}%", limit),
            ).fetchall()
        return [dict(r) for r in rows]

    def count(self) -> int:
        return int(self._conn.execute("SELECT COUNT(*) FROM docs").fetchone()[0])

    def rag_context(self, query: str, limit: int = 3, max_chars: int = 1200) -> str:
        hits = self.search(query, limit=limit)
        if not hits:
            return ""
        parts = ["Knowledge vault excerpts:"]
        used = 0
        for h in hits:
            line = f"- {h.get('title')} ({h.get('path')}): {h.get('snip') or ''}"
            if used + len(line) > max_chars:
                break
            parts.append(line)
            used += len(line)
        return "\n".join(parts)
