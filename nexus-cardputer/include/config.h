#pragma once

// NEXUS Cardputer ADV — product + hard memory limits

#define NEXUS_CARDPUTER_VERSION "0.1.0"
#define NEXUS_CARDPUTER_NAME "NEXUS Cardputer"

#define NEXUS_SCREEN_W 240
#define NEXUS_SCREEN_H 135

#define NEXUS_NOTES_SD_PATH "/nexus-notes.txt"
#define NEXUS_NOTES_FS_PATH "/notes.txt"

#define NEXUS_CHAT_MAX_PROMPT 96
#define NEXUS_CHAT_MAX_REPLY 160
#define NEXUS_HUB_VISIBLE 5

/*
 * Memory strategy (Cardputer ADV — Stamp-S3A / ESP32-S3FN8)
 * ---------------------------------------------------------
 * FLASH 8 MB: firmware + SPIFFS notes fallback; TinyChat corpus in PROGMEM
 * SRAM ~512 KB: UI buffers, keyboard, short strings — NO PSRAM on this SoC
 *
 * This is NOT the same as NEXUS Pocket (nexus-esp32/), which needs PSRAM for
 * stories260K / llama2.c. Cardputer ADV runs TinyChat: a flash-resident
 * keyword + phrase corpus. Keep expectations honest in the UI and README.
 *
 * microSD (if present): preferred store for notes.txt
 */
