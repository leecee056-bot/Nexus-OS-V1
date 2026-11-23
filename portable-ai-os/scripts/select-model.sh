#!/usr/bin/env bash
# HAP-66 — Pick best local GGUF + threads/ctx from free RAM (model ladder).
# Writes /data/config/model-ladder.json (or $CONFIG_DIR) and prints MODEL_PATH.
# Usage: bash scripts/select-model.sh [--apply]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/env.sh" 2>/dev/null || true

MODELS_DIR="${PORTABLE_AI_MODELS:-$ROOT/models}"
CATALOG="${PORTABLE_AI_CATALOG:-$ROOT/catalog/catalog.json}"
CONFIG_DIR="${AI_DATA:-/data}/config"
[[ -d "${AI_DATA:-}" ]] || CONFIG_DIR="${PORTABLE_AI_RUNTIME:-/tmp}/config"
mkdir -p "$CONFIG_DIR" "$(dirname "$CONFIG_DIR")/logs" 2>/dev/null || true

PROBE_JSON="${CONFIG_DIR%/config}/logs/probe.json"
if [[ ! -f "$PROBE_JSON" ]]; then
  PROBE_JSON="$(mktemp)"
  bash "$ROOT/scripts/probe-hw.sh" > "$PROBE_JSON"
fi

APPLY=0
[[ "${1:-}" == "--apply" ]] && APPLY=1

python3 - "$CATALOG" "$MODELS_DIR" "$PROBE_JSON" "$CONFIG_DIR" "$APPLY" <<'PY'
import json, os, sys

catalog_path, models_dir, probe_path, config_dir, apply = sys.argv[1:6]
apply = apply == "1"

with open(catalog_path) as f:
    cat = json.load(f)
with open(probe_path) as f:
    probe = json.load(f)

usable = int(probe.get("usable_ram_mb") or probe.get("mem_mb") or 512)
threads = int(probe.get("threads") or 1)
tier = probe.get("tier", "T0")
arch = probe.get("arch", "x86_64")

# Ladder: largest fitting model by min_ram_mb + file present; rescue last.
candidates = []
for m in cat.get("models", []):
    if arch.startswith("i") or arch in ("i686", "i386"):
        if "i686" not in m.get("arch", []) and "i386" not in m.get("arch", []):
            # allow x86_64-listed only if also lists i686
            if m.get("arch") and "x86_64" in m["arch"] and "i686" not in m["arch"]:
                continue
    path = os.path.join(models_dir, m["filename"])
    present = os.path.isfile(path) and os.path.getsize(path) > 1_000_000
    min_ram = int(m.get("min_ram_mb") or 99999)
    fits = min_ram <= usable
    candidates.append({**m, "path": path, "present": present, "fits": fits})

present_fit = [c for c in candidates if c["present"] and c["fits"]]
present_any = [c for c in candidates if c["present"]]

def rank(c):
    # Prefer higher min_ram among fits (bigger useful model), then priority
    return (c.get("min_ram_mb") or 0, -(c.get("priority") or 99))

if present_fit:
    pick = sorted(present_fit, key=rank, reverse=True)[0]
    reason = "largest_present_fitting_usable_ram"
elif present_any:
    # Prefer rescue / smallest
    rescue = [c for c in present_any if c.get("role") == "rescue"]
    pick = rescue[0] if rescue else sorted(present_any, key=lambda c: c.get("approx_size_mb") or 0)[0]
    reason = "fallback_rescue_or_smallest_present"
else:
    pick = None
    reason = "no_gguf_present"

# Context from tier + versions.lock-ish defaults
ctx_map = {"T0": 512, "T1": 2048, "T2": 4096}
ctx = int(os.environ.get("N_CTX") or ctx_map.get(tier, 512))
if pick:
    ctx = min(ctx, int(pick.get("recommended_ctx") or ctx))

out = {
    "usable_ram_mb": usable,
    "tier": tier,
    "threads": threads,
    "n_ctx": ctx,
    "reason": reason,
    "model_id": pick["id"] if pick else None,
    "model_path": pick["path"] if pick else None,
    "filename": pick["filename"] if pick else None,
}
path_out = os.path.join(config_dir, "model-ladder.json")
os.makedirs(config_dir, exist_ok=True)
with open(path_out, "w") as f:
    json.dump(out, f, indent=2)
    f.write("\n")

# Env file for start-infer / guest-autostart
env_path = os.path.join(config_dir, "model-ladder.env")
with open(env_path, "w") as f:
    if pick:
        f.write(f"MODEL_PATH={pick['path']}\n")
        f.write(f"N_CTX={ctx}\n")
        f.write(f"N_THREADS={threads}\n")
    f.write(f"LADDER_REASON={reason}\n")

print(json.dumps(out, indent=2))
if pick:
    print(pick["path"])
else:
    sys.exit(1)
PY
