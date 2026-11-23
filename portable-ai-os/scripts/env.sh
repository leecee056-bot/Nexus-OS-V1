#!/usr/bin/env bash
# Shared paths: store tree may be non-executable / unable to hold large GGUFs.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PORTABLE_AI_ROOT="$ROOT"

# Prefer stick layout, then agent runtime, then local
if [[ -z "${PORTABLE_AI_RUNTIME:-}" ]]; then
  if [[ -x /opt/portable-ai-os/runtime/bin/llama-server ]]; then
    export PORTABLE_AI_RUNTIME=/opt/portable-ai-os/runtime
  elif [[ -x /agent/portable-ai-os-runtime/bin/llama-server ]]; then
    export PORTABLE_AI_RUNTIME=/agent/portable-ai-os-runtime
  else
    export PORTABLE_AI_RUNTIME="${ROOT}/build/llama"
  fi
fi

# Binaries
if [[ -x "$PORTABLE_AI_RUNTIME/bin/llama-server" ]]; then
  export PORTABLE_AI_BIN="$PORTABLE_AI_RUNTIME/bin"
elif [[ -x "$ROOT/build/llama/bin/llama-server" ]]; then
  export PORTABLE_AI_BIN="$ROOT/build/llama/bin"
else
  export PORTABLE_AI_BIN="$PORTABLE_AI_RUNTIME/bin"
  mkdir -p "$PORTABLE_AI_BIN"
  if [[ -f "$ROOT/build/llama/bin/llama-server" ]]; then
    cp -a "$ROOT/build/llama/bin/." "$PORTABLE_AI_BIN/" 2>/dev/null || true
    chmod +x "$PORTABLE_AI_BIN/"* 2>/dev/null || true
  fi
fi

# Models
if [[ -z "${PORTABLE_AI_MODELS:-}" ]]; then
  if ls "$PORTABLE_AI_RUNTIME/models"/*.gguf >/dev/null 2>&1; then
    export PORTABLE_AI_MODELS="$PORTABLE_AI_RUNTIME/models"
  elif ls "$ROOT/models"/*.gguf >/dev/null 2>&1; then
    export PORTABLE_AI_MODELS="$ROOT/models"
  else
    export PORTABLE_AI_MODELS="$PORTABLE_AI_RUNTIME/models"
  fi
fi

# Persistence
if [[ -z "${AI_DATA:-}" ]]; then
  if [[ -d /data ]]; then
    export AI_DATA=/data
  elif [[ -d /agent/portable-ai-os-runtime/data ]]; then
    export AI_DATA=/agent/portable-ai-os-runtime/data
  else
    export AI_DATA="$ROOT/data"
  fi
fi
export PORTABLE_AI_DATA="${PORTABLE_AI_DATA:-$AI_DATA}"

export LD_LIBRARY_PATH="${PORTABLE_AI_BIN}:${LD_LIBRARY_PATH:-}"
export INFER_HOST="${INFER_HOST:-127.0.0.1}"
export INFER_PORT="${INFER_PORT:-8080}"
