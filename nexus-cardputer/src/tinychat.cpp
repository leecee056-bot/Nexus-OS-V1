#include "tinychat.h"

#include <Arduino.h>
#include <ctype.h>
#include <string.h>

// Compact flash-resident corpus. Not a neural net — fits ADV with no PSRAM.
// String literals live in flash .rodata on ESP32 — keep the table tiny.
static const char *const k_phrases[] = {
    "Tri-Cass Cardputer keeps chat offline on this tiny board.",
    "No PSRAM here — TinyChat uses a flash phrase corpus, not llama weights.",
    "Boot the USB or Pi image for the full hub with SmolLM2 and Vault.",
    "Pocket ESP32 with PSRAM can run stories260K over Serial.",
    "Use Notes to jot ideas to microSD when a card is inserted.",
    "Status shows free heap, battery, and storage backend.",
    "Arrow keys or ;/' move the hub — Enter opens, ` or Esc goes back.",
    "This screen is 240 by 135 — keep prompts short.",
    "Flashing erases nothing on your PC; only this Cardputer firmware.",
    "Knowledge Vault on PC/Pi is a searchable notebook, not Wikipedia.",
    "Cyberdecks often pair a Pi card with a pocket companion board.",
    "Try asking about boot, flash, vault, pocket, battery, or notes.",
    "Matrix green is the house look — bright phosphor on near-black.",
    "Secure Boot off helps unsigned USB images on stubborn PCs.",
    "Pi 4 is the primary microSD target; Pi 5 is best-effort.",
    "Reserve a Network username on the website if you want — optional.",
    "TinyChat replies are stitched from local lines — honest and light.",
    "When heap is low, close Chat and open Status to check free RAM.",
    "microSD is preferred for notes; SPIFFS is the fallback.",
    "Welcome to Tri-Cass — offline AI for sticks, Pi, and pocket boards.",
};

static const size_t k_n = sizeof(k_phrases) / sizeof(k_phrases[0]);

static bool has_word(const char *hay, const char *needle) {
  if (!hay || !needle || !needle[0]) return false;
  const char *p = hay;
  size_t nlen = strlen(needle);
  while (*p) {
    while (*p && !isalnum((unsigned char)*p)) p++;
    if (!*p) break;
    const char *start = p;
    while (*p && isalnum((unsigned char)*p)) p++;
    size_t wlen = (size_t)(p - start);
    if (wlen == nlen) {
      bool ok = true;
      for (size_t i = 0; i < nlen; i++) {
        if (tolower((unsigned char)start[i]) != tolower((unsigned char)needle[i])) {
          ok = false;
          break;
        }
      }
      if (ok) return true;
    }
  }
  return false;
}

static int score_phrase(const char *phrase, const char *prompt) {
  int score = 0;
  static const char *keys[] = {"boot",   "flash", "vault", "pocket", "pi",
                               "usb",    "note",  "sd",    "battery", "ram",
                               "psram",  "chat",  "model", "tri-cass",  "menu",
                               "hello",  "help",  "status"};
  for (size_t i = 0; i < sizeof(keys) / sizeof(keys[0]); i++) {
    if (has_word(prompt, keys[i]) && has_word(phrase, keys[i])) score += 3;
  }
  if (has_word(prompt, "hello") || has_word(prompt, "hi")) {
    if (strstr(phrase, "Welcome")) score += 4;
  }
  if (has_word(prompt, "psram") || has_word(prompt, "memory")) {
    if (strstr(phrase, "PSRAM") || strstr(phrase, "heap")) score += 4;
  }
  return score;
}

void tinychat_reply(const char *prompt, char *out, size_t out_cap) {
  if (!out || out_cap < 8) return;
  out[0] = '\0';
  if (!prompt || !prompt[0]) {
    strncpy(out, "Say something short — TinyChat is local flash corpus.", out_cap - 1);
    out[out_cap - 1] = '\0';
    return;
  }

  int best = 0;
  int best_score = -1;
  int second = 1;
  int second_score = -1;

  for (size_t i = 0; i < k_n; i++) {
    // PROGMEM pointer table of const char* in RAM on ESP32 Arduino — safe
    const char *ph = k_phrases[i];
    int s = score_phrase(ph, prompt);
    if (s > best_score) {
      second = best;
      second_score = best_score;
      best = (int)i;
      best_score = s;
    } else if (s > second_score) {
      second = (int)i;
      second_score = s;
    }
  }

  if (best_score <= 0) {
    best = (int)(esp_random() % k_n);
    second = (int)((best + 3) % k_n);
  }

  snprintf(out, out_cap, "%s %s", k_phrases[best],
           (best_score >= 3 && second != best) ? k_phrases[second] : "");
  // trim trailing space
  size_t n = strlen(out);
  while (n > 0 && out[n - 1] == ' ') out[--n] = '\0';
}
