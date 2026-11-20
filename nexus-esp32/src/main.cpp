#include <Arduino.h>
#include <FS.h>
#include <SPIFFS.h>

#include "config.h"
#include "hub.h"
#include "model_runner.h"

static ModelRunner g_model;

void setup() {
  Serial.begin(NEXUS_SERIAL_BAUD);
  delay(800);

  Serial.printf("\n%s boot %s\n", NEXUS_POCKET_NAME, NEXUS_POCKET_VERSION);
  Serial.printf("PSRAM: %u bytes\n", ESP.getPsramSize());

  if (!SPIFFS.begin(true)) {
    Serial.println("SPIFFS mount failed — continuing in demo mode");
  }

  if (!model_init(&g_model)) {
    Serial.println("model_init failed hard");
  }

  hub_banner(&g_model);
  hub_help();
}

void loop() {
  hub_loop(&g_model);
}
