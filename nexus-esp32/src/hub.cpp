#include "hub.h"

#include "config.h"
#include "tools.h"

#include <Arduino.h>
#include <string.h>

static char line_buf[384];
static size_t line_len = 0;

void hub_banner(const ModelRunner *mr) {
  Serial.println();
  Serial.println("========================================");
  Serial.println("  ((\\ ");
  Serial.println("  (-.-)  *   Tri-Cass Pocket");
  Serial.println(" o_(\")(\")  offline tiny-ML (ESP32-S3)");
  Serial.printf("  %s  v%s\n", NEXUS_POCKET_NAME, NEXUS_POCKET_VERSION);
  Serial.println("========================================");
  model_print_status(mr);
  Serial.println("type  help  for commands");
  Serial.println();
}

void hub_help(void) {
  Serial.println("commands:");
  Serial.println("  help              this list");
  Serial.println("  status            model + memory");
  Serial.println("  chat <prompt>     generate (TinyStories / demo)");
  Serial.println("  c <prompt>        short alias for chat");
  Serial.println("  tool <name> [arg] run a built-in tool");
  Serial.println("  tools             list tools");
  Serial.println("  clear             clear screen (ANSI)");
  Serial.println("  reboot            restart board");
  Serial.println();
  Serial.println("examples:");
  Serial.println("  chat Once upon a time");
  Serial.println("  tool mem");
  Serial.println("  tool note buy solder");
  Serial.println("  tool calc 19+23");
}

static void trim_inplace(char *s) {
  if (!s) return;
  char *start = s;
  while (*start == ' ' || *start == '\t') start++;
  if (start != s) memmove(s, start, strlen(start) + 1);
  size_t n = strlen(s);
  while (n > 0 && (s[n - 1] == ' ' || s[n - 1] == '\t' || s[n - 1] == '\r')) {
    s[--n] = '\0';
  }
}

static bool split_name_arg(char *line, char *name, size_t name_cap, const char **arg) {
  char *sp = strchr(line, ' ');
  if (sp) {
    size_t nl = (size_t)(sp - line);
    if (nl >= name_cap) nl = name_cap - 1;
    memcpy(name, line, nl);
    name[nl] = '\0';
    *arg = sp + 1;
    while (**arg == ' ') (*arg)++;
  } else {
    strncpy(name, line, name_cap - 1);
    name[name_cap - 1] = '\0';
    *arg = "";
  }
  return name[0] != '\0';
}

static bool is_cmd(const char *line, const char *cmd) {
  return strcmp(line, cmd) == 0;
}

static void handle_line(ModelRunner *mr, char *line) {
  trim_inplace(line);
  if (!line[0]) return;

  if (is_cmd(line, "help") || is_cmd(line, "?")) {
    hub_help();
    return;
  }
  if (is_cmd(line, "status")) {
    model_print_status(mr);
    return;
  }
  if (is_cmd(line, "tools")) {
    tools_list();
    return;
  }
  if (is_cmd(line, "clear")) {
    Serial.print("\033[2J\033[H");
    hub_banner(mr);
    return;
  }
  if (is_cmd(line, "reboot")) {
    Serial.println("rebooting...");
    delay(50);
    ESP.restart();
    return;
  }

  if (strncmp(line, "chat ", 5) == 0 || strncmp(line, "c ", 2) == 0) {
    char *prompt = (line[0] == 'c' && line[1] == ' ') ? line + 2 : line + 5;
    trim_inplace(prompt);
    Serial.println("---");
    char out[1024];
    unsigned long t0 = millis();
    int n = model_generate(mr, prompt, out, sizeof(out), NEXUS_MAX_NEW_TOKENS);
    unsigned long dt = millis() - t0;
    Serial.println(out);
    Serial.println("---");
    if (n >= 0) {
      Serial.printf("(%d new tokens, %lu ms)\n", n, dt);
    } else {
      Serial.printf("generate failed: %s\n", mr->last_error);
    }
    return;
  }

  if (strncmp(line, "tool ", 5) == 0) {
    char *rest = line + 5;
    trim_inplace(rest);
    char name[32];
    const char *arg = "";
    split_name_arg(rest, name, sizeof(name), &arg);
    char out[768];
    tools_run(name, arg, out, sizeof(out));
    Serial.println(out);
    return;
  }

  // Bare tool: "mem" or "note hello"
  {
    char name[32];
    const char *arg = "";
    split_name_arg(line, name, sizeof(name), &arg);
    static const char *known[] = {"help", "mem", "fs", "note", "notes",
                                  "uptime", "echo", "calc"};
    for (size_t i = 0; i < sizeof(known) / sizeof(known[0]); i++) {
      if (strcmp(name, known[i]) == 0) {
        char out[768];
        tools_run(name, arg, out, sizeof(out));
        Serial.println(out);
        return;
      }
    }
  }

  Serial.printf("unknown: %s\n", line);
  Serial.println("try: help | chat <prompt> | tool mem");
}

void hub_loop(ModelRunner *mr) {
  Serial.print("> ");
  for (;;) {
    while (Serial.available()) {
      char c = (char)Serial.read();
      if (c == '\r') continue;
      if (c == '\n') {
        Serial.println();
        line_buf[line_len] = '\0';
        handle_line(mr, line_buf);
        line_len = 0;
        Serial.print("> ");
        continue;
      }
      if (c == 0x08 || c == 0x7f) {
        if (line_len > 0) {
          line_len--;
          Serial.print("\b \b");
        }
        continue;
      }
      if (line_len + 1 < sizeof(line_buf)) {
        line_buf[line_len++] = c;
        Serial.print(c);
      }
    }
    delay(5);
  }
}
