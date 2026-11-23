#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/env.sh" 2>/dev/null || true
PIDFILE="${ROOT}/data/logs/llama-server.pid"
if [[ -f "$PIDFILE" ]]; then
  PID="$(cat "$PIDFILE")"
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID" || true
    sleep 0.5
    kill -9 "$PID" 2>/dev/null || true
    echo "Stopped $PID"
  fi
  rm -f "$PIDFILE"
fi
pkill -f "${PORTABLE_AI_BIN:-llama}/llama-server" 2>/dev/null || true
pkill -f 'llama-server' 2>/dev/null || true
echo "Infer stopped"
