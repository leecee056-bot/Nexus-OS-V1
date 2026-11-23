# Tri-Cass OS — Raspberry Pi images (plan)

**Date:** 2026-11-19  
**Status:** Plan + scaffold — **not shipped yet.** Do not claim Pi downloads until QEMU/hardware smoke passes and a GitHub Release asset exists.  
**Owner path:** Image bake on hub-shell worker (runtime + debootstrap); website wires Download when assets are public.

## Why this is separate from PC USB

| | PC images (shipped) | Raspberry Pi (this track) |
|--|---------------------|---------------------------|
| CPU | Intel/AMD `x86_64` / `i686` | ARM `aarch64` (Pi 3/4/5 first) |
| Boot | BIOS/MBR + extlinux | Pi firmware + FAT boot partition |
| Flash tool | Etcher / `dd` | Same (Raspberry Pi Imager “custom .img” OK) |
| llama binary | Host-built x86/i686 | Must be **aarch64** (cross-compile or on-Pi build) |

The current `build-usb-image.sh` only accepts `x86_64|i686`. Pi needs a new script (`build-rpi-image.sh`) and a matching llama binary.

## Goals (v1)

1. **Primary:** `tri-cass-os-rpi-aarch64.img` (or `portable-ai-os-aarch64.img`) for **Pi 4 and Pi 5** (64-bit OS).
2. Same product experience: hub TUI, SmolLM2 rescue model, `AI_DATA` persistence, Network stub, offline-first.
3. Flash with Etcher / Raspberry Pi Imager; document HDMI + USB keyboard.
4. Publish xz on GitHub Release (same 2 GiB asset limit pattern as PC).

**Later (v1.1+):** `armhf` for older Pi 1 / Zero (non‑2) if demand exists — slower AI, tighter RAM; do not block aarch64.

**Out of scope for first Pi bake:** Wi‑Fi first-boot wizard polish, camera, Desktop GUI, Apple Silicon as target.

## Target hardware (honest)

| Board | v1 target? | Notes |
|-------|------------|--------|
| Pi 5 (4 GB+) | Yes | Preferred |
| Pi 4 (2 GB+) | Yes | 1 GB may struggle with model + TUI |
| Pi 3 / Zero 2 W (aarch64) | Stretch | Try after Pi 4 smoke; expect slow Chat |
| Pi 1 / Zero (armhf) | Later | Separate image |
| Pi Pico / microcontrollers | No | Not Linux |

## Image layout (proposed)

```
Partition 1  FAT32  LABEL=bootfs   ~512 MB   — firmware, kernel, cmdline, overlays
Partition 2  ext4   LABEL=AI_SYS   rest-1GB  — Debian root + /opt/portable-ai-os
Partition 3  ext4   LABEL=AI_DATA  ~1 GB     — config, extra models, vault (same idea as PC)
```

- Base: **Debian bookworm arm64** via `debootstrap --arch=arm64` under `qemu-user-static`.
- Packages: `linux-image-arm64` **or** Raspberry Pi kernel/firmware packages (`raspi-firmware`, etc. — prefer Debian’s Pi support packages where maintainable).
- Boot: standard Pi `config.txt` / `cmdline.txt` pointing root at `LABEL=AI_SYS` or PARTUUID.
- Payload: same TUI tree + **aarch64** `llama-server` + SmolLM2 GGUF.
- Size: start **4 GB** sparse image (Pi users often have ≥8 GB cards; leave headroom).

## Build phases

| Phase | Deliverable | Gate |
|-------|-------------|------|
| **RPi-A** | This plan + `scripts/build-rpi-image.sh` scaffold | Lee OK |
| **RPi-B** | aarch64 llama.cpp build script / CI note | Binary runs under `qemu-aarch64` or on Pi |
| **RPi-C** | First image bake on hub-shell | debootstrap completes; image boots in `qemu-system-aarch64` (virt machine) **or** real Pi |
| **RPi-D** | Hub smoke: menu + Chat one-shot | Same honesty as PC SMOKE |
| **RPi-E** | xz + SHA256SUMS → GitHub Release; site Download row | Public URLs only after smoke |
| **RPi-F** | Site About/Download: Pi listed as available | No “coming” badge |

## Engineering notes

1. **Do not** reuse MBR+extlinux from the PC builder — Pi firmware will not boot it.
2. Cross-build on x86_64 cloud VM with `qemu-user-static` + `binfmt` (same pattern as i386 debootstrap).
3. llama: extend `build-llama.sh` with `aarch64` toolchain or build inside chroot.
4. Keep branding paths `/opt/portable-ai-os` + `/opt/tri-cass-os` symlink.
5. Website: until RPi-E, copy must say **“Raspberry Pi images — building next”**, not downloadable.

## Scaffold locations

- Plan: `docs/raspberry-pi-plan.md` (this file)
- Script: `portable-ai-os/scripts/build-rpi-image.sh`
- Flash notes: `portable-ai-os/docs/raspberry-pi.md`

## Lee summary (plain English)

You asked for Pi support to reach more people. We are adding a **new kind of image** for Raspberry Pi (starting with Pi 4/5), because Pi boards need different boot files than old Windows PCs. The PC downloads stay as they are. When the first Pi image passes a smoke test, it will show up on the website Download page next to the PC ones.
