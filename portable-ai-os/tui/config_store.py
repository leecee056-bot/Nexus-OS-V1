"""Load/save Tri-Cass OS UI + model settings from AI_DATA (or local data/)."""
from __future__ import annotations

import os
from pathlib import Path


DEFAULTS = {
    "theme": "basic",
    "image_gen": True,
    "image_size": 32,
    "first_boot_done": False,
    "active_model": "",
    "pin_model": "",
    "host": "127.0.0.1",
    "port": 8080,
    "ctx": 512,
    "threads": 0,
    "network_enabled": False,
    "vault_rag": True,
    "allow_host_fs": False,
}


def resolve_config_dir(root: Path) -> Path:
    candidates = []
    for env_key in ("AI_DATA", "PORTABLE_AI_DATA", "NEXUS_DATA"):
        env = os.environ.get(env_key)
        if env:
            candidates.append(Path(env) / "config")
    for p in (Path("/data/config"), root / "data" / "config"):
        candidates.append(p)
    for c in candidates:
        try:
            c.mkdir(parents=True, exist_ok=True)
            test = c / ".write_test"
            test.write_text("ok")
            test.unlink()
            return c
        except OSError:
            continue
    d = root / "data" / "config"
    d.mkdir(parents=True, exist_ok=True)
    return d


def resolve_data_dir(root: Path) -> Path:
    for env_key in ("AI_DATA", "PORTABLE_AI_DATA", "NEXUS_DATA"):
        env = os.environ.get(env_key)
        if env:
            p = Path(env)
            p.mkdir(parents=True, exist_ok=True)
            return p
    if Path("/data").is_dir():
        return Path("/data")
    d = root / "data"
    d.mkdir(parents=True, exist_ok=True)
    return d


def _parse_toml_simple(text: str) -> dict:
    out = dict(DEFAULTS)
    for line in text.splitlines():
        line = line.split("#", 1)[0].strip()
        if not line or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k, v = k.strip(), v.strip()
        if v.startswith('"') and v.endswith('"'):
            val: object = v[1:-1]
        elif v.lower() in ("true", "false"):
            val = v.lower() == "true"
        else:
            try:
                val = int(v)
            except ValueError:
                val = v
        out[k] = val
    return out


def _dump_toml(cfg: dict) -> str:
    lines = [
        "# Tri-Cass OS UI settings — edited by TUI",
        f'theme = "{cfg.get("theme", "basic")}"',
        f"image_gen = {'true' if cfg.get('image_gen') else 'false'}",
        f"image_size = {int(cfg.get('image_size', 32))}",
        f"first_boot_done = {'true' if cfg.get('first_boot_done') else 'false'}",
        f'active_model = "{cfg.get("active_model", "")}"',
        f'pin_model = "{cfg.get("pin_model", "")}"',
        f'host = "{cfg.get("host", "127.0.0.1")}"',
        f"port = {int(cfg.get('port', 8080))}",
        f"ctx = {int(cfg.get('ctx', 512))}",
        f"threads = {int(cfg.get('threads', 0))}",
        f"network_enabled = {'true' if cfg.get('network_enabled') else 'false'}",
        f"vault_rag = {'true' if cfg.get('vault_rag') else 'false'}",
        f"allow_host_fs = {'true' if cfg.get('allow_host_fs') else 'false'}",
        "",
    ]
    return "\n".join(lines)


def load_ui_config(root: Path) -> tuple[dict, Path]:
    cfg_dir = resolve_config_dir(root)
    path = cfg_dir / "ui.toml"
    seed = root / "configs" / "ui.toml"
    if not path.is_file() and seed.is_file():
        try:
            path.write_text(seed.read_text(encoding="utf-8"), encoding="utf-8")
        except OSError:
            pass
    if path.is_file():
        cfg = _parse_toml_simple(path.read_text(encoding="utf-8"))
    else:
        cfg = dict(DEFAULTS)
    for k, v in DEFAULTS.items():
        cfg.setdefault(k, v)
    return cfg, path


def save_ui_config(path: Path, cfg: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(_dump_toml(cfg), encoding="utf-8")
