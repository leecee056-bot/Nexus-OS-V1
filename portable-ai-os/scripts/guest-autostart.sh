#!/bin/sh
# Runs on the USB image after login / via systemd — start infer + TUI.
set -eu
export PATH="/usr/local/bin:/usr/bin:/bin:/opt/portable-ai-os/runtime/bin:$PATH"
export PORTABLE_AI_ROOT="/opt/portable-ai-os"
export PORTABLE_AI_RUNTIME="/opt/portable-ai-os/runtime"
export PORTABLE_AI_MODELS="/opt/portable-ai-os/runtime/models"
export AI_DATA="/data"
export LD_LIBRARY_PATH="/opt/portable-ai-os/runtime/bin:${LD_LIBRARY_PATH:-}"
export N_CTX="${N_CTX:-512}"
export N_BATCH="${N_BATCH:-128}"
export N_THREADS="${N_THREADS:-1}"

# Mount AI_DATA if present and not mounted
if [ ! -d /data/config ]; then
  mkdir -p /data
  if [ -b /dev/disk/by-label/AI_DATA ]; then
    mount /dev/disk/by-label/AI_DATA /data 2>/dev/null || true
  elif [ -b /dev/sdb2 ]; then
    mount /dev/sdb2 /data 2>/dev/null || true
  elif [ -b /dev/vda2 ]; then
    mount /dev/vda2 /data 2>/dev/null || true
  elif [ -b /dev/sda2 ]; then
    mount /dev/sda2 /data 2>/dev/null || true
  fi
  mkdir -p /data/config /data/models /data/memory /data/images /data/logs \
    /data/knowledge/raw /data/notes
fi
mkdir -p /data/knowledge/raw /data/notes 2>/dev/null || true

# Seed catalog into data
cp -f /opt/portable-ai-os/catalog/catalog.json /data/models/catalog.json 2>/dev/null || true
if [ ! -f /data/config/ui.toml ] && [ -f /opt/portable-ai-os/configs/ui.toml ]; then
  cp -f /opt/portable-ai-os/configs/ui.toml /data/config/ui.toml
fi

# Seed Knowledge Vault starter pack (how-tos + glossary). Do not overwrite user edits.
STARTER_SRC="/opt/portable-ai-os/knowledge/starter"
if [ -d "$STARTER_SRC" ]; then
  mkdir -p /data/knowledge/raw
  for f in "$STARTER_SRC"/*.md; do
    [ -f "$f" ] || continue
    base=$(basename "$f")
    if [ ! -f "/data/knowledge/raw/$base" ]; then
      cp -f "$f" "/data/knowledge/raw/$base" 2>/dev/null || true
    fi
  done
fi

# Hardware probe (best-effort)
if [ -x /opt/portable-ai-os/scripts/probe-hw.sh ]; then
  /bin/bash /opt/portable-ai-os/scripts/probe-hw.sh > /data/logs/probe.json 2>/dev/null || true
fi

# Start llama-server if not up
if ! curl -sf http://127.0.0.1:8080/health >/dev/null 2>&1; then
  /bin/bash /opt/portable-ai-os/scripts/start-infer.sh || true
fi

cd /opt/portable-ai-os
# Prefer hub; fall back to chat.py entry (which launches hub)
exec /usr/bin/python3 /opt/portable-ai-os/tui/hub.py \
  --models "$PORTABLE_AI_MODELS" \
  --catalog /opt/portable-ai-os/catalog/catalog.json
