# NEXUS Companion app (Windows + iOS)

Secondary app — **not** the bootable USB/Pi OS, and **not** Cardputer/Pocket
firmware. Use it to try Chat, Knowledge Vault, and simple document browsing in
a normal windowed interface.

Source and full run notes: [`nexus-app/README.md`](../../nexus-app/README.md)

## Quick start

```bash
git clone https://github.com/leecee056-bot/Nexus-OS-V1.git
cd Nexus-OS-V1/nexus-app
npm install
```

**iOS:** `npm run ios` (macOS + Xcode) or `npm start` + Expo Go on a device.  
**Windows:** `npm run web` in a browser, or `npm run windows:electron` after
installing Electron (see README).

## What v0.1 includes

- Offline phrase Chat (stub — not a full local LLM yet)
- Knowledge Vault notes on-device
- Document import / list
- Dark green “matrix” styling

For flashable images and hardware firmware, use [Download](/download) and
[Setup](/setup) instead.
