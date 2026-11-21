# NEXUS Companion app (Windows · Mac · Android · iOS)

Normal app with **real local AI Chat**, Vault, Packs, and Files. Matrix boot
splash, rabbit-wizard logo, and a proper desktop / home-screen icon. Phones use
bottom tabs; tablets use a side rail.

## One-click downloads

| Platform | Action |
|----------|--------|
| **Windows** | [Download portable .exe](https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.4.0/NEXUS-Companion-Windows-0.4.0-portable.exe) — double-click, NEXUS icon |
| **Mac** | [Companion Release](https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/companion-v0.4.0) — grab the `.dmg` when attached |
| **Web** | [Open /companion/](/companion/) in your browser |
| **Android** | Sideload APK from the [companion Release](https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/companion-v0.4.0) when attached — see [android-apk.md](./android-apk.md) |

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

## Dev run

```bash
cd nexus-app
npm install
npm run android   # phone / tablet
npm run ios
npm run web
npm run build:windows   # portable .exe with icon
npm run build:mac       # .dmg (macOS)
npm run android:apk     # EAS preview APK
```

## What v0.4 includes

- Real local models via Ollama + simple model selector
- Windows / Mac desktop packaging with NEXUS logo icon
- Matrix boot splash + rabbit logo
- Vault + optional Packs import
- Phone + tablet responsive chrome
