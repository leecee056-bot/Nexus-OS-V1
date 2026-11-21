import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing, useTheme } from "../theme";

const COLS = 16;
const ROWS = 12;
const TICK = 140;

type Pt = { x: number; y: number };
type Dir = "U" | "D" | "L" | "R";

function randFood(snake: Pt[]): Pt {
  while (true) {
    const p = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p;
  }
}

export function SnakeGame() {
  const { colors } = useTheme();
  const [snake, setSnake] = useState<Pt[]>([
    { x: 4, y: 6 },
    { x: 3, y: 6 },
  ]);
  const [food, setFood] = useState<Pt>({ x: 10, y: 6 });
  const [dir, setDir] = useState<Dir>("R");
  const [alive, setAlive] = useState(true);
  const [score, setScore] = useState(0);
  const dirRef = useRef(dir);
  dirRef.current = dir;

  useEffect(() => {
    if (!alive) return;
    const id = setInterval(() => {
      setSnake((prev) => {
        const d = dirRef.current;
        const head = prev[0];
        const next = {
          x: head.x + (d === "L" ? -1 : d === "R" ? 1 : 0),
          y: head.y + (d === "U" ? -1 : d === "D" ? 1 : 0),
        };
        if (
          next.x < 0 ||
          next.y < 0 ||
          next.x >= COLS ||
          next.y >= ROWS ||
          prev.some((s) => s.x === next.x && s.y === next.y)
        ) {
          setAlive(false);
          return prev;
        }
        const grew = next.x === food.x && next.y === food.y;
        const body = [next, ...prev];
        if (!grew) body.pop();
        else {
          setScore((s) => s + 1);
          setFood(randFood(body));
        }
        return body;
      });
    }, TICK);
    return () => clearInterval(id);
  }, [alive, food]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "ArrowUp" || k === "w") setDir((d) => (d === "D" ? d : "U"));
      if (k === "ArrowDown" || k === "s") setDir((d) => (d === "U" ? d : "D"));
      if (k === "ArrowLeft" || k === "a") setDir((d) => (d === "R" ? d : "L"));
      if (k === "ArrowRight" || k === "d") setDir((d) => (d === "L" ? d : "R"));
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, []);

  function reset() {
    setSnake([
      { x: 4, y: 6 },
      { x: 3, y: 6 },
    ]);
    setFood({ x: 10, y: 6 });
    setDir("R");
    setAlive(true);
    setScore(0);
  }

  const cell = 18;

  return (
    <View>
      <Text style={{ color: colors.fgDim, marginBottom: spacing.sm }}>
        Score {score}
        {!alive ? " · game over" : ""}
      </Text>
      <View
        style={{
          width: COLS * cell,
          height: ROWS * cell,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.bgElev,
          alignSelf: "center",
        }}
      >
        {snake.map((s, i) => (
          <View
            key={`${s.x}-${s.y}-${i}`}
            style={{
              position: "absolute",
              left: s.x * cell,
              top: s.y * cell,
              width: cell - 1,
              height: cell - 1,
              backgroundColor: i === 0 ? colors.accent : colors.phosphor,
              opacity: i === 0 ? 1 : 0.75,
            }}
          />
        ))}
        <View
          style={{
            position: "absolute",
            left: food.x * cell,
            top: food.y * cell,
            width: cell - 1,
            height: cell - 1,
            backgroundColor: colors.purple,
          }}
        />
      </View>
      <View style={styles.pads}>
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
            onPress={() =>
              setDir((cur) => {
                if (d === "U" && cur === "D") return cur;
                if (d === "D" && cur === "U") return cur;
                if (d === "L" && cur === "R") return cur;
                if (d === "R" && cur === "L") return cur;
                return d;
              })
            }
            style={[styles.pad, { borderColor: colors.border }]}
          >
            <Text style={{ color: colors.accent, fontWeight: "800" }}>
              {label}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={reset}
          style={[styles.pad, { borderColor: colors.accent }]}
        >
          <Text style={{ color: colors.accent, fontWeight: "800" }}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pads: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
    justifyContent: "center",
  },
  pad: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 48,
    alignItems: "center",
  },
});
