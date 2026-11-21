import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing, useTheme } from "../theme";

const W = 320;
const H = 240;
const BRICK_R = 4;
const BRICK_C = 8;
const BW = W / BRICK_C - 2;
const BH = 12;

type Brick = { x: number; y: number; alive: boolean };

function makeBricks(): Brick[] {
  const out: Brick[] = [];
  for (let r = 0; r < BRICK_R; r++) {
    for (let c = 0; c < BRICK_C; c++) {
      out.push({ x: c * (BW + 2) + 1, y: 24 + r * (BH + 4), alive: true });
    }
  }
  return out;
}

export function BreakoutGame() {
  const { colors } = useTheme();
  const [paddle, setPaddle] = useState(W / 2 - 32);
  const [ball, setBall] = useState({ x: W / 2, y: H - 40, vx: 2.8, vy: -2.8 });
  const [bricks, setBricks] = useState(makeBricks);
  const [lives, setLives] = useState(3);
  const [running, setRunning] = useState(true);
  const paddleRef = useRef(paddle);
  paddleRef.current = paddle;
  const bricksRef = useRef(bricks);
  bricksRef.current = bricks;

  useEffect(() => {
    if (!running || lives <= 0) return;
    const id = setInterval(() => {
      setBall((b) => {
        let { x, y, vx, vy } = b;
        x += vx;
        y += vy;
        if (x < 0 || x > W - 8) vx = -vx;
        if (y < 0) vy = -vy;
        const px = paddleRef.current;
        if (y > H - 22 && x > px && x < px + 64 && vy > 0) {
          vy = -Math.abs(vy);
          vx += (x - (px + 32)) * 0.08;
        }
        let nextBricks = bricksRef.current;
        let hit = false;
        nextBricks = nextBricks.map((br) => {
          if (!br.alive || hit) return br;
          if (
            x > br.x &&
            x < br.x + BW &&
            y > br.y &&
            y < br.y + BH
          ) {
            hit = true;
            return { ...br, alive: false };
          }
          return br;
        });
        if (hit) {
          vy = -vy;
          setBricks(nextBricks);
          bricksRef.current = nextBricks;
        }
        if (y > H) {
          setLives((l) => l - 1);
          return { x: W / 2, y: H - 40, vx: 2.8, vy: -2.8 };
        }
        return { x, y, vx, vy };
      });
    }, 16);
    return () => clearInterval(id);
  }, [running, lives]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a")
        setPaddle((p) => Math.max(0, p - 22));
      if (e.key === "ArrowRight" || e.key === "d")
        setPaddle((p) => Math.min(W - 64, p + 22));
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, []);

  function reset() {
    setBricks(makeBricks());
    setBall({ x: W / 2, y: H - 40, vx: 2.8, vy: -2.8 });
    setLives(3);
    setRunning(true);
  }

  const left = bricks.filter((b) => b.alive).length;

  return (
    <View>
      <Text style={{ color: colors.fgDim, marginBottom: spacing.sm }}>
        Bricks {left} · lives {lives}
        {lives <= 0 ? " · game over" : left === 0 ? " · clear!" : ""}
      </Text>
      <View
        style={{
          width: W,
          height: H,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.bgElev,
          alignSelf: "center",
          overflow: "hidden",
        }}
      >
        {bricks.map((br, i) =>
          br.alive ? (
            <View
              key={i}
              style={{
                position: "absolute",
                left: br.x,
                top: br.y,
                width: BW,
                height: BH,
                backgroundColor: i % 2 ? colors.accent : colors.purple,
                opacity: 0.85,
              }}
            />
          ) : null,
        )}
        <View
          style={{
            position: "absolute",
            left: paddle,
            bottom: 8,
            width: 64,
            height: 10,
            backgroundColor: colors.accent,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: ball.x,
            top: ball.y,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.phosphor,
          }}
        />
      </View>
      <View style={styles.row}>
        <Pressable
          onPress={() => setPaddle((p) => Math.max(0, p - 28))}
          style={[styles.btn, { borderColor: colors.border }]}
        >
          <Text style={{ color: colors.accent }}>◀</Text>
        </Pressable>
        <Pressable
          onPress={() => setPaddle((p) => Math.min(W - 64, p + 28))}
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
