# NEXUS OS on Raspberry Pi

**Status:** Build in progress — images not public yet.

## When images ship

Flash the `.img` (after `xz -d` if compressed) with:

- [Raspberry Pi Imager](https://www.raspberrypi.com/software/) → Use custom
- or balenaEtcher / `dd`

## Planned first image

- **64-bit (`aarch64`)** for **Raspberry Pi 4 and Pi 5** (2 GB+ RAM recommended; 4 GB+ nicer for Chat)
- Same offline hub / SmolLM2 idea as the PC USB stick
- HDMI display + USB keyboard

## Not in the first Pi cut

- Pi 1 / classic Zero (`armhf`) — later if needed
- Claiming “any Pi” without a tested image
- Replacing your Pi OS install without warning — flashing a whole card erases it

## PC vs Pi

| | PC USB (available now) | Pi (this track) |
|--|------------------------|-----------------|
| Download today? | Yes — site / GitHub Release | Not until smoke + Release |
| Boot | BIOS/USB | Pi firmware on the card |

See also: [`../docs/nexus-os-raspberry-pi-plan.md`](../../docs/nexus-os-raspberry-pi-plan.md) in the Project docs store, or ask for status on the site About page.
