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
| Notes / Vault | Scratch notes + **optional SD Vault** | Serial notes tool | Knowledge Vault |

## Hardware

- M5Stack **Cardputer ADV**
- ESP32-S3FN8 · **8 MB flash** · **~512 KB SRAM** · **no PSRAM**
- 1.14″ **240×135** display
- 56‑key keyboard
- microSD slot + battery

## Memory constraints (read this)

- All UI + TinyChat state must fit in on-chip SRAM.
- TinyChat is a **keyword + phrase corpus in flash**, not a neural net.
- Optional **Knowledge Vault** on microSD is streamed line-by-line / file chunks —
  not loaded entirely into RAM.
- No card or empty vault: firmware still boots and runs Chat / Notes / Status.
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

## Optional microSD Knowledge Vault

Same idea as the USB/Pi **Knowledge Vault**, scaled to the Cardputer:

1. Format a microSD card (FAT).
2. Copy `sd-example/nexus-vault/` to the **root** of the card (see
   [`sd-example/README.md`](sd-example/README.md)).
3. Insert the card, open **Vault** on the hub.

Supported layouts (first match wins):

- `/nexus-vault/*.txt` or `*.md` (preferred)
- `/vault/*.txt` or `*.md`
- single file `/nexus-vault.txt`

**Browse:** `;`/`'` select · Enter open (reads a capped chunk).  
**Search:** type a word · Enter (scans files line-by-line).  
Scratch **Notes** still append to `/nexus-notes.txt` on SD (or SPIFFS fallback).

## Hub controls

| Key | Action |
|-----|--------|
| `;` or `,` | Move selection up |
| `'` or `.` | Move selection down |
| `1`–`5` | Jump to menu item |
| `Enter` | Open / send / save / search |
| `` ` `` (backtick) | Back (hub, or Vault list from view) |
| Backspace | Edit text |

Menu: **Chat**, **Vault**, **Notes**, **Status**, **About**.

- **Chat** — TinyChat offline replies (scripted corpus).
- **Vault** — optional SD knowledge base (browse + search).
- **Notes** — append lines to microSD or SPIFFS.
- **Status** — heap, flash, notes backend, vault file count, battery.
- **About** — ADV limits vs Pocket / USB / Pi.

## Layout

```
nexus-cardputer/
  platformio.ini
  partitions.csv
  include/   config, ui, hub, tinychat, notes, vault
  src/
  sd-example/nexus-vault/   ← copy to microSD root
  README.md
  LICENSE
```

## Site / docs

Listed on the product site under Download / Setup as **Cardputer ADV**, with a
note that the SD vault is optional.

## License

MIT © 2026 Lee Cee
