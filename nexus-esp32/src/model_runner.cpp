#include "model_runner.h"

#include "config.h"
#include "tokenizer.h"

#include <Arduino.h>
#include <FS.h>
#include <SPIFFS.h>
#include <math.h>
#include <stdlib.h>
#include <string.h>

// --- Transformer weights (llama2.c layout) ---
typedef struct {
  float *token_embedding_table;
  float *rms_att_weight;
  float *rms_ffn_weight;
  float *wq;
  float *wk;
  float *wv;
  float *wo;
  float *w1;
  float *w2;
  float *w3;
  float *rms_final_weight;
  float *wcls;
} TransformerWeights;

typedef struct {
  float *x;
  float *xb;
  float *xb2;
  float *hb;
  float *hb2;
  float *q;
  float *k;
  float *v;
  float *att;
  float *logits;
  float *key_cache;
  float *value_cache;
} RunState;

typedef struct {
  ModelConfig config;
  TransformerWeights weights;
  RunState state;
  Tokenizer tokenizer;
  bool weights_ok;
} Transformer;

static Transformer g_tf;
static bool g_tf_alive = false;

static void set_err(ModelRunner *mr, const char *msg) {
  strncpy(mr->last_error, msg, sizeof(mr->last_error) - 1);
  mr->last_error[sizeof(mr->last_error) - 1] = '\0';
}

static void rmsnorm(float *o, float *x, float *weight, int size) {
  float ss = 0.0f;
  for (int j = 0; j < size; j++) {
    ss += x[j] * x[j];
  }
  ss /= size;
  ss += 1e-5f;
  ss = 1.0f / sqrtf(ss);
  for (int j = 0; j < size; j++) {
    o[j] = weight[j] * (ss * x[j]);
  }
}

static void softmax(float *x, int size) {
  float max_val = x[0];
  for (int i = 1; i < size; i++) {
    if (x[i] > max_val) max_val = x[i];
  }
  float sum = 0.0f;
  for (int i = 0; i < size; i++) {
    x[i] = expf(x[i] - max_val);
    sum += x[i];
  }
  for (int i = 0; i < size; i++) {
    x[i] /= sum;
  }
}

static void matmul(float *xout, float *x, float *w, int n, int d) {
  // W (d,n) @ x (n,) -> xout (d,)
  for (int i = 0; i < d; i++) {
    float val = 0.0f;
    for (int j = 0; j < n; j++) {
      val += w[i * n + j] * x[j];
    }
    xout[i] = val;
  }
}

