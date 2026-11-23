#!/usr/bin/env bash
# Download Karpathy TinyStories stories260K checkpoint + tokenizer for SPIFFS.
# Output: data/model.bin  data/tokenizer.bin
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATA="$ROOT/data"
mkdir -p "$DATA"

# HuggingFace mirror of llama2.c tinystories (stories260K)
BASE_URL="${NEXUS_MODEL_BASE_URL:-https://huggingface.co/karpathy/tinyllamas/resolve/main}"

MODEL_URL="${BASE_URL}/stories260K/stories260K.bin"
TOK_URL="${BASE_URL}/stories260K/tok512.bin"

echo "==> Tri-Cass Pocket model fetch"
echo "    dest: $DATA"

fetch() {
  local url="$1" out="$2"
  if [[ -f "$out" && "${FORCE:-}" != "1" ]]; then
    echo "    skip (exists): $out"
    return 0
  fi
  echo "    get $url"
  if command -v curl >/dev/null 2>&1; then
    curl -fL --retry 3 -o "$out.partial" "$url"
  elif command -v wget >/dev/null 2>&1; then
    wget -O "$out.partial" "$url"
  else
    echo "need curl or wget" >&2
    exit 1
  fi
  mv "$out.partial" "$out"
}

fetch "$MODEL_URL" "$DATA/model.bin"
fetch "$TOK_URL" "$DATA/tokenizer.bin"

ls -lh "$DATA/model.bin" "$DATA/tokenizer.bin"
echo
echo "Next:"
echo "  pio run -e nexus-pocket-s3 -t upload"
echo "  pio run -e nexus-pocket-s3 -t uploadfs   # flashes data/ → SPIFFS"
echo "  pio device monitor"
echo
echo "Optional larger model later (~29M stories15M) needs more flash headroom;"
echo "keep stories260K as the default Pocket path."
