# i686 (T0) — shipped image path

v1 ships **`portable-ai-os-i686.img`** for true 32-bit XP-era BIOS boxes.

## Artifact

| Item | Value |
|------|--------|
| Path | `/agent/portable-ai-os-images/portable-ai-os-i686.img` |
| Base | Debian 12 bookworm **i386** (Ubuntu noble has no i386 kernel) |
| Boot | MBR + extlinux |
| Kernel | `linux-image-686` |
| llama | Built **inside** the guest rootfs (matches bookworm glibc) |
| Models | SmolLM2 135M Q4_K_M + Q8_0 |
| QEMU gate | `qemu-system-i386 -m 1536` → SMOKE_OK |

## Build

```bash
# 1) Optional host -m32 llama is NOT used for the stick (glibc mismatch).
#    The image builder seeds bins, then rebuild in-guest if needed.
bash scripts/build-usb-image.sh i686
```

If host-copied i686 libs fail with `GLIBC_2.38 not found`, chroot the image and rebuild llama (done for the verified artifact).

## Flash & boot

See [`usb-flash.md`](usb-flash.md). Prefer this image on 32-bit-only CPUs.