static float *forward(Transformer *t, int token, int pos) {
  ModelConfig *p = &t->config;
  TransformerWeights *w = &t->weights;
  RunState *s = &t->state;
  float *x = s->x;
  int dim = p->dim;
  int kv_dim = (p->dim * p->n_kv_heads) / p->n_heads;
  int kv_mul = p->n_heads / p->n_kv_heads;
  int hidden_dim = p->hidden_dim;
  int head_size = dim / p->n_heads;

  memcpy(x, w->token_embedding_table + token * dim, dim * sizeof(float));

  for (int l = 0; l < p->n_layers; l++) {
    rmsnorm(s->xb, x, w->rms_att_weight + l * dim, dim);

    int loff = l * p->seq_len * kv_dim;
    s->k = s->key_cache + loff + pos * kv_dim;
    s->v = s->value_cache + loff + pos * kv_dim;

    matmul(s->q, s->xb, w->wq + l * dim * dim, dim, dim);
    matmul(s->k, s->xb, w->wk + l * dim * kv_dim, dim, kv_dim);
    matmul(s->v, s->xb, w->wv + l * dim * kv_dim, dim, kv_dim);

    // RoPE
    for (int i = 0; i < dim; i += 2) {
      int head_dim = i % head_size;
      float freq = 1.0f / powf(10000.0f, head_dim / (float)head_size);
      float val = pos * freq;
      float fcr = cosf(val);
      float fci = sinf(val);
      int rotn = i < kv_dim ? 2 : 1;
      for (int v = 0; v < rotn; v++) {
        float *vec = v == 0 ? s->q : s->k;
        float v0 = vec[i];
        float v1 = vec[i + 1];
        vec[i] = v0 * fcr - v1 * fci;
        vec[i + 1] = v0 * fci + v1 * fcr;
      }
    }

    // multihead attention
    for (int h = 0; h < p->n_heads; h++) {
      float *q = s->q + h * head_size;
      float *att = s->att + h * p->seq_len;
      for (int tpos = 0; tpos <= pos; tpos++) {
        float *k = s->key_cache + loff + tpos * kv_dim + (h / kv_mul) * head_size;
        float score = 0.0f;
        for (int i = 0; i < head_size; i++) {
          score += q[i] * k[i];
        }
        score /= sqrtf((float)head_size);
        att[tpos] = score;
      }
      softmax(att, pos + 1);
      float *xb = s->xb + h * head_size;
      memset(xb, 0, head_size * sizeof(float));
      for (int tpos = 0; tpos <= pos; tpos++) {
        float *v = s->value_cache + loff + tpos * kv_dim + (h / kv_mul) * head_size;
        float a = att[tpos];
        for (int i = 0; i < head_size; i++) {
          xb[i] += a * v[i];
        }
      }
    }

    matmul(s->xb2, s->xb, w->wo + l * dim * dim, dim, dim);
    for (int i = 0; i < dim; i++) {
      x[i] += s->xb2[i];
    }

    rmsnorm(s->xb, x, w->rms_ffn_weight + l * dim, dim);
    matmul(s->hb, s->xb, w->w1 + l * dim * hidden_dim, dim, hidden_dim);
    matmul(s->hb2, s->xb, w->w3 + l * dim * hidden_dim, dim, hidden_dim);
    for (int i = 0; i < hidden_dim; i++) {
      float val = s->hb[i];
      val *= (1.0f / (1.0f + expf(-val))); // silu
      val *= s->hb2[i];
      s->hb[i] = val;
    }
    matmul(s->xb, s->hb, w->w2 + l * dim * hidden_dim, hidden_dim, dim);
    for (int i = 0; i < dim; i++) {
      x[i] += s->xb[i];
    }
  }

  rmsnorm(x, x, w->rms_final_weight, dim);
  matmul(s->logits, x, w->wcls, p->dim, p->vocab_size);
  return s->logits;
}

static int sample_argmax(float *probabilities, int n) {
  int max_i = 0;
  float max_p = probabilities[0];
  for (int i = 1; i < n; i++) {
    if (probabilities[i] > max_p) {
      max_i = i;
      max_p = probabilities[i];
    }
  }
  return max_i;
}

static bool malloc_run_state(RunState *s, ModelConfig *p) {
  int kv_dim = (p->dim * p->n_kv_heads) / p->n_heads;
  s->x = (float *)ps_calloc(p->dim, sizeof(float));
  s->xb = (float *)ps_calloc(p->dim, sizeof(float));
  s->xb2 = (float *)ps_calloc(p->dim, sizeof(float));
  s->hb = (float *)ps_calloc(p->hidden_dim, sizeof(float));
  s->hb2 = (float *)ps_calloc(p->hidden_dim, sizeof(float));
  s->q = (float *)ps_calloc(p->dim, sizeof(float));
  s->att = (float *)ps_calloc(p->n_heads * p->seq_len, sizeof(float));
  s->logits = (float *)ps_calloc(p->vocab_size, sizeof(float));
  s->key_cache =
      (float *)ps_calloc(p->n_layers * p->seq_len * kv_dim, sizeof(float));
  s->value_cache =
      (float *)ps_calloc(p->n_layers * p->seq_len * kv_dim, sizeof(float));
  return s->x && s->xb && s->xb2 && s->hb && s->hb2 && s->q && s->att &&
         s->logits && s->key_cache && s->value_cache;
}

