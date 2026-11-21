#include "notes.h"

#include "config.h"

#include <Arduino.h>
#include <FS.h>
#include <SD.h>
#include <SPIFFS.h>

static bool g_sd = false;
static bool g_fs = false;
static const char *g_backend = "none";

bool notes_begin(void) {
  g_sd = false;
  g_fs = false;
  g_backend = "none";

  // Cardputer SD on SPI — M5Cardputer usually mounts via SD.begin
  if (SD.begin()) {
    g_sd = true;
    g_backend = "sd";
    return true;
  }

  if (SPIFFS.begin(true)) {
    g_fs = true;
    g_backend = "spiffs";
    return true;
  }
  return false;
}

static const char *path(void) {
  return g_sd ? NEXUS_NOTES_SD_PATH : NEXUS_NOTES_FS_PATH;
}

bool notes_append(const char *line) {
  if (!line || !line[0]) return false;
  if (!g_sd && !g_fs) return false;

  File f;
  if (g_sd) {
    f = SD.open(path(), FILE_APPEND);
    if (!f) f = SD.open(path(), FILE_WRITE);
  } else {
    f = SPIFFS.open(path(), FILE_APPEND);
    if (!f) f = SPIFFS.open(path(), FILE_WRITE);
  }
  if (!f) return false;
  f.printf("%lu %s\n", (unsigned long)(millis() / 1000UL), line);
  f.close();
  return true;
}

size_t notes_read_tail(char *out, size_t out_cap) {
  if (!out || out_cap < 2) return 0;
  out[0] = '\0';
  if (!g_sd && !g_fs) {
    strncpy(out, "(no storage — insert microSD or reflash SPIFFS)", out_cap - 1);
    return strlen(out);
  }

  File f = g_sd ? SD.open(path(), FILE_READ) : SPIFFS.open(path(), FILE_READ);
  if (!f) {
    strncpy(out, "(empty — type a note and press Enter)", out_cap - 1);
    return strlen(out);
  }

  size_t sz = f.size();
  if (sz == 0) {
    f.close();
    strncpy(out, "(empty — type a note and press Enter)", out_cap - 1);
    return strlen(out);
  }

  // Read last out_cap-1 bytes
  size_t want = out_cap - 1;
  if (sz > want) {
    f.seek(sz - want);
  }
  size_t n = f.readBytes(out, want);
  out[n] = '\0';
  f.close();

  // Align to first newline if we mid-line started
  if (sz > want) {
    char *nl = strchr(out, '\n');
    if (nl && nl[1]) {
      memmove(out, nl + 1, strlen(nl + 1) + 1);
      n = strlen(out);
    }
  }
  return n;
}

const char *notes_backend(void) { return g_backend; }

bool notes_sd_mounted(void) { return g_sd; }
