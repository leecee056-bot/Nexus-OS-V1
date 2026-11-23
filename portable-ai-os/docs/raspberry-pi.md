# Tri-Cass OS on Raspberry Pi

**Status:** **Available** — GitHub Release [`v1.0.0-pi`](https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/v1.0.0-pi).

## Download

- https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/v1.0.0-pi/portable-ai-os-aarch64.img.xz  
- Checksums: https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/v1.0.0-pi/SHA256SUMS  

```bash
xz -d portable-ai-os-aarch64.img.xz
sha256sum -c SHA256SUMS
```

Flash with [Raspberry Pi Imager](https://www.raspberrypi.com/software/) → Use custom, or balenaEtcher / `dd`.

## First image

- **64-bit (`aarch64`)** for **Raspberry Pi 4 and Pi 5** (2 GB+ RAM; 4 GB+ nicer)
- Same offline hub / SmolLM2 idea as the PC USB stick
- HDMI + USB keyboard

## Not in this cut

- Pi 1 / classic Zero (`armhf`) — later if needed
- Claiming every Pi board without a tested image
- Replacing your Pi OS install without warning — flashing a whole card erases it

## PC vs Pi

| | PC USB | Pi |
|--|--------|-----|
| Download | `v1.0.0-usb` | `v1.0.0-pi` |
| Boot | BIOS/USB | Pi firmware on the card |

See also: store docs `nexus-os-raspberry-pi-plan.md`, `nexus-os-pi-release.md`.
