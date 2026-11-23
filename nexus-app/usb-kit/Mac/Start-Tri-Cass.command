#!/bin/bash
cd "$(dirname "$0")"
export TRICASS_USB_ROOT="$(cd .. && pwd)"
export TRICASS_PORTABLE=1

APP="Tri-Cass Companion.app"
if [[ -d "$APP" ]]; then
  open "$APP"
  exit 0
fi

# Zip extract may leave the .app one level deeper
FOUND=$(find . -maxdepth 2 -name "Tri-Cass Companion.app" -type d 2>/dev/null | head -1)
if [[ -n "$FOUND" ]]; then
  open "$FOUND"
  exit 0
fi

echo "Tri-Cass Companion.app not found in Mac/"
echo "Copy the .app from the companion release zip/dmg into this folder."
echo "See README.txt"
read -r _
exit 1
