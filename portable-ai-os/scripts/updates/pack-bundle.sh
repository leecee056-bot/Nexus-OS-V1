#!/usr/bin/env bash
# Pack a staged tree into a signed update bundle (HAP-68).
# Usage: bash scripts/updates/pack-bundle.sh <stage-dir> <version>
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STAGE="${1:-}"
VERSION="${2:-}"
[[ -n "$STAGE" && -d "$STAGE" && -n "$VERSION" ]] || {
  echo "usage: $0 <stage-dir> <version>" >&2
  exit 1
}

OUT_DIR="${UPDATE_OUT:-$ROOT/build/updates}"
mkdir -p "$OUT_DIR"
NAME="tri-cass-update-${VERSION}.tar.zst"
ARCHIVE="$OUT_DIR/$NAME"

echo "$VERSION" > "$STAGE/VERSION"
# Manifest of files
(cd "$STAGE" && find . -type f | sort > MANIFEST.txt)

if command -v zstd >/dev/null; then
  tar -C "$STAGE" -cf - . | zstd -T0 -19 -o "$ARCHIVE"
else
  ARCHIVE="${ARCHIVE%.zst}.gz"
  NAME="$(basename "$ARCHIVE")"
  tar -C "$STAGE" -czf "$ARCHIVE" .
fi

(cd "$OUT_DIR" && sha256sum "$NAME" > "${NAME}.sha256")

KEY_DIR="${UPDATE_KEY_DIR:-$ROOT/build/update-keys}"
if [[ -f "$KEY_DIR/secret.key" ]] && command -v minisign >/dev/null; then
  minisign -S -s "$KEY_DIR/secret.key" -m "$ARCHIVE" -x "${ARCHIVE}.minisig"
  echo "Signed: ${ARCHIVE}.minisig"
elif [[ -f "$KEY_DIR/secret.pem" ]]; then
  openssl pkeyutl -sign -inkey "$KEY_DIR/secret.pem" -rawin -in "$ARCHIVE" -out "${ARCHIVE}.sig"
  echo "Signed: ${ARCHIVE}.sig"
else
  echo "WARNING: no signing key — ran gen-keys.sh? Bundle packed unsigned." >&2
fi

ls -lh "$ARCHIVE"*
echo "==> Bundle ready: $ARCHIVE"
