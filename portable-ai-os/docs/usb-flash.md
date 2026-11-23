# How to put Tri-Cass OS on a USB stick and boot an old PC

This is a **real Linux USB OS** — it does **not** run inside Windows.  
Cold-boot from the stick into the **Tri-Cass OS** hub TUI.

(Folder name on disk is still `portable-ai-os/`.)

## Artifacts (this worker)

| Arch | Path | SHA256 |
|------|------|--------|
| **x86_64** | `/agent/portable-ai-os-images/portable-ai-os-x86_64.img` | see `build/images/SHA256SUMS` |
| **i686** (XP-era 32-bit) | `/agent/portable-ai-os-images/portable-ai-os-i686.img` | see `build/images/SHA256SUMS` |

Store pointers: `build/images/ARTIFACT-*.txt`

Rebuild:

```bash
bash scripts/build-usb-image.sh x86_64   # Ubuntu 24.04 noble
bash scripts/build-usb-image.sh i686     # Debian 12 bookworm i386
```

## Flash

```bash
# Identify the stick carefully (lsblk). Example /dev/sdX — whole disk, not a partition.
sudo dd if=/agent/portable-ai-os-images/portable-ai-os-i686.img \
  of=/dev/sdX bs=4M status=progress conv=fsync
sync
```

Or **balenaEtcher** / Raspberry Pi Imager (custom `.img`).

Use **i686** on true 32-bit XP-era boxes; **x86_64** on 64-bit capable CPUs (SSE4.2+).

## Boot

1. BIOS: USB / Removable first. Disable **Secure Boot** (unsigned v1).
2. Prefer **legacy/CSM** USB boot on UEFI machines.
3. First-boot wizard: theme · image gen · model → **main menu hub**.

## On the stick

| Part | Label | Role |
|------|-------|------|
| 1 | `AI_SYS` | OS, kernel, llama, hub TUI, bundled SmolLM2 |
| 2 | `AI_DATA` | Writable config, images, knowledge vault, extra models |

Bundled: **SmolLM2 135M** (Apache-2.0). Add GGUFs under `/data/models/`.  
Knowledge Vault starter pack (guide + glossary + how-tos) under `/data/knowledge/raw/`.

**Tri-Cass Network** appears in the menu as a stub (offline / not connected). Offline AI does not require it.

## QEMU (same image)

```bash
bash scripts/test-usb-qemu.sh x86_64
bash scripts/test-usb-qemu.sh i686
```

Host hub smoke: `../../media/nexus-hub-host-smoke-highlights.txt`.  
Boot smoke: `../../media/qemu-usb-*-serial.log`.
