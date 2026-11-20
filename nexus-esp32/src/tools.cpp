#include "tools.h"

#include "config.h"

#include <Arduino.h>
#include <FS.h>
#include <SPIFFS.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

typedef bool (*ToolFn)(const char *arg, char *out, size_t out_cap);

typedef struct {
  const char *name;
  const char *help;
  ToolFn fn;
} Tool;

static bool tool_help(const char *arg, char *out, size_t out_cap);
static bool tool_mem(const char *arg, char *out, size_t out_cap);
static bool tool_fs(const char *arg, char *out, size_t out_cap);
static bool tool_note_write(const char *arg, char *out, size_t out_cap);
static bool tool_note_read(const char *arg, char *out, size_t out_cap);
static bool tool_uptime(const char *arg, char *out, size_t out_cap);
static bool tool_echo(const char *arg, char *out, size_t out_cap);
static bool tool_calc(const char *arg, char *out, size_t out_cap);

static const Tool k_tools[] = {
    {"help", "list tools", tool_help},
    {"mem", "heap + PSRAM", tool_mem},
    {"fs", "SPIFFS usage + files", tool_fs},
    {"note", "append text to notes.txt  | note <text>", tool_note_write},
    {"notes", "read notes.txt", tool_note_read},
    {"uptime", "millis since boot", tool_uptime},
    {"echo", "echo argument", tool_echo},
    {"calc", "simple + - * /  | calc 2+3*4", tool_calc},
};

static bool tool_help(const char *arg, char *out, size_t out_cap) {
  (void)arg;
  size_t n = 0;
  n += snprintf(out + n, out_cap - n, "tools:\n");
  for (size_t i = 0; i < sizeof(k_tools) / sizeof(k_tools[0]); i++) {
    n += snprintf(out + n, out_cap > n ? out_cap - n : 0, "  %-8s %s\n",
                  k_tools[i].name, k_tools[i].help);
    if (n >= out_cap) break;
  }
  return true;
}

static bool tool_mem(const char *arg, char *out, size_t out_cap) {
  (void)arg;
  snprintf(out, out_cap,
           "heap free=%u min=%u\n"
           "psram free=%u size=%u\n"
           "chip rev=%d cores=%d\n",
           ESP.getFreeHeap(), ESP.getMinFreeHeap(), ESP.getFreePsram(),
           ESP.getPsramSize(), ESP.getChipRevision(), ESP.getChipCores());
  return true;
}

static bool tool_fs(const char *arg, char *out, size_t out_cap) {
  (void)arg;
  size_t n = 0;
  n += snprintf(out + n, out_cap - n, "SPIFFS total=%u used=%u\n",
                SPIFFS.totalBytes(), SPIFFS.usedBytes());
  File root = SPIFFS.open("/");
  if (!root || !root.isDirectory()) {
    n += snprintf(out + n, out_cap > n ? out_cap - n : 0, "(no listing)\n");
    return true;
  }
  File f = root.openNextFile();
  while (f && n + 40 < out_cap) {
    n += snprintf(out + n, out_cap - n, "  %s  %u\n", f.name(),
                  (unsigned)f.size());
    f = root.openNextFile();
  }
  return true;
}

static bool tool_note_write(const char *arg, char *out, size_t out_cap) {
  if (!arg || !arg[0]) {
    snprintf(out, out_cap, "usage: note <text to append>");
    return false;
  }
  File f = SPIFFS.open(NEXUS_NOTES_PATH, FILE_APPEND);
  if (!f) {
    f = SPIFFS.open(NEXUS_NOTES_PATH, FILE_WRITE);
  }
  if (!f) {
    snprintf(out, out_cap, "cannot open %s", NEXUS_NOTES_PATH);
    return false;
  }
  f.printf("%lu %s\n", (unsigned long)(millis() / 1000UL), arg);
  f.close();
  snprintf(out, out_cap, "appended to %s", NEXUS_NOTES_PATH);
  return true;
}

static bool tool_note_read(const char *arg, char *out, size_t out_cap) {
  (void)arg;
  File f = SPIFFS.open(NEXUS_NOTES_PATH, "r");
  if (!f) {
    snprintf(out, out_cap, "(empty — use: note <text>)");
    return true;
  }
  size_t n = f.readBytes(out, out_cap - 1);
  out[n] = '\0';
  f.close();
  if (n == 0) {
    snprintf(out, out_cap, "(empty)");
  }
  return true;
}

static bool tool_uptime(const char *arg, char *out, size_t out_cap) {
  (void)arg;
  unsigned long s = millis() / 1000UL;
  snprintf(out, out_cap, "uptime %luh %lum %lus", s / 3600UL, (s / 60UL) % 60UL,
           s % 60UL);
  return true;
}

static bool tool_echo(const char *arg, char *out, size_t out_cap) {
  snprintf(out, out_cap, "%s", arg ? arg : "");
  return true;
}

// Tiny expression: integers and + - * / left-to-right (no precedence) for MCU
static bool tool_calc(const char *arg, char *out, size_t out_cap) {
  if (!arg || !arg[0]) {
    snprintf(out, out_cap, "usage: calc 12+3*2");
    return false;
  }
  const char *p = arg;
  while (*p == ' ') p++;
  char *end = nullptr;
  double acc = strtod(p, &end);
  if (end == p) {
    snprintf(out, out_cap, "bad number");
    return false;
  }
  p = end;
  while (*p) {
    while (*p == ' ') p++;
    if (!*p) break;
    char op = *p++;
    while (*p == ' ') p++;
    double rhs = strtod(p, &end);
    if (end == p) {
      snprintf(out, out_cap, "bad number after %c", op);
      return false;
    }
    p = end;
    switch (op) {
      case '+':
        acc += rhs;
        break;
      case '-':
        acc -= rhs;
        break;
      case '*':
        acc *= rhs;
        break;
      case '/':
        if (rhs == 0) {
          snprintf(out, out_cap, "div0");
          return false;
        }
        acc /= rhs;
        break;
      default:
        snprintf(out, out_cap, "bad op '%c'", op);
        return false;
    }
  }
  snprintf(out, out_cap, "%g", acc);
  return true;
}

void tools_list(void) {
  char buf[512];
  tool_help(nullptr, buf, sizeof(buf));
  Serial.print(buf);
}

bool tools_run(const char *name, const char *arg, char *out, size_t out_cap) {
  if (!name || !out || out_cap == 0) return false;
  for (size_t i = 0; i < sizeof(k_tools) / sizeof(k_tools[0]); i++) {
    if (strcmp(k_tools[i].name, name) == 0) {
      return k_tools[i].fn(arg, out, out_cap);
    }
  }
  snprintf(out, out_cap, "unknown tool '%s' — try: help", name);
  return false;
}
