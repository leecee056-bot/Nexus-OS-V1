#!/usr/bin/env bash
# Build a sideloadable Companion APK without Expo cloud (no EXPO_TOKEN).
# Uses expo prebuild + Gradle. Release builds are signed with the Android
# debug keystore so phones can install them outside Play Store.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERSION="$(node -p "require('./package.json').version")"
OUT_DIR="$ROOT/release"
OUT_APK="$OUT_DIR/NEXUS-Companion-Android-${VERSION}.apk"

echo "Building NEXUS Companion Android ${VERSION}…"

rm -rf android
npx expo prebuild -p android --non-interactive

# Point release signing at the standard debug keystore (sideload / CI).
APP_GRADLE="$ROOT/android/app/build.gradle"
if [[ -f "$APP_GRADLE" ]]; then
  python3 - <<'PY'
from pathlib import Path
import re

path = Path("android/app/build.gradle")
text = path.read_text()
if "signingConfig signingConfigs.debug" in text and re.search(
    r"release\s*\{[^}]*signingConfig signingConfigs.debug", text, re.S
):
    print("Release already uses debug signing")
else:
    text2, n = re.subn(
        r"(release\s*\{)",
        r"\1\n            signingConfig signingConfigs.debug",
        text,
        count=1,
    )
    if n == 0:
        text2 = text.replace(
            "buildTypes {",
            "buildTypes {\n        release {\n            signingConfig signingConfigs.debug\n        }",
            1,
        )
    path.write_text(text2)
    print("Patched android/app/build.gradle for debug-signed release")
PY
fi

cd android
chmod +x gradlew
./gradlew assembleRelease --no-daemon

mkdir -p "$OUT_DIR"
SRC="$(find app/build/outputs/apk/release -name '*.apk' | head -n 1)"
if [[ -z "$SRC" ]]; then
  echo "No release APK produced" >&2
  exit 1
fi
cp "$SRC" "$OUT_APK"
echo "Wrote $OUT_APK ($(du -h "$OUT_APK" | cut -f1))"
