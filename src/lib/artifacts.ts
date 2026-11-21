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

/** NEXUS Pocket — ESP32-S3 firmware (source + flash guide; not a disk image). */
export const POCKET_REPO =
  "https://github.com/leecee056-bot/Nexus-OS-V1/tree/main/nexus-esp32";

export const POCKET_README =
  "https://github.com/leecee056-bot/Nexus-OS-V1/blob/main/nexus-esp32/README.md";

export const POCKET_VERSION = "0.1.0";

export const POCKET_ARTIFACTS = [
  {
    arch: "esp32-s3",
    label: "NEXUS Pocket (ESP32-S3)",
    filename: "nexus-esp32",
    sizeLabel: "Firmware source + ~1 MB TinyStories model (stories260K)",
    guidance:
      "USB-Serial offline companion for ESP32-S3 boards with PSRAM (N16R8 / 16 MB flash preferred; 8 MB env available). Flash with PlatformIO, then upload the model to SPIFFS. Serial hub: chat, status, and small tools — no Wi‑Fi required at runtime.",
  },
] as const;

/** NEXUS Cardputer ADV — no-PSRAM on-device hub (separate from Pocket). */
export const CARDPUTER_REPO =
  "https://github.com/leecee056-bot/Nexus-OS-V1/tree/main/nexus-cardputer";

export const CARDPUTER_README =
  "https://github.com/leecee056-bot/Nexus-OS-V1/blob/main/nexus-cardputer/README.md";

export const CARDPUTER_VERSION = "0.2.0";

export const CARDPUTER_ARTIFACTS = [
  {
    arch: "cardputer-adv",
    label: "NEXUS Cardputer ADV",
    filename: "nexus-cardputer",
    sizeLabel:
      "Firmware + optional microSD Vault example (TinyChat in flash; no neural weights)",
    guidance:
      "Dedicated M5Stack Cardputer ADV firmware (ESP32-S3FN8, 8 MB flash, no PSRAM, 240×135 + keyboard). Green terminal hub on the built-in screen with TinyChat, Notes, and an optional Knowledge Vault on microSD (/nexus-vault). Cannot run USB/Pi images or Pocket’s stories260K.",
  },
] as const;

export const BUILD_NOTE =
  "Choose a build: PC USB or Raspberry Pi microSD (v1.0.1 — Knowledge Vault starter pack), NEXUS Pocket for ESP32-S3 with PSRAM, Cardputer ADV firmware, Companion apps (Windows / Mac / Android / web), or the Companion USB portable kit (carry Chat + Vault on a stick). Disk images unpack from .xz and flash with Etcher; Pocket/Cardputer use PlatformIO. Full walkthrough on the Setup page.";

/** Companion app — Chat/Vault/Packs with local AI (not the bootable OS). */
export const COMPANION_VERSION = "0.10.0";

export const COMPANION_RELEASE_PAGE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/companion-v0.10.0";

export const COMPANION_WINDOWS_URL =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.10.0/NEXUS-Companion-Windows-0.10.0-portable.exe";

export const COMPANION_MAC_URL =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/companion-v0.10.0";

export const COMPANION_USB_URL =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.10.0/NEXUS-Companion-USB-0.10.0.zip";

export const COMPANION_ANDROID_URL =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.10.0/NEXUS-Companion-Android-0.10.0.apk";

export const COMPANION_WEB_URL = "/companion/";

export const COMPANION_ANDROID_NOTES =
  "https://nexus-os.apps.grok.bot/guides/android-apk.md";
