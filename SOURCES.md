# Source offer (GPL components in Tri-Cass OS images)

Tri-Cass product code in this repository (website, Companion app, Pocket /
Cardputer firmware) is licensed under the **MIT License** — see [`LICENSE`](LICENSE).

The **bootable USB / Pi disk images** distributed on GitHub Releases include
third-party GPL components (notably the Linux kernel and GPL userland). Those
binaries are **not** built from this website repo alone.

## Corresponding source

We intend to publish, with each image release:

1. The **image build scripts** and package list used to produce that release.
2. An **SBOM** / package inventory for the rootfs.
3. A written **GPL source offer** covering kernel and GPL userland (or links to
   the exact Debian/Ubuntu source packages used for that build).

Until that packaging lands in a public git tree (tracker **HAP-63**), treat
this file as the standing note: corresponding source for GPL parts of a given
release will be provided on request for at least three years after that
release, and will be published alongside future builds.

Contact via the project GitHub:
https://github.com/leecee056-bot/Nexus-OS-V1/issues

## What is already public here

| Tree | Licence | Notes |
|------|---------|--------|
| Website (`src/`, `public/`) | MIT | This repo |
| Companion (`nexus-app/`) | MIT | This repo |
| Pocket / Cardputer firmware | MIT | This repo |
| USB / Pi image build scripts | Pending publish | Tracked as HAP-63 |

## Boot honesty (v1 images)

Current v1 images are **unsigned** and primarily exercised on **legacy / BIOS
(CSM)** style USB boot. **UEFI + Secure Boot dual-signed** boot is planned
(HAP-64). Do not treat “turn Secure Boot off” as the long-term product path.
