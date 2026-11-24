"""Agent Controller — allowlisted tools only (no arbitrary shell)."""
from __future__ import annotations

import ast
import operator
import re
from pathlib import Path

from builder import (
    guess_scaffold,
    list_templates,
    mkdir_project_path,
    projects_root,
    scaffold,
    write_project_file,
)
from checkpoints import (
    create_checkpoint,
    list_checkpoints,
    maybe_checkpoint_after,
    restore_checkpoint,
)
from files import FileBrowser
from llm import present_models, server_alive
from monitor import snapshot
from pxg import generate_and_save
from vault import Vault


# Safe calculator ops
_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.Mod: operator.mod,
}


def _eval_node(node):
    if isinstance(node, ast.Expression):
        return _eval_node(node.body)
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.Num):  # py<3.8
        return node.n
    if isinstance(node, ast.BinOp) and type(node.op) in _OPS:
        return _OPS[type(node.op)](_eval_node(node.left), _eval_node(node.right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in _OPS:
        return _OPS[type(node.op)](_eval_node(node.operand))
    raise ValueError("unsupported expression")


def safe_calc(expr: str) -> str:
    expr = expr.strip()
    if not expr or len(expr) > 120:
        raise ValueError("bad expression")
    if not re.fullmatch(r"[0-9.\s+\-*/()%^]+", expr.replace("**", "^")):
        # allow ** via rewrite
        pass
    expr2 = expr.replace("^", "**")
    tree = ast.parse(expr2, mode="eval")
    return str(_eval_node(tree))


TOOLS = [
    ("calc", "Calculator — calc <expr>"),
    ("sysinfo", "System info snapshot"),
    ("models", "List local GGUF models"),
    ("filesearch", "Search AI_DATA filenames — filesearch <q>"),
    ("fileread", "Read text file under AI_DATA — fileread <path>"),
    ("vault", "Search knowledge vault — vault <q>"),
    ("note", "Append note to AI_DATA/notes — note <text>"),
    ("pxg", "Pixel art — pxg <prompt>"),
    ("templates", "List Pocket Agent project templates"),
    ("scaffold", "Copy template → /data/projects — scaffold <tpl> <name>"),
    ("projects", "List /data/projects"),
    ("mkdir", "Make folder under projects — mkdir <rel/path>"),
    ("write", "Write file under projects — write <rel/path> | <content>"),
    ("make", "Guess template from words — make <timer app called foo>"),
    ("checkpoint", "Snapshot a project — checkpoint <name> [label]"),
    ("checkpoints", "List snapshots — checkpoints [project]"),
    ("restore", "Roll back a project — restore <checkpoint-id>"),
]


class AgentController:
    def __init__(self, data_dir: Path, models_dir: Path, catalog: list, root: Path, cfg: dict, base: str):
        self.data_dir = Path(data_dir)
        self.models_dir = Path(models_dir)
        self.catalog = catalog
        self.root = root
        self.cfg = cfg
        self.base = base
        self.log: list[str] = [
            "Agent ready. Allowlisted tools only — no shell.",
            "Pocket Agent: scaffold / make / write under /data/projects/",
            "Checkpoints: auto after scaffold/write; restore <id> to roll back.",
        ]
        self.input = ""
        self.pending_confirm: tuple[str, str] | None = None  # (tool, arg)

    def help_lines(self) -> list[str]:
        return ["Tools:"] + [f"  {k:10} {d}" for k, d in TOOLS] + ["", "Type: tool args   Enter run   Esc back"]

    def run(self, line: str) -> str:
        line = line.strip()
        if not line:
            return ""
        if self.pending_confirm:
            tool, arg = self.pending_confirm
            self.pending_confirm = None
            if line.lower() in ("y", "yes"):
                return self._dispatch(tool, arg, confirmed=True)
            return "Cancelled."
        parts = line.split(None, 1)
        tool = parts[0].lower()
        arg = parts[1] if len(parts) > 1 else ""
        known = {t[0] for t in TOOLS}
        # Natural language → make (Pocket Agent)
        if tool not in known:
            guessed = guess_scaffold(line)
            if guessed:
                return self._dispatch("make", line, confirmed=False)
            return f"Unknown tool '{tool}'. Try: " + ", ".join(t[0] for t in TOOLS)
        # Destructive-ish: note overwrite N/A; fileread ok; delete not exposed
        if tool in ("note",) and arg.startswith("!"):
            self.pending_confirm = (tool, arg)
            return f"Confirm {tool}? [y/N]"
        return self._dispatch(tool, arg, confirmed=False)

    def _dispatch(self, tool: str, arg: str, confirmed: bool) -> str:
        try:
            if tool == "calc":
                return safe_calc(arg or "0")
            if tool == "sysinfo":
                return "\n".join(
                    snapshot(self.data_dir, self.cfg.get("active_model", ""), server_alive(self.base))
                )
            if tool == "models":
                models = present_models(self.models_dir, self.catalog)
                lines = []
                for m in models:
                    mark = "OK" if m.get("present") else "--"
                    lines.append(f"[{mark}] {m.get('name')} ({m.get('approx_size_mb')}MB)")
                return "\n".join(lines) or "(no models)"
            if tool == "filesearch":
                fb = FileBrowser(self.data_dir, allow_host=False)
                hits = fb.search(arg)
                return "\n".join(str(h.relative_to(self.data_dir)) for h in hits) or "(no hits)"
            if tool == "fileread":
                path = (self.data_dir / arg).resolve()
                path.relative_to(self.data_dir.resolve())
                if not path.is_file():
                    return "not a file"
                if path.stat().st_size > 100_000:
                    return "file too large"
                return path.read_text(encoding="utf-8", errors="replace")[:4000]
            if tool == "vault":
                v = Vault(self.data_dir)
                # First Agents vault call: index starter raw notes if DB empty
                try:
                    n_docs = v._conn.execute("SELECT COUNT(*) FROM docs").fetchone()[0]
                except Exception:
                    n_docs = 0
                if n_docs == 0:
                    v.rebuild()
                hits = v.search(arg or "")
                if not hits and n_docs == 0:
                    # rebuilt but still empty — try once more after raw seed
                    v.rebuild()
                    hits = v.search(arg or "")
                v.close()
                if not hits:
                    return "(no vault hits — add .md/.txt under knowledge/raw, or Vault → rebuild)"
                return "\n".join(f"{h['title']}: {h.get('snip')}" for h in hits)
            if tool == "note":
                notes = self.data_dir / "notes"
                notes.mkdir(parents=True, exist_ok=True)
                p = notes / "agent-notes.txt"
                with p.open("a", encoding="utf-8") as f:
                    f.write(arg.strip() + "\n")
                return f"Appended to {p}"
            if tool == "pxg":
                if not self.cfg.get("image_gen"):
                    return "image_gen disabled in Settings"
                res = generate_and_save(
                    arg or "nexus",
                    self.data_dir / "images",
                    size=int(self.cfg.get("image_size") or 32),
                )
                return f"saved {res['png']}\n{res['ascii'][:500]}"
            if tool == "templates":
                names = list_templates(self.root)
                return "\n".join(names) or "(no templates — check projects/templates)"
            if tool == "scaffold":
                bits = arg.split(None, 1)
                if len(bits) < 2:
                    return "Usage: scaffold <template> <name>"
                msg = scaffold(self.root, self.data_dir, bits[0], bits[1])
                return maybe_checkpoint_after(
                    self.data_dir, bits[1], f"scaffold {bits[0]}", msg
                )
            if tool == "projects":
                root = projects_root(self.data_dir)
                kids = sorted(
                    p.name
                    for p in root.iterdir()
                    if not p.name.startswith(".") and p.name != ".tri-cass"
                )
                return "\n".join(kids) or "(empty — try: scaffold html-app demo)"
            if tool == "mkdir":
                if not arg:
                    return "Usage: mkdir <rel/path under projects>"
                msg = mkdir_project_path(self.data_dir, arg)
                proj = arg.strip().split("/")[0]
                return maybe_checkpoint_after(
                    self.data_dir, proj, f"mkdir {arg.strip()}", msg
                )
            if tool == "write":
                if "|" not in arg:
                    return "Usage: write <rel/path> | <content>"
                path_part, content = arg.split("|", 1)
                rel = path_part.strip()
                msg = write_project_file(self.data_dir, rel, content)
                proj = rel.split("/")[0]
                return maybe_checkpoint_after(
                    self.data_dir, proj, f"write {rel}", msg
                )
            if tool == "make":
                guessed = guess_scaffold(arg or "")
                if not guessed:
                    avail = ", ".join(list_templates(self.root)) or "html-app, timer-app, …"
                    return f"Could not guess template. Try: scaffold <tpl> <name>\nTemplates: {avail}"
                tpl, name = guessed
                msg = scaffold(self.root, self.data_dir, tpl, name)
                return maybe_checkpoint_after(
                    self.data_dir, name, f"make {tpl}", msg
                )
            if tool == "checkpoint":
                bits = arg.split(None, 1)
                if not bits or not bits[0]:
                    return "Usage: checkpoint <project> [label]"
                label = bits[1] if len(bits) > 1 else "manual"
                return create_checkpoint(self.data_dir, bits[0], label)
            if tool == "checkpoints":
                return list_checkpoints(self.data_dir, arg.strip())
            if tool == "restore":
                return restore_checkpoint(self.data_dir, arg)
            return f"Unknown tool '{tool}'. Try: " + ", ".join(t[0] for t in TOOLS)
        except Exception as e:
            return f"Error: {e}"
