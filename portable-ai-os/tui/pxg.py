#!/usr/bin/env python3
"""PXG-tiny style procedural pixel-art generator (offline, tiny RAM).

No neural weights required. Deterministic from a text seed/prompt.
Optional: LLM can suggest a prompt/palette; this module always renders.
"""
from __future__ import annotations

import hashlib
import math
import os
import struct
import zlib
from pathlib import Path


# Compact named palettes (RGB tuples)
PALETTES = {
    "matrix": [(0, 0, 0), (0, 40, 0), (0, 120, 0), (0, 200, 40), (180, 255, 180)],
    "mono": [(0, 0, 0), (64, 64, 64), (128, 128, 128), (192, 192, 192), (255, 255, 255)],
    "sunset": [(20, 10, 40), (120, 40, 60), (220, 90, 40), (240, 180, 60), (255, 240, 200)],
    "ocean": [(5, 15, 40), (10, 50, 100), (20, 120, 160), (80, 200, 200), (200, 240, 255)],
    "candy": [(30, 10, 40), (180, 40, 120), (255, 100, 150), (255, 200, 100), (255, 255, 220)],
    "earth": [(30, 20, 10), (80, 50, 20), (40, 100, 40), (120, 140, 60), (200, 190, 150)],
}


def _rng(seed: bytes):
    """Tiny xorshift-ish stream from seed bytes."""
    h = hashlib.sha256(seed).digest()
    state = list(struct.unpack(">8I", h))

    def rnd() -> float:
        t = state[0] ^ ((state[0] << 11) & 0xFFFFFFFF)
        state[0] = state[1]
        state[1] = state[2]
        state[2] = state[3]
        state[3] = (state[3] ^ (state[3] >> 19) ^ t ^ (t >> 8)) & 0xFFFFFFFF
        return state[3] / 0xFFFFFFFF

    def randint(a: int, b: int) -> int:
        return a + int(rnd() * (b - a + 1)) % (b - a + 1)

    return rnd, randint


def pick_palette(prompt: str) -> str:
    p = prompt.lower()
    if any(w in p for w in ("matrix", "green", "neo", "code")):
        return "matrix"
    if any(w in p for w in ("sea", "ocean", "water", "blue")):
        return "ocean"
    if any(w in p for w in ("sun", "fire", "warm", "dusk")):
        return "sunset"
    if any(w in p for w in ("candy", "pink", "sweet")):
        return "candy"
    if any(w in p for w in ("forest", "tree", "earth", "dirt")):
        return "earth"
    if any(w in p for w in ("mono", "bw", "noir", "black")):
        return "mono"
    # hash pick
    idx = int(hashlib.md5(prompt.encode()).hexdigest(), 16) % len(PALETTES)
    return list(PALETTES.keys())[idx]


def generate_pixels(prompt: str, size: int = 32, palette_name: str | None = None) -> list[list[tuple[int, int, int]]]:
    size = max(16, min(64, int(size)))
    palette_name = palette_name or pick_palette(prompt)
    pal = PALETTES.get(palette_name, PALETTES["matrix"])
    rnd, randint = _rng(prompt.encode("utf-8") + f"|{size}|{palette_name}".encode())

    # Base noise field
    grid = [[0 for _ in range(size)] for _ in range(size)]
    # Low-frequency blobs
    blobs = 3 + randint(0, 4)
    centers = [(rnd(), rnd(), 0.15 + rnd() * 0.35, randint(1, len(pal) - 1)) for _ in range(blobs)]
    for y in range(size):
        for x in range(size):
            fx, fy = x / size, y / size
            v = 0.0
            for cx, cy, rad, strength in centers:
                d = math.hypot(fx - cx, fy - cy)
                v += max(0.0, 1.0 - d / rad) * strength
            v += rnd() * 0.4
            idx = int(v) % len(pal)
            idx = max(0, min(len(pal) - 1, idx))
            grid[y][x] = idx

    # Optional "sprite" silhouette for creature/face-ish prompts
    if any(w in prompt.lower() for w in ("cat", "face", "robot", "skull", "heart", "star", "ship", "tree")):
        cx = cy = size // 2
        for y in range(size):
            for x in range(size):
                dx, dy = x - cx, y - cy
                if "heart" in prompt.lower():
                    # simple heart SDF-ish
                    nx, ny = dx / (size * 0.35), (dy + size * 0.05) / (size * 0.35)
                    inside = (nx * nx + ny * ny - 1) ** 3 - nx * nx * ny * ny * ny < 0
                elif "star" in prompt.lower():
                    ang = math.atan2(dy, dx)
                    r = math.hypot(dx, dy) / (size * 0.4)
                    inside = r < (0.5 + 0.5 * abs(math.cos(ang * 5)))
                else:
                    inside = math.hypot(dx, dy) < size * (0.28 + 0.08 * rnd())
                if inside:
                    grid[y][x] = min(len(pal) - 1, grid[y][x] + 1)
                elif math.hypot(dx, dy) < size * 0.45:
                    grid[y][x] = max(0, grid[y][x] - 1)

    return [[pal[grid[y][x]] for x in range(size)] for y in range(size)]


def pixels_to_png(pixels: list[list[tuple[int, int, int]]]) -> bytes:
    """Minimal PNG encoder (no PIL required)."""
    h = len(pixels)
    w = len(pixels[0]) if h else 0
    raw = bytearray()
    for row in pixels:
        raw.append(0)  # filter none
        for r, g, b in row:
            raw.extend((r, g, b))

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)  # 8-bit RGB
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


def pixels_to_ascii(pixels: list[list[tuple[int, int, int]]], max_width: int = 48) -> str:
    """Block/ASCII preview using luminance → charset."""
    chars = " .:-=+*#%@"
    h = len(pixels)
    w = len(pixels[0]) if h else 0
    step = max(1, w // max_width)
    lines = []
    for y in range(0, h, step):
        row = []
        for x in range(0, w, step):
            r, g, b = pixels[y][x]
            lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
            row.append(chars[min(len(chars) - 1, int(lum * (len(chars) - 1)))])
        lines.append("".join(row))
    return "\n".join(lines)


def generate_and_save(
    prompt: str,
    out_dir: str | Path,
    size: int = 32,
    palette_name: str | None = None,
) -> dict:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    palette_name = palette_name or pick_palette(prompt)
    pixels = generate_pixels(prompt, size=size, palette_name=palette_name)
    digest = hashlib.sha1(f"{prompt}|{size}|{palette_name}".encode()).hexdigest()[:10]
    safe = "".join(c if c.isalnum() or c in "-_" else "-" for c in prompt.lower())[:32] or "pxg"
    stem = f"pxg-{safe}-{digest}"
    png_path = out_dir / f"{stem}.png"
    txt_path = out_dir / f"{stem}.txt"
    png_path.write_bytes(pixels_to_png(pixels))
    ascii_art = pixels_to_ascii(pixels)
    txt_path.write_text(
        f"prompt: {prompt}\npalette: {palette_name}\nsize: {size}\n\n{ascii_art}\n",
        encoding="utf-8",
    )
    return {
        "png": str(png_path),
        "txt": str(txt_path),
        "ascii": ascii_art,
        "palette": palette_name,
        "size": size,
    }


if __name__ == "__main__":
    import sys

    prompt = " ".join(sys.argv[1:]) or "matrix cat"
    res = generate_and_save(prompt, Path(os.environ.get("PXG_OUT", "/tmp/pxg-out")))
    print(res["ascii"])
    print(f"saved {res['png']}")
