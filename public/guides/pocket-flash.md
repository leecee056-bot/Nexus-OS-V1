# Tri-Cass Pocket — flash checklist (ESP32-S3)

Short path for the USB-Serial offline companion. Full notes live in
`nexus-esp32/README.md` on GitHub.

## You need

- ESP32-S3 with **PSRAM** (N16R8 / 16 MB flash preferred; 8 MB boards use the
  `nexus-pocket-s3-8mb` PlatformIO env)
- USB cable that carries data
- [PlatformIO](https://platformio.org/) (VS Code / CLI)
- ~1 GB free for tools + the TinyStories model download

## Steps

```bash
git clone https://github.com/leecee056-bot/Nexus-OS-V1.git
cd Nexus-OS-V1/nexus-esp32
chmod +x scripts/fetch_model.sh
./scripts/fetch_model.sh          # → data/model.bin + data/tokenizer.bin

pio run -e nexus-pocket-s3 -t upload
pio run -e nexus-pocket-s3 -t uploadfs
pio device monitor                # 115200 baud
```

For 8 MB flash boards, swap the env to `nexus-pocket-s3-8mb`.

## First Serial commands

```
help
status
chat Once upon a time
tool mem
tool note pocket idea
```

If SPIFFS has no model yet, `chat` still runs in demo mode so you can exercise
the hub.

## Notes

- Runtime is offline; Wi‑Fi is not required after flash.
- Default model is TinyStories **stories260K** (~1 MB). Larger checkpoints are a
  later path on 16 MB boards.
- This is separate from the PC USB / Pi microSD disk images.
