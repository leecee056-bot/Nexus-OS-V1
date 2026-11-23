#!/usr/bin/env bash
# Download Debian-family dual-signed shim + GRUB EFI packages for HAP-64.
# Blobs land in build/uefi/vendor/ (gitignored). Does not modify images.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=/dev/null
source "$ROOT/scripts/env.sh" 2>/dev/null || true

VENDOR="$ROOT/build/uefi/vendor"
mkdir -p "$VENDOR"

SUITE="${UEFI_DEB_SUITE:-$(grep -E '^uefi.debian.suite=' "$ROOT/versions.lock" 2>/dev/null | cut -d= -f2 || true)}"
SUITE="${SUITE:-bookworm}"
MIRROR="${UEFI_DEB_MIRROR:-http://deb.debian.org/debian}"
ARCH="${UEFI_DEB_ARCH:-amd64}"

need() { command -v "$1" >/dev/null || { echo "missing $1" >&2; exit 1; }; }
need curl
need ar
need tar
need xz || need unxz || true

echo "==> Fetching signed UEFI packages (Debian $SUITE/$ARCH)"
echo "    mirror=$MIRROR"
echo "    out=$VENDOR"

# Resolve current package filenames from Packages index (no hard-coded versions).
PKG_INDEX="$VENDOR/Packages.xz"
curl -fsSL "$MIRROR/dists/$SUITE/main/binary-$ARCH/Packages.xz" -o "$PKG_INDEX"
PACKAGES_TXT="$VENDOR/Packages.txt"
if command -v xz >/dev/null; then
  xz -dc "$PKG_INDEX" > "$PACKAGES_TXT"
elif command -v unxz >/dev/null; then
  unxz -c "$PKG_INDEX" > "$PACKAGES_TXT"
else
  echo "need xz or unxz to read Packages.xz" >&2
  exit 1
fi

pick_filename() {
  local pkg="$1"
  awk -v p="$pkg" '
    $1=="Package:" && $2==p {hit=1}
    hit && $1=="Filename:" {print $2; exit}
    hit && $1=="Package:" && $2!=p {hit=0}
  ' "$PACKAGES_TXT"
}

SHIM_PATH="$(pick_filename shim-signed)"
GRUB_PATH="$(pick_filename grub-efi-amd64-signed)"
SHIM_HELPER_PATH="$(pick_filename shim-helpers-amd64-signed || true)"

[[ -n "$SHIM_PATH" ]] || { echo "shim-signed not found in $SUITE" >&2; exit 1; }
[[ -n "$GRUB_PATH" ]] || { echo "grub-efi-amd64-signed not found in $SUITE" >&2; exit 1; }

download_deb() {
  local rel="$1"
  local url="$MIRROR/$rel"
  local base
  base="$(basename "$rel")"
  echo "==> $base"
  curl -fsSL "$url" -o "$VENDOR/$base"
  echo "$base" >> "$VENDOR/FETCHED.txt"
}

: > "$VENDOR/FETCHED.txt"
download_deb "$SHIM_PATH"
download_deb "$GRUB_PATH"
if [[ -n "${SHIM_HELPER_PATH:-}" ]]; then
  download_deb "$SHIM_HELPER_PATH" || true
fi

extract_deb() {
  local deb="$1"
  local dest="$2"
  mkdir -p "$dest"
  local tmp
  tmp="$(mktemp -d)"
  (cd "$tmp" && ar x "$deb")
  if [[ -f "$tmp/data.tar.xz" ]]; then
    tar -C "$dest" -xJf "$tmp/data.tar.xz"
  elif [[ -f "$tmp/data.tar.gz" ]]; then
    tar -C "$dest" -xzf "$tmp/data.tar.gz"
  elif [[ -f "$tmp/data.tar.zst" ]]; then
    if command -v zstd >/dev/null; then
      zstd -dc "$tmp/data.tar.zst" | tar -C "$dest" -x
    else
      echo "zstd required for $deb" >&2
      rm -rf "$tmp"
      return 1
    fi
  else
    echo "unknown data.tar in $deb" >&2
    rm -rf "$tmp"
    return 1
  fi
  rm -rf "$tmp"
}

STAGE="$VENDOR/extract"
rm -rf "$STAGE"
mkdir -p "$STAGE"
for deb in "$VENDOR"/*.deb; do
  [[ -f "$deb" ]] || continue
  extract_deb "$deb" "$STAGE"
done

# Collect known EFI binaries into a flat staging dir for install-uefi-esp.sh
FLAT="$VENDOR/esp-binaries"
rm -rf "$FLAT"
mkdir -p "$FLAT"
find "$STAGE" -type f \( -name 'shimx64.efi*' -o -name 'grubx64.efi*' -o -name 'mmx64.efi*' -o -name 'BOOTX64.CSV' \) \
  -exec cp -av {} "$FLAT/" \;

cat > "$VENDOR/MANIFEST.txt" <<EOF
suite=$SUITE
arch=$ARCH
mirror=$MIRROR
fetched=$(date -u +%Y-%m-%dT%H:%M:%SZ)
shim=$(ls "$FLAT"/shimx64.efi* 2>/dev/null | head -1 || echo MISSING)
grub=$(ls "$FLAT"/grubx64.efi* 2>/dev/null | head -1 || echo MISSING)
EOF

echo "==> Staged EFI binaries:"
ls -la "$FLAT"
echo "==> Manifest: $VENDOR/MANIFEST.txt"
if ! ls "$FLAT"/shimx64.efi* >/dev/null 2>&1; then
  echo "ERROR: shimx64.efi not found after extract" >&2
  exit 1
fi
if ! ls "$FLAT"/grubx64.efi* >/dev/null 2>&1; then
  echo "ERROR: grubx64.efi not found after extract" >&2
  exit 1
fi
echo "==> Ready for ENABLE_UEFI=1 bash scripts/build-usb-image.sh x86_64"
