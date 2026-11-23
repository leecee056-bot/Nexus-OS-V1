#!/usr/bin/env bash
# Boot the flashable .img in QEMU (BIOS/legacy) and capture serial evidence.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ARCH="${1:-x86_64}"
OUT_DIR="${PORTABLE_AI_IMAGE_DIR:-/agent/portable-ai-os-images}"
IMG="$OUT_DIR/portable-ai-os-${ARCH}.img"
MEDIA="${PORTABLE_AI_MEDIA:-/cursor/stores/self/media}"
RAM_MB="${QEMU_RAM_MB:-2048}"
mkdir -p "$MEDIA"

[[ -f "$IMG" ]] || { echo "missing $IMG — run build-usb-image.sh $ARCH" >&2; exit 1; }

case "$ARCH" in
  x86_64) QEMU=qemu-system-x86_64; CPU=qemu64 ;;
  i686)   QEMU=qemu-system-i386;  CPU=qemu32; RAM_MB="${QEMU_RAM_MB:-1536}" ;;
  *) echo "bad arch"; exit 1 ;;
esac

LOG="$MEDIA/qemu-usb-${ARCH}.log"
SERIAL_LOG="$MEDIA/qemu-usb-${ARCH}-serial.log"
echo "==> QEMU BIOS boot $IMG RAM=${RAM_MB}MB → $SERIAL_LOG"

# Copy image to work area so QEMU snapshots don't touch master? Use -snapshot for smoke.
# Use IDE so generic initrd need not include virtio_blk; matches many old PCs better.
timeout "${QEMU_TIMEOUT:-240}" "$QEMU" \
  -machine pc,accel=tcg \
  -cpu "$CPU" \
  -m "$RAM_MB" \
  -smp 2 \
  -drive file="$IMG",format=raw,if=ide,index=0,media=disk \
  -boot c \
  -nographic \
  -serial file:"$SERIAL_LOG" \
  -monitor none \
  -no-reboot \
  2>"$LOG" || true

echo "---- serial tail ----"
tail -80 "$SERIAL_LOG" 2>/dev/null || true
echo "---- log tail ----"
tail -40 "$LOG" 2>/dev/null || true

# Heuristics
if grep -qiE 'Tri-Cass OS|Portable AI OS|llama-server|login:|portable-ai|systemd' "$SERIAL_LOG" 2>/dev/null; then
  echo "BOOT_SIGNAL=ok"
else
  echo "BOOT_SIGNAL=unclear — inspect $SERIAL_LOG"
fi
