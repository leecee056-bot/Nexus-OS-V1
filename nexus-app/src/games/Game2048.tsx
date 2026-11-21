import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing, useTheme } from "../theme";

type Grid = number[][];

function empty(): Grid {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function spawn(g: Grid): Grid {
  const free: { r: number; c: number }[] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) if (!g[r][c]) free.push({ r, c });
  if (!free.length) return g;
  const pick = free[Math.floor(Math.random() * free.length)];
  const next = g.map((row) => [...row]);
  next[pick.r][pick.c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function slideRow(row: number[]): { row: number[]; gained: number } {
  const vals = row.filter((v) => v);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < vals.length; i++) {
    if (i + 1 < vals.length && vals[i] === vals[i + 1]) {
      out.push(vals[i] * 2);
      gained += vals[i] * 2;
      i++;
    } else out.push(vals[i]);
  }
  while (out.length < 4) out.push(0);
  return { row: out, gained };
}

function move(g: Grid, dir: "L" | "R" | "U" | "D"): { grid: Grid; score: number } {
  let score = 0;
  let next = g.map((r) => [...r]);
  const apply = (get: (i: number) => number[], set: (i: number, row: number[]) => void) => {
    for (let i = 0; i < 4; i++) {
      let row = get(i);
      if (dir === "R" || dir === "D") row = [...row].reverse();
      const slid = slideRow(row);
      let out = slid.row;
      if (dir === "R" || dir === "D") out = out.reverse();
      score += slid.gained;
      set(i, out);
    }
  };
  if (dir === "L" || dir === "R") {
    apply(
      (r) => next[r],
      (r, row) => {
        next[r] = row;
      },
    );
  } else {
    apply(
      (c) => next.map((row) => row[c]),
      (c, col) => {
        for (let r = 0; r < 4; r++) next[r][c] = col[r];
      },
    );
  }
  const changed = JSON.stringify(next) !== JSON.stringify(g);
  if (changed) next = spawn(next);
  return { grid: next, score };
}

export function Game2048() {
  const { colors } = useTheme();
  const [grid, setGrid] = useState(() => spawn(spawn(empty())));
  const [score, setScore] = useState(0);

  function go(dir: "L" | "R" | "U" | "D") {
    const r = move(grid, dir);
    setGrid(r.grid);
    setScore((s) => s + r.score);
  }

  function reset() {
    setGrid(spawn(spawn(empty())));
    setScore(0);
  }

  return (
    <View>
      <Text style={{ color: colors.fgDim, marginBottom: spacing.sm }}>
        Score {score}
      </Text>
      <View style={{ alignSelf: "center", gap: 4 }}>
        {grid.map((row, r) => (
          <View key={r} style={{ flexDirection: "row", gap: 4 }}>
            {row.map((v, c) => (
              <View
                key={c}
                style={{
                  width: 64,
                  height: 64,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: v
                    ? colors.accentSoft
                    : colors.bgElev,
                }}
              >
                <Text
                  style={{
                    color: v >= 8 ? colors.accent : colors.fg,
                    fontWeight: "800",
                    fontSize: v >= 1000 ? 16 : 20,
                  }}
                >
                  {v || ""}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
      <View style={styles.row}>
        {(
          [
            ["U", "↑"],
            ["L", "←"],
            ["D", "↓"],
            ["R", "→"],
          ] as const
        ).map(([d, label]) => (
          <Pressable
            key={d}
            onPress={() => go(d)}
            style={[styles.btn, { borderColor: colors.border }]}
          >
            <Text style={{ color: colors.accent, fontWeight: "800" }}>
              {label}
            </Text>
          </Pressable>
        ))}
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
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
    justifyContent: "center",
  },
  btn: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
});
