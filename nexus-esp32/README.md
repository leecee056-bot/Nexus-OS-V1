# Tri-Cass Pocket (ESP32-S3)

Offline USB-Serial tiny-ML companion for **Tri-Cass OS**.

Runs a Karpathy-style **llama2.c** transformer on-device (default: TinyStories **stories260K**), with a Serial hub TUI and a few built-in tools. No Wi‑Fi required at runtime.

## Hardware

| Board | Flash | PSRAM | PlatformIO env |
|-------|-------|-------|----------------|
| ESP32-S3 DevKit / N16R8 class | 16 MB | 8 MB OPI | `nexus-pocket-s3` *(default)* |
| ESP32-S3 8 MB flash (e.g. XIAO) | 8 MB | 8 MB | `nexus-pocket-s3-8mb` |

**Why S3 + PSRAM:** weights live on SPIFFS (flash); activations + KV cache allocate from PSRAM. Without PSRAM, Chat falls back to demo mode; `tool mem` / notes still work.

## Quick start

```bash
cd nexus-esp32
chmod +x scripts/fetch_model.sh
./scripts/fetch_model.sh          # → data/model.bin + data/tokenizer.bin

pio run -e nexus-pocket-s3 -t upload
pio run -e nexus-pocket-s3 -t uploadfs
pio device monitor                # 115200
```

Open the Serial monitor and try:

```
help
status
chat Once upon a time
tool mem
tool note pocket idea
tool calc 12*7+3
```

If SPIFFS has no weights yet, `chat` prints a demo stub so you can still exercise the hub.

## Serial hub

| Command | Action |
|---------|--------|
| `help` | command list |
| `status` | model + heap/PSRAM |
| `chat <prompt>` / `c <prompt>` | generate |
| `tool <name> [arg]` | built-in tool |
| `tools` | list tools |
| `clear` / `reboot` | ANSI clear / restart |

Tools: `mem`, `fs`, `note`, `notes`, `uptime`, `echo`, `calc`.

## Memory map

See `include/config.h`. Short version:

- **SPIFFS** — `model.bin`, `tokenizer.bin`, `notes.txt`
- **PSRAM** — weights staging, activations, KV cache (`ps_malloc`)
- **SRAM** — UI line buffer, stack

stories260K is ~1 MB fp32 — fits 8 MB and 16 MB partition layouts. A future ~15M/29M path needs the 16 MB board and a longer SPIFFS upload.

## Layout

```
nexus-esp32/
  platformio.ini
  partitions.csv / partitions-8mb.csv
  include/   config, hub, model_runner, tokenizer, tools
  src/       main, hub, model_runner, tokenizer, tools
  data/      SPIFFS image (model + tokenizer after fetch)
  scripts/fetch_model.sh
```

## Notes

- Inference is **greedy** and capped (`NEXUS_MAX_NEW_TOKENS`, default 48) so USB stays responsive.
- Tokenizer encode is a compact longest-prefix lookup suitable for tok512; fine for Pocket prompts.
- License: MIT (Lee Cee 2026), same family as portable-ai-os.

## Related: Cardputer ADV

M5Stack **Cardputer ADV** has **no PSRAM** — do not flash this Pocket firmware
expecting stories260K. Use the dedicated project instead:

→ [`../nexus-cardputer/`](../nexus-cardputer/) (on-screen TinyChat hub + optional microSD Vault)

## Roadmap (not in v0.1)

- Quantized weights (q8) for larger stories checkpoints
- Optional BLE UART mirror of the hub
- Wire Pocket notes ↔ Knowledge Vault export on host
