# HAP-60 — Android TV / leanback Companion

**Goal:** Use a cheap Android TV box as a Tri-Cass terminal — Chat, Vault, Packs,
Files — with a remote and on-screen keyboard. Stock Android TV APK first; custom
firmware is research-only (see below).

## Coverage

| RAM | Expectation |
|-----|-------------|
| ~1 GB | Marginal — may boot leanback; keep animations off; TinyChat / small Ollama only |
| 2 GB+ | Comfortable target for local Ollama + Vault |
| 4 GB+ | Coding packs + agent file tools more usable |

## Build / install (stock path)

1. Build the existing Expo Android app (`eas build` / `npx expo run:android`).
2. `app.json` declares `android.leanback` / TV launcher intent so the APK appears
   on Android TV / Google TV launchers.
3. Sideload via USB/`adb install`, or publish an Android TV track later.
4. Point Chat at a LAN Ollama (or use TinyChat phrase fallback offline).

Remote-first: large tab targets already exist in the bottom navigator; prefer D-pad
focus. Use the system on-screen keyboard / T9 for chat input.

## USB stick on TV boxes

Copy Knowledge Vault / coding packs to USB; open Packs / Vault in Companion and
point at the stick path when the platform exposes it. Desktop USB kit layout
(`Knowledge/`, `Files/`) remains the reference.

## Firmware research (not a ship blocker)

Many TV boxes ship locked OEM Android. **Supported path = stock Android TV +
sideloaded APK.** Unlocking / custom ROM varies by family (Amlogic, Rockchip,
Allwinner clones) and often voids support or bricks devices — document per-family
notes under `docs/android-tv-firmware-notes.md` as research only. Do not claim
Tri-Cass ships custom TV firmware.
