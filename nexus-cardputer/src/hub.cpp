#include "hub.h"

#include "config.h"
#include "notes.h"
#include "tinychat.h"
#include "ui.h"

#include <M5Cardputer.h>
#include <string.h>

enum Screen : uint8_t { SCR_HUB, SCR_CHAT, SCR_NOTES, SCR_STATUS, SCR_ABOUT };

static const char *k_items[] = {"Chat", "Notes", "Status", "About"};
static const int k_count = 4;

static Screen g_screen = SCR_HUB;
static int g_sel = 0;
static int g_scroll = 0;
static char g_input[NEXUS_CHAT_MAX_PROMPT];
static char g_reply[NEXUS_CHAT_MAX_REPLY];
static char g_notes_view[384];
static bool g_dirty = true;

static void clamp_scroll(void) {
  if (g_sel < g_scroll) g_scroll = g_sel;
  if (g_sel >= g_scroll + NEXUS_HUB_VISIBLE) {
    g_scroll = g_sel - NEXUS_HUB_VISIBLE + 1;
  }
}

static void draw_hub(void) {
  ui_clear(COL_BG);
  ui_draw_header(NEXUS_CARDPUTER_NAME " v" NEXUS_CARDPUTER_VERSION);
  clamp_scroll();
  int16_t y = 20;
  for (int i = 0; i < NEXUS_HUB_VISIBLE; i++) {
    int idx = g_scroll + i;
    if (idx >= k_count) break;
    ui_draw_menu_row(y, idx, k_items[idx], idx == g_sel);
    y += 14;
  }
  ui_draw_footer(";/' move  Enter open", "no PSRAM");
}

static void draw_chat(void) {
  ui_clear(COL_BG);
  ui_draw_header("Chat · TinyChat");
  ui_draw_text(4, 18, "flash corpus (not llama)", COL_DIM);
  ui_fill_rect(2, 30, NEXUS_SCREEN_W - 4, 48, COL_BAR);
  ui_wrap_print(4, 32, NEXUS_SCREEN_W - 10,
                g_reply[0] ? g_reply : "Type a short prompt, Enter to reply.",
                COL_FG);
  ui_draw_text(4, 84, ">", COL_ACCENT);
  ui_draw_text(14, 84, g_input[0] ? g_input : "_", COL_FG);
  ui_draw_footer("` back", "Enter send");
}

static void draw_notes(void) {
  ui_clear(COL_BG);
  char head[40];
  snprintf(head, sizeof(head), "Notes · %s", notes_backend());
  ui_draw_header(head);
  ui_wrap_print(4, 18, NEXUS_SCREEN_W - 8,
                g_notes_view[0] ? g_notes_view : "(empty)", COL_FG);
  ui_draw_text(4, 100, ">", COL_ACCENT);
  ui_draw_text(14, 100, g_input[0] ? g_input : "type note…", COL_DIM);
  ui_draw_footer("` back", "Enter append");
}

static void draw_status(void) {
  ui_clear(COL_BG);
  ui_draw_header("Status");
  char line[64];
  int16_t y = 18;
  snprintf(line, sizeof(line), "chip ESP32-S3FN8 ADV");
  ui_draw_text(4, y, line, COL_FG);
  y += 12;
  snprintf(line, sizeof(line), "heap free %u", ESP.getFreeHeap());
  ui_draw_text(4, y, line, COL_FG);
  y += 12;
  snprintf(line, sizeof(line), "flash %u MB  psram none",
           (unsigned)(ESP.getFlashChipSize() / (1024 * 1024)));
  ui_draw_text(4, y, line, COL_FG);
  y += 12;
  snprintf(line, sizeof(line), "notes: %s", notes_backend());
  ui_draw_text(4, y, line, COL_FG);
  y += 12;
  // Battery via M5 power if available
  int bat = M5.Power.getBatteryLevel();
  if (bat >= 0) {
    snprintf(line, sizeof(line), "battery ~%d%%", bat);
  } else {
    snprintf(line, sizeof(line), "battery n/a");
  }
  ui_draw_text(4, y, line, COL_FG);
  ui_draw_footer("` back", "refresh any key");
}

