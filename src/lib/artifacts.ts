const USB_RELEASE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/v1.0.3-usb";

const PI_RELEASE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/v1.0.3-pi";

export const RELEASE_PAGE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/v1.0.3-usb";

export const PI_RELEASE_PAGE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/v1.0.3-pi";

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
    sizeBytes: 529474684,
    sizeLabel: "~505 MB download → about 3 GB after unpacking",
    sha256xz:
      "db82246baabb26fc4506c5a452d0c67bb9826bd2918669ea31c78d5710cba370",
    sha256:
      "96cd6d21fa42e0c8dea9332ca03be25ab40ddeefe1043eeb255940f6b01549e2",
    guidance:
      "For most modern and mid-2000s+ PCs that already run 64-bit Windows or Linux. Tri-Cass hub + Cline-parity Pocket Agent + Knowledge Vault starter pack.",
  },
  {
    arch: "i686",
    label: "32-bit / older PC (i686)",
    filename: "portable-ai-os-i686.img",
    downloadName: "portable-ai-os-i686.img.xz",
    downloadUrl: `${USB_RELEASE}/portable-ai-os-i686.img.xz`,
    sizeBytes: 619145528,
    sizeLabel: "~591 MB download → about 3 GB after unpacking",
    sha256xz:
      "895e8877129758ca1f16fd5a7726b69ec09f7e77343ee9306296687beb088e34",
    sha256:
      "736eec0ea350f6274a775698cd3217ca704411b32dddabf75cf9b84f78e1eb38",
    guidance:
      "Prefer this for XP-era or true 32-bit machines. If the PC is very old and you are unsure, start here. Tri-Cass hub + Cline-parity Pocket Agent + Knowledge Vault starter pack.",
  },
] as const;

export const PI_ARTIFACTS = [
  {
    arch: "aarch64",
    label: "Raspberry Pi 4 / Pi 5 (64-bit) — same image",
    filename: "portable-ai-os-aarch64.img",
    downloadName: "portable-ai-os-aarch64.img.xz",
    downloadUrl: `${PI_RELEASE}/portable-ai-os-aarch64.img.xz`,
    sizeBytes: 892211324,
    sizeLabel: "~851 MB download → about 4 GB after unpacking",
    sha256xz:
      "ea3d349957a4127bd1dbda06c1d862bb2b7de9ba8bb77475d3c5bad319e8bfd5",
    sha256:
      "931856c0d3e952954272c6de241546f6ebd9f04fd4f7f7b448e214111c4febd4",
    guidance:
      "Flash this to a microSD card for Raspberry Pi 4 or Pi 5 (2 GB+ RAM; 4 GB+ preferred). One aarch64 image covers both boards. Tri-Cass hub + Cline-parity Pocket Agent + Knowledge Vault starter pack.",
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
  "Choose a build: PC USB or Raspberry Pi microSD (release v1.0.3 — Tri-Cass branding + Cline-parity Pocket Agent + Knowledge Vault starter pack), Tri-Cass Pocket for ESP32-S3 with PSRAM, Cardputer ADV firmware, Companion apps (Windows / Mac / Android / web), Tri-Cass Desk, or the Companion USB portable kit. Disk images unpack from .xz and flash with Etcher; Pocket/Cardputer use PlatformIO. Pi 4 and Pi 5 share the same aarch64 image. Full walkthrough on the Setup page.";

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

/**
 * Tri-Cass Desk — living desktop companion (separate repo).
 * Bump URLs only after the matching Tri-Cass-Desk release assets exist.
 */
export const DESK_VERSION = "0.3.2";

export const DESK_RELEASE_PAGE =
  "https://github.com/leecee056-bot/Tri-Cass-Desk/releases/tag/v0.3.2";

export const DESK_RELEASES_LATEST =
  "https://github.com/leecee056-bot/Tri-Cass-Desk/releases/latest";

/** Windows x64 NSIS setup (desktop + Start Menu). */
export const DESK_WINDOWS_SETUP_URL =
  "https://github.com/leecee056-bot/Tri-Cass-Desk/releases/download/v0.3.2/Tri-Cass-Desk-0.3.2-win-x64.exe";

export const DESK_REPO_URL = "https://github.com/leecee056-bot/Tri-Cass-Desk";
