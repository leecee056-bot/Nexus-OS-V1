# NEXUS Companion (Windows · Mac · Android · iOS)

Normal desktop / mobile app for the NEXUS OS / Tri-Cass family — Chat with
**real local models**, Knowledge Vault, Packs, and Files. Matrix boot splash and
rabbit-wizard branding throughout.

| Path | Role |
|------|------|
| USB / Pi images | Full bootable hub |
| `nexus-esp32/` / `nexus-cardputer/` | Hardware firmware |
| **`nexus-app/` (this folder)** | Windows · Mac · Android · iOS companion |

## Features (v0.5)

- **Local AI Chat** — pick a lightweight model (Qwen 2.5 0.5B/1.5B, TinyLlama,
  Llama 3.2 1B, Gemma 2 2B), one-tap download via [Ollama](https://ollama.com),
  then chat offline
- **Premium UI** — phosphor typewriter replies, status orb, glass panels,
  model-card lift + progress ring, NEXUS status bar
- **Themes** — Basic / Matrix / Lumen (desktop picker; About on all platforms),
  optional light scanlines
- **Desktop apps** — Windows portable `.exe` and Mac `.dmg` with NEXUS logo icon
- **Matrix boot splash** + rabbit-wizard logo
- **Vault / Packs / Files** — on-device notes and document import
- **Phone + tablet** — bottom tabs on phones, side rail on tablets

## Quick start — Chat with a local model

1. Install [Ollama](https://ollama.com/download) (Windows / Mac / Linux).
2. Open **NEXUS Companion** → **Chat**.
3. Tap **Model** → choose a recommended model → **Get**.
4. Wait for the download once, then start chatting. After that it works offline.

**Android:** run Ollama on a PC on the same Wi‑Fi, then in Chat open **Ollama host**
and set e.g. `http://192.168.1.20:11434` (use your PC’s LAN IP).

## Requirements

- Node.js 20+ (22 OK)
- **Local AI:** [Ollama](https://ollama.com) running on the machine (or LAN host)
- **Android:** device/emulator, or EAS cloud build for APK
- **iOS:** macOS + Xcode, or Expo Go
- **Windows / Mac desktop:** Electron builds below

## Install

```bash
cd nexus-app
npm install
```

## Run

```bash
npm run android
npm run ios
npm run web
# Desktop window (needs Expo web or a prior build:web):
npm install --no-save electron && npm run desktop
```

## Build one-click apps

```bash
# Windows portable .exe (logo icon in taskbar / explorer)
npm run build:windows

# Mac .dmg (run on macOS CI or a Mac)
npm run build:mac

# Android sideload APK
npm run android:apk
```

Artifacts land in `release/` (gitignored). Attach them to a GitHub Release
`companion-v*` tag — the site Download page links them.

## Project layout

```
nexus-app/
  App.tsx
  electron/                # Desktop shell + Ollama IPC proxy
  assets/brand/            # logo + app icons (.ico / .icns / .png)
  src/chat/                # models catalog, Ollama client, fallback phrases
  src/screens/             # Home, Chat, Vault, Packs, Files, About
```

## License

MIT — see repo root `LICENSE`.
