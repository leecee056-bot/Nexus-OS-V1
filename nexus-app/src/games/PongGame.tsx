import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing, useTheme } from "../theme";

const W = 320;
const H = 200;
const PW = 8;
const PH = 48;
const BR = 6;

export function PongGame() {
  const { colors } = useTheme();
  const [p1, setP1] = useState(H / 2 - PH / 2);
  const [p2, setP2] = useState(H / 2 - PH / 2);
  const [ball, setBall] = useState({ x: W / 2, y: H / 2, vx: 3.2, vy: 2.1 });
  const [score, setScore] = useState({ a: 0, b: 0 });
  const [running, setRunning] = useState(true);
  const p1Ref = useRef(p1);
  const p2Ref = useRef(p2);
  p1Ref.current = p1;
  p2Ref.current = p2;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setBall((b) => {
        let { x, y, vx, vy } = b;
        x += vx;
        y += vy;
        if (y < 0 || y > H - BR) vy = -vy;
        const hit1 =
          x < PW + 4 &&
          y + BR > p1Ref.current &&
          y < p1Ref.current + PH;
        const hit2 =
          x > W - PW - BR - 4 &&
          y + BR > p2Ref.current &&
          y < p2Ref.current + PH;
        if (hit1) {
          vx = Math.abs(vx) + 0.15;
          x = PW + 4;
        }
        if (hit2) {
          vx = -(Math.abs(vx) + 0.15);
          x = W - PW - BR - 4;
        }
        if (x < -10) {
          setScore((s) => ({ ...s, b: s.b + 1 }));
          return { x: W / 2, y: H / 2, vx: 3.2, vy: 2.1 };
        }
        if (x > W + 10) {
          setScore((s) => ({ ...s, a: s.a + 1 }));
          return { x: W / 2, y: H / 2, vx: -3.2, vy: 2.1 };
        }
        // simple CPU paddle
        setP2((py) => {
          const target = y - PH / 2;
          const step = 2.6;
          if (py < target - 2) return Math.min(H - PH, py + step);
          if (py > target + 2) return Math.max(0, py - step);
          return py;
        });
        return { x, y, vx, vy };
      });
    }, 16);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w")
        setP1((v) => Math.max(0, v - 18));
      if (e.key === "ArrowDown" || e.key === "s")
        setP1((v) => Math.min(H - PH, v + 18));
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, []);

  return (
    <View>
      <Text style={{ color: colors.fgDim, marginBottom: spacing.sm }}>
        {score.a} — {score.b} · arrows / W S
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
        <View
          style={{
            position: "absolute",
            left: 4,
            top: p1,
            width: PW,
            height: PH,
            backgroundColor: colors.accent,
          }}
        />
        <View
          style={{
            position: "absolute",
            right: 4,
            top: p2,
            width: PW,
            height: PH,
            backgroundColor: colors.purple,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: ball.x,
            top: ball.y,
            width: BR,
            height: BR,
            borderRadius: BR / 2,
            backgroundColor: colors.phosphor,
          }}
        />
      </View>
      <View style={styles.row}>
        <Pressable
          onPress={() => setP1((v) => Math.max(0, v - 24))}
          style={[styles.btn, { borderColor: colors.border }]}
        >
          <Text style={{ color: colors.accent }}>▲</Text>
        </Pressable>
        <Pressable
          onPress={() => setP1((v) => Math.min(H - PH, v + 24))}
          style={[styles.btn, { borderColor: colors.border }]}
        >
          <Text style={{ color: colors.accent }}>▼</Text>
        </Pressable>
        <Pressable
          onPress={() => setRunning((r) => !r)}
          style={[styles.btn, { borderColor: colors.accent }]}
        >
          <Text style={{ color: colors.accent }}>
            {running ? "Pause" : "Play"}
          </Text>
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
  btn: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
