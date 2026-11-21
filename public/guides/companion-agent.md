# NEXUS Companion Agent

Agent mode turns Chat into a personal helper that can use the knowledge and
tools **you** added — Vault notes, knowledge packs, and the Add-ons / Plugin
library — instead of chatting in isolation.

## Quick start

1. Download a local model in **Chat** (Ollama).
2. Open **Add-ons** and leave the tools you want enabled (Vault, Packs, Files…).
3. In **Chat**, select **Agent** (default).
4. Ask things like:
   - “Search my vault for glossary”
   - “List files in website”
   - “Create a simple website”
   - “Write website/about.html with a short bio”

Short status lines appear while the agent plans, searches, and writes.

## What the agent can do

| Plugin | Tool | Capability |
|--------|------|------------|
| Vault Search | `search_vault` | Search Knowledge Vault notes |
| Knowledge Packs | `search_packs` | Prefer pack-imported notes |
| Files Browse | `list_files` | List Files library / folders |
| Files Read | `read_file` | Open local text files |
| Files Write | `write_file` | Create/update text files |
| Folders | `ensure_folder` | Create folders (e.g. `website/`) |
| NEXUS Status | `nexus_status` | Report plugins + counts |

Disable any plugin in **Add-ons** and Agent will not call that tool.

## Why it feels personal

You assemble the system: pick the model, import packs into Vault, enable
Add-ons, grow Files (even a small site). Agent answers with **those** pieces.
The same tool names in `nexus-app/src/agent/schema.ts` are meant for later
ports to the bootable NEXUS OS images and Cardputer firmware.

## Chat vs Agent

- **Chat** — direct reply from the local model.
- **Agent** — runs enabled tools first (with status), then answers using that
  local context + your model.

Both stay offline after the model is downloaded (tool work is on-device).
