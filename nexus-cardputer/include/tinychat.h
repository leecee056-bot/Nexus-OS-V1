#pragma once

#include <stddef.h>

// Flash-corpus TinyChat — no neural weights, fits Cardputer ADV SRAM.
void tinychat_reply(const char *prompt, char *out, size_t out_cap);
