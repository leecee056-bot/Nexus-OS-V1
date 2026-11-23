# Companion USB / portable kit (Windows · Mac)

A **portable desktop** edition of Tri-Cass Companion that lives on a USB stick,
memory card, or external hard drive. Heavier than the bootable OS images, but
the same Companion features — carried with your Vault, chats, and files.

## Download → USB → go

1. Download **Tri-Cass-Companion-USB-…zip** from
   [/download#companion-usb](/download#companion-usb) (or the
   [companion Release](https://github.com/leecee056-bot/Nexus-OS-V1/releases?q=companion)).
2. Unzip onto the USB (keep the folder structure).
3. Open **START-HERE.html** (shows the Tri-Cass logo) or:
   - **Windows:** `Windows\Start-Tri-Cass.bat` (2–3 clicks; allow SmartScreen if asked)
   - **Mac:** `Mac/Start-Tri-Cass.command` (right‑click → Open the first time)

## What travels with the stick

| Folder | Role |
|--------|------|
| `Data/` | App settings, Vault, themes, plugins (Electron userData) |
| `Knowledge/` | Your wiki / notes / folders — drop files or use **Add from this PC** |
| `Files/` | Generated images + document space |
| `Chats/` | **Save chat** markdown exports |

Unplug safely after quitting Companion; plug into another PC and Start-Tri-Cass —
your personal setup comes along.

## Features (same as desktop Companion)

Local Chat + grafting wait animation, Agent / Add-ons, Vault & Packs, Files,
Image Lab, Games (Chess + tiny 2D extras), themes (Basic / Matrix / Lumen /
Terminal), Check for updates.

**Ollama** still runs on the host PC (install once). Optional advanced: point
`OLLAMA_MODELS` at a folder on the USB if you want the weights on the stick
(needs a lot of free space).

## Vs bootable OS images

| | Bootable USB/Pi image | Companion USB kit |
|--|----------------------|-------------------|
| Boots its own OS | Yes | No — runs on Windows/Mac |
| Size | Lean OS image | Heavier desktop app + your data |
| Setup | Flash with Etcher | Unzip + Start-Tri-Cass |
| Best for | Dedicated offline machine | Carry Companion between PCs |

## Build the kit (devs)

```bash
cd nexus-app
npm run build:desktop   # win portable+dir, mac dmg+zip
npm run pack:usb        # → release/Tri-Cass-Companion-USB-<version>.zip
```

CI attaches the zip on `companion-v*` tags when Windows + Mac jobs finish.
