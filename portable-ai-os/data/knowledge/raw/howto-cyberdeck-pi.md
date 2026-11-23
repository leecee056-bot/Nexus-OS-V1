# How to: cyberdecks and Raspberry Pi

## Why Pi fits cyberdecks

Cyberdecks are portable DIY terminals. The NEXUS **aarch64** image boots from microSD into the same offline hub as the PC USB build — useful for handheld cases, field kits, and classroom spares.

## Recommendations

- **Pi 4** with 2 GB+ RAM is the primary target.
- **Pi 5** may work with the same image (best-effort for this release).
- Use a quality microSD card (8 GB+). Flashing erases the card.
- Prefer wired Ethernet or a known-working Wi‑Fi dongle if you need to copy files; Chat itself stays offline once models are on disk.

## Power and heat

Small cases can run warm. Give the board airflow; undervoltage shows up as freezes or brownouts under load.

## After first boot

Open Knowledge Vault to read the starter notes, try Chat with SmolLM2, then add your own project notes under `knowledge/raw`.