static bool map_weights(TransformerWeights *w, ModelConfig *p, float *ptr,
                        bool shared_weights) {
  int kv_dim = (p->dim * p->n_kv_heads) / p->n_heads;
  float *pcur = ptr;
  w->token_embedding_table = pcur;
  pcur += (size_t)p->vocab_size * p->dim;
  w->rms_att_weight = pcur;
  pcur += (size_t)p->n_layers * p->dim;
  w->wq = pcur;
  pcur += (size_t)p->n_layers * p->dim * p->dim;
  w->wk = pcur;
  pcur += (size_t)p->n_layers * p->dim * kv_dim;
  w->wv = pcur;
  pcur += (size_t)p->n_layers * p->dim * kv_dim;
  w->wo = pcur;
  pcur += (size_t)p->n_layers * p->dim * p->dim;
  w->rms_ffn_weight = pcur;
  pcur += (size_t)p->n_layers * p->dim;
  w->w1 = pcur;
  pcur += (size_t)p->n_layers * p->dim * p->hidden_dim;
  w->w2 = pcur;
  pcur += (size_t)p->n_layers * p->hidden_dim * p->dim;
  w->w3 = pcur;
  pcur += (size_t)p->n_layers * p->dim * p->hidden_dim;
  w->rms_final_weight = pcur;
  pcur += p->dim;
  pcur += (size_t)p->seq_len * (p->dim / p->n_heads); // skip freq cis
  w->wcls = shared_weights ? w->token_embedding_table : pcur;
  (void)pcur;
  return true;
}

static bool load_weights_file(Transformer *t, const char *path) {
  File f = SPIFFS.open(path, "r");
  if (!f) return false;

  ModelConfig cfg;
  if (f.read((uint8_t *)&cfg, sizeof(ModelConfig)) != sizeof(ModelConfig)) {
    f.close();
    return false;
  }
  // vocab_size can be negative in llama2.c to mean unshared classifier
  bool shared = true;
  if (cfg.vocab_size < 0) {
    shared = false;
    cfg.vocab_size = -cfg.vocab_size;
  }
  t->config = cfg;

  size_t file_left = f.size() - sizeof(ModelConfig);
  float *data = (float *)ps_malloc(file_left);
  if (!data) {
    f.close();
    return false;
  }
  size_t got = f.read((uint8_t *)data, file_left);
  f.close();
  if (got != file_left) {
    free(data);
    return false;
  }

  map_weights(&t->weights, &t->config, data, shared);
  // keep pointer via token_embedding_table base (first alloc)
  if (!malloc_run_state(&t->state, &t->config)) {
    free(data);
    return false;
  }
  t->weights_ok = true;
  return true;
}

bool model_init(ModelRunner *mr) {
  memset(mr, 0, sizeof(*mr));
  memset(&g_tf, 0, sizeof(g_tf));
  g_tf_alive = true;

  if (!SPIFFS.begin(true)) {
    set_err(mr, "SPIFFS mount failed");
    mr->demo_mode = true;
    mr->ready = true;
    return true;
  }

  bool tok = tokenizer_load(&g_tf.tokenizer, NEXUS_TOKENIZER_PATH);
  bool wts = load_weights_file(&g_tf, NEXUS_MODEL_PATH);

  if (!wts || !tok) {
    set_err(mr, wts ? "tokenizer missing — run fetch_model.sh"
                    : "model.bin missing — run fetch_model.sh");
    mr->demo_mode = true;
    mr->ready = true;
    // still expose expected config for status
    mr->config.dim = 64;
    mr->config.hidden_dim = 172;
    mr->config.n_layers = 5;
    mr->config.n_heads = 8;
    mr->config.n_kv_heads = 4;
    mr->config.vocab_size = 512;
    mr->config.seq_len = 512;
    return true;
  }

  mr->config = g_tf.config;
  mr->demo_mode = false;
  mr->ready = true;
  set_err(mr, "");
  return true;
}

