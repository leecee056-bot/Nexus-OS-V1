# NEXUS Companion app (Windows · Mac · Android · iOS)

Normal app with **real local AI Chat**, Vault, Packs, and Files. Matrix boot
splash, rabbit-wizard logo, and a proper desktop / home-screen icon. Phones use
bottom tabs; tablets use a side rail.

## One-click downloads

| Platform | Action |
|----------|--------|
| **Windows** | [Download portable .exe](https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.10.0/NEXUS-Companion-Windows-0.10.0-portable.exe) — double-click, NEXUS icon |
| **Mac** | [Companion Release](https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/companion-v0.10.0) — grab the `.dmg` when attached |
| **USB kit** | [NEXUS-Companion-USB zip](https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.10.0/NEXUS-Companion-USB-0.10.0.zip) — unzip to a stick, Start-NEXUS — see [companion-usb.md](./companion-usb.md) |
| **Web** | [Open /companion/](/companion/) in your browser |
| **Android** | [Download APK](https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.10.0/NEXUS-Companion-Android-0.10.0.apk) — see [android-apk.md](./android-apk.md) |

Site Download section: [/download#companion](/download#companion)

## Local AI Chat (Ollama)

1. Install [Ollama](https://ollama.com/download) on Windows, Mac, or Linux.
2. Open Companion → **Chat**.
3. Tap **Model** → pick a recommended lightweight model (Qwen 2.5 0.5B / 1.5B,
   TinyLlama, Llama 3.2 1B, Gemma 2 2B).
4. Tap **Get** — Ollama downloads the model once.
5. Chat offline. Models stay on your machine.

**Android:** run Ollama on a PC on the same Wi‑Fi, then Chat → **Ollama host** →
set `http://YOUR_PC_LAN_IP:11434`.

## Themes (v0.7)

Home / About (every platform) and the desktop side rail can switch looks:

| Theme | Feel |
|-------|------|
| **Basic** | Clean light UI (same idea as the website Basic theme) |
| **Matrix** | Classic neon-green terminal NEXUS |
| **Lumen** | Frosted glass panels, soft edge light, premium phosphor glow (default) |
| **Terminal** | CRT multi-panel “NEXUS OS” dashboard — mono type, scanlines, real logo mark |

Optional **scanlines** toggle (Matrix / Lumen / Terminal) — CRT overlay. Terminal turns scanlines on by default.

## Premium Chat UI

- Phosphor-style typewriter replies
- Status orb (ready / thinking / offline)
- Model cards with lift + edge light + download progress ring
- Minimal status bar: model name, device hint, LOCAL / OFFLINE AI

## Dev run

```bash
cd nexus-app
npm install
npm run android
npm run ios
npm run web
npm run build:windows
npm run build:mac
npm run android:apk
```

## Agent (v0.6)

See [companion-agent.md](./companion-agent.md) — Agent mode uses Vault, Add-ons,
and Files with live status while answering.

## Games (desktop / USB, v0.10)

**Games** tab with Chess first, plus Snake, Pong, Breakout, Tetris, and 2048 —
pure JS, one game mounted at a time. See [companion-games.md](./companion-games.md).

## USB portable kit (v0.9)

Carry Companion on a USB stick with Vault, chats, and Knowledge on the drive.
See [companion-usb.md](./companion-usb.md).

## Grafting indicator (v0.8.1)

While Chat waits for a local model reply, the rabbit **grafting** GIF loops in
the thread with a live `grafting… Ns` counter (no “thinking” spinner). Works on
Windows, Mac, Android, and the web companion.

## Image Lab (desktop, v0.8)

Windows / Mac / web companion: **Image** tab with the same Get-model flow as
Chat. See [companion-image.md](./companion-image.md).

## Check for updates (v0.8)

Manual **Check for updates** on models, add-ons, packs, and **Check for OS
updates** in About / Chat / Plugins. See [companion-updates.md](./companion-updates.md).

## What v0.10 includes

- **Games** (desktop / USB) — Chess + tiny 2D extras, low memory
- **USB portable kit** — Vault, chats, Knowledge on the stick
- **Image Lab** (desktop) — local image models via Ollama + Save PNG
- **Check for updates** — curated links for models, add-ons, packs, OS
- More Chat model options (Phi-3, DeepSeek R1 1.5B, Llama/Qwen 3B, …)
- **Terminal** theme — CRT multi-panel home dashboard with NEXUS logo
- Agent mode + Add-ons / Plugin library
- Lumen UI polish + Basic / Matrix / Lumen / Terminal themes
- Real local models via Ollama + model selector
- Windows / Mac desktop packaging with NEXUS logo icon
- Vault + optional Packs import + Files folders/text
- Phone + tablet responsive chrome
