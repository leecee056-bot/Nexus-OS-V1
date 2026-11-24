# How to: flash and boot

## PC (USB)

1. Download the matching image: **i686** (older/32-bit) or **x86_64** (typical 64-bit).
2. Unpack if the download is `.xz` / `.zip`.
3. Flash with Etcher (or `dd`). This **erases** the USB stick — pick the correct target.
4. Boot the PC from USB (boot menu often F12 / Esc / F10). Disable Secure Boot if the unsigned image will not start.
5. After boot you should see the **Tri-Cass OS** hub (rabbit mark + menu).

## Raspberry Pi (microSD)

1. Download the **aarch64** Pi image (same file for Pi 4 and Pi 5 — release v1.0.2-pi).
2. Unpack, then flash to a microSD card (8 GB+ recommended) with Etcher.
3. Insert the card and power the Pi.
4. Same hub menu as the PC build.

## If it will not boot

- Confirm stick/card and image architecture match the machine.
- Try another USB port (prefer rear motherboard ports on desktops).
- Recheck checksums from the download page if the image may be corrupt.
