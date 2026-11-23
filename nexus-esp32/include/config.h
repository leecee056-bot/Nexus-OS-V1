#pragma once

// Tri-Cass Pocket — product + memory knobs

#define NEXUS_POCKET_VERSION "0.1.0"
#define NEXUS_POCKET_NAME "Tri-Cass Pocket"

#ifndef NEXUS_SERIAL_BAUD
#define NEXUS_SERIAL_BAUD 115200
#endif

// Model files on SPIFFS (flash filesystem)
#define NEXUS_MODEL_PATH "/model.bin"
#define NEXUS_TOKENIZER_PATH "/tokenizer.bin"
#define NEXUS_NOTES_PATH "/notes.txt"

// Generation defaults (keep short for MCU)
#define NEXUS_MAX_NEW_TOKENS 48
#define NEXUS_TEMPERATURE 0.9f
#define NEXUS_TOP_P 0.9f

/*
 * Memory strategy (ESP32-S3 N16R8)
 * -------------------------------
 * FLASH (SPIFFS): model.bin + tokenizer.bin + notes.txt
 *   - stories260K weights ~1 MB; tokenizer small
 *   - read-only after flash (except notes)
 *
 * PSRAM (8 MB OPI): transformer activations, KV cache, weight staging
 *   - allocated via heap_caps / ps_malloc when BOARD_HAS_PSRAM
 *
 * internal SRAM (~512 KB): stack, small UI buffers, hot scratch
 *   - do NOT put the full model here
 *
 * Boards with less PSRAM: Chat may fail to allocate; menu/tools still work.
 */
