import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

const GLYPHS = "01アイウエオカキクケコサシスセソナニヌネノﾊﾐﾑﾒﾓNEXUS";
const COLS = 14;

type Column = {
  x: number;
  delay: number;
  speed: number;
  text: string;
};

function makeColumns(width: number): Column[] {
  const gap = width / COLS;
  return Array.from({ length: COLS }, (_, i) => {
    const len = 8 + Math.floor(Math.random() * 10);
    let text = "";
    for (let j = 0; j < len; j++) {
      text += GLYPHS[Math.floor(Math.random() * GLYPHS.length)] + "\n";
    }
    return {
      x: i * gap + 4,
      delay: Math.random() * 1200,
      speed: 2800 + Math.random() * 2200,
      text,
    };
  });
}

function RainColumn({ col, height }: { col: Column; height: number }) {
  const y = useRef(new Animated.Value(-height * 0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(col.delay),
        Animated.timing(y, {
          toValue: height + 40,
          duration: col.speed,
          useNativeDriver: true,
        }),
        Animated.timing(y, {
          toValue: -height * 0.45,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [col.delay, col.speed, height, y]);

  return (
    <Animated.Text
      style={[
        styles.col,
        {
          left: col.x,
          transform: [{ translateY: y }],
          opacity: 0.35 + (col.x % 3) * 0.12,
        },
      ]}
    >
      {col.text}
    </Animated.Text>
  );
}

export function MatrixRain({ dimmed = false }: { dimmed?: boolean }) {
  const { width, height } = Dimensions.get("window");
  const columns = useMemo(() => makeColumns(width), [width]);
  const [tick, setTick] = useState(0);

  // occasional glyph refresh so the rain feels alive
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 4200);
    return () => clearInterval(id);
  }, []);

  const refreshed = useMemo(() => {
    void tick;
    return columns.map((c) => ({
      ...c,
      text: c.text
        .split("\n")
        .map((ch) =>
          ch
            ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
            : "",
        )
        .join("\n"),
    }));
  }, [columns, tick]);

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, dimmed && styles.dimmed, { width, height }]}
    >
      {refreshed.map((col, i) => (
        <RainColumn key={i} col={col} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
    backgroundColor: colors.bg,
  },
  dimmed: { opacity: 0.55 },
  col: {
    position: "absolute",
    top: 0,
    color: colors.accent,
    fontSize: 13,
    lineHeight: 16,
    fontFamily: "monospace",
    textShadowColor: "rgba(57,255,20,0.45)",
    textShadowRadius: 6,
  },
});
