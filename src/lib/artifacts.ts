export const ARTIFACTS = [
  {
    arch: "x86_64",
    label: "x86_64 (64-bit)",
    filename: "portable-ai-os-x86_64.img",
    sizeBytes: 3221225472,
    sizeLabel: "~3.0 GiB",
    sha256:
      "0d490700300b91b7f4d1d983ee1d39f75d6f27248200a2aeffc1d0e1276e8877",
    guidance:
      "Use on 64-bit capable CPUs (SSE4.2+). Preferred for modern and mid-2000s+ machines.",
    builderPath: "/agent/portable-ai-os-images/portable-ai-os-x86_64.img",
  },
  {
    arch: "i686",
    label: "i686 (32-bit / XP-era)",
    filename: "portable-ai-os-i686.img",
    sizeBytes: 3221225472,
    sizeLabel: "~3.0 GiB",
    sha256:
      "b9a3820ebed6025d81a3670897573b02ca958ac2a5b18b624b24ce0825104465",
    guidance:
      "Use on true 32-bit XP-era boxes. Pick this when the machine cannot boot 64-bit Linux.",
    builderPath: "/agent/portable-ai-os-images/portable-ai-os-i686.img",
  },
] as const;

export const BUILD_NOTE =
  "Images are built by the NEXUS OS image builder workers. Full .img files (~3 GiB each) are distributed from builder releases — this site hosts checksums, flash guides, and a small demo package.";
