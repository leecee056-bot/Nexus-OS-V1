# NEXUS Companion app (Windows · iOS · Android)

Secondary app — **not** the bootable USB/Pi OS, and **not** Cardputer/Pocket
firmware. Use it to try Chat, Knowledge Vault, optional Packs, and document
browsing in a normal app UI.

Source and full run notes: [`nexus-app/README.md`](../../nexus-app/README.md)

## Quick start

```bash
git clone https://github.com/leecee056-bot/Nexus-OS-V1.git
cd Nexus-OS-V1/nexus-app
npm install
```

**Android:** `npm run android` (or Expo Go). APK sideload: see
[android-apk.md](./android-apk.md).  
**iOS:** `npm run ios` (macOS + Xcode) or `npm start` + Expo Go.  
**Windows:** `npm run web` in a browser, or Electron (see README).

## What v0.2 includes

- Matrix letter boot splash + rabbit-wizard logo
- Offline phrase Chat (stub — not a full local LLM yet)
- Knowledge Vault notes on-device
- **Packs** — open Kiwix / Gutenberg, import `.txt`/`.md`
- Document import / list
- Dark green + purple “matrix” styling

For flashable images and hardware firmware, use [Download](/download) and
[Setup](/setup) instead.
