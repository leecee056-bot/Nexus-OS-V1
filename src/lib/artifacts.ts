const RELEASE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/download/v1.0.0-usb";

export const RELEASE_PAGE =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases/tag/v1.0.0-usb";

export const RELEASE_SHA256SUMS = `${RELEASE}/SHA256SUMS`;

export const ARTIFACTS = [
  {
    arch: "x86_64",
    label: "x86_64 (64-bit)",
    filename: "portable-ai-os-x86_64.img",
    downloadName: "portable-ai-os-x86_64.img.xz",
    downloadUrl: `${RELEASE}/portable-ai-os-x86_64.img.xz`,
    sizeBytes: 479461624,
    sizeLabel: "~458 MiB (.xz) → ~3.0 GiB .img",
    sha256xz:
      "96a164b8e94b3dc9d12614805d6e4777d5ec7751e8337e79c6c04569f9a0b1ca",
    sha256:
      "0d490700300b91b7f4d1d983ee1d39f75d6f27248200a2aeffc1d0e1276e8877",
    guidance:
      "Use on 64-bit capable CPUs (SSE4.2+). Preferred for modern and mid-2000s+ machines.",
  },
  {
    arch: "i686",
    label: "i686 (32-bit / XP-era)",
    filename: "portable-ai-os-i686.img",
    downloadName: "portable-ai-os-i686.img.xz",
    downloadUrl: `${RELEASE}/portable-ai-os-i686.img.xz`,
    sizeBytes: 735020108,
    sizeLabel: "~701 MiB (.xz) → ~3.0 GiB .img",
    sha256xz:
      "ac3afb547bd223a121068ea73e9f3c46e1f2ce078553001171b8455b15d7aef4",
    sha256:
      "b9a3820ebed6025d81a3670897573b02ca958ac2a5b18b624b24ce0825104465",
    guidance:
      "Prefer this for true 32-bit XP-era boxes. Pick when the machine cannot boot 64-bit Linux.",
  },
] as const;

export const BUILD_NOTE =
  "USB images are public on GitHub Release v1.0.0-usb as .xz archives (GitHub’s 2 GiB limit). Download → decompress → flash the .img.";
