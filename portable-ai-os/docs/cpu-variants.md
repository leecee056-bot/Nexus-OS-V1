# HAP-65 — All-CPU llama.cpp variants

Default `build-llama.sh` stays the **conservative portable** build (AVX off) so
old PCs and QEMU keep working.

For better speed on modern hosts **without** dropping old CPUs:

```bash
bash scripts/build-llama-all-variants.sh
```

That script:

1. Tries a single **CPU all-variants / backend-dl** binary (runtime dispatch).
2. If the pinned llama.cpp tag lacks those CMake flags, builds **dual**
   binaries: `llama-server-portable` + `llama-server-native`, and selects by
   `/proc/cpuinfo` flags.

Vulkan / CUDA remain off in v1 (queued later).

## Image builders

USB/Pi image scripts still call `build-llama.sh` by default. Set
`LLAMA_BUILD_ALL_VARIANTS=1` before `build-usb-image.sh` to prefer the HAP-65
script when bundling.
