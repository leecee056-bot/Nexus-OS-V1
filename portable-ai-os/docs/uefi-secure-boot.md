# HAP-64 — UEFI + Secure Boot (keep BIOS)

Status: **scaffolded in-repo**. Default `build-usb-image.sh` still produces the
proven **BIOS / MBR + extlinux** v1 image. Opt in with `ENABLE_UEFI=1` once
signed shim packages are fetched.

## Goal

Boot Tri-Cass OS on modern PCs **with Secure Boot on**, without dropping the
old-PC **legacy / BIOS** path.

| Path | Loader | Secure Boot |
|------|--------|-------------|
| Legacy / CSM | extlinux on `AI_SYS` + MBR (today’s default) | N/A |
| UEFI | `EFI/BOOT/BOOTX64.EFI` = **shim** → GRUB → kernel | On (Microsoft 3rd-party CA) |

## Why Debian-family dual-signed shim

New firmwares may carry only the **2023** Microsoft UEFI CA; older sticks signed
only for the **2011** CA fail there. Debian’s `shim-signed` / `grub-efi-amd64-signed`
chain targets both. Do **not** ship an unsigned `BOOTX64.EFI` and tell users to
turn Secure Boot off as the primary path.

Reference pins live in `versions.lock` (`uefi.*` keys) and are downloaded by
`scripts/fetch-uefi-shim.sh` into `build/uefi/vendor/` (gitignored blobs).

## Target GPT layout (`ENABLE_UEFI=1`)

```
p1  ESP      FAT32  ~256 MiB   LABEL=TRI_CASS_ESP   (EFI system, boot)
p2  AI_SYS   ext4   rest−data  LABEL=AI_SYS         (root + hub)
p3  AI_DATA  ext4   ~384 MiB   LABEL=AI_DATA        (persistence)
```

ESP contents (after `install-uefi-esp.sh`):

```
EFI/BOOT/BOOTX64.EFI          ← shim (removable-media path)
EFI/ubuntu/ or EFI/debian/    ← grubx64.efi + grub.cfg (distro layout)
EFI/tri-cass/grub.cfg         ← our menu (also copied to BOOT)
```

BIOS machines still boot via **extlinux + mbr.bin** on the same image when a
hybrid/protective MBR boot flag is written (see build script). i686 images stay
BIOS-only (no 32-bit Secure Boot product path in v1).

## Build flow

```bash
# 1) Fetch signed packages (needs network + ar/tar)
bash scripts/fetch-uefi-shim.sh

# 2) Build image with ESP + BIOS retained
ENABLE_UEFI=1 bash scripts/build-usb-image.sh x86_64
```

If vendor packages are missing, `ENABLE_UEFI=1` **fails closed** with a clear
error (does not silently ship unsigned EFI).

## Verification checklist (before claiming Download)

1. QEMU UEFI: OVMF + Secure Boot enrolled with Microsoft + Debian/3rd-party CA.
2. One real 2020+ laptop with Secure Boot **On** boots the stick.
3. One legacy BIOS / CSM machine still boots (extlinux path).
4. Setup / compat docs no longer lead with “turn Secure Boot off”.

## Out of scope here

- Releasing a new signed `.img` on GitHub (needs a builder with the packages and
  smoke hardware).
- Apple Silicon USB boot.
- 32-bit UEFI tablets (`BOOTIA32.EFI`) — later tangent.
