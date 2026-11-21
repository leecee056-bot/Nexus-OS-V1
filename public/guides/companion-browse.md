# Companion Browse (Windows · Mac)

Open the web inside a **NEXUS Browse** window that matches your Companion theme
— especially **Spatial / Open** — without building a separate browser product.

## What it is

- A dedicated, themed window owned by Companion (back / forward / URL / reload).
- Detects common installed browsers (Chrome, Edge, Firefox, Safari, Brave, Opera).
- Lets you set a preferred browser and choose:
  - **NEXUS window** — in-app chrome + page view (Electron Chromium surface)
  - **Browser app window** — Chromium-family browsers via `--app=` when available
  - **System browser** — hand off to your installed browser normally

Companion does **not** reinvent a full browser. The page surface uses the desktop
shell’s Chromium view; detection and hand-off use browsers already on your PC.

## Where to open it

| Place | Action |
|-------|--------|
| Home | **Browse** button, or the **Browse** panel |
| About | **Browse** panel |
| Desk layout | Browse panel under the dashboard |
| Any `window.open` / external http(s) link in the desktop app | Opens NEXUS Browse by default |

## Themes

Browse chrome follows the active Companion theme. **Spatial / Open** gives the
floating glass toolbar and soft depth lighting. Other themes keep their accent
language (Matrix, Lumen, Terminal, Basic).

## Privacy

Pages load like a normal browser session for that window. Offline-first Chat /
Vault / Agent still do not require the network.
