"""TUI themes: basic (high-contrast mono) and matrix (green on black)."""
from __future__ import annotations

import curses
import random
from typing import Any


THEMES = ("basic", "matrix")


class Theme:
    def __init__(self, name: str = "basic"):
        self.name = name if name in THEMES else "basic"
        self.colors = False
        self._rain: list[tuple[int, int, str]] = []
        self._tick = 0

    def init(self, stdscr) -> None:
        curses.start_color()
        curses.use_default_colors()
        try:
            if self.name == "matrix":
                # Green on black
                curses.init_pair(1, curses.COLOR_GREEN, curses.COLOR_BLACK)  # normal
                curses.init_pair(2, curses.COLOR_GREEN, curses.COLOR_BLACK)  # bold/title
                curses.init_pair(3, curses.COLOR_WHITE, curses.COLOR_BLACK)  # accent
                curses.init_pair(4, curses.COLOR_BLACK, curses.COLOR_GREEN)  # reverse bar
                curses.init_pair(5, curses.COLOR_GREEN, curses.COLOR_BLACK)  # dim rain
                try:
                    curses.init_pair(5, 22, curses.COLOR_BLACK)  # dark green if available
                except curses.error:
                    pass
            else:
                # basic: high-contrast mono (white/black)
                curses.init_pair(1, curses.COLOR_WHITE, curses.COLOR_BLACK)
                curses.init_pair(2, curses.COLOR_WHITE, curses.COLOR_BLACK)
                curses.init_pair(3, curses.COLOR_WHITE, curses.COLOR_BLACK)
                curses.init_pair(4, curses.COLOR_BLACK, curses.COLOR_WHITE)
                curses.init_pair(5, curses.COLOR_WHITE, curses.COLOR_BLACK)
            self.colors = True
        except curses.error:
            self.colors = False
        if self.name == "matrix":
            stdscr.bkgd(" ", self.attr_normal())
        else:
            stdscr.bkgd(" ", self.attr_normal())

    def set_name(self, name: str, stdscr=None) -> None:
        self.name = name if name in THEMES else "basic"
        self._rain.clear()
        if stdscr is not None:
            self.init(stdscr)

    def attr_normal(self) -> int:
        return curses.color_pair(1) if self.colors else curses.A_NORMAL

    def attr_title(self) -> int:
        base = curses.color_pair(4) if self.colors else curses.A_REVERSE
        return base | curses.A_BOLD

    def attr_bold(self) -> int:
        return (curses.color_pair(2) | curses.A_BOLD) if self.colors else curses.A_BOLD

    def attr_dim(self) -> int:
        return (curses.color_pair(5) | curses.A_DIM) if self.colors else curses.A_DIM

    def attr_input(self) -> int:
        return (curses.color_pair(3) | curses.A_BOLD) if self.colors else curses.A_BOLD

    def attr_select(self) -> int:
        return (curses.color_pair(4) | curses.A_BOLD) if self.colors else curses.A_REVERSE

    def paint_backdrop(self, stdscr, h: int, w: int) -> None:
        """Optional low-CPU matrix rain in unused margins; skipped for basic."""
        if self.name != "matrix" or h < 6 or w < 20:
            return
        self._tick += 1
        # Update rain sparsely (every other frame worth of draws)
        if self._tick % 2 == 0:
            # Spawn
            if len(self._rain) < max(8, w // 10):
                self._rain.append((random.randint(0, w - 1), 1, random.choice("01アイウエオﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶﾗｾｿﾂ")))
            nxt = []
            for x, y, ch in self._rain:
                y2 = y + 1
                if y2 < h - 1:
                    nxt.append((x, y2, ch))
            self._rain = nxt[-40:]
        for x, y, ch in self._rain:
            if 1 <= y < h - 1 and 0 <= x < w:
                try:
                    # Don't overwrite main content columns heavily — draw dim only
                    stdscr.addch(y, x, ch, self.attr_dim())
                except curses.error:
                    pass
