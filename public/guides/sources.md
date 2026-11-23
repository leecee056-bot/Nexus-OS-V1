# Source / GPL note (Tri-Cass OS images)

Product code in the GitHub repo (website, Companion, Pocket, Cardputer, and the
`portable-ai-os/` hub + build scripts) is **MIT**. Bootable USB / Pi images also
ship **GPL** components (Linux kernel and GPL userland).

Standing source offer: [`SOURCES.md`](https://github.com/leecee056-bot/Nexus-OS-V1/blob/main/SOURCES.md)  
SBOM baseline: [`portable-ai-os/SBOM.md`](https://github.com/leecee056-bot/Nexus-OS-V1/blob/main/portable-ai-os/SBOM.md)  
Build tree: [`portable-ai-os/`](https://github.com/leecee056-bot/Nexus-OS-V1/tree/main/portable-ai-os)

## Boot honesty (v1)

v1 images are **unsigned** and prefer **legacy / BIOS (CSM)** USB boot.
**UEFI + Secure Boot** dual-signed boot is planned (**HAP-64**).
Hardware matrix: [/compat](/compat).
