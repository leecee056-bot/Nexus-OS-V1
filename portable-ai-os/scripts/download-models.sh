#!/usr/bin/env bash
# Download open-license GGUFs from catalog.json via curl; verify SHA256.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CATALOG="${ROOT}/catalog/catalog.json"
# Prefer writable runtime dir (store FUSE may reject large binaries)
DEST="${PORTABLE_AI_MODELS:-}"
if [[ -z "$DEST" ]]; then
  if touch "${ROOT}/models/.write_test" 2>/dev/null; then
    rm -f "${ROOT}/models/.write_test"
    # Probe large write
    if dd if=/dev/zero of="${ROOT}/models/.size_test" bs=1M count=2 status=none 2>/dev/null; then
      rm -f "${ROOT}/models/.size_test"
      DEST="${ROOT}/models"
    else
      rm -f "${ROOT}/models/.size_test"
      DEST="${PORTABLE_AI_RUNTIME:-/agent/portable-ai-os-runtime}/models"
    fi
  else
    DEST="${PORTABLE_AI_RUNTIME:-/agent/portable-ai-os-runtime}/models"
  fi
fi
SEED="${1:-all}"  # all | rescue | t0 | t1

mkdir -p "$DEST"
echo "==> Downloading models to $DEST (selection=$SEED)"

python3 - "$CATALOG" "$DEST" "$SEED" <<'PY'
import hashlib, json, os, subprocess, sys

catalog_path, dest, selection = sys.argv[1:4]
with open(catalog_path) as f:
    cat = json.load(f)

def want(m):
    if selection == "all":
        return True
    if selection == "rescue":
        return m.get("role") == "rescue" or "135M" in m.get("params", "")
    tiers = set(m.get("tier_fit", []))
    if selection == "t0":
        return "T0" in tiers and m.get("approx_size_mb", 9999) <= 500
    if selection == "t1":
        return "T1" in tiers and m.get("approx_size_mb", 9999) <= 1200
    return True

failures = []
for m in cat["models"]:
    if not want(m):
        continue
    url = m["source_url"]
    path = os.path.join(dest, m["filename"])
    print(f"\n--- {m['id']}")
    print(f"    URL: {url}")
    need = True
    if os.path.isfile(path) and os.path.getsize(path) > 1_000_000:
        h = hashlib.sha256()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(1024 * 1024), b""):
                h.update(chunk)
        if m.get("sha256") and m["sha256"] != "PENDING_DOWNLOAD" and h.hexdigest() == m["sha256"]:
            print(f"    OK cached sha256={m['sha256']}")
            need = False
        else:
            print(f"    exists; will re-hash / refresh if needed")
            need = h.hexdigest() != m.get("sha256")
            if not need:
                print(f"    sha256 match")
    if need:
        part = path + ".part"
        cmd = [
            "curl", "-fL", "--retry", "3", "-A", "Mozilla/5.0",
            "-o", part, url,
        ]
        print(f"    downloading...")
        try:
            subprocess.check_call(cmd)
            os.replace(part, path)
        except Exception as e:
            failures.append((m["id"], url, str(e)))
            print(f"    FAILED: {e}")
            if os.path.exists(part):
                os.remove(part)
            continue
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    digest = h.hexdigest()
    print(f"    sha256: {digest}")
    print(f"    size_mb: {os.path.getsize(path) / (1024*1024):.1f}")
    expected = m.get("sha256")
    if expected and expected not in ("PENDING_DOWNLOAD", "PENDING_HASH") and expected != digest:
        print(f"    WARNING: sha256 mismatch catalog={expected}")
    m["sha256"] = digest

with open(catalog_path, "w") as f:
    json.dump(cat, f, indent=2)
    f.write("\n")

sums = os.path.join(dest, "SHA256SUMS")
with open(sums, "w") as f:
    for m in cat["models"]:
        p = os.path.join(dest, m["filename"])
        if os.path.isfile(p):
            f.write(f"{m['sha256']}  {m['filename']}\n")

# Mirror catalog into dest
import shutil
shutil.copy2(catalog_path, os.path.join(dest, "catalog.json"))

if failures:
    print("\n!! Some downloads failed. Exact URLs:")
    for mid, url, err in failures:
        print(f"  - {mid}: {url}\n    error: {err}")
    ggufs = [n for n in os.listdir(dest) if n.endswith(".gguf")]
    if not ggufs:
        sys.exit(2)
    print(f"\nContinuing with {len(ggufs)} local GGUF(s).")
else:
    print("\nAll selected downloads OK.")
print(f"Models dir: {dest}")
PY

echo "Done."
