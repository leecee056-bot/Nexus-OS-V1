#pragma once

#include <stddef.h>

// Built-in offline tools for the Serial hub.
void tools_list(void);
// Run tool by name with optional arg. Writes human text into out.
bool tools_run(const char *name, const char *arg, char *out, size_t out_cap);
