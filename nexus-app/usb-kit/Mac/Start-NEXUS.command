#!/bin/bash
cd "$(dirname "$0")"
export NEXUS_USB_ROOT="$(cd .. && pwd)"
export NEXUS_PORTABLE=1

APP="NEXUS Companion.app"
if [[ -d "$APP" ]]; then
  open "$APP"
  exit 0
fi

# Zip extract may leave the .app one level deeper
FOUND=$(find . -maxdepth 2 -name "NEXUS Companion.app" -type d 2>/dev/null | head -1)
if [[ -n "$FOUND" ]]; then
  open "$FOUND"
  exit 0
fi

echo "NEXUS Companion.app not found in Mac/"
echo "Copy the .app from the companion release zip/dmg into this folder."
echo "See README.txt"
read -r _
exit 1
