# How to: add models

The image ships with **SmolLM2 135M** so Chat works on modest RAM.

## Catalog (optional downloads)

Open GGUFs listed in the model catalog include:

- Qwen2.5 0.5B Instruct (Q4_K_M)
- TinyLlama 1.1B Chat (Q4_K_M)
- Qwen2.5 1.5B Instruct (Q4_K_M) — needs more RAM (roughly 8 GB+ class machines)

## Install on the stick/card

1. On a machine with internet, download a GGUF from the catalog URLs (or another Apache-2.0 / open source you trust).
2. Copy the `.gguf` into `AI_DATA/models` (or the runtime models folder if you know what you are doing).
3. In the hub, open **Models** and select the new file.
4. If Chat fails to start, pick SmolLM2 again — the new model may need more RAM or a smaller quant.

## Image Lab note

Pixel Art / Image Lab uses **PXG** (procedural). It is not a Stable Diffusion-style neural image model.
