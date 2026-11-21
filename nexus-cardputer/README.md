# NEXUS Cardputer ADV

Dedicated **M5Stack Cardputer ADV** firmware for the NEXUS OS family.

This is **not** a Linux USB/Pi image, and it is **not** the same as
[`nexus-esp32/`](../nexus-esp32/) (NEXUS Pocket). The Cardputer ADV has
**no PSRAM**, so it cannot load TinyStories / llama2.c weights into RAM.

| | Cardputer ADV (this folder) | Pocket (`nexus-esp32`) | USB / Pi images |
|--|--|--|--|
| SoC | ESP32-S3FN8 (Stamp-S3A) | ESP32-S3 + **PSRAM** | x86 / aarch64 Linux |
| Flash | 8 MB | 8–16 MB | multi‑GB disk image |
| UI | 240×135 colour + 56‑key | USB Serial TUI | full hub |
| Chat | **TinyChat** (flash corpus) | stories260K on SPIFFS | SmolLM2 / GGUF |

## Hardware

- M5Stack **Cardputer ADV**
- ESP32-S3FN8 · **8 MB flash** · **~512 KB SRAM** · **no PSRAM**
- 1.14″ **240×135** display
- 56‑key keyboard
- microSD slot + battery

## Memory constraints (read this)

- All UI + TinyChat state must fit in on-chip SRAM.
- TinyChat is a **keyword + phrase corpus in flash**, not a neural net.
- For real transformer chat on MCU hardware, use **NEXUS Pocket** on a board
  **with PSRAM** (`nexus-esp32/`).
- For the full offline OS (Vault, Games, Agents…), flash a **USB or Pi** image.

## Quick start

```bash
cd nexus-cardputer
pio run -e cardputer-adv -t upload
pio device monitor   # optional USB log @ 115200
```

PlatformIO pulls `M5Unified`, `M5GFX`, and `M5Cardputer`.

## Hub controls

| Key | Action |
|-----|--------|
| `;` or `,` | Move selection up |
| `'` or `.` | Move selection down |
| `1`–`4` | Jump to menu item |
| `Enter` | Open / send / save note |
| `` ` `` (backtick) | Back to hub |
| Backspace | Edit text |

Menu: **Chat**, **Notes**, **Status**, **About**.

- **Chat** — TinyChat offline replies (scripted corpus).
- **Notes** — append lines to microSD (`/nexus-notes.txt`) or SPIFFS fallback.
- **Status** — heap, flash size, notes backend, battery % when available.
- **About** — short reminder of ADV limits vs Pocket / USB / Pi.

## Layout

```
nexus-cardputer/
  platformio.ini      # env: cardputer-adv
  partitions.csv      # 8 MB app + SPIFFS
  include/            # config, ui, hub, tinychat, notes
  src/                # main, hub, ui, tinychat, notes
  README.md
  LICENSE
```

## Site / docs

The product site lists this under Download / Setup as **Cardputer ADV** —
separate from Pocket ESP32 (PSRAM) and from PC/Pi disk images.

## License

MIT © 2026 Lee Cee
