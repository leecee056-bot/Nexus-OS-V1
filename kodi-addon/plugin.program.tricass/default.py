# Tri-Cass Kodi add-on (HAP-61) — Chat + Vault search, remote-friendly.
# Keep thin: no full Companion UI.
from __future__ import annotations

import json
import os
import sys
import urllib.parse
import urllib.request

import xbmc
import xbmcaddon
import xbmcgui
import xbmcplugin

ADDON = xbmcaddon.Addon()
ADDON_HANDLE = int(sys.argv[1])
BASE_URL = sys.argv[0]
ARGS = urllib.parse.parse_qs(urllib.parse.urlparse(sys.argv[2]).query)


def get_arg(name: str, default: str = "") -> str:
    vals = ARGS.get(name)
    return vals[0] if vals else default


def build_url(**kwargs) -> str:
    return BASE_URL + "?" + urllib.parse.urlencode(kwargs)


def list_root() -> None:
    items = [
        ("Chat (Ollama / TinyChat)", {"mode": "chat"}),
        ("Search Knowledge Vault", {"mode": "vault"}),
        ("Settings", {"mode": "settings"}),
    ]
    for label, params in items:
        li = xbmcgui.ListItem(label=label)
        xbmcplugin.addDirectoryItem(
            ADDON_HANDLE, build_url(**params), li, isFolder=params["mode"] != "settings"
        )
    xbmcplugin.endOfDirectory(ADDON_HANDLE)


def do_settings() -> None:
    ADDON.openSettings()


def ollama_chat(prompt: str) -> str:
    host = ADDON.getSetting("ollama_host") or "http://127.0.0.1:11434"
    model = ADDON.getSetting("ollama_model") or "tinyllama"
    url = host.rstrip("/") + "/api/generate"
    body = json.dumps({"model": model, "prompt": prompt, "stream": False}).encode("utf-8")
    req = urllib.request.Request(
        url, data=body, headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return (data.get("response") or "").strip() or "(empty reply)"
    except Exception as exc:  # noqa: BLE001 — show in UI
        return tinychat_fallback(prompt, err=str(exc))


def tinychat_fallback(prompt: str, err: str = "") -> str:
    # Tiny phrase bank — mirrors Companion offline fallback spirit
    p = prompt.lower()
    if "hello" in p or "hi" in p:
        return "Hello from Tri-Cass on Kodi. Connect Ollama for fuller answers."
    if "help" in p:
        return "Use Chat for local Ollama, or Vault to search markdown on your USB path."
    tip = f" (Ollama unreachable: {err})" if err else ""
    return (
        "Offline TinyChat: I only know a few phrases here. "
        "Set Ollama host in add-on settings for real local models."
        + tip
    )


def do_chat() -> None:
    keyboard = xbmc.Keyboard("", "Ask Tri-Cass")
    keyboard.doModal()
    if not keyboard.isConfirmed():
        return
    prompt = keyboard.getText() or ""
    if not prompt.strip():
        return
    reply = ollama_chat(prompt.strip())
    xbmcgui.Dialog().textviewer("Tri-Cass Chat", reply)


def vault_root() -> str:
    path = ADDON.getSetting("vault_path") or ""
    if path and os.path.isdir(path):
        return path
    # Common USB guess — user should set Settings → Vault path
    for cand in ("/media/usb/Knowledge", "/var/media/Knowledge", "/storage/Knowledge"):
        if os.path.isdir(cand):
            return cand
    return path


def do_vault() -> None:
    root = vault_root()
    if not root or not os.path.isdir(root):
        xbmcgui.Dialog().ok(
            "Vault",
            "Set Knowledge Vault folder in add-on settings "
            "(USB Knowledge/ or markdown tree).",
        )
        return
    keyboard = xbmc.Keyboard("", "Search Vault")
    keyboard.doModal()
    if not keyboard.isConfirmed():
        return
    query = (keyboard.getText() or "").strip().lower()
    if not query:
        return
    hits = []
    for dirpath, _dirnames, filenames in os.walk(root):
        for name in filenames:
            if not name.lower().endswith((".md", ".txt")):
                continue
            full = os.path.join(dirpath, name)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    text = fh.read()
            except OSError:
                continue
            if query in text.lower() or query in name.lower():
                snippet = text.strip().replace("\n", " ")[:240]
                hits.append(f"{name}\n{snippet}")
            if len(hits) >= 12:
                break
        if len(hits) >= 12:
            break
    if not hits:
        xbmcgui.Dialog().ok("Vault", f"No hits for “{query}”.")
        return
    xbmcgui.Dialog().textviewer("Vault hits", "\n\n---\n\n".join(hits))


def main() -> None:
    mode = get_arg("mode") or "root"
    if mode == "root":
        list_root()
    elif mode == "chat":
        do_chat()
    elif mode == "vault":
        do_vault()
    elif mode == "settings":
        do_settings()
    else:
        list_root()


if __name__ == "__main__":
    main()
