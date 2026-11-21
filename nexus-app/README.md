# NEXUS Companion (Windows + iOS)

**Secondary** desktop / mobile app for the NEXUS OS / Tri-Cass family.

This is **not** the bootable USB/Pi OS image, and **not** Cardputer / Pocket
firmware. It is a normal windowed app so people can try the same offline-first
idea (Chat, Knowledge Vault, simple document browsing) without flashing media.

| Path | Role |
|------|------|
| USB / Pi images | Primary full hub |
| `nexus-esp32/` / `nexus-cardputer/` | Hardware companions |
| **`nexus-app/` (this folder)** | Windows + iOS companion app |

## Features (v0.1)

- **Home** — what this app is (secondary target)
- **Chat** — lightweight offline phrase stub (honest stand-in until a local model is wired)
- **Vault** — searchable on-device notes (starter pack included)
- **Files** — import / list documents from the device
- **About** — version + links back to the bootable downloads

Dark theme with green accents to match the project look. Full parity with every
USB hub feature is **not** required in this first version. Network community
hooks can be added later.

## Requirements

- Node.js 20+ (22 OK)
- **iOS:** macOS with Xcode, or [Expo Go](https://expo.dev/go) on a physical iPhone/iPad
- **Windows:** modern Windows 10/11; use web preview or the optional Electron shell

## Install

```bash
cd nexus-app
npm install
```

## Run — iOS

```bash
# Start Metro, then open in iOS Simulator (macOS) or scan QR with Expo Go
npm run ios
# or
npm start
```

For a store-ready binary later: use [EAS Build](https://docs.expo.dev/build/introduction/)
with the `ios.bundleIdentifier` in `app.json` (`bot.grok.nexus.companion`).

## Run — Windows

**Option A — web window (simplest)**

```bash
npm run web
```

Open the URL Expo prints (usually `http://localhost:8081`) in Edge/Chrome.
This is a fine first try of the UI on a PC.

**Option B — Electron desktop window**

```bash
# terminal 1
npm run web

# terminal 2 (after Metro is up)
npm install --no-save electron
npm run windows:electron
```

`electron/main.js` opens a native window pointed at the Expo web server.
Packaging an `.exe` installer is a later step (electron-builder / similar).

## Project layout

```
nexus-app/
  App.tsx                 # tab navigation
  src/
    theme.ts
    chat/tinychat.ts      # offline phrase replies
    vault/store.ts        # AsyncStorage notes
    files/store.ts
    screens/              # Home, Chat, Vault, Files, About
  electron/main.js        # optional Windows shell
  README.md
```

## Relation to Knowledge Packs

Optional large offline libraries (Kiwix, Gutenberg) are documented on the site
under **Optional Knowledge Packs**. In v0.1 this app uses its own Vault notes
and imported files; syncing packs from USB media can come later.

## License

MIT — same family as the rest of NEXUS OS (see repo root `LICENSE`).
