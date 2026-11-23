#!/usr/bin/env python3
"""Tri-Cass offline CLI starter — edit or let the agent extend it."""
from __future__ import annotations

import argparse


def main() -> None:
    p = argparse.ArgumentParser(description="Tri-Cass local tool")
    p.add_argument("message", nargs="?", default="hello from offline Tri-Cass")
    args = p.parse_args()
    print(args.message)


if __name__ == "__main__":
    main()
