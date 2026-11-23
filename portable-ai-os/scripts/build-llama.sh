#!/usr/bin/env bash
# Build llama.cpp (llama-server + cli) for host arch.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_ROOT="${PORTABLE_AI_BUILD_ROOT:-/tmp/portable-ai-os-build}"
SRC="$BUILD_ROOT/llama.cpp"
PREFIX="$ROOT/build/llama"
RUNTIME_BIN="${PORTABLE_AI_RUNTIME:-/agent/portable-ai-os-runtime}/bin"
TAG="$(grep -E '^llama.cpp.tag=' "$ROOT/versions.lock" | cut -d= -f2)"
GIT_URL="$(grep -E '^llama.cpp.git=' "$ROOT/versions.lock" | cut -d= -f2)"

mkdir -p "$BUILD_ROOT" "$PREFIX/bin" "$RUNTIME_BIN"

if [[ ! -d "$SRC/.git" ]]; then
  echo "==> Cloning llama.cpp ($TAG)"
  git clone --depth 1 --branch "$TAG" "$GIT_URL" "$SRC" \
    || git clone --depth 1 "$GIT_URL" "$SRC"
else
  echo "==> Using existing $SRC"
fi

cd "$SRC"
COMMIT="$(git rev-parse HEAD)"
echo "$COMMIT" > "$PREFIX/COMMIT"
echo "$COMMIT" > "$RUNTIME_BIN/../COMMIT" 2>/dev/null || true

# Portable CPU flags for old PCs / QEMU (override with GGML_NATIVE=ON for host-only speed)
NATIVE="${GGML_NATIVE:-OFF}"
echo "==> Configuring (CPU, server, GGML_NATIVE=$NATIVE)"
cmake -S . -B build \
  -DCMAKE_BUILD_TYPE=Release \
  -DGGML_NATIVE="$NATIVE" \
  -DGGML_AVX=OFF -DGGML_AVX2=OFF -DGGML_AVX512=OFF \
  -DGGML_FMA=OFF -DGGML_F16C=OFF \
  -DLLAMA_BUILD_SERVER=ON \
  -DGGML_CUDA=OFF \
  -DGGML_VULKAN=OFF

echo "==> Building"
cmake --build build --config Release -j"$(nproc)" --target llama-server llama-cli 2>/dev/null \
  || cmake --build build --config Release -j"$(nproc)"

# Install to runtime (executable) and copy into store tree
find build -type f -name 'llama-server' -executable | head -1 | xargs -I{} cp -f {} "$RUNTIME_BIN/"
find build -type f -name 'llama-cli' -executable | head -1 | xargs -I{} cp -f {} "$RUNTIME_BIN/" || true
find build -name 'libllama.so*' -o -name 'libggml*.so*' 2>/dev/null | while read -r so; do
  cp -f "$so" "$RUNTIME_BIN/" 2>/dev/null || true
done
chmod +x "$RUNTIME_BIN/"* || true

# Best-effort mirror into store (may be non-executable on FUSE)
cp -a "$RUNTIME_BIN/." "$PREFIX/bin/" 2>/dev/null || true
echo "$COMMIT" > "$PREFIX/COMMIT"

ls -la "$RUNTIME_BIN"
"$RUNTIME_BIN/llama-server" --version 2>&1 | head -5 || true
echo "==> Installed to $RUNTIME_BIN (mirrored to $PREFIX/bin)"
echo "$COMMIT"
