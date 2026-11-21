# NEXUS Companion app (Windows · Mac · Android · iOS)

Normal app with **real local AI Chat**, Vault, Packs, and Files. Matrix boot
splash, rabbit-wizard logo, and a proper desktop / home-screen icon. Phones use
bottom tabs; tablets use a side rail.

## One-click downloads

| Platform | Action |
|----------|--------|
| **Windows** | [Download portable .exe](https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.7.0/NEXUS-Companion-Windows-0.7.0-portable.exe) — double-click, NEXUS icon |
| **Mac** | [Companion Release](https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/companion-v0.7.0) — grab the `.dmg` when attached |
| **Web** | [Open /companion/](/companion/) in your browser |
| **Android** | Sideload APK from the [companion Release](https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/companion-v0.7.0) when attached — see [android-apk.md](./android-apk.md) |

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

## What v0.7 includes

- **Terminal** theme — CRT multi-panel home dashboard with NEXUS logo
- Agent mode + Add-ons / Plugin library
- Lumen UI polish + Basic / Matrix / Lumen / Terminal themes
- Real local models via Ollama + model selector
- Windows / Mac desktop packaging with NEXUS logo icon
- Vault + optional Packs import + Files folders/text
- Phone + tablet responsive chrome
