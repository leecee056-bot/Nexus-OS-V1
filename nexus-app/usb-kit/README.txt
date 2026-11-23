Tri-Cass Companion — USB / portable kit
====================================

Carry your personal offline AI setup on a USB stick, memory card, or external
drive. Heavier than the bootable Tri-Cass OS images, but the same Companion features
(Chat, Agent, Vault, Packs, Image Lab, themes) with data that travels with you.

Quick start (about three clicks)
--------------------------------
1. Download the USB kit .zip from https://nexus-os.apps.grok.bot/download#companion-usb
2. Unzip onto a USB stick (keep the folder layout intact).
3. Windows: double-click  Windows\Start-Tri-Cass.bat
   Mac:     double-click  Mac\Start-Tri-Cass.command  (or right-click → Open)

First run may ask Windows SmartScreen / Mac Gatekeeper to allow the app —
choose Run anyway / Open. The Tri-Cass logo is the app icon.

What stays on this drive
------------------------
  Data/        App settings, Vault notes, themes, plugin toggles
  Knowledge/   Drop your own wiki / notes / folders here (or use Add from this PC)
  Files/       Companion Files library exports + generated images
  Chats/       Saved chat transcripts (Chat → Save chat)

Ollama (local models)
---------------------
Install Ollama once on the host PC (https://ollama.com/download). Models can
live on the host; Companion on the USB talks to localhost. Optional: set
OLLAMA_MODELS to a folder on this USB if you want weights on the stick too
(needs free space — multi‑GB).

Unplug safely
-------------
Quit Companion, then eject the drive. Plug into another PC and Start-Tri-Cass again —
your Vault and chats come with you.

More help
---------
  START-HERE.html          Visual steps + logo
  https://nexus-os.apps.grok.bot/guides/companion-usb.md
