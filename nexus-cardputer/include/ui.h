#pragma once

#include <Arduino.h>

void ui_begin(void);
void ui_clear(uint16_t color);
void ui_draw_header(const char *title);
void ui_draw_footer(const char *left, const char *right);
void ui_draw_text(int16_t x, int16_t y, const char *text, uint16_t color);
void ui_draw_menu_row(int16_t y, int index, const char *label, bool active);
void ui_fill_rect(int16_t x, int16_t y, int16_t w, int16_t h, uint16_t color);
void ui_wrap_print(int16_t x, int16_t y, int16_t max_w, const char *text, uint16_t color);

// Matrix-ish palette (16-bit RGB565)
static const uint16_t COL_BG = 0x0208;      // near black-green
static const uint16_t COL_FG = 0x87F0;      // bright green
static const uint16_t COL_DIM = 0x3C68;     // dim green
static const uint16_t COL_ACCENT = 0x3FE0;  // #39ff14-ish
static const uint16_t COL_BAR = 0x0A20;
