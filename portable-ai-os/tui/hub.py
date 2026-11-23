#!/usr/bin/env python3
"""Tri-Cass OS — main menu hub (TUI). One maximised app at a time (T0-friendly)."""
from __future__ import annotations

import argparse
import curses
import os
import textwrap
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
import sys

if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

from agents import AgentController  # noqa: E402
from brand import NETWORK, PRODUCT, TAGLINE, hub_title, rabbit_block  # noqa: E402
from config_store import load_ui_config, resolve_data_dir, save_ui_config  # noqa: E402
from files import FileBrowser  # noqa: E402
from games import Minesweeper, SnakeGame  # noqa: E402
from llm import (  # noqa: E402
    chat_completion,
    load_catalog,
    present_models,
    restart_server,
    server_alive,
)
from monitor import snapshot  # noqa: E402
from pxg import generate_and_save  # noqa: E402
from themes import THEMES, Theme  # noqa: E402
from vault import Vault  # noqa: E402

DEFAULT_CATALOG = ROOT / "catalog" / "catalog.json"
DEFAULT_MODELS = Path(
    os.environ.get("PORTABLE_AI_MODELS")
    or os.environ.get("NEXUS_MODELS")  # legacy alias
    or (ROOT / "models")
)

MENU = [
    ("chat", "AI Chat", "Enter"),
    ("image_lab", "Image Lab", "I"),
    ("pixel", "Pixel Art", "P"),
    ("files", "File Manager", "F"),
    ("vault", "Knowledge Vault", "K"),
    ("agents", "Agents & Tools", "A"),
    ("network", NETWORK, "N"),
    ("games", "Games", "G"),
    ("monitor", "System Monitor", "S"),
    ("models", "Models", "M"),
    ("settings", "Settings", "O"),
    ("help", "Help", "?"),
]


