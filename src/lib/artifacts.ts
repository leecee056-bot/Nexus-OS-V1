const USB_RELEASE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/v1.0.2-usb";

const PI_RELEASE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/v1.0.2-pi";

export const RELEASE_PAGE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/v1.0.2-usb";

export const PI_RELEASE_PAGE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/v1.0.2-pi";

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
    sizeBytes: 516880360,
    sizeLabel: "~493 MB download → about 3 GB after unpacking",
    sha256xz:
      "ebb971eac54ca492b2d0460f28aa4ab77d346f84de57d7473ed63d291d7117c5",
    sha256:
      "94338b010768bc5ba729dc2f3fed567a77871de7bcf4e37789a6d2a3e987ac29",
    guidance:
      "For most modern and mid-2000s+ PCs that already run 64-bit Windows or Linux. Tri-Cass hub + Pocket Agent scaffolds + Knowledge Vault starter pack.",
  },
  {
    arch: "i686",
    label: "32-bit / older PC (i686)",
    filename: "portable-ai-os-i686.img",
    downloadName: "portable-ai-os-i686.img.xz",
    downloadUrl: `${USB_RELEASE}/portable-ai-os-i686.img.xz`,
    sizeBytes: 584556812,
    sizeLabel: "~558 MB download → about 3 GB after unpacking",
    sha256xz:
      "f4ff4ab255f6d40c76c53ab480dd9406454158cad26cc89fb5388f85066e3f90",
    sha256:
      "243c850128c7b868dd872373da4648c1ca9e34f4afaaecf2e74c1921385b5001",
    guidance:
      "Prefer this for XP-era or true 32-bit machines. If the PC is very old and you are unsure, start here. Tri-Cass hub + Pocket Agent scaffolds + Knowledge Vault starter pack.",
  },
] as const;

export const PI_ARTIFACTS = [
  {
    arch: "aarch64",
    label: "Raspberry Pi 4 / Pi 5 (64-bit) — same image",
    filename: "portable-ai-os-aarch64.img",
    downloadName: "portable-ai-os-aarch64.img.xz",
    downloadUrl: `${PI_RELEASE}/portable-ai-os-aarch64.img.xz`,
    sizeBytes: 843077616,
    sizeLabel: "~804 MB download → about 4 GB after unpacking",
    sha256xz:
      "a1056f9714f2b45318d071d22b1a9c1ce4074e2de77f1d198abc1e10f2936828",
    sha256:
      "bfc6915a14fac8954f49597c29ea23b039e87cb8acdaf1a0c2cc8501f71786c2",
    guidance:
      "Flash this to a microSD card for Raspberry Pi 4 or Pi 5 (2 GB+ RAM; 4 GB+ preferred). One aarch64 image covers both boards. Tri-Cass hub + Pocket Agent scaffolds + Knowledge Vault starter pack.",
  },
] as const;

/** Tri-Cass Pocket — ESP32-S3 firmware (source + flash guide; not a disk image). */
export const POCKET_REPO =
  "https://github.com/leecee056-bot/Nexus-OS-V1/tree/main/nexus-esp32";

export const POCKET_README =
  "https://github.com/leecee056-bot/Nexus-OS-V1/blob/main/nexus-esp32/README.md";

export const POCKET_VERSION = "0.1.0";

export const POCKET_ARTIFACTS = [
  {
    arch: "esp32-s3",
    label: "Tri-Cass Pocket (ESP32-S3)",
    filename: "nexus-esp32",
    sizeLabel: "Firmware source + ~1 MB TinyStories model (stories260K)",
    guidance:
      "USB-Serial offline companion for ESP32-S3 boards with PSRAM (N16R8 / 16 MB flash preferred; 8 MB env available). Flash with PlatformIO, then upload the model to SPIFFS. Serial hub: chat, status, and small tools — no Wi‑Fi required at runtime.",
  },
] as const;

/** Tri-Cass Cardputer ADV — no-PSRAM on-device hub (separate from Pocket). */
export const CARDPUTER_REPO =
  "https://github.com/leecee056-bot/Nexus-OS-V1/tree/main/nexus-cardputer";

export const CARDPUTER_README =
  "https://github.com/leecee056-bot/Nexus-OS-V1/blob/main/nexus-cardputer/README.md";

export const CARDPUTER_VERSION = "0.2.0";

export const CARDPUTER_ARTIFACTS = [
  {
    arch: "cardputer-adv",
    label: "Tri-Cass Cardputer ADV",
    filename: "nexus-cardputer",
    sizeLabel:
      "Firmware + optional microSD Vault example (TinyChat in flash; no neural weights)",
    guidance:
      "Dedicated M5Stack Cardputer ADV firmware (ESP32-S3FN8, 8 MB flash, no PSRAM, 240×135 + keyboard). Green terminal hub on the built-in screen with TinyChat, Notes, and an optional Knowledge Vault on microSD (/tri-cass-vault). Cannot run USB/Pi images or Pocket’s stories260K.",
  },
] as const;

export const BUILD_NOTE =
  "Choose a build: PC USB or Raspberry Pi microSD (release v1.0.2 — Tri-Cass branding + Pocket Agent scaffolds + Knowledge Vault starter pack), Tri-Cass Pocket for ESP32-S3 with PSRAM, Cardputer ADV firmware, Companion apps (Windows / Mac / Android / web), or the Companion USB portable kit. Disk images unpack from .xz and flash with Etcher; Pocket/Cardputer use PlatformIO. Pi 4 and Pi 5 share the same aarch64 image. Full walkthrough on the Setup page.";

/**
 * Companion app — Chat/Vault/Packs with local AI (not the bootable OS).
 * Site download buttons must point at a release that already has assets.
 * Desktop package version may be ahead (see nexus-app/package.json); bump
 * these URLs only after the companion-v* Windows/Mac/USB/Android files exist.
 */
export const COMPANION_VERSION = "0.12.2";

export const COMPANION_RELEASE_PAGE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/companion-v0.12.2";

/** Preferred Windows install — creates Desktop + Start Menu shortcuts with icon. */
export const COMPANION_WINDOWS_SETUP_URL =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.12.2/NEXUS-Companion-Windows-0.12.2-setup.exe";

export const COMPANION_WINDOWS_URL =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.12.2/NEXUS-Companion-Windows-0.12.2-setup.exe";

export const COMPANION_WINDOWS_PORTABLE_URL =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.12.2/NEXUS-Companion-Windows-0.12.2-portable.exe";

/** Apple Silicon Mac installer. */
export const COMPANION_MAC_ARM64_URL =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.12.2/NEXUS-Companion-Mac-0.12.2-arm64.dmg";

/** Intel Mac installer. */
export const COMPANION_MAC_X64_URL =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.12.2/NEXUS-Companion-Mac-0.12.2-x64.dmg";

/** @deprecated Prefer COMPANION_MAC_ARM64_URL / COMPANION_MAC_X64_URL */
export const COMPANION_MAC_URL = COMPANION_MAC_ARM64_URL;

export const COMPANION_USB_URL =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.12.2/NEXUS-Companion-USB-0.12.2.zip";

export const COMPANION_ANDROID_URL =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/companion-v0.12.2/NEXUS-Companion-Android-0.12.2.apk";

export const COMPANION_WEB_URL = "/companion/";

export const COMPANION_ANDROID_NOTES =
  "https://nexus-os.apps.grok.bot/guides/android-apk.md";
