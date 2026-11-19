# How to put NEXUS OS on a USB stick and boot an old PC

This is a **real Linux USB OS** — it does **not** run inside Windows.  
Cold-boot from the stick into the **NEXUS OS** hub TUI.

## Public downloads

Release: https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/v1.0.0-usb

| Arch | File | Notes |
|------|------|-------|
| **i686** (prefer for XP-era 32-bit) | `portable-ai-os-i686.img.xz` | Decompress → flash |
| **x86_64** (SSE4.2+) | `portable-ai-os-x86_64.img.xz` | Decompress → flash |
| Checksums | `SHA256SUMS` | Digests for `.xz` and raw `.img` |

Raw `.img` files are ~3 GiB (over GitHub’s 2 GiB limit), so public assets are **xz-compressed**.

## Decompress

```bash
xz -d portable-ai-os-i686.img.xz
# Windows: extract with 7-Zip → portable-ai-os-i686.img
```

## Verify

```bash
sha256sum -c SHA256SUMS
# expect: portable-ai-os-*.img: OK (after decompress)
```

## Flash

```bash
# Identify the stick carefully (lsblk). Example /dev/sdX — whole disk, not a partition.
sudo dd if=portable-ai-os-i686.img \
  of=/dev/sdX bs=4M status=progress conv=fsync
sync
```

Or **balenaEtcher** / Raspberry Pi Imager — select the decompressed `.img` (not the `.xz`).

## Boot

1. BIOS: USB / Removable first. Disable **Secure Boot** (unsigned v1).
2. Prefer **legacy/CSM** USB boot on UEFI machines.
3. First-boot wizard → theme / image gen / model → **main menu hub**.

## Notes

- NEXUS Network is a stub on these images (offline AI works with Network off).
- Site: https://nexus-os.apps.grok.bot