class Hub:
    def __init__(self, stdscr, args):
        self.stdscr = stdscr
        self.args = args
        self.cfg, self.cfg_path = load_ui_config(ROOT)
        self.data_dir = resolve_data_dir(ROOT)
        for sub in ("knowledge/raw", "images", "notes", "models", "logs"):
            (self.data_dir / sub).mkdir(parents=True, exist_ok=True)
        self.base = f"http://{args.host}:{args.port}"
        self.catalog = load_catalog(Path(args.catalog))
        self.models_dir = Path(args.models)
        self.models = present_models(self.models_dir, self.catalog)
        self.theme = Theme(str(self.cfg.get("theme", "basic")))
        self.theme.init(stdscr)
        self.app = "menu"
        self.menu_idx = 0
        self.status = ""
        self.input = ""
        self.active_model = self.cfg.get("active_model") or self._guess_model()
        self.messages = [
            {
                "role": "system",
                "content": f"You are {PRODUCT}, a helpful local offline assistant. Be concise.",
            }
        ]
        self.chat_log: list[str] = []
        self.model_idx = 0
        self.settings_idx = 0
        self.settings_items = self._settings_items()
        self.files = FileBrowser(self.data_dir, allow_host=bool(self.cfg.get("allow_host_fs")))
        self.file_mode = "browse"  # browse | prompt
        self.file_prompt_action = ""
        self.vault = Vault(self.data_dir)
        self.vault_q = ""
        self.vault_hits: list[dict] = []
        self.vault_idx = 0
        self.agent = AgentController(
            self.data_dir, self.models_dir, self.catalog, ROOT, self.cfg, self.base
        )
        self.game = None
        self.game_name = "snake"
        self.last_tick = 0.0
        self.image_ascii = ""
        self.image_path = ""
        self.help_scroll = 0
        if not self.cfg.get("first_boot_done"):
            self.app = "firstboot"
            self.fb_idx = 0

    def _guess_model(self) -> str:
        for m in self.models:
            if m.get("present") and m.get("role") == "rescue":
                return m["id"]
        for m in self.models:
            if m.get("present"):
                return m["id"]
        return ""

    def persist(self):
        self.cfg["theme"] = self.theme.name
        self.cfg["active_model"] = self.active_model
        save_ui_config(self.cfg_path, self.cfg)

    def _settings_items(self) -> list[tuple[str, str]]:
        c = self.cfg
        return [
            ("theme", f"Theme: {c.get('theme')}"),
            ("image_gen", f"Image gen: {'ON' if c.get('image_gen') else 'OFF'}"),
            ("image_size", f"Image size: {c.get('image_size')}px"),
            ("ctx", f"Context: {c.get('ctx')}"),
            ("threads", f"Threads: {c.get('threads') or 'auto'}"),
            ("vault_rag", f"Vault RAG in chat: {'ON' if c.get('vault_rag') else 'OFF'}"),
            (
                "network",
                f"{NETWORK}: {'ON' if c.get('network_enabled') else 'OFF'} (client not shipped)",
            ),
            ("allow_host", f"Allow host FS: {'ON' if c.get('allow_host_fs') else 'OFF'}"),
            ("save", "Save & return to menu"),
        ]

    # ----- drawing -----
    def draw(self):
        self.stdscr.erase()
        h, w = self.stdscr.getmaxyx()
        if self.theme.name == "matrix":
            self.theme.paint_backdrop(self.stdscr, h, w)
        net = "Online" if self.cfg.get("network_enabled") else "Offline"
        title = hub_title(net=net)
        self.stdscr.addnstr(0, 0, title.ljust(w), w, self.theme.attr_title())
        if self.app == "menu":
            self._draw_menu(h, w)
        elif self.app == "chat":
            self._draw_chat(h, w)
        elif self.app == "models":
            self._draw_models(h, w)
        elif self.app == "settings":
            self._draw_settings(h, w)
        elif self.app == "monitor":
            self._draw_monitor(h, w)
        elif self.app == "files":
            self._draw_files(h, w)
        elif self.app == "vault":
            self._draw_vault(h, w)
        elif self.app == "agents":
            self._draw_agents(h, w)
        elif self.app == "games":
            self._draw_games(h, w)
        elif self.app in ("pixel", "image_lab"):
            self._draw_image(h, w)
        elif self.app == "network":
            self._draw_network(h, w)
        elif self.app == "help":
            self._draw_help(h, w)
        elif self.app == "firstboot":
            self._draw_firstboot(h, w)
        foot = self.status or f"model={self.active_model or '?'}  data={self.data_dir}"
        self.stdscr.addnstr(h - 1, 0, foot[: w - 1].ljust(w - 1), w - 1, self.theme.attr_dim())
        self.stdscr.refresh()

    def _draw_menu(self, h, w):
        row = 2
        for line in rabbit_block():
            if row >= h - 2:
                break
            self.stdscr.addnstr(row, 2, line, w - 4, self.theme.attr_dim())
            row += 1
        self.stdscr.addnstr(row, 2, PRODUCT, w - 4, self.theme.attr_bold())
        row += 1
        self.stdscr.addnstr(row, 2, TAGLINE, w - 4, self.theme.attr_dim())
        row += 1
        self.stdscr.addnstr(row, 2, "(One app at a time — maximised)", w - 4, self.theme.attr_dim())
        row += 2
        menu_top = row
        for i, (_id, label, key) in enumerate(MENU):
            r = menu_top + i
            if r >= h - 2:
                break
            mark = ">" if i == self.menu_idx else " "
            stub = "  [stub]" if _id == "network" else ""
            line = f"{mark} {label:<22} [{key}]{stub}"
            attr = self.theme.attr_select() if i == self.menu_idx else self.theme.attr_normal()
            self.stdscr.addnstr(r, 2, line, w - 4, attr)

    def _draw_chat(self, h, w):
        self.stdscr.addnstr(1, 1, f"AI Chat — {self.active_model or 'no model'}", w - 2, self.theme.attr_bold())
        body = self.chat_log[-(h - 5) :]
        for i, line in enumerate(body):
            self.stdscr.addnstr(2 + i, 1, line, w - 2, self.theme.attr_normal())
        self.stdscr.addnstr(h - 2, 0, f"> {self.input}"[: w - 1].ljust(w - 1), w - 1, self.theme.attr_input())

    def _draw_models(self, h, w):
        self.stdscr.addnstr(1, 1, "Models — Enter activate", w - 2, self.theme.attr_bold())
        self.models = present_models(self.models_dir, self.catalog)
        for i, m in enumerate(self.models):
            if 3 + i >= h - 2:
                break
            mark = ">" if i == self.model_idx else " "
            ok = "OK" if m.get("present") else "--"
            line = f"{mark} [{ok}] {m.get('name')}  {m.get('approx_size_mb')}MB  {m.get('license')}"
            attr = self.theme.attr_select() if i == self.model_idx else self.theme.attr_normal()
            self.stdscr.addnstr(3 + i, 1, line, w - 2, attr)

    def _draw_settings(self, h, w):
        self.settings_items = self._settings_items()
        self.stdscr.addnstr(1, 1, "Settings — Enter change  +/- adjust numbers", w - 2, self.theme.attr_bold())
        for i, (_k, label) in enumerate(self.settings_items):
            attr = self.theme.attr_select() if i == self.settings_idx else self.theme.attr_normal()
            mark = ">" if i == self.settings_idx else " "
            self.stdscr.addnstr(3 + i, 1, f"{mark} {label}", w - 2, attr)

    def _draw_monitor(self, h, w):
        lines = snapshot(self.data_dir, self.active_model, server_alive(self.base))
        for i, line in enumerate(lines):
            if 1 + i >= h - 2:
                break
            self.stdscr.addnstr(1 + i, 1, line, w - 2, self.theme.attr_normal())

    def _draw_files(self, h, w):
        self.stdscr.addnstr(
            1, 1, f"File Manager — {self.files.cwd}  (AI_DATA scoped)", w - 2, self.theme.attr_bold()
        )
        self.stdscr.addnstr(
            2, 1, "Enter open  Backspace up  n mkdir  r rename  d delete  c copy→models  / search  v→vault",
            w - 2,
            self.theme.attr_dim(),
        )
        mid = max(6, (h - 6) // 2)
        for i, p in enumerate(self.files.entries[:mid]):
            mark = ">" if i == self.files.idx else " "
            name = p.name + ("/" if p.is_dir() else "")
            attr = self.theme.attr_select() if i == self.files.idx else self.theme.attr_normal()
            self.stdscr.addnstr(3 + i, 1, f"{mark} {name}", w // 2 - 2, attr)
        prev = self.files.preview.splitlines()
        for i, line in enumerate(prev[: h - 5]):
            self.stdscr.addnstr(3 + i, w // 2, line[: w // 2 - 2], w // 2 - 2, self.theme.attr_dim())
        if self.file_mode == "prompt":
            self.stdscr.addnstr(
                h - 2, 0, f"{self.file_prompt_action}> {self.input}"[: w - 1].ljust(w - 1),
                w - 1,
                self.theme.attr_input(),
            )
        else:
            self.stdscr.addnstr(h - 2, 1, self.files.status[: w - 3], w - 3, self.theme.attr_dim())

    def _draw_vault(self, h, w):
        self.stdscr.addnstr(
            1, 1, f"Knowledge Vault — {self.vault.count()} docs  (type query, Enter search)",
            w - 2,
            self.theme.attr_bold(),
        )
        self.stdscr.addnstr(2, 1, "i import from File cwd selection path  b rebuild index", w - 2, self.theme.attr_dim())
        self.stdscr.addnstr(3, 1, f"q> {self.input}", w - 2, self.theme.attr_input())
        for i, hit in enumerate(self.vault_hits[: h - 6]):
            mark = ">" if i == self.vault_idx else " "
            line = f"{mark} {hit.get('title')}: {hit.get('snip')}"
            attr = self.theme.attr_select() if i == self.vault_idx else self.theme.attr_normal()
            self.stdscr.addnstr(5 + i, 1, line, w - 2, attr)

    def _draw_agents(self, h, w):
        self.stdscr.addnstr(1, 1, "Agents & Tools — allowlist only", w - 2, self.theme.attr_bold())
        lines = self.agent.help_lines() + [""] + self.agent.log[-(h - 10) :]
        for i, line in enumerate(lines):
            if 2 + i >= h - 3:
                break
            self.stdscr.addnstr(2 + i, 1, line, w - 2, self.theme.attr_normal())
        self.stdscr.addnstr(h - 2, 0, f"> {self.input}"[: w - 1].ljust(w - 1), w - 1, self.theme.attr_input())

    def _draw_games(self, h, w):
        self.stdscr.addnstr(1, 1, f"Games — {self.game_name}  (1 snake  2 mines  Esc menu)", w - 2, self.theme.attr_bold())
        if self.game is None:
            self.stdscr.addnstr(3, 1, "Press 1 for Snake, 2 for Minesweeper", w - 2, self.theme.attr_normal())
            return
        # tick snake on draw
        if isinstance(self.game, SnakeGame) and not self.game.dead:
            now = time.time()
            if now - self.last_tick > 0.15:
                self.game.tick()
                self.last_tick = now
        for i, line in enumerate(self.game.render()):
            if 3 + i >= h - 2:
                break
            self.stdscr.addnstr(3 + i, 1, line, w - 2, self.theme.attr_normal())

    def _draw_image(self, h, w):
        title = "Image Lab (PXG + optional LLM prompt)" if self.app == "image_lab" else "Pixel Art (PXG)"
        self.stdscr.addnstr(1, 1, title, w - 2, self.theme.attr_bold())
        if not self.cfg.get("image_gen"):
            self.stdscr.addnstr(3, 1, "Image gen OFF — enable in Settings", w - 2, self.theme.attr_bold())
            return
        self.stdscr.addnstr(2, 1, f"> {self.input}", w - 2, self.theme.attr_input())
        if self.image_path:
            self.stdscr.addnstr(3, 1, f"saved: {self.image_path}", w - 2, self.theme.attr_dim())
        for i, line in enumerate((self.image_ascii or "").splitlines()):
            if 5 + i >= h - 2:
                break
            self.stdscr.addnstr(5 + i, 1, line[: w - 2], w - 2, self.theme.attr_normal())

    def _draw_network(self, h, w):
        lines = [
            NETWORK,
            "",
            "Status: NOT CONNECTED",
            "Client: not shipped in this build (see HAP-10).",
            "Server: off-USB by design.",
            "",
            f"Master switch: {'ON' if self.cfg.get('network_enabled') else 'OFF'} (Settings)",
            "Offline AI Chat / Vault / Files work with Network disabled.",
            "",
            "Coming soon: PMs, chatrooms, feed — protocol spike recommends XMPP.",
        ]
        for i, line in enumerate(lines):
            self.stdscr.addnstr(2 + i, 2, line, w - 4, self.theme.attr_normal())

    def _draw_help(self, h, w):
        text = f"""{PRODUCT} Help
Flashable offline AI USB / Pi. Terminal is the application.

Menu keys: arrows + Enter, or letter shortcuts shown in menu.
Esc returns to main menu. F10 quits.

AI Chat talks to local llama-server on 127.0.0.1.
Pixel Art / Image Lab use PXG procedural pixel art (optional).
File Manager stays on AI_DATA unless you enable host FS.
Knowledge Vault indexes txt/md on the stick (SQLite FTS5).
A small starter pack (guide, glossary, how-tos) ships in knowledge/raw.
Agents: allowlisted tools only — no shell.
Games are optional and use no model RAM when idle.
{NETWORK} is a stub until HAP-10.
"""
        lines = text.splitlines()
        for i, line in enumerate(lines[self.help_scroll :]):
            if 1 + i >= h - 2:
                break
            self.stdscr.addnstr(1 + i, 1, line, w - 2, self.theme.attr_normal())

    def _draw_firstboot(self, h, w):
        row = 1
        for line in rabbit_block():
            self.stdscr.addnstr(row, 2, line, w - 4, self.theme.attr_dim())
            row += 1
        self.stdscr.addnstr(row, 2, f"{PRODUCT} — First boot", w - 4, self.theme.attr_bold())
        row += 1
        self.stdscr.addnstr(row, 2, TAGLINE, w - 4, self.theme.attr_dim())
        row += 2
        steps = [
            f"Theme: {self.theme.name}",
            f"Image gen: {'ON' if self.cfg.get('image_gen') else 'OFF'}",
            "Pick a model (arrows when on this step)",
            "Finish → main menu",
        ]
        for i, s in enumerate(steps):
            attr = self.theme.attr_select() if i == self.fb_idx else self.theme.attr_normal()
            self.stdscr.addnstr(row + i, 2, s, w - 4, attr)
        model_top = row + len(steps) + 1
        if self.fb_idx == 2:
            for i, m in enumerate(self.models):
                if not m.get("present"):
                    continue
                if model_top + i >= h - 2:
                    break
                mark = ">" if i == self.model_idx else " "
                self.stdscr.addnstr(
                    model_top + i, 4, f"{mark} {m.get('name')}", w - 6, self.theme.attr_normal()
                )

    # ----- actions -----
    def open_app(self, app_id: str):
        self.app = app_id
        self.input = ""
        self.status = ""
        if app_id == "games":
            self.game = None
        if app_id == "files":
            self.files.allow_host = bool(self.cfg.get("allow_host_fs"))
            self.files.refresh()
        if app_id == "chat" and not self.chat_log:
            self.chat_log.append(f"system: Connected to {PRODUCT}. Esc=menu.")

    def activate_model(self):
        self.models = present_models(self.models_dir, self.catalog)
        if not self.models:
            self.status = "No models"
            return
        m = self.models[self.model_idx]
        if not m.get("present"):
            self.status = "Model not on disk"
            return
        ctx = int(self.cfg.get("ctx") or m.get("recommended_ctx") or 512)
        threads = int(self.cfg.get("threads") or 0)
        try:
            restart_server(m["path"], ctx, ROOT, threads=threads)
            self.active_model = m["id"]
            self.persist()
            self.status = f"Active: {m['id']}"
            self.messages = [self.messages[0]]
        except Exception as e:
            self.status = f"Activate failed: {e}"

    def cycle_theme(self):
        idx = THEMES.index(self.theme.name) if self.theme.name in THEMES else 0
        self.theme.set_name(THEMES[(idx + 1) % len(THEMES)], self.stdscr)
        self.cfg["theme"] = self.theme.name
        self.persist()
        self.status = f"Theme: {self.theme.name}"

    def send_chat(self):
        text = self.input.strip()
        self.input = ""
        if not text:
            return
        self.chat_log.append(f"you: {text}")
        msgs = list(self.messages)
        if self.cfg.get("vault_rag"):
            try:
                ctx = self.vault.rag_context(text)
                if ctx:
                    msgs = [msgs[0], {"role": "system", "content": ctx}] + msgs[1:]
                    self.chat_log.append("vault: using knowledge hits")
            except Exception:
                pass
        msgs.append({"role": "user", "content": text})
        self.status = "Thinking..."
        self.draw()
        try:
            if not server_alive(self.base):
                raise RuntimeError("llama-server not up")
            reply = chat_completion(self.base, msgs)
            self.messages.append({"role": "user", "content": text})
            self.messages.append({"role": "assistant", "content": reply})
            for line in textwrap.wrap(f"ai: {reply.strip()}", width=max(40, curses.COLS - 4)):
                self.chat_log.append(line)
            self.status = "OK"
        except Exception as e:
            self.chat_log.append(f"error: {e}")
            self.status = "Chat error"

    def render_pxg(self, prompt: str, use_llm: bool = False):
        if not self.cfg.get("image_gen"):
            self.status = "image_gen off"
            return
        vis = prompt
        if use_llm and server_alive(self.base):
            try:
                vis = chat_completion(
                    self.base,
                    [
                        {"role": "system", "content": "Reply with only a short pixel-art subject, max 12 words."},
                        {"role": "user", "content": prompt},
                    ],
                ).strip().split("\n")[0][:120]
            except Exception:
                vis = prompt
        res = generate_and_save(vis, self.data_dir / "images", size=int(self.cfg.get("image_size") or 32))
        self.image_ascii = res["ascii"]
        self.image_path = res["png"]
        self.status = f"PXG {res['png']}"

    def settings_activate(self):
        key = self.settings_items[self.settings_idx][0]
        if key == "theme":
            self.cycle_theme()
        elif key == "image_gen":
            self.cfg["image_gen"] = not bool(self.cfg.get("image_gen"))
        elif key == "vault_rag":
            self.cfg["vault_rag"] = not bool(self.cfg.get("vault_rag"))
        elif key == "network":
            self.cfg["network_enabled"] = not bool(self.cfg.get("network_enabled"))
        elif key == "allow_host":
            self.cfg["allow_host_fs"] = not bool(self.cfg.get("allow_host_fs"))
            self.files.allow_host = bool(self.cfg.get("allow_host_fs"))
        elif key == "save":
            self.persist()
            self.app = "menu"
            self.status = "Settings saved"
            return
        self.persist()
        self.status = "Updated"

    def settings_adjust(self, delta: int):
        key = self.settings_items[self.settings_idx][0]
        if key == "image_size":
            self.cfg["image_size"] = max(16, min(64, int(self.cfg.get("image_size") or 32) + delta * 8))
        elif key == "ctx":
            self.cfg["ctx"] = max(256, min(4096, int(self.cfg.get("ctx") or 512) + delta * 256))
        elif key == "threads":
            self.cfg["threads"] = max(0, min(16, int(self.cfg.get("threads") or 0) + delta))
        self.persist()

    # ----- input loop -----
    def run(self):
        curses.curs_set(1)
        self.stdscr.keypad(True)
        self.stdscr.nodelay(False)
        while True:
            if self.app == "games" and isinstance(self.game, SnakeGame) and not self.game.dead:
                self.stdscr.nodelay(True)
            else:
                self.stdscr.nodelay(False)
            self.draw()
            try:
                ch = self.stdscr.get_wch()
            except curses.error:
                time.sleep(0.05)
                if self.app == "games" and isinstance(self.game, SnakeGame):
                    continue
                continue
            if ch == curses.KEY_F10 or (isinstance(ch, str) and ch == "\x11"):
                break
            if self.app == "firstboot":
                self._handle_firstboot(ch)
                continue
            if ch == 27 or ch == "\x1b":  # Esc
                self.app = "menu"
                self.game = None
                continue
            if self.app == "menu":
                self._handle_menu(ch)
            elif self.app == "chat":
                self._handle_chat(ch)
            elif self.app == "models":
                self._handle_models(ch)
            elif self.app == "settings":
                self._handle_settings(ch)
            elif self.app == "monitor":
                if ch in ("r", "R"):
                    self.status = "Refreshed"
            elif self.app == "files":
                self._handle_files(ch)
            elif self.app == "vault":
                self._handle_vault(ch)
            elif self.app == "agents":
                self._handle_agents(ch)
            elif self.app == "games":
                self._handle_games(ch)
            elif self.app in ("pixel", "image_lab"):
                self._handle_image(ch)
            elif self.app == "help":
                if ch == curses.KEY_DOWN:
                    self.help_scroll += 1
                elif ch == curses.KEY_UP:
                    self.help_scroll = max(0, self.help_scroll - 1)

    def _handle_menu(self, ch):
        if ch in (curses.KEY_UP, "k"):
            self.menu_idx = (self.menu_idx - 1) % len(MENU)
        elif ch in (curses.KEY_DOWN, "j"):
            self.menu_idx = (self.menu_idx + 1) % len(MENU)
        elif ch in ("\n", "\r"):
            self.open_app(MENU[self.menu_idx][0])
        elif isinstance(ch, str):
            key = ch.upper() if ch != "?" else "?"
            for mid, _label, shortcut in MENU:
                if shortcut.upper() == key or (shortcut == "Enter" and False):
                    self.open_app(mid)
                    break
                if ch.lower() == mid[0] and mid in (
                    "chat",
                    "files",
                    "vault",
                    "agents",
                    "games",
                    "monitor",
                    "settings",
                    "help",
                    "network",
                    "models",
                    "pixel",
                ):
                    # letter fallbacks already covered by shortcuts
                    pass
            # explicit letter map
            keymap = {
                "i": "image_lab",
                "p": "pixel",
                "f": "files",
                "k": "vault",
                "a": "agents",
                "n": "network",
                "g": "games",
                "s": "monitor",
                "m": "models",
                "o": "settings",
                "?": "help",
            }
            if ch.lower() in keymap:
                self.open_app(keymap[ch.lower()])

    def _handle_chat(self, ch):
        if ch in ("\n", "\r"):
            self.send_chat()
        elif ch in (curses.KEY_BACKSPACE, "\x7f", "\b"):
            self.input = self.input[:-1]
        elif isinstance(ch, str) and ch.isprintable():
            self.input += ch

    def _handle_models(self, ch):
        if ch in (curses.KEY_UP, "k"):
            self.model_idx = max(0, self.model_idx - 1)
        elif ch in (curses.KEY_DOWN, "j"):
            self.model_idx = min(len(self.models) - 1, self.model_idx + 1)
        elif ch in ("\n", "\r"):
            self.activate_model()

    def _handle_settings(self, ch):
        if ch in (curses.KEY_UP, "k"):
            self.settings_idx = max(0, self.settings_idx - 1)
        elif ch in (curses.KEY_DOWN, "j"):
            self.settings_idx = min(len(self.settings_items) - 1, self.settings_idx + 1)
        elif ch in ("\n", "\r"):
            self.settings_activate()
        elif ch in ("+", "="):
            self.settings_adjust(1)
        elif ch in ("-", "_"):
            self.settings_adjust(-1)

    def _handle_files(self, ch):
        if self.files.confirm:
            if ch in ("y", "Y"):
                self.files.confirm_yes()
            else:
                self.files.confirm_no()
            return
        if self.file_mode == "prompt":
            if ch in ("\n", "\r"):
                act = self.file_prompt_action
                val = self.input.strip()
                self.input = ""
                self.file_mode = "browse"
                if act == "mkdir":
                    self.files.mkdir(val)
                elif act == "rename":
                    self.files.rename(val)
                elif act == "search":
                    hits = self.files.search(val)
                    self.status = f"{len(hits)} hits — open AI_DATA manually; first: {hits[0] if hits else '-'}"
                return
            if ch in (curses.KEY_BACKSPACE, "\x7f", "\b"):
                self.input = self.input[:-1]
            elif isinstance(ch, str) and ch.isprintable():
                self.input += ch
            return
        if ch in (curses.KEY_UP, "k"):
            self.files.move_idx(-1)
        elif ch in (curses.KEY_DOWN, "j"):
            self.files.move_idx(1)
        elif ch in ("\n", "\r"):
            self.files.enter()
        elif ch in (curses.KEY_BACKSPACE, "\x7f"):
            self.files.up()
        elif ch == "n":
            self.file_mode = "prompt"
            self.file_prompt_action = "mkdir"
            self.input = ""
        elif ch == "r":
            self.file_mode = "prompt"
            self.file_prompt_action = "rename"
            self.input = self.files.entries[self.files.idx].name if self.files.entries else ""
        elif ch == "d":
            self.files.delete_request()
        elif ch == "c":
            self.status = self.files.import_model(self.models_dir)
        elif ch == "/":
            self.file_mode = "prompt"
            self.file_prompt_action = "search"
            self.input = ""
        elif ch == "v":
            # import selection into vault
            if self.files.entries:
                try:
                    p = self.files.entries[self.files.idx]
                    if p.is_file():
                        self.vault.import_file(p)
                        self.status = f"Vault imported {p.name}"
                    else:
                        self.status = "Select a file"
                except Exception as e:
                    self.status = str(e)

    def _handle_vault(self, ch):
        if ch in (curses.KEY_UP, "k"):
            self.vault_idx = max(0, self.vault_idx - 1)
        elif ch in (curses.KEY_DOWN, "j"):
            self.vault_idx = min(max(0, len(self.vault_hits) - 1), self.vault_idx + 1)
        elif ch in ("\n", "\r"):
            self.vault_hits = self.vault.search(self.input)
            self.vault_idx = 0
            self.status = f"{len(self.vault_hits)} hits"
        elif ch == "b":
            n = self.vault.rebuild()
            self.status = f"Rebuilt {n} docs"
        elif ch == "i":
            # import from knowledge/raw prompt path relative to data
            self.status = "Place files in AI_DATA/knowledge/raw then press b to rebuild"
        elif ch in (curses.KEY_BACKSPACE, "\x7f", "\b"):
            self.input = self.input[:-1]
        elif isinstance(ch, str) and ch.isprintable():
            self.input += ch

    def _handle_agents(self, ch):
        if ch in ("\n", "\r"):
            out = self.agent.run(self.input)
            self.input = ""
            for line in (out or "").splitlines() or ["(ok)"]:
                self.agent.log.append(line)
            self.agent.log = self.agent.log[-200:]
        elif ch in (curses.KEY_BACKSPACE, "\x7f", "\b"):
            self.input = self.input[:-1]
        elif isinstance(ch, str) and ch.isprintable():
            self.input += ch

    def _handle_games(self, ch):
        if ch == "1":
            self.game = SnakeGame()
            self.game_name = "snake"
            self.last_tick = time.time()
        elif ch == "2":
            self.game = Minesweeper()
            self.game_name = "mines"
        elif self.game is None:
            return
        elif ch == "r":
            self.game.reset()
        elif isinstance(self.game, SnakeGame):
            if ch == curses.KEY_UP:
                self.game.set_dir(0, -1)
            elif ch == curses.KEY_DOWN:
                self.game.set_dir(0, 1)
            elif ch == curses.KEY_LEFT:
                self.game.set_dir(-1, 0)
            elif ch == curses.KEY_RIGHT:
                self.game.set_dir(1, 0)
        elif isinstance(self.game, Minesweeper):
            if ch == curses.KEY_UP:
                self.game.move(0, -1)
            elif ch == curses.KEY_DOWN:
                self.game.move(0, 1)
            elif ch == curses.KEY_LEFT:
                self.game.move(-1, 0)
            elif ch == curses.KEY_RIGHT:
                self.game.move(1, 0)
            elif ch == " ":
                self.game.reveal()
            elif ch == "f":
                self.game.flag()

    def _handle_image(self, ch):
        if ch in ("\n", "\r"):
            self.render_pxg(self.input.strip() or "nexus matrix", use_llm=(self.app == "image_lab"))
            self.input = ""
        elif ch in (curses.KEY_BACKSPACE, "\x7f", "\b"):
            self.input = self.input[:-1]
        elif isinstance(ch, str) and ch.isprintable():
            self.input += ch

    def _handle_firstboot(self, ch):
        if ch in (curses.KEY_UP, "k"):
            if self.fb_idx == 2:
                self.model_idx = max(0, self.model_idx - 1)
            else:
                self.fb_idx = max(0, self.fb_idx - 1)
        elif ch in (curses.KEY_DOWN, "j"):
            if self.fb_idx == 2:
                self.model_idx = min(len(self.models) - 1, self.model_idx + 1)
            else:
                self.fb_idx = min(3, self.fb_idx + 1)
        elif ch in ("\n", "\r"):
            if self.fb_idx == 0:
                self.cycle_theme()
            elif self.fb_idx == 1:
                self.cfg["image_gen"] = not bool(self.cfg.get("image_gen"))
                self.persist()
            elif self.fb_idx == 2:
                self.activate_model()
            elif self.fb_idx == 3:
                self.cfg["first_boot_done"] = True
                self.persist()
                self.app = "menu"
                self.status = f"Welcome to {PRODUCT}"


def main():
    ap = argparse.ArgumentParser(description=f"{PRODUCT} Hub")
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=8080)
    ap.add_argument("--catalog", default=str(DEFAULT_CATALOG))
    ap.add_argument("--models", default=str(DEFAULT_MODELS))
    args = ap.parse_args()
    curses.wrapper(lambda stdscr: Hub(stdscr, args).run())


if __name__ == "__main__":
    main()