static void draw_about(void) {
  ui_clear(COL_BG);
  ui_draw_header("About");
  ui_wrap_print(
      4, 18, NEXUS_SCREEN_W - 8,
      "Dedicated Cardputer ADV firmware. "
      "No PSRAM — cannot run stories260K. "
      "For full hub use USB/Pi images. "
      "Pocket needs ESP32-S3 + PSRAM.",
      COL_FG);
  ui_draw_footer("` back", NEXUS_CARDPUTER_VERSION);
}

static void redraw(void) {
  switch (g_screen) {
    case SCR_HUB:
      draw_hub();
      break;
    case SCR_CHAT:
      draw_chat();
      break;
    case SCR_NOTES:
      draw_notes();
      break;
    case SCR_STATUS:
      draw_status();
      break;
    case SCR_ABOUT:
      draw_about();
      break;
  }
  g_dirty = false;
}

static void open_sel(void) {
  g_input[0] = '\0';
  g_reply[0] = '\0';
  switch (g_sel) {
    case 0:
      g_screen = SCR_CHAT;
      strncpy(g_reply, "TinyChat ready. Ask about boot, vault, pocket…",
              sizeof(g_reply) - 1);
      break;
    case 1:
      g_screen = SCR_NOTES;
      notes_read_tail(g_notes_view, sizeof(g_notes_view));
      break;
    case 2:
      g_screen = SCR_STATUS;
      break;
    case 3:
      g_screen = SCR_ABOUT;
      break;
    default:
      break;
  }
  g_dirty = true;
}

static void go_hub(void) {
  g_screen = SCR_HUB;
  g_input[0] = '\0';
  g_dirty = true;
}

static void handle_char(char c) {
  if (g_screen != SCR_CHAT && g_screen != SCR_NOTES) return;
  size_t n = strlen(g_input);
  if (c == 0x08 || c == 0x7f) { // backspace
    if (n > 0) {
      g_input[n - 1] = '\0';
      g_dirty = true;
    }
    return;
  }
  if (c >= 32 && c < 127 && n + 1 < sizeof(g_input)) {
    g_input[n] = c;
    g_input[n + 1] = '\0';
    g_dirty = true;
  }
}

static void handle_enter(void) {
  if (g_screen == SCR_HUB) {
    open_sel();
    return;
  }
  if (g_screen == SCR_CHAT) {
    if (!g_input[0]) return;
    tinychat_reply(g_input, g_reply, sizeof(g_reply));
    g_input[0] = '\0';
    g_dirty = true;
    return;
  }
  if (g_screen == SCR_NOTES) {
    if (!g_input[0]) return;
    if (notes_append(g_input)) {
      notes_read_tail(g_notes_view, sizeof(g_notes_view));
    } else {
      strncpy(g_notes_view, "save failed — check SD / SPIFFS",
              sizeof(g_notes_view) - 1);
    }
    g_input[0] = '\0';
    g_dirty = true;
  }
  if (g_screen == SCR_STATUS) {
    g_dirty = true;
  }
}

void hub_run(void) {
  g_dirty = true;
  for (;;) {
    M5Cardputer.update();
    if (g_dirty) redraw();

    if (M5Cardputer.Keyboard.isChange() && M5Cardputer.Keyboard.isPressed()) {
      Keyboard_Class::KeysState st = M5Cardputer.Keyboard.keysState();

      // Navigation on hub: ; = up (often mapped), ' = down on Cardputer layout
      // Also support arrows if present on ADV firmware keyboard maps
      for (auto k : st.word) {
        if (g_screen == SCR_HUB) {
          if (k == ';' || k == ',') {
            g_sel = (g_sel - 1 + k_count) % k_count;
            g_dirty = true;
          } else if (k == '\'' || k == '.') {
            g_sel = (g_sel + 1) % k_count;
            g_dirty = true;
          } else if (k >= '1' && k <= '4') {
            g_sel = k - '1';
            open_sel();
          } else {
            handle_char((char)k);
          }
        } else if (k == '`' || k == 0x1b) {
          go_hub();
        } else {
          handle_char((char)k);
        }
      }

      if (st.enter) handle_enter();
      if (st.del) handle_char(0x08);
    }

    // Fn+arrow style: some builds report hid keys — poll buttons if any
    delay(12);
  }
}
