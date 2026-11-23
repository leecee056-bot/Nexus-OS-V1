#!/usr/bin/env bash
# Hardware probe → JSON on stdout (ai-hw-probe stand-in)
set -euo pipefail

ARCH="$(uname -m)"
MEM_KB="$(awk '/MemTotal/ {print $2}' /proc/meminfo)"
MEM_MB=$((MEM_KB / 1024))
CORES="$(nproc)"
FLAGS="$(grep -m1 '^flags' /proc/cpuinfo 2>/dev/null | cut -d: -f2 || true)"
HAS_AVX2=0; HAS_AVX=0; HAS_SSE42=0
echo "$FLAGS" | grep -qw avx2 && HAS_AVX2=1 || true
echo "$FLAGS" | grep -qw avx && HAS_AVX=1 || true
echo "$FLAGS" | grep -qw sse4_2 && HAS_SSE42=1 || true

OS_RESERVE="${OS_RESERVE_MB:-350}"
UI_RESERVE="${UI_RESERVE_MB:-96}"
USABLE=$((MEM_MB - OS_RESERVE - UI_RESERVE))
[[ $USABLE -lt 128 ]] && USABLE=128

THREADS=$((CORES > 1 ? CORES - 1 : 1))

if [[ $MEM_MB -lt 2500 ]]; then TIER=T0
elif [[ $MEM_MB -lt 7000 ]]; then TIER=T1
else TIER=T2
fi

python3 - <<PY
import json
print(json.dumps({
  "arch": "$ARCH",
  "mem_mb": $MEM_MB,
  "usable_ram_mb": $USABLE,
  "cores": $CORES,
  "threads": $THREADS,
  "avx2": bool($HAS_AVX2),
  "avx": bool($HAS_AVX),
  "sse4_2": bool($HAS_SSE42),
  "tier": "$TIER",
}, indent=2))
PY
