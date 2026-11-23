# SBOM — Tri-Cass OS image (v1.0.1-class)

Software bill of materials for the **bootable** USB / Pi images built from this
tree. Website and Companion dependencies are separate (root `package.json` /
`nexus-app/package.json`).

Generated from `versions.lock`, build scripts, and release artifact notes.
Rebuild dates and exact package lists may vary slightly per architecture; treat
this as the declared baseline for trust/review.

## Build pins (`versions.lock`)

| Component | Version / pin | Licence (upstream) | Notes |
|-----------|---------------|--------------------|--------|
| Alpine Linux (prototype rootfs path) | 3.20.3 (`v3.20`) | Multiple (see Alpine) | Early Alpine path; USB/Pi releases also use Debian-family tooling in `build-usb-image.sh` / `build-rpi-image.sh` |
| llama.cpp | tag `b4600` · commit `553f1e46e9e864514bbd6bf4009146db66be0541` | MIT | Built via `scripts/build-llama.sh`; `llama-server` bound to `127.0.0.1` |
| QEMU test defaults | host x86_64, 4096 MB RAM | GPL-2.0 (QEMU) | Dev/test only — not shipped on the stick |

## Inference defaults (image)

| Setting | Value |
|---------|--------|
| Bind | `127.0.0.1` (not LAN) |
| Context tiers | 512 / 2048 / 4096 tokens (`infer.n_ctx_t0`…`t2`) |
| Starter model | SmolLM2 ~135M GGUF (downloaded; not stored in git) |

## Image layout (USB)

| Piece | Detail |
|-------|--------|
| Boot (default) | MBR + extlinux / SYSLINUX |
| Boot (`ENABLE_UEFI=1`) | GPT ESP + Debian `shim-signed` / `grub-efi-amd64-signed` + BIOS extlinux retained (HAP-64) |
| Partitions | `AI_SYS` + `AI_DATA` (+ `TRI_CASS_ESP` when UEFI enabled) |
| Hub | Python curses TUI in `tui/` |
| Network | Stub only — offline by default |

UEFI vendor `.deb` blobs are **not** in git; see `scripts/fetch-uefi-shim.sh` and
`docs/uefi-secure-boot.md`.

## Related scaffolds

| Track | Path |
|-------|------|
| HAP-65 CPU variants | `scripts/build-llama-all-variants.sh` |
| HAP-66 model ladder | `scripts/select-model.sh` |
| HAP-68 signed updates | `scripts/updates/` |

## Release artifact pointers

See `build/images/ARTIFACT-*.txt` and `build/images/SHA256SUMS*` for the last
recorded image sizes / hashes for x86_64, i686, and aarch64. The binary images
themselves are distributed via GitHub Releases, not this repository.

## GPL corresponding source

Distributing the disk image means distributing GPL-covered binaries (kernel and
GPL userland). Corresponding source and build scripts for a given release are
offered in:

- this `portable-ai-os/` tree (build scripts + pins),
- root [`SOURCES.md`](../SOURCES.md) (standing written offer),
- and Debian / Alpine upstream package sources for the exact versions installed
  in that build.

Contact: https://github.com/leecee056-bot/Nexus-OS-V1/issues
