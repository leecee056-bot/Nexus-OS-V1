#!/usr/bin/env bash
# Host vertical-slice demo: probe → start infer → TUI (or oneshot).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/env.sh"
cd "$ROOT"

echo "=== Tri-Cass OS — host demo ==="
bash "$ROOT/scripts/probe-hw.sh"

if [[ ! -x "$PORTABLE_AI_BIN/llama-server" ]]; then
  echo "Building llama.cpp..."
  bash "$ROOT/scripts/build-llama.sh"
  # shellcheck disable=SC1091
  source "$ROOT/scripts/env.sh"
fi

if ! ls "$PORTABLE_AI_MODELS"/*.gguf >/dev/null 2>&1; then
  echo "Downloading rescue/small models..."
  PORTABLE_AI_MODELS="$PORTABLE_AI_MODELS" bash "$ROOT/scripts/download-models.sh" t0 \
    || PORTABLE_AI_MODELS="$PORTABLE_AI_MODELS" bash "$ROOT/scripts/download-models.sh" rescue || true
fi

MODEL=""
for cand in \
  "$PORTABLE_AI_MODELS/SmolLM2-135M-Instruct-Q8_0.gguf" \
  "$PORTABLE_AI_MODELS/SmolLM2-135M-Instruct-Q4_K_M.gguf" \
  "$PORTABLE_AI_MODELS"/*.gguf
do
  [[ -f "$cand" ]] && MODEL="$cand" && break
done
[[ -n "$MODEL" ]] || { echo "No models available in $PORTABLE_AI_MODELS"; exit 1; }

export N_CTX="${N_CTX:-512}"
export N_BATCH="${N_BATCH:-128}"
bash "$ROOT/scripts/start-infer.sh" "$MODEL"

if [[ "${1:-}" == "--oneshot" ]]; then
  shift
  PROMPT="${*:-Say hello in one short sentence.}"
  python3 "$ROOT/tui/chat.py" --oneshot "$PROMPT" --models "$PORTABLE_AI_MODELS"
  exit 0
fi

exec python3 "$ROOT/tui/chat.py" --models "$PORTABLE_AI_MODELS"
