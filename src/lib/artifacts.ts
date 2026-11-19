const USB_RELEASE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/v1.0.1-usb";

const PI_RELEASE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/v1.0.1-pi";

export const RELEASE_PAGE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/v1.0.1-usb";

export const PI_RELEASE_PAGE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/v1.0.1-pi";

export const RELEASE_SHA256SUMS = `${USB_RELEASE}/SHA256SUMS`;
export const PI_RELEASE_SHA256SUMS = `${PI_RELEASE}/SHA256SUMS`;

/** @deprecated Prefer ARTIFACTS (PC USB) + PI_ARTIFACTS */
export const ARTIFACTS = [
  {
    arch: "x86_64",
    label: "64-bit PC (x86_64)",
    filename: "portable-ai-os-x86_64.img",
    downloadName: "portable-ai-os-x86_64.img.xz",
    downloadUrl: `${USB_RELEASE}/portable-ai-os-x86_64.img.xz`,
    sizeBytes: 479475712,
    sizeLabel: "~457 MB download → about 3 GB after unpacking",
    sha256xz:
      "3a12751be42dcc31d8118424de2cddd00bf2c4f4e65293e4cdf152f219e77814",
    sha256:
      "a397f4cf303c35d9add60651dc562823662f5bd9d03b3c0ad1380e5dddfd06c5",
    guidance:
      "For most modern and mid-2000s+ PCs that already run 64-bit Windows or Linux. Includes the Knowledge Vault starter pack.",
  },
  {
    arch: "i686",
    label: "32-bit / older PC (i686)",
    filename: "portable-ai-os-i686.img",
    downloadName: "portable-ai-os-i686.img.xz",
    downloadUrl: `${USB_RELEASE}/portable-ai-os-i686.img.xz`,
    sizeBytes: 735022940,
    sizeLabel: "~701 MB download → about 3 GB after unpacking",
    sha256xz:
      "8c4db63a35dd718968f8890503f82e83e7aec325e57af79404dd478de1a7b2d8",
    sha256:
      "fb2b39abeb025a1040178dd1eb327206538df2c31ba1cc2a05089bb7ba661e43",
    guidance:
      "Prefer this for XP-era or true 32-bit machines. If the PC is very old and you are unsure, start here. Includes the Knowledge Vault starter pack.",
  },
] as const;

export const PI_ARTIFACTS = [
  {
    arch: "aarch64",
    label: "Raspberry Pi 4 (64-bit) — primary",
    filename: "portable-ai-os-aarch64.img",
    downloadName: "portable-ai-os-aarch64.img.xz",
    downloadUrl: `${PI_RELEASE}/portable-ai-os-aarch64.img.xz`,
    sizeBytes: 923217144,
    sizeLabel: "~880 MB download → about 4 GB after unpacking",
    sha256xz:
      "199967b3e95cb5f274a2842996121d7c59de7d758e427777519371417a52b839",
    sha256:
      "777419a193379d37f3d7f26c69af8410800dca1651a9f6237c2cba17139abc8b",
    guidance:
      "Flash this to a microSD card for Raspberry Pi 4 (2 GB+ RAM; 4 GB+ preferred) — a good base for cyberdecks and portable Pi kits. Same file may work on Pi 5, but Pi 5 is best-effort; some boards may need a software update later if they will not boot. Includes the Knowledge Vault starter pack.",
  },
] as const;

export const BUILD_NOTE =
  "Pick a PC USB image or the Raspberry Pi microSD image (v1.0.1 — Knowledge Vault starter pack), unpack the .xz, then flash the .img with Etcher. Full walkthrough on the Setup page.";
