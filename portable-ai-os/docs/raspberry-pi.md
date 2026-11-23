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
- **Pocket Agent** templates + Agents tools (`scaffold` / `make` / `write`) under
  `/data/projects/` — same as PC USB. See [`pocket-agent.md`](pocket-agent.md).

## Pi 4 vs Pi 5 (same image)

| | Pi 5 (preferred) | Pi 4 (budget) |
|--|------------------|---------------|
| Role | Primary offline builder | Lite / slower |
| RAM | 4–8 GB recommended | 2–8 GB (4 GB+ nicer) |
| Model ladder | Prefer ~1.5B–3B Q4 when present | Stick to ~0.5B–1.5B rescue |
| Storage | NVMe HAT or fast USB SSD | USB 3 SSD preferred over SD |
| Cooling | Active cooler | Heatsink + fan |
| `config.txt` | `[pi5]` block present | Default aarch64 boot |

One flash image covers both boards (`build-rpi-image.sh`). Expectation: Pi 4
builds take longer; set N_CTX / thread knobs lower if Chat feels stuck.

## Not in this cut

- Pi 1 / classic Zero (`armhf`) — later if needed
- Claiming every Pi board without a tested image
- Replacing your Pi OS install without warning — flashing a whole card erases it
- Full grammar-constrained JSON tool loop + sandboxed `run()` (follow-up)

## PC vs Pi

| | PC USB | Pi |
|--|--------|-----|
| Download | `v1.0.0-usb` | `v1.0.0-pi` |
| Boot | BIOS/USB | Pi firmware on the card |
| Pocket Agent | Hub → Agents | Same |

See also: store docs `nexus-os-raspberry-pi-plan.md`, `nexus-os-pi-release.md`.
