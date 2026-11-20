#pragma once

#include <stddef.h>
#include <stdbool.h>

typedef struct {
  char **vocab;
  float *scores;
  int vocab_size;
  unsigned int max_token_length;
  bool ready;
} Tokenizer;

bool tokenizer_load(Tokenizer *t, const char *path);
void tokenizer_free(Tokenizer *t);

// Encode prompt into token ids. Returns count.
int tokenizer_encode(Tokenizer *t, const char *text, int *tokens, int max_tokens,
                     bool bos);

// Decode one token id into buf.
void tokenizer_decode(Tokenizer *t, int token, char *buf, size_t buf_cap);
