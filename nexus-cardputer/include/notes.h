#pragma once

#include <stddef.h>
#include <stdbool.h>

bool notes_begin(void);
bool notes_append(const char *line);
// Fill out with last notes (newest last). Returns bytes written.
size_t notes_read_tail(char *out, size_t out_cap);
const char *notes_backend(void); // "sd" | "spiffs" | "none"
bool notes_sd_mounted(void);     // microSD available for vault / notes
