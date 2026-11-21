# NEXUS Companion (Windows · iOS · Android)

**Secondary** desktop / mobile app for the NEXUS OS / Tri-Cass family.

This is **not** the bootable USB/Pi OS image, and **not** Cardputer / Pocket
firmware. It is a normal app so people can try the offline-first idea (Chat,
Knowledge Vault, Packs, Files) without flashing media.

| Path | Role |
|------|------|
| USB / Pi images | Primary full hub |
| `nexus-esp32/` / `nexus-cardputer/` | Hardware companions |
| **`nexus-app/` (this folder)** | Windows + iOS + **Android** companion |

## Features (v0.2)

- **Matrix boot splash** — falling glyphs + rabbit-wizard logo + “NEXUS OS”
- **Home** — branded hero, secondary-target copy
- **Chat** — lightweight offline phrase stub (honest stand-in until a local model is wired)
- **Vault** — searchable on-device notes
- **Packs** — optional knowledge: open Kiwix / Gutenberg, import `.txt`/`.md` into Vault
- **Files** — import / list documents
- **About** — version + APK / source links

Dark theme with neon green + wizard-hat purple accents.

## Requirements

- Node.js 20+ (22 OK)
- **Android:** device/emulator, or EAS cloud build for APK
- **iOS:** macOS + Xcode, or Expo Go
- **Windows:** `npm run web` or optional Electron shell

## Install

```bash
cd nexus-app
npm install
```

## Run — Android

```bash
npm run android
# or
npm start   # then press `a` / scan with Expo Go
```

### Sideload APK (no Play Store yet)

Build a release APK with EAS **preview** profile (`eas.json`):

```bash
# npm i -g eas-cli && eas login && eas build:configure   # once
npm run android:apk
```

Download the `.apk` from the EAS build page → attach to a **GitHub Release** →
link it from the site Download page. Users enable “Install unknown apps” for
their browser/Files app, then install.

Full notes: [`../public/guides/android-apk.md`](../public/guides/android-apk.md)

## Run — iOS

```bash
npm run ios
# or npm start + Expo Go
```

## Run — Windows

```bash
npm run web
# optional desktop window:
# npm install --no-save electron && npm run windows:electron
```

## Optional Knowledge Packs

1. Open **Packs**
2. Browse Kiwix / Gutenberg (we do not host the dumps)
3. **Import .txt / .md into Vault** — searchable offline

Site guide: https://nexus-os.apps.grok.bot/knowledge-packs

## Project layout

```
nexus-app/
  App.tsx
  eas.json                 # Android APK preview profile
  assets/brand/            # logo-mark + rabbit wizard
  src/
    components/            # MatrixRain, BootSplash
    screens/               # Home, Chat, Vault, Packs, Files, About
    packs/catalog.ts
    chat/ tinychat.ts
  README.md
```

## License

MIT — see repo root `LICENSE`.
