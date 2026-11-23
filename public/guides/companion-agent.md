# Tri-Cass Companion Agent

Agent mode turns Chat into a personal helper that can use the knowledge and
tools **you** added — Vault notes, knowledge packs, and the Add-ons / Plugin
library — instead of chatting in isolation.

## Quick start

1. Download a local model in **Chat** (Ollama). Small models (~1.5B and under)
   work best with **file tools + Vault/packs**, not as a solo “know everything”
   coder.
2. Open **Add-ons** and leave the tools you want enabled (Vault, Packs, Files…).
3. In **Chat**, select **Agent** (default).
4. Ask things like:
   - “Search my vault for glossary”
   - “List files in website”
   - “Create a simple website”
   - “Write website/about.html with a short bio”
   - “Rename website/README.txt to website/NOTES.txt”
   - “Delete website/old.html”

Short status lines appear while the agent plans, searches, and writes. When
files change, Chat shows a **Changes** list of created / updated / renamed /
deleted paths.

## Workspace sandbox

Agent file tools stay inside a **workspace**:

| Mode | Where files live |
|------|------------------|
| Desktop installed | Companion `userData/Workspace/` |
| USB portable kit | Kit `Files/` on the stick |
| Mobile / web | In-app Files library (same tools; not host disk) |

Paths are relative only (`website/index.html`). Absolute paths and `..` are
rejected. Common text/code extensions are allowed (`.txt` `.md` `.html` `.css`
`.js` `.ts` `.py` `.json` `.sh` …).

## What the agent can do

| Plugin | Tool | Capability |
|--------|------|------------|
| Vault Search | `search_vault` | Search Knowledge Vault notes |
| Knowledge Packs | `search_packs` | Prefer pack-imported notes |
| Files Browse | `list_files` | List workspace / folders |
| Files Read | `read_file` | Open text files |
| Files Write | `write_file` | Create/update text & code files |
| Files Create | `create_file` | Same sandbox create alias |
| Folders | `ensure_folder` | Create folders (e.g. `website/`) |
| Files Rename | `rename_file` | Rename/move inside the sandbox |
| Files Delete | `delete_file` | Delete inside the sandbox only |
| Tri-Cass Status | `tricass_status` | Plugins + workspace root |

Disable any plugin in **Add-ons** and Agent will not call that tool.

## Small-model coding (optional)

With a small local model, aim for:

- Short scripts, edits, file trees, and starters
- Looking things up in Vault / packs you imported
- Multi-step asks (“create folder X, then write Y.py”)

Do not expect large greenfield apps from a 1.5B (or smaller) model alone.
Coding knowledge packs (DevDocs / Stack Overflow via Kiwix) are planned as
optional USB downloads — see the Knowledge Packs page.

## Why it feels personal

You assemble the system: pick the model, import packs into Vault, enable
Add-ons, grow the workspace (even a small site). Agent answers with **those**
pieces. The same tool names in `nexus-app/src/agent/schema.ts` are meant for
later ports to the bootable Tri-Cass OS images and Cardputer firmware.

## Chat vs Agent

- **Chat** — direct reply from the local model.
- **Agent** — runs enabled tools first (with status), then answers using that
  local context + your model.

Both stay offline after the model is downloaded (tool work is on-device).
