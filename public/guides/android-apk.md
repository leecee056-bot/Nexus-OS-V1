# NEXUS Companion — Android APK (sideload)

Secondary Android app — **not** the bootable USB/Pi OS, Cardputer firmware, or
a Play Store listing (yet). Source: [`nexus-app/`](../../nexus-app/).

## Install an APK (users)

1. Download the `.apk` from the
   [companion Release](https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/companion-v0.8.0)
   (preferred) or the site Download page when a build is attached. Windows / Mac
   users can grab one-click desktop builds from the same release. For local AI
   Chat, run Ollama on a PC on the same Wi‑Fi and set that host in Chat.
2. On the phone: open the file → allow **Install unknown apps** for your
   browser/Files app if Android asks.
3. Open NEXUS Companion → wait for the matrix boot splash → use Chat / Vault /
   Packs / Files offline.

Tip: keep “unknown sources” limited to the app you used to download the APK.

## Where we host it

| Place | Role |
|-------|------|
| **GitHub Releases** on `leecee056-bot/Nexus-OS-V1` | Canonical APK + checksum notes |
| Site **Download → Companion / Android** | Link to the latest Release asset |
| Play Store | Later — not required for v0.2 |

We do **not** host multi‑GB knowledge dumps; Packs opens public Kiwix/Gutenberg
pages and imports plain `.txt`/`.md` into Vault.

## Build an APK (developers)

```bash
cd nexus-app
npm install
# one-time: npm i -g eas-cli && eas login && eas build:configure
npm run android:apk
# or: npx eas-cli build -p android --profile preview
```

`eas.json` → profile **preview** sets `"android.buildType": "apk"` for
sideloadable builds. Download the artifact from the Expo/EAS build page, then
attach it to a GitHub Release.

Local device/emulator (dev, needs Android SDK):

```bash
npx expo run:android
```

## Optional Knowledge Packs on Android

1. Open **Packs** in the app.
2. Tap a public source (Kiwix, Gutenberg, site guide).
3. Download plain text on the phone.
4. Tap **Import .txt / .md into Vault** — searchable offline in **Vault**.

Full site page: [/knowledge-packs](/knowledge-packs)
