#!/usr/bin/env bash
# Start llama-server on loopback with cgroup-friendly defaults.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/env.sh"

SERVER="${PORTABLE_AI_BIN}/llama-server"
MODELS_DIR="${PORTABLE_AI_MODELS}"
HOST="${INFER_HOST:-127.0.0.1}"
PORT="${INFER_PORT:-8080}"
MODEL_PATH="${1:-}"
CTX="${N_CTX:-512}"
THREADS="${N_THREADS:-}"
BATCH="${N_BATCH:-128}"

if [[ ! -x "$SERVER" ]]; then
  echo "llama-server missing at $SERVER; run scripts/build-llama.sh first" >&2
  exit 1
fi

if [[ -z "$MODEL_PATH" ]]; then
  for cand in \
    "$MODELS_DIR"/SmolLM2-135M-Instruct-Q8_0.gguf \
    "$MODELS_DIR"/SmolLM2-135M-Instruct-Q4_K_M.gguf \
    "$MODELS_DIR"/*.gguf
  do
    [[ -f "$cand" ]] && MODEL_PATH="$cand" && break
  done
fi

if [[ -z "${MODEL_PATH}" || ! -f "$MODEL_PATH" ]]; then
  echo "No GGUF found in $MODELS_DIR" >&2
  exit 1
fi

if [[ -z "$THREADS" ]]; then
  CORES="$(nproc)"
  THREADS=$((CORES > 1 ? CORES - 1 : 1))
fi

PIDFILE="${ROOT}/data/logs/llama-server.pid"
LOGFILE="${ROOT}/data/logs/llama-server.log"
mkdir -p "${ROOT}/data/logs" "$PORTABLE_AI_RUNTIME/logs"

if [[ -f "$PIDFILE" ]] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  if curl -sf "http://${HOST}:${PORT}/health" >/dev/null 2>&1 \
    || curl -sf "http://${HOST}:${PORT}/v1/models" >/dev/null 2>&1; then
    echo "Already running pid=$(cat "$PIDFILE")"
    exit 0
  fi
  echo "Stale/unhealthy pid $(cat "$PIDFILE"); restarting"
  kill "$(cat "$PIDFILE")" 2>/dev/null || true
  sleep 0.5
  kill -9 "$(cat "$PIDFILE")" 2>/dev/null || true
  rm -f "$PIDFILE"
fi

echo "==> Starting llama-server"
echo "    model=$MODEL_PATH"
echo "    bind=${HOST}:${PORT} ctx=$CTX threads=$THREADS batch=$BATCH"

# Optional cgroup v2 slice
if mkdir -p /sys/fs/cgroup/portable-ai-infer 2>/dev/null; then
  if [[ -n "${CGROUP_MEMORY_MAX:-}" ]]; then
    echo "$CGROUP_MEMORY_MAX" > /sys/fs/cgroup/portable-ai-infer/memory.max 2>/dev/null || true
  fi
fi

export LD_LIBRARY_PATH="${PORTABLE_AI_BIN}:${LD_LIBRARY_PATH:-}"

nohup "$SERVER" \
  -m "$MODEL_PATH" \
  --host "$HOST" \
  --port "$PORT" \
  -c "$CTX" \
  -t "$THREADS" \
  -b "$BATCH" \
  --parallel 1 \
  >"$LOGFILE" 2>&1 &
echo $! > "$PIDFILE"
echo $! > "$PORTABLE_AI_RUNTIME/logs/llama-server.pid" 2>/dev/null || true

if [[ -d /sys/fs/cgroup/portable-ai-infer ]]; then
  echo $! > /sys/fs/cgroup/portable-ai-infer/cgroup.procs 2>/dev/null || true
fi

for i in $(seq 1 90); do
  if curl -sf "http://${HOST}:${PORT}/health" >/dev/null 2>&1 \
    || curl -sf "http://${HOST}:${PORT}/v1/models" >/dev/null 2>&1; then
    echo "Ready on http://${HOST}:${PORT} (pid=$(cat "$PIDFILE"))"
    exit 0
  fi
  sleep 0.5
done

echo "Server did not become ready; see $LOGFILE" >&2
tail -50 "$LOGFILE" >&2 || true
exit 1
