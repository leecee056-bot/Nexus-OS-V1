"""System monitor — CPU/RAM/disk from /proc (no extra deps)."""
from __future__ import annotations

import os
import time
from pathlib import Path


_prev_cpu: tuple[float, float] | None = None


def _read_cpu_times() -> tuple[float, float]:
    with open("/proc/stat") as f:
        parts = f.readline().split()
    # user nice system idle iowait irq softirq steal
    nums = [float(x) for x in parts[1:8]]
    idle = nums[3] + (nums[4] if len(nums) > 4 else 0)
    total = sum(nums)
    return idle, total


def cpu_percent() -> float:
    global _prev_cpu
    idle, total = _read_cpu_times()
    if _prev_cpu is None:
        _prev_cpu = (idle, total)
        time.sleep(0.05)
        idle2, total2 = _read_cpu_times()
    else:
        idle2, total2 = idle, total
        idle, total = _prev_cpu
    _prev_cpu = (idle2, total2)
    d_total = total2 - total
    d_idle = idle2 - idle
    if d_total <= 0:
        return 0.0
    return max(0.0, min(100.0, (1.0 - d_idle / d_total) * 100.0))


def mem_info() -> dict:
    info = {}
    with open("/proc/meminfo") as f:
        for line in f:
            k, v = line.split(":", 1)
            info[k] = int(v.strip().split()[0])  # kB
    total = info.get("MemTotal", 1)
    avail = info.get("MemAvailable", info.get("MemFree", 0))
    used = total - avail
    return {
        "total_mb": total // 1024,
        "used_mb": used // 1024,
        "avail_mb": avail // 1024,
        "percent": round(100.0 * used / total, 1),
    }


def disk_info(path: str | Path = "/data") -> dict:
    p = Path(path)
    if not p.exists():
        p = Path("/")
    st = os.statvfs(p)
    total = st.f_frsize * st.f_blocks
    free = st.f_frsize * st.f_bavail
    used = total - free
    return {
        "path": str(p),
        "total_mb": total // (1024 * 1024),
        "used_mb": used // (1024 * 1024),
        "free_mb": free // (1024 * 1024),
        "percent": round(100.0 * used / total, 1) if total else 0.0,
    }


def bar(pct: float, width: int = 20) -> str:
    filled = int(round(width * pct / 100.0))
    filled = max(0, min(width, filled))
    return "[" + "#" * filled + "-" * (width - filled) + f"] {pct:5.1f}%"


def snapshot(data_dir: Path, model_id: str = "", server_up: bool = False) -> list[str]:
    cpu = cpu_percent()
    mem = mem_info()
    disk = disk_info(data_dir if data_dir.exists() else Path("/"))
    lines = [
        "NEXUS OS — System Monitor",
        "",
        f"CPU  {bar(cpu)}",
        f"RAM  {bar(mem['percent'])}  {mem['used_mb']}/{mem['total_mb']} MB",
        f"Disk {bar(disk['percent'])}  {disk['used_mb']}/{disk['total_mb']} MB  ({disk['path']})",
        "",
        f"Infer server: {'UP' if server_up else 'DOWN'}",
        f"Active model: {model_id or '(none)'}",
        f"Arch: {os.uname().machine}  Cores: {os.cpu_count() or '?'}",
        "",
        "Refresh: r   Back: Esc / q",
    ]
    return lines
