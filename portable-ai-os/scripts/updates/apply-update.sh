#!/usr/bin/env bash
# Verify + apply update bundle; keep LAST_GOOD for rollback (HAP-68).
# Usage: bash scripts/updates/apply-update.sh <bundle.tar.zst>
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BUNDLE="${1:-}"
[[ -n "$BUNDLE" && -f "$BUNDLE" ]] || { echo "usage: $0 <bundle>" >&2; exit 1; }

TARGET="${TRI_CASS_UPDATE_ROOT:-/opt/portable-ai-os}"
DATA_UPDATES="${AI_DATA:-/data}/updates"
mkdir -p "$DATA_UPDATES/PENDING" "$DATA_UPDATES/LAST_GOOD"

bash "$ROOT/scripts/updates/verify-bundle.sh" "$BUNDLE"

rm -rf "$DATA_UPDATES/PENDING"/*
mkdir -p "$DATA_UPDATES/PENDING"
if [[ "$BUNDLE" == *.zst ]]; then
  zstd -dc "$BUNDLE" | tar -C "$DATA_UPDATES/PENDING" -xf -
elif [[ "$BUNDLE" == *.gz ]]; then
  tar -C "$DATA_UPDATES/PENDING" -xzf "$BUNDLE"
else
  tar -C "$DATA_UPDATES/PENDING" -xf "$BUNDLE"
fi

# Snapshot current tree pieces we replace
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP="$DATA_UPDATES/LAST_GOOD/$STAMP"
mkdir -p "$BACKUP"
for part in runtime catalog tui knowledge VERSION; do
  if [[ -e "$TARGET/$part" ]]; then
    cp -a "$TARGET/$part" "$BACKUP/" 2>/dev/null || true
  fi
done
ln -sfn "$STAMP" "$DATA_UPDATES/LAST_GOOD/current"

# Promote (best-effort; needs write access to TARGET)
for part in runtime catalog tui knowledge VERSION; do
  if [[ -e "$DATA_UPDATES/PENDING/$part" ]]; then
    mkdir -p "$TARGET"
    rm -rf "$TARGET/$part"
    cp -a "$DATA_UPDATES/PENDING/$part" "$TARGET/$part"
  fi
done

echo "$STAMP" > "$DATA_UPDATES/LAST_APPLIED"
echo "==> Applied update from $BUNDLE"
echo "    Rollback: bash $ROOT/scripts/updates/rollback-update.sh"
