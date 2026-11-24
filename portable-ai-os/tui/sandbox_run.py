"""Sandboxed project command runner (HAP-104).

cwd locked under /data/projects/<name>; timeout; stdout/stderr captured.
No shell — argv only; allowlisted interpreters.
"""
from __future__ import annotations

import os
import shlex
import shutil
import subprocess
from pathlib import Path

from builder import projects_root

ALLOWED_BINS = frozenset({"python", "python3", "py", "node"})
DEFAULT_TIMEOUT = 20
MAX_TIMEOUT = 60
MAX_OUTPUT = 8000


def _resolve_project(data_dir: Path, project: str) -> Path | str:
    project = (project or "").strip().strip("/")
    if not project or "/" in project or ".." in project or project.startswith("."):
        return "run needs a single project name under /data/projects"
    root = projects_root(data_dir) / project
    if not root.is_dir():
        return f"No project '{project}' — scaffold one first"
    return root.resolve()


def _parse_command(command: str) -> list[str] | str:
    command = (command or "").strip()
    if not command:
        return "run needs a command"
    if len(command) > 500:
        return "command too long"
    if "\n" in command or "\r" in command:
        return "command must be a single line"
    try:
        argv = shlex.split(command)
    except ValueError as e:
        return f"bad command: {e}"
    if not argv:
        return "empty command"
    bin_name = Path(argv[0]).name.lower()
    # allow ./script.py via python only — raw script names must be interpreters
    if bin_name not in ALLOWED_BINS:
        return (
            f"binary '{bin_name}' not allowed — use: "
            + ", ".join(sorted(ALLOWED_BINS))
        )
    resolved = shutil.which(argv[0]) or shutil.which(bin_name)
    if not resolved:
        return f"'{bin_name}' not found on PATH"
    argv[0] = resolved
    return argv


def _paths_stay_in_cwd(cwd: Path, argv: list[str]) -> str | None:
    """Reject absolute path args that escape the project cwd."""
    for arg in argv[1:]:
        if not arg or arg.startswith("-"):
            continue
        # skip module flags like -m py_compile then check following file args loosely
        p = Path(arg)
        if p.is_absolute():
            try:
                p.resolve().relative_to(cwd)
            except ValueError:
                return f"path escapes project: {arg}"
        else:
            if ".." in Path(arg).parts:
                return f"path escapes project: {arg}"
            full = (cwd / arg).resolve()
            try:
                full.relative_to(cwd)
            except ValueError:
                return f"path escapes project: {arg}"
    return None


def sandbox_run(
    data_dir: Path,
    project: str,
    command: str,
    timeout_sec: float | int | str | None = None,
) -> str:
    """Run allowlisted command with cwd=/data/projects/<project>. Returns text report."""
    cwd = _resolve_project(data_dir, project)
    if isinstance(cwd, str):
        return cwd
    argv = _parse_command(command)
    if isinstance(argv, str):
        return argv
    err = _paths_stay_in_cwd(cwd, argv)
    if err:
        return err

    try:
        t = float(timeout_sec) if timeout_sec not in (None, "") else DEFAULT_TIMEOUT
    except (TypeError, ValueError):
        t = DEFAULT_TIMEOUT
    t = max(1.0, min(float(t), float(MAX_TIMEOUT)))

    env = {
        "PATH": os.environ.get("PATH", "/usr/bin:/bin"),
        "HOME": os.environ.get("HOME", str(cwd)),
        "LANG": os.environ.get("LANG", "C.UTF-8"),
        "PYTHONUNBUFFERED": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
    }
    # Keep Windows runnable if ever used under Wine-like hosts
    for k in ("SYSTEMROOT", "SYSTEMDRIVE", "PATHEXT", "TEMP", "TMP"):
        if k in os.environ:
            env[k] = os.environ[k]

    try:
        proc = subprocess.run(
            argv,
            cwd=str(cwd),
            env=env,
            capture_output=True,
            text=True,
            timeout=t,
            check=False,
        )
    except subprocess.TimeoutExpired as e:
        out = (e.stdout or "") + (e.stderr or "")
        out = out[-MAX_OUTPUT:]
        return (
            f"TIMEOUT after {t:.0f}s\ncwd={cwd}\ncmd={' '.join(argv)}\n{out}".strip()
        )
    except OSError as e:
        return f"exec failed: {e}"

    chunks = []
    if proc.stdout:
        chunks.append(proc.stdout)
    if proc.stderr:
        chunks.append("--- stderr ---\n" + proc.stderr)
    body = "".join(chunks)
    if len(body) > MAX_OUTPUT:
        body = body[: MAX_OUTPUT // 2] + "\n…truncated…\n" + body[-MAX_OUTPUT // 2 :]
    status = f"exit {proc.returncode}"
    header = f"{status} · cwd={cwd.name} · {' '.join(Path(a).name if i == 0 else a for i, a in enumerate(argv))}"
    return f"{header}\n{body}".rstrip() if body else header
