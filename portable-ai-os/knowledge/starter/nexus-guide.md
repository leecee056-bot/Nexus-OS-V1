# Tri-Cass OS Guide

Tri-Cass OS is a portable offline AI system. You write a disk image to a USB stick (PC) or microSD card (Raspberry Pi), boot from that media, and get a keyboard-friendly hub menu.

## What runs offline

- **AI Chat** — local llama.cpp with a small bundled model (SmolLM2). Answers stay on the machine.
- **Knowledge Vault** — searchable notes on `AI_DATA` (this starter pack plus anything you add).
- **Files, notes, settings, monitor, simple games**
- **Pixel Art / Image Lab** — lightweight procedural PXG generator (not a cloud image model)

## Themes

- **matrix** — green-on-black terminal look
- **basic** — high-contrast plain theme

## Storage layout

- `AI_SYS` — read-only-ish system: OS, hub, bundled model
- `AI_DATA` (`/data`) — your config, extra models, images, knowledge, notes

## Optional online Network

The website can reserve a future username. Chat rooms are separate and not required to use the stick or Pi offline.
