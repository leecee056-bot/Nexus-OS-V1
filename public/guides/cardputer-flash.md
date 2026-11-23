# Tri-Cass Cardputer ADV — flash checklist

Dedicated firmware for the **M5Stack Cardputer ADV** (ESP32-S3FN8, 8 MB flash,
**no PSRAM**, 240×135 screen + keyboard). Full notes:
`nexus-cardputer/README.md`.

## Important

- This is **not** a USB/Pi disk image.
- This is **not** Tri-Cass Pocket (`nexus-esp32/`) — Pocket needs **PSRAM** for
  stories260K. Cardputer ADV uses **TinyChat** (flash phrase corpus).
- **microSD Knowledge Vault is optional** — no card required to run the hub.

## You need

- M5Stack Cardputer ADV
- USB-C data cable
- [PlatformIO](https://platformio.org/)
- Optional: FAT microSD + files from `nexus-cardputer/sd-example/`

## Steps

```bash
git clone https://github.com/leecee056-bot/Nexus-OS-V1.git
cd Nexus-OS-V1/nexus-cardputer
pio run -e cardputer-adv -t upload
```

On the device: `;` / `'` move, Enter opens, `` ` `` returns to the hub.

## Optional SD Vault

```
microSD root/
  tri-cass-vault/
    00-readme.txt
    guide.txt
    glossary.txt
    how-to-boot.txt
```

Copy `sd-example/tri-cass-vault/` to the card, insert it, then Hub → **Vault**.
Enter opens a file; type a word + Enter to search. Without a card, Vault shows
a short hint and everything else still works.

Want larger free offline libraries (Gutenberg books, Kiwix Wikipedia text)?
See [/knowledge-packs](/knowledge-packs) — optional; we do not host the dumps.

## First hub items

1. Chat — TinyChat offline replies  
2. Vault — optional SD knowledge base  
3. Notes — append to SD or SPIFFS  
4. Status — heap / flash / vault / battery  
5. About — memory limits reminder  
