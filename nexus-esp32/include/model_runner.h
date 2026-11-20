#pragma once

#include <Arduino.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

// Karpathy llama2.c checkpoint Config (stories260K / tinyllamas)
typedef struct {
  int dim;
  int hidden_dim;
  int n_layers;
  int n_heads;
  int n_kv_heads;
  int vocab_size;
  int seq_len;
} ModelConfig;

typedef struct {
  ModelConfig config;
  bool ready;
  bool demo_mode; // menu works; chat returns canned text if no weights
  char last_error[96];
} ModelRunner;

bool model_init(ModelRunner *mr);
void model_deinit(ModelRunner *mr);

// Generate into out (NUL-terminated). Returns tokens generated or -1 on error.
int model_generate(ModelRunner *mr, const char *prompt, char *out, size_t out_cap,
                   int max_new_tokens);

void model_print_status(const ModelRunner *mr);
