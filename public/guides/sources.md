# Source / GPL note (Tri-Cass OS images)

Product code in the GitHub repo (website, Companion, Pocket, Cardputer) is
**MIT**. Bootable USB / Pi images also ship **GPL** components (Linux kernel
and GPL userland).

Standing source offer and status: see [`SOURCES.md`](https://github.com/leecee056-bot/Nexus-OS-V1/blob/main/SOURCES.md)
in the repository. Publishing full image build scripts + SBOM is tracked as
**HAP-63**.

## Boot honesty (v1)

v1 images are **unsigned** and prefer **legacy / BIOS (CSM)** USB boot.
**UEFI + Secure Boot** dual-signed boot is planned (**HAP-64**).
