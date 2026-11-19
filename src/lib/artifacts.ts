const USB_RELEASE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/v1.0.0-usb";

const PI_RELEASE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/v1.0.0-pi";

export const RELEASE_PAGE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/v1.0.0-usb";

export const PI_RELEASE_PAGE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/v1.0.0-pi";

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
    sizeBytes: 479461624,
    sizeLabel: "~458 MB download → about 3 GB after unpacking",
    sha256xz:
      "96a164b8e94b3dc9d12614805d6e4777d5ec7751e8337e79c6c04569f9a0b1ca",
    sha256:
      "0d490700300b91b7f4d1d983ee1d39f75d6f27248200a2aeffc1d0e1276e8877",
    guidance:
      "For most modern and mid-2000s+ PCs that already run 64-bit Windows or Linux.",
  },
  {
    arch: "i686",
    label: "32-bit / older PC (i686)",
    filename: "portable-ai-os-i686.img",
    downloadName: "portable-ai-os-i686.img.xz",
    downloadUrl: `${USB_RELEASE}/portable-ai-os-i686.img.xz`,
    sizeBytes: 735020108,
    sizeLabel: "~701 MB download → about 3 GB after unpacking",
    sha256xz:
      "ac3afb547bd223a121068ea73e9f3c46e1f2ce078553001171b8455b15d7aef4",
    sha256:
      "b9a3820ebed6025d81a3670897573b02ca958ac2a5b18b624b24ce0825104465",
    guidance:
      "Prefer this for XP-era or true 32-bit machines. If the PC is very old and you are unsure, start here.",
  },
] as const;

export const PI_ARTIFACTS = [
  {
    arch: "aarch64",
    label: "Raspberry Pi 4 (64-bit) — primary",
    filename: "portable-ai-os-aarch64.img",
    downloadName: "portable-ai-os-aarch64.img.xz",
    downloadUrl: `${PI_RELEASE}/portable-ai-os-aarch64.img.xz`,
    sizeBytes: 923230452,
    sizeLabel: "~881 MB download → about 4 GB after unpacking",
    sha256xz:
      "ab55937df18bc05f9a00c29b26098b874c50ecad6e31c003b4cf5f08f29c40a7",
    sha256:
      "7aa7341853a9f290f2637363b14f8cc2d21a90a3fb19d3697891c213e6b7f72d",
    guidance:
      "Flash this to a microSD card for Raspberry Pi 4 (2 GB+ RAM; 4 GB+ preferred). Same file may work on Pi 5, but Pi 5 is best-effort — some boards need a firmware/dtb follow-up if they will not boot.",
  },
] as const;

export const BUILD_NOTE =
  "Pick a PC USB image or the Raspberry Pi microSD image, unpack the .xz, then flash the .img with Etcher. Full walkthrough on the Setup page.";
