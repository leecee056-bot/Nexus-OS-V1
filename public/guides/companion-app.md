# NEXUS Companion app (Windows · iOS · Android)

Secondary app — **not** the bootable USB/Pi OS. Chat, Vault, Packs, Files with
a matrix boot splash and rabbit-wizard logo. Phones use bottom tabs; tablets
use a side rail.

## One-click downloads

| Platform | Action |
|----------|--------|
| **Windows** | [Download portable .exe](https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.3.0/NEXUS-Companion-Windows-0.3.0-portable.exe) — double-click, no installer |
| **Web** | [Open /companion/](/companion/) in your browser |
| **Android** | Sideload APK from the [companion Release](https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/companion-v0.3.0) when attached — see [android-apk.md](./android-apk.md) |

Site Download section: [/download#companion](/download#companion)

## Dev run

```bash
cd nexus-app
npm install
npm run android   # phone / tablet emulator or device
npm run ios
npm run web
npm run build:windows   # portable .exe (needs electron-builder)
npm run android:apk     # EAS preview APK
```

## What v0.3 includes

- Matrix letter boot splash + rabbit logo
- Offline phrase Chat (stub)
- Knowledge Vault + optional Packs import
- Document import
- Phone + tablet responsive chrome
