#!/usr/bin/env python3
"""NEXUS OS — CLI entry (oneshot / pxg / theme) and interactive hub launcher."""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

from config_store import load_ui_config, resolve_data_dir, save_ui_config  # noqa: E402
from llm import chat_completion, server_alive  # noqa: E402
from pxg import generate_and_save  # noqa: E402
from themes import THEMES  # noqa: E402

DEFAULT_CATALOG = ROOT / "catalog" / "catalog.json"
DEFAULT_MODELS = Path(
    os.environ.get("PORTABLE_AI_MODELS") or os.environ.get("NEXUS_MODELS") or (ROOT / "models")
)
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8080


def main():
    ap = argparse.ArgumentParser(description="NEXUS OS TUI / CLI")
    ap.add_argument("--host", default=DEFAULT_HOST)
    ap.add_argument("--port", type=int, default=DEFAULT_PORT)
    ap.add_argument("--catalog", default=str(DEFAULT_CATALOG))
    ap.add_argument("--models", default=str(DEFAULT_MODELS))
    ap.add_argument("--oneshot", help="Non-interactive chat prompt")
    ap.add_argument("--pxg", help="Non-interactive PXG prompt")
    ap.add_argument("--set-theme", choices=list(THEMES), help="Set theme and exit")
    ap.add_argument("--hub", action="store_true", help="Force hub UI")
    args = ap.parse_args()
    base = f"http://{args.host}:{args.port}"

    if args.set_theme:
        cfg, path = load_ui_config(ROOT)
        cfg["theme"] = args.set_theme
        save_ui_config(path, cfg)
        print(f"theme={args.set_theme} saved {path}")
        return

    if args.pxg:
        cfg, _path = load_ui_config(ROOT)
        data = resolve_data_dir(ROOT)
        res = generate_and_save(args.pxg, data / "images", size=int(cfg.get("image_size") or 32))
        print(res["ascii"])
        print(f"PNG={res['png']}")
        return

    if args.oneshot:
        if not server_alive(base):
            print("ERROR: server not up", file=sys.stderr)
            sys.exit(1)
        msgs = [
            {"role": "system", "content": "You are NEXUS OS, a helpful local assistant. Be concise."},
            {"role": "user", "content": args.oneshot},
        ]
        # optional vault RAG
        try:
            cfg, _ = load_ui_config(ROOT)
            if cfg.get("vault_rag"):
                from vault import Vault

                v = Vault(resolve_data_dir(ROOT))
                ctx = v.rag_context(args.oneshot)
                v.close()
                if ctx:
                    msgs.insert(1, {"role": "system", "content": ctx})
        except Exception:
            pass
        print(chat_completion(base, msgs))
        return

    # Interactive: hub
    import hub as hubmod

    hubmod.main()


if __name__ == "__main__":
    main()
