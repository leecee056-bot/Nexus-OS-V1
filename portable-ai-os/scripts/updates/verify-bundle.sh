#!/usr/bin/env bash
# Verify a Tri-Cass update bundle signature (HAP-68).
# Usage: bash scripts/updates/verify-bundle.sh <bundle.tar.zst>
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BUNDLE="${1:-}"
[[ -n "$BUNDLE" && -f "$BUNDLE" ]] || { echo "usage: $0 <bundle>" >&2; exit 1; }

PUB_MINI="${ROOT}/updates/trusted.pub"
PUB_PEM="${ROOT}/updates/trusted.pem"

if [[ -f "${BUNDLE}.minisig" ]] && command -v minisign >/dev/null && [[ -f "$PUB_MINI" ]]; then
  minisign -V -p "$PUB_MINI" -m "$BUNDLE" -x "${BUNDLE}.minisig"
  echo "OK minisign"
  exit 0
fi

if [[ -f "${BUNDLE}.sig" ]] && [[ -f "$PUB_PEM" ]]; then
  openssl pkeyutl -verify -pubin -inkey "$PUB_PEM" -rawin -in "$BUNDLE" -sigfile "${BUNDLE}.sig"
  echo "OK openssl"
  exit 0
fi

# sha256-only fallback when .sha256 present (dev)
if [[ -f "${BUNDLE}.sha256" ]]; then
  (cd "$(dirname "$BUNDLE")" && sha256sum -c "$(basename "$BUNDLE").sha256")
  echo "OK sha256 (unsigned trust — release builds should use minisign)"
  exit 0
fi

echo "No signature or trusted public key found" >&2
exit 1
