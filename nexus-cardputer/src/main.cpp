#include <Arduino.h>
#include <M5Cardputer.h>

#include "config.h"
#include "hub.h"
#include "notes.h"
#include "ui.h"
#include "vault.h"

void setup() {
  auto cfg = M5.config();
  // Cardputer ADV: Stamp-S3A, colour LCD, keyboard — no PSRAM
  M5Cardputer.begin(cfg, true);
  Serial.begin(115200);
  delay(200);

  Serial.printf("\n%s v%s\n", NEXUS_CARDPUTER_NAME, NEXUS_CARDPUTER_VERSION);
  Serial.printf("flash=%u heap=%u psram=%u\n", ESP.getFlashChipSize(),
                ESP.getFreeHeap(), ESP.getPsramSize());

  ui_begin();
  ui_draw_header(NEXUS_CARDPUTER_NAME);
  ui_draw_text(4, 40, "booting hub…", COL_FG);
  ui_draw_footer("offline", "ADV");

  if (!notes_begin()) {
    Serial.println("notes: no SD/SPIFFS yet — Notes will warn in UI");
  } else {
    Serial.printf("notes backend: %s\n", notes_backend());
  }

  if (vault_refresh()) {
    Serial.printf("vault: %s (%d files)\n", vault_root_hint(),
                  vault_file_count());
  } else {
    Serial.printf("vault: optional — %s\n", vault_root_hint());
  }

  delay(400);
  hub_run();
}

void loop() {
  // hub_run never returns
}
