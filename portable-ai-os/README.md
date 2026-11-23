# Tri-Cass OS — image build tree (`portable-ai-os/`)

Source used to build the **bootable USB / Pi disk images** for Tri-Cass OS.
Folder name stays `portable-ai-os/` for continuity with older paths and release
artifacts (`portable-ai-os-*.img.xz`).

Product website and Companion live in the repo root / `nexus-app/` — this tree
is the offline OS image.

## What is in git

| Path | Role |
|------|------|
| `scripts/` | USB / Pi image build, llama.cpp build, QEMU test, model download |
| `tui/` | Curses hub (Chat, Vault, Files, …) |
| `configs/` | Infer / UI / model policy |
| `catalog/` | Model catalog metadata |
| `knowledge/` | Starter Vault plain-text pack |
| `docs/` | Flash / Pi notes for builders |
| `versions.lock` | Pinned Alpine + llama.cpp revisions |
| `build/images/` | Release artifact pointers + SHA256 lists (not the `.img` blobs) |
| `build/llama/COMMIT` | llama.cpp commit used for shipped builds |
| `SBOM.md` | Software bill of materials for a v1.0.1-class image |

**Not in git:** raw `.img` / `.xz` images, rootfs tarballs, GGUF weights, or
compiled `llama-server` binaries. Download images from [GitHub Releases](https://github.com/leecee056-bot/Nexus-OS-V1/releases);
pull models with `scripts/download-models.sh`.

## Licence

- Tri-Cass / hub / scripts in this tree: **MIT** — see [`LICENSE`](LICENSE).
- Shipped images also contain **GPL** components (Linux kernel + GPL userland).
  See root [`SOURCES.md`](../SOURCES.md) for the GPL source offer.

## Rebuild (developer machine)

```bash
# From this directory — needs root/disk tools; long-running:
bash scripts/build-usb-image.sh x86_64
bash scripts/build-usb-image.sh i686
bash scripts/build-rpi-image.sh
```

QEMU smoke: `bash scripts/test-usb-qemu.sh x86_64`

## Boot honesty (v1)

Default images use **MBR + extlinux** (legacy / BIOS-friendly) and are
**unsigned** for Secure Boot. Prefer CSM/legacy USB boot until a signed release
is published.

### HAP-64 scaffold (UEFI + Secure Boot, keep BIOS)

```bash
bash scripts/fetch-uefi-shim.sh          # Debian dual-signed shim+GRUB → build/uefi/vendor/
ENABLE_UEFI=1 bash scripts/build-usb-image.sh x86_64
```

Design notes: [`docs/uefi-secure-boot.md`](docs/uefi-secure-boot.md). Default
builds (no `ENABLE_UEFI`) stay BIOS-only so existing flash docs keep working.

Honest machine matrix: [/compat](https://nexus-os.apps.grok.bot/compat).
