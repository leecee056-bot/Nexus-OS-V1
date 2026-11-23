#include "vault.h"

#include "config.h"
#include "notes.h"

#include <Arduino.h>
#include <ctype.h>
#include <SD.h>
#include <string.h>

static VaultFile g_files[VAULT_MAX_FILES];
static int g_count = 0;
static bool g_ok = false;
static char g_hint[48] = "no SD / no vault";

static bool is_note_name(const char *name) {
  if (!name || name[0] == '.' || name[0] == '\0') return false;
  size_t n = strlen(name);
  if (n >= 4 && strcasecmp(name + n - 4, ".txt") == 0) return true;
  if (n >= 3 && strcasecmp(name + n - 3, ".md") == 0) return true;
  return false;
}

static void add_file(const char *name) {
  if (g_count >= VAULT_MAX_FILES) return;
  if (!is_note_name(name)) return;
  strncpy(g_files[g_count].name, name, VAULT_NAME_LEN - 1);
  g_files[g_count].name[VAULT_NAME_LEN - 1] = '\0';
  g_count++;
}

static bool scan_dir(const char *dir) {
  File root = SD.open(dir);
  if (!root || !root.isDirectory()) {
    if (root) root.close();
    return false;
  }
  File f = root.openNextFile();
  while (f && g_count < VAULT_MAX_FILES) {
    if (!f.isDirectory()) {
      // prefer basename
      const char *nm = f.name();
      const char *base = strrchr(nm, '/');
      add_file(base ? base + 1 : nm);
    }
    f.close();
    f = root.openNextFile();
  }
  if (f) f.close();
  root.close();
  return g_count > 0;
}

bool vault_refresh(void) {
  g_count = 0;
  g_ok = false;
  strncpy(g_hint, "no SD / no vault", sizeof(g_hint) - 1);

  if (!notes_sd_mounted()) {
    strncpy(g_hint, "insert microSD for Vault", sizeof(g_hint) - 1);
    return false;
  }

  if (scan_dir(NEXUS_VAULT_DIR)) {
    g_ok = true;
    strncpy(g_hint, NEXUS_VAULT_DIR, sizeof(g_hint) - 1);
    return true;
  }
  g_count = 0;
  if (scan_dir(NEXUS_VAULT_DIR_ALT)) {
    g_ok = true;
    strncpy(g_hint, NEXUS_VAULT_DIR_ALT, sizeof(g_hint) - 1);
    return true;
  }
  g_count = 0;

  // Single-file fallback
  if (SD.exists(NEXUS_VAULT_SINGLE)) {
    strncpy(g_files[0].name, "tri-cass-vault.txt", VAULT_NAME_LEN - 1);
    g_count = 1;
    g_ok = true;
    strncpy(g_hint, NEXUS_VAULT_SINGLE, sizeof(g_hint) - 1);
    return true;
  }

  strncpy(g_hint, "no /tri-cass-vault on SD", sizeof(g_hint) - 1);
  return false;
}

bool vault_available(void) { return g_ok && g_count > 0; }

int vault_file_count(void) { return g_count; }

const char *vault_file_name(int index) {
  if (index < 0 || index >= g_count) return "";
  return g_files[index].name;
}

static void build_path(int index, char *path, size_t cap) {
  path[0] = '\0';
  if (index < 0 || index >= g_count) return;
  if (strcmp(g_hint, NEXUS_VAULT_SINGLE) == 0) {
    strncpy(path, NEXUS_VAULT_SINGLE, cap - 1);
    path[cap - 1] = '\0';
    return;
  }
  snprintf(path, cap, "%s/%s", g_hint, g_files[index].name);
}

size_t vault_read_file(int index, char *out, size_t out_cap) {
  if (!out || out_cap < 8) return 0;
  out[0] = '\0';
  char path[64];
  build_path(index, path, sizeof(path));
  if (!path[0]) {
    strncpy(out, "(missing)", out_cap - 1);
    return strlen(out);
  }
  File f = SD.open(path, FILE_READ);
  if (!f) {
    strncpy(out, "(cannot open)", out_cap - 1);
    return strlen(out);
  }
  size_t total = f.size();
  size_t n = f.readBytes(out, out_cap - 1);
  out[n] = '\0';
  f.close();
  if (total > out_cap - 1 && n >= 4) {
    out[n - 3] = '.';
    out[n - 2] = '.';
    out[n - 1] = '.';
  }
  return n;
}

static bool line_has(const char *line, const char *q) {
  if (!q || !q[0]) return true;
  // case-insensitive substring
  for (const char *p = line; *p; p++) {
    const char *a = p;
    const char *b = q;
    while (*a && *b &&
           tolower((unsigned char)*a) == tolower((unsigned char)*b)) {
      a++;
      b++;
    }
    if (!*b) return true;
  }
  return false;
}

size_t vault_search(const char *query, char *out, size_t out_cap) {
  if (!out || out_cap < 16) return 0;
  out[0] = '\0';
  if (!vault_available()) {
    strncpy(out, vault_root_hint(), out_cap - 1);
    return strlen(out);
  }
  if (!query || !query[0]) {
    strncpy(out, "type a word, Enter to search", out_cap - 1);
    return strlen(out);
  }

  size_t used = 0;
  int hits = 0;
  char line[96];
  char path[64];

  for (int i = 0; i < g_count && hits < 4; i++) {
    build_path(i, path, sizeof(path));
    File f = SD.open(path, FILE_READ);
    if (!f) continue;
    size_t li = 0;
    while (f.available() && hits < 4) {
      char c = (char)f.read();
      if (c == '\r') continue;
      if (c == '\n' || li + 1 >= sizeof(line)) {
        line[li] = '\0';
        if (li > 0 && line_has(line, query)) {
          int n = snprintf(out + used, out_cap > used ? out_cap - used : 0,
                           "[%s] %s\n", g_files[i].name, line);
          if (n < 0 || (size_t)n >= out_cap - used) {
            out[out_cap - 1] = '\0';
            f.close();
            return strlen(out);
          }
          used += (size_t)n;
          hits++;
        }
        li = 0;
        if (c != '\n') {
          // long line truncated — keep scanning
        }
      } else {
        line[li++] = c;
      }
    }
    // last line without newline
    if (li > 0 && hits < 4) {
      line[li] = '\0';
      if (line_has(line, query)) {
        int n = snprintf(out + used, out_cap > used ? out_cap - used : 0,
                         "[%s] %s\n", g_files[i].name, line);
        if (n > 0 && (size_t)n < out_cap - used) used += (size_t)n;
        hits++;
      }
    }
    f.close();
  }

  if (hits == 0) {
    snprintf(out, out_cap, "no hits for \"%s\"", query);
  }
  return strlen(out);
}

const char *vault_root_hint(void) { return g_hint; }
