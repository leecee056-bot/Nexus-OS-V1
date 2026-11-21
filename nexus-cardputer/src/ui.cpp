#include "ui.h"

#include "config.h"

#include <M5Cardputer.h>

void ui_begin(void) {
  auto &d = M5Cardputer.Display;
  d.setRotation(1); // landscape 240×135
  d.setTextSize(1);
  d.setTextDatum(top_left);
  d.setFont(&fonts::Font0);
  ui_clear(COL_BG);
}

void ui_clear(uint16_t color) {
  M5Cardputer.Display.fillScreen(color);
}

void ui_fill_rect(int16_t x, int16_t y, int16_t w, int16_t h, uint16_t color) {
  M5Cardputer.Display.fillRect(x, y, w, h, color);
}

void ui_draw_text(int16_t x, int16_t y, const char *text, uint16_t color) {
  M5Cardputer.Display.setTextColor(color, COL_BG);
  M5Cardputer.Display.setCursor(x, y);
  M5Cardputer.Display.print(text ? text : "");
}

void ui_draw_header(const char *title) {
  ui_fill_rect(0, 0, NEXUS_SCREEN_W, 14, COL_BAR);
  M5Cardputer.Display.setTextColor(COL_ACCENT, COL_BAR);
  M5Cardputer.Display.setCursor(4, 3);
  M5Cardputer.Display.print(title ? title : NEXUS_CARDPUTER_NAME);
}

void ui_draw_footer(const char *left, const char *right) {
  ui_fill_rect(0, NEXUS_SCREEN_H - 12, NEXUS_SCREEN_W, 12, COL_BAR);
  M5Cardputer.Display.setTextColor(COL_DIM, COL_BAR);
  M5Cardputer.Display.setCursor(4, NEXUS_SCREEN_H - 10);
  M5Cardputer.Display.print(left ? left : "");
  if (right && right[0]) {
    int16_t tw = M5Cardputer.Display.textWidth(right);
    M5Cardputer.Display.setCursor(NEXUS_SCREEN_W - tw - 4, NEXUS_SCREEN_H - 10);
    M5Cardputer.Display.print(right);
  }
}

void ui_draw_menu_row(int16_t y, int index, const char *label, bool active) {
  if (active) {
    ui_fill_rect(2, y - 1, NEXUS_SCREEN_W - 4, 12, COL_BAR);
    M5Cardputer.Display.setTextColor(COL_ACCENT, COL_BAR);
  } else {
    M5Cardputer.Display.setTextColor(COL_FG, COL_BG);
  }
  char line[48];
  snprintf(line, sizeof(line), "%02d %s", index + 1, label ? label : "");
  M5Cardputer.Display.setCursor(6, y);
  M5Cardputer.Display.print(line);
}

void ui_wrap_print(int16_t x, int16_t y, int16_t max_w, const char *text,
                   uint16_t color) {
  if (!text) return;
  M5Cardputer.Display.setTextColor(color, COL_BG);
  int16_t cx = x;
  int16_t cy = y;
  const char *p = text;
  char word[40];
  size_t wi = 0;
  auto flush = [&](bool force_nl) {
    word[wi] = '\0';
    if (wi == 0 && !force_nl) return;
    int16_t ww = M5Cardputer.Display.textWidth(word);
    if (cx + ww > x + max_w && cx > x) {
      cx = x;
      cy += 10;
    }
    if (cy > NEXUS_SCREEN_H - 22) return;
    M5Cardputer.Display.setCursor(cx, cy);
    M5Cardputer.Display.print(word);
    cx += ww;
    wi = 0;
    if (force_nl) {
      cx = x;
      cy += 10;
    }
  };
  while (*p && cy <= NEXUS_SCREEN_H - 22) {
    if (*p == '\n') {
      flush(true);
      p++;
      continue;
    }
    if (*p == ' ') {
      if (wi + 1 < sizeof(word)) word[wi++] = ' ';
      flush(false);
      p++;
      continue;
    }
    if (wi + 1 < sizeof(word)) word[wi++] = *p;
    p++;
  }
  flush(false);
}
