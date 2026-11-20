#include "tokenizer.h"

#include <Arduino.h>
#include <FS.h>
#include <SPIFFS.h>
#include <math.h>
#include <stdlib.h>
#include <string.h>

bool tokenizer_load(Tokenizer *t, const char *path) {
  memset(t, 0, sizeof(*t));
  File f = SPIFFS.open(path, "r");
  if (!f) {
    return false;
  }

  if (f.read((uint8_t *)&t->max_token_length, sizeof(int)) != sizeof(int)) {
    f.close();
    return false;
  }
  // vocab size inferred later — for llama2.c tokenizer.bin we read until EOF
  // stories260K ships vocab_size 512; allocate that then grow if needed
  int cap = 512;
  t->vocab = (char **)ps_malloc(sizeof(char *) * (size_t)cap);
  t->scores = (float *)ps_malloc(sizeof(float) * (size_t)cap);
  if (!t->vocab || !t->scores) {
    f.close();
    return false;
  }
  memset(t->vocab, 0, sizeof(char *) * (size_t)cap);

  int i = 0;
  while (f.available()) {
    if (i >= cap) {
      int ncap = cap * 2;
      char **nv = (char **)ps_malloc(sizeof(char *) * (size_t)ncap);
      float *ns = (float *)ps_malloc(sizeof(float) * (size_t)ncap);
      if (!nv || !ns) {
        f.close();
        return false;
      }
      memcpy(nv, t->vocab, sizeof(char *) * (size_t)cap);
      memcpy(ns, t->scores, sizeof(float) * (size_t)cap);
      memset(nv + cap, 0, sizeof(char *) * (size_t)(ncap - cap));
      free(t->vocab);
      free(t->scores);
      t->vocab = nv;
      t->scores = ns;
      cap = ncap;
    }
    float score = 0;
    int len = 0;
    if (f.read((uint8_t *)&score, sizeof(float)) != sizeof(float)) break;
    if (f.read((uint8_t *)&len, sizeof(int)) != sizeof(int)) break;
    if (len <= 0 || len > 256) break;
    char *s = (char *)ps_malloc((size_t)len + 1);
    if (!s) {
      f.close();
      return false;
    }
    if (f.read((uint8_t *)s, (size_t)len) != (size_t)len) {
      free(s);
      break;
    }
    s[len] = '\0';
    t->vocab[i] = s;
    t->scores[i] = score;
    i++;
  }
  f.close();
  t->vocab_size = i;
  t->ready = t->vocab_size > 0;
  return t->ready;
}

void tokenizer_free(Tokenizer *t) {
  if (!t) return;
  if (t->vocab) {
    for (int i = 0; i < t->vocab_size; i++) {
      free(t->vocab[i]);
    }
    free(t->vocab);
  }
  free(t->scores);
  memset(t, 0, sizeof(*t));
}

static int str_lookup(Tokenizer *t, const char *str) {
  for (int i = 0; i < t->vocab_size; i++) {
    if (t->vocab[i] && strcmp(t->vocab[i], str) == 0) return i;
  }
  return -1;
}

int tokenizer_encode(Tokenizer *t, const char *text, int *tokens, int max_tokens,
                     bool bos) {
  if (!t->ready || !text || max_tokens <= 0) return 0;
  int n = 0;
  if (bos && n < max_tokens) {
    // BOS is usually token 1 in llama2.c tinystories
    tokens[n++] = 1;
  }

  // Greedy byte-pair style merge using scores (simplified llama2.c encode)
  // Start with UTF-8 bytes as single-char pieces when present in vocab
  char *str = (char *)ps_malloc(strlen(text) * 2 + 16);
  if (!str) return n;
  str[0] = '\0';

  // Build initial piece list as concatenated with spaces — use simple char loop
  // For MCU: encode as sequence of vocab lookups on longest prefix
  const char *p = text;
  while (*p && n < max_tokens) {
    int best = -1;
    int best_len = 0;
    for (int len = 1; p[len - 1]; len++) {
      char tmp[64];
      if (len >= (int)sizeof(tmp)) break;
      memcpy(tmp, p, (size_t)len);
      tmp[len] = '\0';
      int id = str_lookup(t, tmp);
      if (id >= 0) {
        best = id;
        best_len = len;
      } else if (best >= 0) {
        break; // longer won't match after a miss for this simple scan
      }
      // continue trying longer for BPE; cap
      if (len > 24) break;
    }
    if (best < 0) {
      // unknown byte → skip / use unk 0
      tokens[n++] = 0;
      p++;
    } else {
      tokens[n++] = best;
      p += best_len;
    }
  }
  free(str);
  return n;
}

void tokenizer_decode(Tokenizer *t, int token, char *buf, size_t buf_cap) {
  if (!buf || buf_cap == 0) return;
  buf[0] = '\0';
  if (!t->ready || token < 0 || token >= t->vocab_size || !t->vocab[token]) {
    return;
  }
  strncpy(buf, t->vocab[token], buf_cap - 1);
  buf[buf_cap - 1] = '\0';
  // llama2.c: strip leading space marker for token pieces sometimes stored with space
}
