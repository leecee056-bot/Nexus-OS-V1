# Companion Image Lab (Windows · Mac)

Optional **local image generation** in the desktop Tri-Cass Companion apps.
Phone / tablet builds do not include this tab yet — use Windows, Mac, or the
web companion at [/companion/](/companion/).

## How it works

1. Install [Ollama](https://ollama.com/download) (same runtime as Chat).
2. Open Companion → **Image**.
3. Pick a recommended model (Z-Image Turbo, FLUX.2 Klein, …) → **Get model**.
4. Type a prompt → **Generate locally**.
5. Optionally **Save PNG** (desktop app writes to your Pictures folder).

After the weights are on disk, generation is offline-first — we do not host the
model files.

## Models

Curated tags mirror the Chat model picker style. Each card has **Check for
updates**, which opens the official Ollama library page for that model.

Image generation in Ollama has been **experimental** and version-dependent. If
Generate reports that the endpoint is missing, check the model’s update page,
try a build that still exposes image generation, or use [ComfyUI](https://www.comfy.org/)
as an alternate local install path. Companion still lets you pull models and
keeps the same “one Get click” flow either way.

## Check for updates

Across Companion (Chat models, Image models, Add-ons, Packs, About) you will
see **Check for updates** / **Check for OS updates**. These are manual links to
official download or release pages — no background scanning. The same pattern
is intended to cover USB / Pi OS images and Cardputer firmware later.

See also: [companion-app.md](./companion-app.md), [companion-agent.md](./companion-agent.md).
