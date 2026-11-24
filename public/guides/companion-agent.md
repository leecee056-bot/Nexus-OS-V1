# Tri-Cass Companion Agent

Agent mode turns Chat into a personal helper that can use the knowledge and
tools **you** added — Vault notes, knowledge packs, coding packs, and the
Add-ons / Plugin library — instead of chatting in isolation.

## Quick start

1. Download a local model in **Chat** (Ollama). Small models (~1.5B and under)
   work best with **coding packs + file tools**, not as a solo “know everything”
   coder.
2. Open **Add-ons** and leave the tools you want enabled (Vault, Packs, Coding
   Packs, Files…).
3. In **Chat**, select **Agent** (default).
4. Ask things like:
   - “Search my vault for glossary”
   - “Look up fetch API in my coding packs”
   - “List files in website”
   - “Create a simple website”
   - “Make me a timer app called tea”
   - “Scaffold an html app named notes”
   - “Write website/about.html with a short bio”
   - “Rename website/README.txt to website/NOTES.txt”
   - “Delete website/old.html”

Project scaffolds land under `projects/<name>/` (timer, HTML app, Python CLI,
stdlib HTTP / Flask-style). Free Lucide + Twemoji icons ship in the Companion
`assets/ui-kit/` tree for those apps to reuse.

Short status lines appear while the agent plans, searches, and writes. When
files change, Chat shows a **Changes** list of created / updated / renamed /
deleted paths.

Chat chrome (Companion): **New chat**, **Save chat**, **Close**, and **Chats**
(open a prior saved conversation). On the OS hub TUI: `/new` `/save` `/clear`
`/chats` `/open N`.

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
| Coding Packs | `search_coding_packs` | Search `pack-coding-*` imports (DevDocs / SO excerpts) |
| Files Browse | `list_files` | List workspace / folders |
| Files Read | `read_file` | Open text files |
| Files Write | `write_file` | Create/update text & code files |
| Files Write | `edit_file` | Diff-style replace (`old`→`new`) via grammar loop |
| Files Create | `create_file` | Same sandbox create alias |
| Folders | `ensure_folder` | Create folders (e.g. `website/`) |
| Files Rename | `rename_file` | Rename/move inside the sandbox |
| Files Delete | `delete_file` | Delete inside the sandbox only |
| Tri-Cass Status | `tricass_status` | Plugins + workspace root |
| Checkpoints | `list_checkpoints` / `create_checkpoint` / `restore_checkpoint` | Snapshot / roll back Files workspace |
| Sandbox Run | `run` | Run python/node in `projects/<name>/` (desktop; timed) |

Disable any plugin in **Add-ons** and Agent will not call that tool.

## Checkpoints (rollback)

Before Agent file edits, Companion saves a **baseline** snapshot under
`.tri-cass/checkpoints/`. After a successful edit turn it saves another. If a
mutating tool fails mid-turn, Agent **auto-restores** the baseline (Cline-style
safety for small local models).

Ask Agent:

- “list checkpoints”
- “restore last checkpoint” / “undo”
- “save checkpoint”

## Post-write checks + stuck detection

After each successful `write_file` / `edit_file`, Agent runs a quick smoke check
(JSON parse, HTML/JS/Python bracket sanity; on desktop, `py_compile` /
`node --check` when the file lives under `projects/<name>/`). Failures are fed
back into the tool loop.

If the **same error** repeats **three times** in one turn, Agent restores the
last checkpoint and stops — asking you to change approach rather than thrashing.

## Plan mode + project rules

Cline-slim flow for multi-file builds:

1. **PLAN** — Agent explores and writes a short checklist to
   `.tri-cass/plan.md`. Other writes / edits / `run` are blocked.
2. You say **accept plan** (or “go ahead”).
3. **ACT** — Agent executes with the checklist re-injected each turn.

Build-style asks (“make me a timer app…”) auto-enter PLAN when no checklist
exists yet. Say **plan mode** / **act mode** anytime.

**Project rules** live in `.tri-cass-rules` at the workspace root (and optional
`projects/<name>/.tri-cass-rules`). Companion seeds a short default on first
Agent turn. Rules are loaded into every Agent / grammar turn.

Hub TUI: `plan <project> | <goal>` → `accept <project>` → `act <project> | <goal>`;
`rules <project> [init]`.

## Grammar JSON tool loop

With a local model ready, Agent prefers a **one-tool-at-a-time** JSON loop
(Ollama `format=json`). Each model reply is a single object:

`{"tool":"write_file|edit_file|read_file|list_dir|run|search_knowledge|finish","args":{…}}`

- `edit_file` replaces the first occurrence of `old` with `new` in a path
- `list_dir` lists a workspace folder (same sandbox as `list_files`)
- `run` executes an allowlisted command (`python` / `python3` / `node`) with
  **cwd locked** to `projects/<project>/` and a **timeout** (default 20s).
  Desktop Companion only; mobile/web report that spawn is unavailable.
  Stdout/stderr are fed back into the next tool step.
- `search_knowledge` hits Vault and coding packs
- `finish` ends the loop with the user-facing message

If the first reply is not valid tool JSON, Agent falls back to the older
heuristic planner. On the USB/Pi hub TUI: `loop <goal>` (needs llama-server)
or `run <project> | python main.py`.

## Small-model coding (~1.5B and smaller)

Realistic workflow:

1. **Packs lookup** — Companion seeds **coding pack v1** (`pack-coding-v1-*`:
   Python CLI/HTTP/JSON, HTML/JS, Flask mini, common fixes). Ask Agent to
   search coding packs. Optional: import more via Packs → **Import as coding
   pack** (see [/knowledge-packs#coding](/knowledge-packs#coding)).
2. **File tools** — list / read / write / rename inside the sandbox.
3. **Short edits** — scripts, file trees, starters, small HTML/CSS/JS pages.

Do **not** expect large greenfield apps from a 1.5B (or smaller) model alone.
Ask for one file or one function at a time; paste errors back into Agent with
packs enabled.

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
