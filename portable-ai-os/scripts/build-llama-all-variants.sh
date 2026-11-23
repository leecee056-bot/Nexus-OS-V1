#!/usr/bin/env bash
# HAP-65 — Build llama.cpp with runtime CPU dispatch (all variants) when supported.
# Falls back to a portable SSE-friendly binary + optional host-native sibling.
# Usage: bash scripts/build-llama-all-variants.sh
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

install_bins() {
  local build_dir="$1"
  local suffix="${2:-}"
  local server cli
  server=$(find "$build_dir" -type f -name 'llama-server' -executable | head -1 || true)
  cli=$(find "$build_dir" -type f -name 'llama-cli' -executable | head -1 || true)
  [[ -n "$server" ]] || return 1
  cp -f "$server" "$RUNTIME_BIN/llama-server${suffix}"
  [[ -n "$cli" ]] && cp -f "$cli" "$RUNTIME_BIN/llama-cli${suffix}" || true
  find "$build_dir" -name 'libllama.so*' -o -name 'libggml*.so*' 2>/dev/null | while read -r so; do
    base=$(basename "$so")
    cp -f "$so" "$RUNTIME_BIN/${base}${suffix}" 2>/dev/null || cp -f "$so" "$RUNTIME_BIN/" 2>/dev/null || true
  done
  chmod +x "$RUNTIME_BIN/"* 2>/dev/null || true
}

# Prefer single binary with CPU feature backends (GGML_BACKEND_DL / ALL_VARIANTS).
try_all_variants() {
  echo "==> Trying GGML CPU all-variants / backend-dl build"
  rm -rf build-all
  local args=(
    -S . -B build-all
    -DCMAKE_BUILD_TYPE=Release
    -DGGML_NATIVE=OFF
    -DLLAMA_BUILD_SERVER=ON
    -DGGML_CUDA=OFF
    -DGGML_VULKAN=OFF
  )
  # Flags vary by llama.cpp revision — probe CMake options.
  if cmake -S . -B /tmp/llama-cmake-probe -N 2>/dev/null | grep -q GGML_CPU_ALL_VARIANTS \
    || grep -Rqs GGML_CPU_ALL_VARIANTS CMakeLists.txt ggml/CMakeLists.txt 2>/dev/null; then
    args+=(-DGGML_CPU_ALL_VARIANTS=ON)
  fi
  if grep -Rqs GGML_BACKEND_DL CMakeLists.txt ggml/CMakeLists.txt 2>/dev/null; then
    args+=(-DGGML_BACKEND_DL=ON)
  fi
  cmake "${args[@]}"
  cmake --build build-all --config Release -j"$(nproc)" --target llama-server llama-cli 2>/dev/null \
    || cmake --build build-all --config Release -j"$(nproc)"
  install_bins build-all ""
  # Default name stays llama-server
  ln -sfn llama-server "$RUNTIME_BIN/llama-server-all" 2>/dev/null || cp -f "$RUNTIME_BIN/llama-server" "$RUNTIME_BIN/llama-server-all"
  echo "all-variants" > "$PREFIX/CPU_VARIANT"
  echo "==> Installed all-variants binary to $RUNTIME_BIN"
  return 0
}

# Dual build: portable (no AVX) + native (host speed).
build_dual() {
  echo "==> Fallback: portable + native dual builds"
  rm -rf build-portable build-native
  cmake -S . -B build-portable \
    -DCMAKE_BUILD_TYPE=Release \
    -DGGML_NATIVE=OFF \
    -DGGML_AVX=OFF -DGGML_AVX2=OFF -DGGML_AVX512=OFF \
    -DGGML_FMA=OFF -DGGML_F16C=OFF \
    -DLLAMA_BUILD_SERVER=ON -DGGML_CUDA=OFF -DGGML_VULKAN=OFF
  cmake --build build-portable --config Release -j"$(nproc)" --target llama-server llama-cli 2>/dev/null \
    || cmake --build build-portable --config Release -j"$(nproc)"
  install_bins build-portable "-portable"
  cp -f "$RUNTIME_BIN/llama-server-portable" "$RUNTIME_BIN/llama-server"

  cmake -S . -B build-native \
    -DCMAKE_BUILD_TYPE=Release \
    -DGGML_NATIVE=ON \
    -DLLAMA_BUILD_SERVER=ON -DGGML_CUDA=OFF -DGGML_VULKAN=OFF
  cmake --build build-native --config Release -j"$(nproc)" --target llama-server llama-cli 2>/dev/null \
    || cmake --build build-native --config Release -j"$(nproc)"
  install_bins build-native "-native" || true

  # Pick runtime binary from CPU flags when possible
  if grep -m1 '^flags' /proc/cpuinfo 2>/dev/null | grep -Eqw 'avx2|avx'; then
    if [[ -x "$RUNTIME_BIN/llama-server-native" ]]; then
      cp -f "$RUNTIME_BIN/llama-server-native" "$RUNTIME_BIN/llama-server"
      echo "native" > "$PREFIX/CPU_VARIANT"
    fi
  else
    echo "portable" > "$PREFIX/CPU_VARIANT"
  fi
  echo "==> Dual builds ready (llama-server-portable / llama-server-native)"
}

if try_all_variants; then
  :
else
  echo "==> All-variants cmake failed; using dual-build fallback"
  build_dual
fi

cp -a "$RUNTIME_BIN/." "$PREFIX/bin/" 2>/dev/null || true
ls -la "$RUNTIME_BIN"/llama-server* 2>/dev/null || ls -la "$RUNTIME_BIN"
"$RUNTIME_BIN/llama-server" --version 2>&1 | head -5 || true
echo "==> HAP-65 build done ($COMMIT)"
echo "$COMMIT"
