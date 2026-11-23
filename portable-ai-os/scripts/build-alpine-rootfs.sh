#!/usr/bin/env bash
# Scaffold Alpine rootfs for live/squashfs (x86_64). Requires root or fakeroot+unshare.
# Full USB flash polish is deferred; this produces a rootfs tarball + optional squashfs.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ARCH="${1:-x86_64}"
ALPINE_VER="$(grep -E '^alpine.version=' "$ROOT/versions.lock" | cut -d= -f2)"
MIRROR="$(grep -E '^alpine.mirror=' "$ROOT/versions.lock" | cut -d= -f2)"
REL="$(grep -E '^alpine.release=' "$ROOT/versions.lock" | cut -d= -f2)"
OUT="$ROOT/build/alpine/${ARCH}"
WORKDIR="${PORTABLE_AI_BUILD_ROOT:-/tmp/portable-ai-os-build}/rootfs-${ARCH}"

mkdir -p "$OUT" "$WORKDIR"

MINIROOTFS="alpine-minirootfs-${ALPINE_VER}-${ARCH}.tar.gz"
URL="${MIRROR}/${REL}/releases/${ARCH}/${MINIROOTFS}"

echo "==> Alpine minirootfs $ARCH $ALPINE_VER"
echo "    $URL"

if [[ ! -f "$OUT/$MINIROOTFS" ]]; then
  curl -fL --retry 3 -o "$OUT/$MINIROOTFS" "$URL" \
    || curl -fL --retry 3 -o "$OUT/$MINIROOTFS" \
      "https://dl-cdn.alpinelinux.org/alpine/${REL}/releases/${ARCH}/${MINIROOTFS}"
fi

rm -rf "$WORKDIR/root"
mkdir -p "$WORKDIR/root"
tar -xzf "$OUT/$MINIROOTFS" -C "$WORKDIR/root"

# Overlay Portable AI OS payload into /opt/portable-ai-os
PAYLOAD="$WORKDIR/root/opt/portable-ai-os"
mkdir -p "$PAYLOAD"
cp -a "$ROOT/catalog" "$ROOT/configs" "$ROOT/tui" "$ROOT/scripts" "$PAYLOAD/"
mkdir -p "$PAYLOAD/models" "$PAYLOAD/data/logs" "$PAYLOAD/build/llama/bin"

if [[ -d "$ROOT/build/llama/bin" ]]; then
  cp -a "$ROOT/build/llama/bin/." "$PAYLOAD/build/llama/bin/" || true
fi
# Seed tiny models if present (don't copy multi-GB into every bake by default)
for f in "$ROOT/models"/SmolLM2*.gguf; do
  [[ -f "$f" ]] && cp -a "$f" "$PAYLOAD/models/" || true
done
cp -f "$ROOT/catalog/catalog.json" "$PAYLOAD/models/catalog.json" 2>/dev/null || true

# OpenRC-ish start script inside rootfs
mkdir -p "$WORKDIR/root/etc/local.d"
cat > "$WORKDIR/root/etc/local.d/portable-ai.start" <<'EOF'
#!/bin/sh
# Best-effort autostart when using a full Alpine image with local.d
export PATH=/usr/local/bin:/usr/bin:/bin
PAYLOAD=/opt/portable-ai-os
if [ -x "$PAYLOAD/build/llama/bin/llama-server" ]; then
  cd "$PAYLOAD" || exit 0
  N_CTX=512 N_BATCH=128 /bin/sh scripts/start-infer.sh &
fi
EOF
chmod +x "$WORKDIR/root/etc/local.d/portable-ai.start" 2>/dev/null || true

# Package list / SBOM stub
{
  echo "# portable-ai-os alpine rootfs seed"
  echo "alpine_minirootfs=$MINIROOTFS"
  echo "arch=$ARCH"
  date -u +"built=%Y-%m-%dT%H:%M:%SZ"
} > "$OUT/BUILDINFO"

# Tarball of customized rootfs
TAR="$OUT/portable-ai-os-rootfs-${ARCH}.tar.gz"
tar -C "$WORKDIR/root" -czf "$TAR" .
echo "Wrote $TAR"

# Squashfs if tool present
if command -v mksquashfs >/dev/null; then
  SFS="$OUT/ai-sys-${ARCH}.squashfs"
  mksquashfs "$WORKDIR/root" "$SFS" -comp xz -noappend
  echo "Wrote $SFS"
  (cd "$OUT" && sha256sum "$(basename "$SFS")" "$(basename "$TAR")" "$MINIROOTFS" > SHA256SUMS) || true
else
  echo "mksquashfs not found; skipped squashfs"
fi

echo "==> Rootfs scaffold complete for $ARCH"
echo "    Next: scripts/run-qemu.sh (guest) or flash docs in README"
