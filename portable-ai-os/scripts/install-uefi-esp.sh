#!/usr/bin/env bash
# Populate an ESP mount with dual-signed shim + GRUB + Tri-Cass grub.cfg.
# Usage: bash scripts/install-uefi-esp.sh /path/to/esp-mount
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ESP_MNT="${1:-}"
[[ -n "$ESP_MNT" && -d "$ESP_MNT" ]] || {
  echo "usage: $0 /mount/point/of/ESP" >&2
  exit 1
}

FLAT="$ROOT/build/uefi/vendor/esp-binaries"
CFG="$ROOT/boot/uefi/grub.cfg"
[[ -d "$FLAT" ]] || {
  echo "missing $FLAT — run: bash scripts/fetch-uefi-shim.sh" >&2
  exit 1
}
[[ -f "$CFG" ]] || { echo "missing $CFG" >&2; exit 1; }

SHIM=$(ls "$FLAT"/shimx64.efi.signed "$FLAT"/shimx64.efi 2>/dev/null | head -1 || true)
GRUB=$(ls "$FLAT"/grubx64.efi.signed "$FLAT"/grubx64.efi 2>/dev/null | head -1 || true)
MM=$(ls "$FLAT"/mmx64.efi.signed "$FLAT"/mmx64.efi 2>/dev/null | head -1 || true)

[[ -n "$SHIM" && -f "$SHIM" ]] || { echo "shimx64.efi missing in $FLAT" >&2; exit 1; }
[[ -n "$GRUB" && -f "$GRUB" ]] || { echo "grubx64.efi missing in $FLAT" >&2; exit 1; }

sudo mkdir -p "$ESP_MNT/EFI/BOOT" "$ESP_MNT/EFI/tri-cass" "$ESP_MNT/EFI/debian"

# Removable-media path: firmware looks for BOOTX64.EFI
sudo cp -f "$SHIM" "$ESP_MNT/EFI/BOOT/BOOTX64.EFI"
# GRUB next to shim (shim loads grubx64.efi from same directory on many builds)
sudo cp -f "$GRUB" "$ESP_MNT/EFI/BOOT/grubx64.efi"
if [[ -n "$MM" && -f "$MM" ]]; then
  sudo cp -f "$MM" "$ESP_MNT/EFI/BOOT/mmx64.efi"
fi

# Distro-style path (some shims prefer /EFI/debian/grubx64.efi)
sudo cp -f "$GRUB" "$ESP_MNT/EFI/debian/grubx64.efi"
sudo cp -f "$CFG" "$ESP_MNT/EFI/tri-cass/grub.cfg"
# Fallback cfg where GRUB often looks
sudo cp -f "$CFG" "$ESP_MNT/EFI/BOOT/grub.cfg"
sudo cp -f "$CFG" "$ESP_MNT/EFI/debian/grub.cfg"

echo "==> ESP populated under $ESP_MNT"
find "$ESP_MNT/EFI" -type f | sort
