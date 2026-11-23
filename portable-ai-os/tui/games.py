"""Optional games — Snake + Minesweeper. Idle = zero AI RAM (pure Python)."""
from __future__ import annotations

import random
from typing import Callable


class SnakeGame:
    def __init__(self, w: int = 28, h: int = 14):
        self.w = max(12, w)
        self.h = max(8, h)
        self.reset()

    def reset(self):
        cx, cy = self.w // 2, self.h // 2
        self.snake = [(cx, cy), (cx - 1, cy), (cx - 2, cy)]
        self.dir = (1, 0)
        self.pending = (1, 0)
        self.food = self._spawn_food()
        self.score = 0
        self.dead = False

    def _spawn_food(self):
        free = {(x, y) for x in range(self.w) for y in range(self.h)} - set(self.snake)
        return random.choice(list(free)) if free else (0, 0)

    def set_dir(self, dx: int, dy: int):
        # no instant reverse
        if (dx, dy) == (-self.dir[0], -self.dir[1]):
            return
        self.pending = (dx, dy)

    def tick(self):
        if self.dead:
            return
        self.dir = self.pending
        hx, hy = self.snake[0]
        nx, ny = hx + self.dir[0], hy + self.dir[1]
        if nx < 0 or ny < 0 or nx >= self.w or ny >= self.h or (nx, ny) in self.snake:
            self.dead = True
            return
        self.snake.insert(0, (nx, ny))
        if (nx, ny) == self.food:
            self.score += 1
            self.food = self._spawn_food()
        else:
            self.snake.pop()

    def render(self) -> list[str]:
        grid = [["." for _ in range(self.w)] for _ in range(self.h)]
        fx, fy = self.food
        grid[fy][fx] = "*"
        for i, (x, y) in enumerate(self.snake):
            grid[y][x] = "@" if i == 0 else "o"
        lines = ["".join(row) for row in grid]
        lines.append(f"Score {self.score}  {'DEAD — r restart' if self.dead else 'arrows move'}")
        return lines


class Minesweeper:
    def __init__(self, w: int = 10, h: int = 8, mines: int = 10):
        self.w = w
        self.h = h
        self.mines_n = mines
        self.reset()

    def reset(self):
        self.mine = set()
        self.revealed = set()
        self.flagged = set()
        self.cursor = [0, 0]
        self.boom = False
        self.won = False
        self._placed = False

    def _place(self, safe: tuple[int, int]):
        cells = [(x, y) for x in range(self.w) for y in range(self.h) if (x, y) != safe]
        self.mine = set(random.sample(cells, min(self.mines_n, len(cells))))
        self._placed = True

    def neighbors(self, x: int, y: int):
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                if dx == dy == 0:
                    continue
                nx, ny = x + dx, y + dy
                if 0 <= nx < self.w and 0 <= ny < self.h:
                    yield nx, ny

    def count(self, x: int, y: int) -> int:
        return sum(1 for n in self.neighbors(x, y) if n in self.mine)

    def reveal(self):
        x, y = self.cursor
        if not self._placed:
            self._place((x, y))
        if (x, y) in self.flagged or (x, y) in self.revealed:
            return
        if (x, y) in self.mine:
            self.boom = True
            self.revealed.add((x, y))
            return
        stack = [(x, y)]
        while stack:
            cx, cy = stack.pop()
            if (cx, cy) in self.revealed:
                continue
            self.revealed.add((cx, cy))
            if self.count(cx, cy) == 0:
                for n in self.neighbors(cx, cy):
                    if n not in self.revealed and n not in self.mine:
                        stack.append(n)
        self._check_win()

    def flag(self):
        x, y = self.cursor
        if (x, y) in self.revealed:
            return
        if (x, y) in self.flagged:
            self.flagged.remove((x, y))
        else:
            self.flagged.add((x, y))

    def _check_win(self):
        if self.boom:
            return
        if len(self.revealed) + len(self.mine) >= self.w * self.h:
            self.won = True

    def move(self, dx: int, dy: int):
        self.cursor[0] = max(0, min(self.w - 1, self.cursor[0] + dx))
        self.cursor[1] = max(0, min(self.h - 1, self.cursor[1] + dy))

    def render(self) -> list[str]:
        lines = []
        for y in range(self.h):
            row = []
            for x in range(self.w):
                ch = "#"
                if (x, y) in self.revealed:
                    if (x, y) in self.mine:
                        ch = "X"
                    else:
                        c = self.count(x, y)
                        ch = " " if c == 0 else str(c)
                elif (x, y) in self.flagged:
                    ch = "F"
                if [x, y] == self.cursor:
                    ch = f"[{ch}]"
                else:
                    ch = f" {ch} "
                row.append(ch)
            lines.append("".join(row))
        if self.boom:
            lines.append("BOOM — r restart")
        elif self.won:
            lines.append("CLEARED — r restart")
        else:
            lines.append("arrows move  space reveal  f flag  r restart")
        return lines


def pick_game(name: str):
    name = name.lower()
    if name.startswith("m"):
        return Minesweeper()
    return SnakeGame()
