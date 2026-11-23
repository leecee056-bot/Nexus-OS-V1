# HAP-66 — RAM-based model ladder

At first boot (and whenever `select-model.sh` runs), Tri-Cass picks the
**largest catalog GGUF that fits usable RAM**, sets threads from core count, and
caps context by hardware tier. SmolLM2 remains the **rescue** when nothing
larger fits or is present.

## Flow

```
probe-hw.sh → usable_ram_mb + tier + threads
     ↓
select-model.sh → /data/config/model-ladder.json + model-ladder.env
     ↓
start-infer.sh sources env (or guest-autostart does)
```

## Tiers (from probe)

| Tier | Host RAM (approx) | Default ctx |
|------|-------------------|-------------|
| T0 | &lt; 2.5 GB | 512 |
| T1 | 2.5–7 GB | 2048 |
| T2 | ≥ 7 GB | 4096 |

Usable RAM = MemTotal − OS reserve (~350 MB) − UI reserve (~96 MB).

## Manual

```bash
bash scripts/probe-hw.sh > /data/logs/probe.json
bash scripts/select-model.sh
# then
bash scripts/start-infer.sh   # respects model-ladder.env when present
```

Optional micro-bench (when `llama-bench` is on PATH / in runtime):

```bash
LLAMA_BENCH=1 bash scripts/select-model.sh
```

(Bench hooks are best-effort; selection does not require them.)
