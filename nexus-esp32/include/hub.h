#pragma once

#include "model_runner.h"

// USB-Serial TUI for NEXUS Pocket
void hub_banner(const ModelRunner *mr);
void hub_help(void);
void hub_loop(ModelRunner *mr);
