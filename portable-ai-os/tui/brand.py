"""Tri-Cass OS brand marks for the offline TUI (no graphics stack)."""
from __future__ import annotations

PRODUCT = "Tri-Cass OS"
TAGLINE = "Your AI Computer. Anywhere."
NETWORK = "Tri-Cass Network"

# Compact rabbit-with-hat (wizard) for first boot / hub hero.
RABBIT_LINES = (
    r"  (\(\ ",
    r"  (-.-)  *",
    ' o_(")(")',
)


def rabbit_block() -> list[str]:
    return list(RABBIT_LINES)


def hub_title(version: str = "v1", mode: str = "USB Mode", net: str = "Offline") -> str:
    return f"{PRODUCT} {version}  |  {mode}  |  {net}  |  Esc=menu  F10=quit"
