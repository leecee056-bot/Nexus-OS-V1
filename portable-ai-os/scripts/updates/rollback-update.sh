#!/usr/bin/env bash
# Restore LAST_GOOD snapshot after a bad update (HAP-68).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TARGET="${TRI_CASS_UPDATE_ROOT:-/opt/portable-ai-os}"
DATA_UPDATES="${AI_DATA:-/data}/updates"
CUR="$DATA_UPDATES/LAST_GOOD/current"

[[ -L "$CUR" || -d "$CUR" ]] || { echo "No LAST_GOOD snapshot" >&2; exit 1; }
SRC="$(readlink -f "$CUR" 2>/dev/null || echo "$CUR")"
[[ -d "$SRC" ]] || { echo "Broken LAST_GOOD link" >&2; exit 1; }

for part in runtime catalog tui knowledge VERSION; do
  if [[ -e "$SRC/$part" ]]; then
    rm -rf "$TARGET/$part"
    cp -a "$SRC/$part" "$TARGET/$part"
  fi
done

echo "==> Rolled back to $(basename "$SRC")"
