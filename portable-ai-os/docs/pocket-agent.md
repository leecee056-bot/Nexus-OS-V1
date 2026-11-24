# Pocket Agent — local app builder (Tri-Cass OS)

**Idea:** small offline LLM + knowledge packs + file tools so the stick/Pi
**builds apps from prompts** — not just chat. Same goal across PC USB, Pi 4,
and Pi 5 (shared aarch64 image), and Companion Agent.

## What already ships

| Piece | Where |
|-------|--------|
| Local llama.cpp + GGUF ladder | `scripts/start-infer.sh`, `select-model.sh` |
| Knowledge Vault + coding pack links | Vault / Companion Packs |
| Companion Agent file tools | `nexus-app` Agent mode (create/edit/rename files, website scaffold) |
| OS TUI allowlisted tools | Hub → Agents (calc, vault, fileread, note…) |

## What this track adds

1. **Project templates** under `projects/templates/` — HTML app, Python CLI,
   Flask/stdlib HTTP micro-app, timer — agent starts from a scaffold, not a blank disk.
2. **Builder commands** in the OS Agents panel: `scaffold`, `make`, `write`,
   `mkdir`, `projects`, `templates` — sandboxed under `/data/projects/` only
   (`tui/builder.py` + `tui/agents.py`).
3. **UI kit** — free Lucide (ISC) icons + Twemoji (CC-BY) under
   `assets/ui-kit/` (ATTRIBUTION.md). Mirrored into Companion `nexus-app/assets/ui-kit/`.
4. **Pi 4 + Pi 5** — same aarch64 image; `config.txt` `[pi5]` block; docs in
   `raspberry-pi.md`. USB + Pi image builds rsync `projects/` + `assets/`.
5. **Companion** — `nexus-app/src/agent/scaffolds.ts` + Agent/Chat one-shot
   (“make me a timer app”) writes `Files → projects/<name>/`.

## Minimal user path (images)

1. Boot Tri-Cass → Hub → **Agents** (or Chat).
2. Type `make me a timer app called tea` **or** `scaffold timer-app tea`.
3. Open `/data/projects/tea/` — real files on the stick / card.
4. Companion: Agent on → same phrasing → Files → `projects/`.

## Checkpoints (hub)

After successful `scaffold` / `make` / `write` / `mkdir`, the hub saves a
snapshot under `/data/projects/.tri-cass/checkpoints/`.

| Tool | Use |
|------|-----|
| `checkpoint <project> [label]` | Manual snapshot |
| `checkpoints [project]` | List ids |
| `restore <checkpoint-id>` | Roll project back |

Companion Agent mirrors this for the Files workspace (baseline before edits;
auto-restore if a mutating tool fails).

## Honest limits

Small models need templates + short steps + vault/coding packs. Not a cloud
codegen replacement. Pi 4 will feel slow; Pi 5 8 GB is the comfortable Pi target.
Full JSON-grammar tool loops + sandboxed `run()` remain follow-ups (Queued).
