#!/usr/bin/env bash
# Generate update-signing keys (HAP-68). Prefer minisign; openssl fallback.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${1:-$ROOT/build/update-keys}"
mkdir -p "$OUT"

if command -v minisign >/dev/null; then
  echo "==> minisign keygen → $OUT"
  # -W unencrypted secret for lab use; operators should encrypt for real releases
  printf '\n' | minisign -G -p "$OUT/trusted.pub" -s "$OUT/secret.key" -W || \
    minisign -G -p "$OUT/trusted.pub" -s "$OUT/secret.key"
  cp -f "$OUT/trusted.pub" "$ROOT/updates/trusted.pub"
  echo "Public key copied to updates/trusted.pub (safe to commit once stable)."
  echo "Keep $OUT/secret.key offline — never commit."
  exit 0
fi

echo "==> minisign missing; openssl ed25519 fallback"
openssl genpkey -algorithm Ed25519 -out "$OUT/secret.pem"
openssl pkey -in "$OUT/secret.pem" -pubout -out "$OUT/trusted.pem"
cp -f "$OUT/trusted.pem" "$ROOT/updates/trusted.pem"
echo "Public key → updates/trusted.pem. Keep secret.pem offline."
