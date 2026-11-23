#pragma once

// Tri-Cass Cardputer ADV — product + hard memory limits

#define NEXUS_CARDPUTER_VERSION "0.2.0"
#define NEXUS_CARDPUTER_NAME "Tri-Cass Cardputer"

#define NEXUS_SCREEN_W 240
#define NEXUS_SCREEN_H 135

#define NEXUS_NOTES_SD_PATH "/tri-cass-notes.txt"
#define NEXUS_NOTES_FS_PATH "/notes.txt"

// Optional Knowledge Vault on microSD (plain .txt / .md)
#define NEXUS_VAULT_DIR "/tri-cass-vault"
#define NEXUS_VAULT_DIR_ALT "/vault"
#define NEXUS_VAULT_SINGLE "/tri-cass-vault.txt"

#define NEXUS_CHAT_MAX_PROMPT 96
#define NEXUS_CHAT_MAX_REPLY 160
#define NEXUS_HUB_VISIBLE 5

/*
 * Memory strategy (Cardputer ADV — Stamp-S3A / ESP32-S3FN8)
 * ---------------------------------------------------------
 * FLASH 8 MB: firmware + SPIFFS notes fallback; TinyChat corpus in flash
 * SRAM ~512 KB: UI buffers, keyboard, short strings — NO PSRAM on this SoC
 *
 * This is NOT the same as Tri-Cass Pocket (nexus-esp32/), which needs PSRAM for
 * stories260K / llama2.c. Cardputer ADV runs TinyChat: a flash-resident
 * keyword + phrase corpus. Keep expectations honest in the UI and README.
 *
 * microSD (optional):
 *   - /tri-cass-notes.txt — scratch Notes append log
 *   - /tri-cass-vault/*.txt|.md — optional Knowledge Vault (streamed, not fully loaded)
 * Firmware runs fine with no card / empty vault.
 */
