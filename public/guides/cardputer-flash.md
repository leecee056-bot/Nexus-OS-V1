# NEXUS Cardputer ADV — flash checklist

Dedicated firmware for the **M5Stack Cardputer ADV** (ESP32-S3FN8, 8 MB flash,
**no PSRAM**, 240×135 screen + keyboard). Full notes:
`nexus-cardputer/README.md`.

## Important

- This is **not** a USB/Pi disk image.
- This is **not** NEXUS Pocket (`nexus-esp32/`) — Pocket needs **PSRAM** for
  stories260K. Cardputer ADV uses **TinyChat** (flash phrase corpus).

## You need

- M5Stack Cardputer ADV
- USB-C data cable
- [PlatformIO](https://platformio.org/)

## Steps

```bash
git clone https://github.com/leecee056-bot/Nexus-OS-V1.git
cd Nexus-OS-V1/nexus-cardputer
pio run -e cardputer-adv -t upload
```

On the device: `;` / `'` move, Enter opens, `` ` `` returns to the hub.
Optional: insert a microSD card for Notes.

## First hub items

1. Chat — TinyChat offline replies  
2. Notes — append to SD or SPIFFS  
3. Status — heap / flash / battery  
4. About — memory limits reminder  