void model_deinit(ModelRunner *mr) {
  (void)mr;
  if (g_tf_alive) {
    tokenizer_free(&g_tf.tokenizer);
    if (g_tf.weights.token_embedding_table) {
      free(g_tf.weights.token_embedding_table);
    }
    free(g_tf.state.x);
    free(g_tf.state.xb);
    free(g_tf.state.xb2);
    free(g_tf.state.hb);
    free(g_tf.state.hb2);
    free(g_tf.state.q);
    free(g_tf.state.att);
    free(g_tf.state.logits);
    free(g_tf.state.key_cache);
    free(g_tf.state.value_cache);
    memset(&g_tf, 0, sizeof(g_tf));
    g_tf_alive = false;
  }
}

static int demo_generate(const char *prompt, char *out, size_t out_cap) {
  const char *body =
      "[demo] No model.bin on SPIFFS yet.\n"
      "Flash stories260K with scripts/fetch_model.sh, then upload SPIFFS.\n"
      "Prompt was: ";
  snprintf(out, out_cap, "%s%.120s", body, prompt ? prompt : "");
  return 0;
}

int model_generate(ModelRunner *mr, const char *prompt, char *out, size_t out_cap,
                   int max_new_tokens) {
  if (!mr || !out || out_cap < 8) return -1;
  out[0] = '\0';

  if (mr->demo_mode || !g_tf.weights_ok) {
    return demo_generate(prompt, out, out_cap);
  }

  if (max_new_tokens <= 0) max_new_tokens = NEXUS_MAX_NEW_TOKENS;
  if (max_new_tokens > 128) max_new_tokens = 128;

  int tokens[256];
  int n_tokens =
      tokenizer_encode(&g_tf.tokenizer, prompt ? prompt : "", tokens, 200, true);
  if (n_tokens <= 0) {
    set_err(mr, "encode failed");
    return -1;
  }

  size_t used = 0;
  int pos = 0;
  int token = tokens[0];

  // clear KV
  int kv_dim = (g_tf.config.dim * g_tf.config.n_kv_heads) / g_tf.config.n_heads;
  memset(g_tf.state.key_cache, 0,
         (size_t)g_tf.config.n_layers * g_tf.config.seq_len * kv_dim *
             sizeof(float));
  memset(g_tf.state.value_cache, 0,
         (size_t)g_tf.config.n_layers * g_tf.config.seq_len * kv_dim *
             sizeof(float));

  int generated = 0;
  while (pos < g_tf.config.seq_len) {
    float *logits = forward(&g_tf, token, pos);

    if (pos < n_tokens - 1) {
      token = tokens[pos + 1];
    } else {
      // temperature 1.0 greedy for stability on MCU
      softmax(logits, g_tf.config.vocab_size);
      token = sample_argmax(logits, g_tf.config.vocab_size);
      generated++;

      char piece[64];
      tokenizer_decode(&g_tf.tokenizer, token, piece, sizeof(piece));
      size_t plen = strlen(piece);
      if (used + plen + 1 < out_cap) {
        memcpy(out + used, piece, plen);
        used += plen;
        out[used] = '\0';
      }
      if (token == 2 || generated >= max_new_tokens) { // EOS ~2
        break;
      }
    }
    pos++;
    // yield to USB serial / watchdog
    if ((pos & 3) == 0) {
      delay(1);
      yield();
    }
  }
  return generated;
}

void model_print_status(const ModelRunner *mr) {
  if (!mr) return;
  Serial.printf("model: %s\n", mr->demo_mode ? "DEMO (no weights)" : "READY");
  Serial.printf("  dim=%d layers=%d heads=%d vocab=%d seq=%d\n", mr->config.dim,
                mr->config.n_layers, mr->config.n_heads, mr->config.vocab_size,
                mr->config.seq_len);
  if (mr->last_error[0]) {
    Serial.printf("  note: %s\n", mr->last_error);
  }
  Serial.printf("  free heap=%u  free psram=%u\n", ESP.getFreeHeap(),
                ESP.getFreePsram());
}
