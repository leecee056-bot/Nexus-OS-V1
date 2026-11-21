# NEXUS Companion — Android APK (sideload)

Secondary Android app — **not** the bootable USB/Pi OS, Cardputer firmware, or
a Play Store listing (yet). Source: [`nexus-app/`](../../nexus-app/).

## Install an APK (users)

1. One-click from the site
   [Download → Companion](/download#companion) → **Download Android (.apk)**,
   or grab
   [NEXUS-Companion-Android-0.12.3.apk](https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.12.3/NEXUS-Companion-Android-0.12.3.apk)
   from the [companion Release](https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/companion-v0.12.3).
2. On the phone: open the file → allow **Install unknown apps** for your
   browser/Files app if Android asks.
3. Open NEXUS Companion → wait for the matrix boot splash → use Chat / Vault /
   Packs / Files offline. For local AI Chat, run Ollama on a PC on the same
   Wi‑Fi and set that host in Chat.

Tip: keep “unknown sources” limited to the app you used to download the APK.

**Note:** Image Lab and Games stay on desktop / web builds. Android gets Chat,
Agent, themes, grafting wait, Vault, Packs, and Files.

## Where we host it

| Place | Role |
|-------|------|
| **GitHub Releases** on `leecee056-bot/Nexus-OS-V1` | Canonical APK |
| Site **Download → Companion / Android** | One-click APK button |
| Play Store | Later — not required for sideload |

We do **not** host multi‑GB knowledge dumps; Packs opens public Kiwix/Gutenberg
pages and imports plain `.txt`/`.md` into Vault.

## Build an APK (developers)

CI builds the APK with local Gradle (no Expo cloud token required):

```bash
cd nexus-app
npm install
npm run android:apk
# → release/NEXUS-Companion-Android-<version>.apk
```

Optional Expo cloud path (needs `EXPO_TOKEN` / `eas login`):

```bash
npm run android:apk:eas
```

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
