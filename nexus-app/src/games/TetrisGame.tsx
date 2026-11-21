import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing, useTheme } from "../theme";

const COLS = 10;
const ROWS = 16;
const CELL = 16;

const SHAPES: number[][][] = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
];

type Piece = { shape: number[][]; x: number; y: number };

function randPiece(): Piece {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)].map((r) => [
    ...r,
  ]);
  return { shape, x: 3, y: 0 };
}

function rotate(shape: number[][]): number[][] {
  const h = shape.length;
  const w = shape[0].length;
  const out: number[][] = Array.from({ length: w }, () => Array(h).fill(0));
  for (let r = 0; r < h; r++)
    for (let c = 0; c < w; c++) out[c][h - 1 - r] = shape[r][c];
  return out;
}

function collides(
  grid: number[][],
  piece: Piece,
  ox = 0,
  oy = 0,
  shape = piece.shape,
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const x = piece.x + c + ox;
      const y = piece.y + r + oy;
      if (x < 0 || x >= COLS || y >= ROWS) return true;
      if (y >= 0 && grid[y][x]) return true;
    }
  }
  return false;
}

export function TetrisGame() {
  const { colors } = useTheme();
  const empty = useMemo(
    () => Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
    [],
  );
  const [grid, setGrid] = useState(empty.map((r) => [...r]));
  const [piece, setPiece] = useState<Piece>(randPiece);
  const [score, setScore] = useState(0);
  const [alive, setAlive] = useState(true);
  const pieceRef = useRef(piece);
  const gridRef = useRef(grid);
  pieceRef.current = piece;
  gridRef.current = grid;

  function merge(g: number[][], p: Piece) {
    const next = g.map((r) => [...r]);
    for (let r = 0; r < p.shape.length; r++) {
      for (let c = 0; c < p.shape[r].length; c++) {
        if (!p.shape[r][c]) continue;
        const y = p.y + r;
        const x = p.x + c;
        if (y >= 0) next[y][x] = 1;
      }
    }
    let cleared = 0;
    const kept = next.filter((row) => {
      const full = row.every((v) => v);
      if (full) cleared++;
      return !full;
    });
    while (kept.length < ROWS) kept.unshift(Array(COLS).fill(0));
    if (cleared) setScore((s) => s + cleared * 100);
    return kept;
  }

  useEffect(() => {
    if (!alive) return;
    const id = setInterval(() => {
      const p = pieceRef.current;
      const g = gridRef.current;
      if (!collides(g, p, 0, 1)) {
        const np = { ...p, y: p.y + 1 };
        pieceRef.current = np;
        setPiece(np);
        return;
      }
      const merged = merge(g, p);
      gridRef.current = merged;
      setGrid(merged);
      const np = randPiece();
      if (collides(merged, np)) setAlive(false);
      else {
        pieceRef.current = np;
        setPiece(np);
      }
    }, 420);
    return () => clearInterval(id);
  }, [alive]);

  function tryMove(ox: number, oy: number) {
    const p = pieceRef.current;
    if (!collides(gridRef.current, p, ox, oy)) {
      const np = { ...p, x: p.x + ox, y: p.y + oy };
      pieceRef.current = np;
      setPiece(np);
    }
  }

  function tryRotate() {
    const p = pieceRef.current;
    const shape = rotate(p.shape);
    if (!collides(gridRef.current, p, 0, 0, shape)) {
      const np = { ...p, shape };
      pieceRef.current = np;
      setPiece(np);
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") tryMove(-1, 0);
      if (e.key === "ArrowRight" || e.key === "d") tryMove(1, 0);
      if (e.key === "ArrowDown" || e.key === "s") tryMove(0, 1);
      if (e.key === "ArrowUp" || e.key === "w" || e.key === " ") tryRotate();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, []);

  function reset() {
    const g = empty.map((r) => [...r]);
    setGrid(g);
    gridRef.current = g;
    const p = randPiece();
    setPiece(p);
    pieceRef.current = p;
    setScore(0);
    setAlive(true);
  }

  const display = grid.map((r) => [...r]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const y = piece.y + r;
      const x = piece.x + c;
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) display[y][x] = 2;
    }
  }

  return (
    <View>
      <Text style={{ color: colors.fgDim, marginBottom: spacing.sm }}>
        Score {score}
        {!alive ? " · game over" : ""}
      </Text>
      <View
        style={{
          width: COLS * CELL,
          height: ROWS * CELL,
          borderWidth: 1,
          borderColor: colors.border,
          alignSelf: "center",
          backgroundColor: colors.bgElev,
        }}
      >
        {display.map((row, r) =>
          row.map((v, c) =>
            v ? (
              <View
                key={`${r}-${c}`}
                style={{
                  position: "absolute",
                  left: c * CELL,
                  top: r * CELL,
                  width: CELL - 1,
                  height: CELL - 1,
                  backgroundColor: v === 2 ? colors.accent : colors.purple,
                }}
              />
            ) : null,
          ),
        )}
      </View>
      <View style={styles.row}>
        <Pressable
          onPress={() => tryMove(-1, 0)}
          style={[styles.btn, { borderColor: colors.border }]}
        >
          <Text style={{ color: colors.accent }}>◀</Text>
        </Pressable>
        <Pressable
          onPress={tryRotate}
          style={[styles.btn, { borderColor: colors.border }]}
        >
          <Text style={{ color: colors.accent }}>⟳</Text>
        </Pressable>
        <Pressable
          onPress={() => tryMove(1, 0)}
          style={[styles.btn, { borderColor: colors.border }]}
        >
          <Text style={{ color: colors.accent }}>▶</Text>
        </Pressable>
        <Pressable
          onPress={reset}
          style={[styles.btn, { borderColor: colors.accent }]}
        >
          <Text style={{ color: colors.accent }}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
    justifyContent: "center",
  },
  btn: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
});
