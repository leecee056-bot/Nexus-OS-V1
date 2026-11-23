# Source offer (GPL components in Tri-Cass OS images)

Tri-Cass product code in this repository (website, Companion app, Pocket /
Cardputer firmware, and the `portable-ai-os/` hub + build scripts) is licensed
under the **MIT License** — see [`LICENSE`](LICENSE) and
[`portable-ai-os/LICENSE`](portable-ai-os/LICENSE).

The **bootable USB / Pi disk images** on GitHub Releases also include
third-party **GPL** components (notably the Linux kernel and GPL userland).

## Corresponding source (standing offer)

For each published image release we provide or will provide:

1. The **image build scripts** and pins in [`portable-ai-os/`](portable-ai-os/)
   (`scripts/`, `versions.lock`, `portable-ai-os/SBOM.md`).
2. An **SBOM** baseline for that class of image (`portable-ai-os/SBOM.md`).
3. Links or packages for the **Debian / Alpine** source of GPL packages installed
   in that build, plus the **llama.cpp** commit recorded in
   `portable-ai-os/build/llama/COMMIT` / `versions.lock`.

This file is a written offer: corresponding source for GPL parts of a given
Tri-Cass OS image release will be provided on request for **at least three years**
after that release, and is intended to ship alongside future builds in this repo.

Contact: https://github.com/leecee056-bot/Nexus-OS-V1/issues

## What is public in this repo

| Tree | Licence | Notes |
|------|---------|--------|
| Website (`src/`, `public/`) | MIT | This repo |
| Companion (`nexus-app/`) | MIT | This repo |
| Pocket / Cardputer firmware | MIT | This repo |
| Image build + hub (`portable-ai-os/`) | MIT (+ GPL in shipped images) | Scripts, TUI, SBOM, artifact checksums — not the raw `.img` blobs |

## Boot honesty (v1 images)

Current v1 images are **unsigned** and primarily exercised on **legacy / BIOS
(CSM)** style USB boot. **UEFI + Secure Boot dual-signed** boot is planned
(HAP-64). See [/compat](/compat) for the honest hardware matrix.
