import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, type TextStyle } from "react-native";
import { useTheme } from "../theme";

type Props = {
  text: string;
  /** Animate only once when this becomes the newest assistant message */
  animate?: boolean;
  style?: TextStyle;
  cps?: number;
};

export function TypewriterText({
  text,
  animate = false,
  style,
  cps = 42,
}: Props) {
  const { colors, themeId } = useTheme();
  const [shown, setShown] = useState(animate ? "" : text);

  useEffect(() => {
    if (!animate) {
      setShown(text);
      return;
    }
    setShown("");
    let i = 0;
    const step = Math.max(1, Math.ceil(text.length / 180));
    const ms = Math.max(12, Math.floor(1000 / cps));
    const id = setInterval(() => {
      i = Math.min(text.length, i + step);
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, ms);
    return () => clearInterval(id);
  }, [text, animate, cps]);

  const glow = useMemo(() => {
    if (themeId === "basic") return undefined;
    return {
      textShadowColor: colors.phosphor,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: themeId === "lumen" ? 8 : 5,
    } as TextStyle;
  }, [themeId, colors.phosphor]);

  return (
    <Text style={[styles.base, { color: colors.fg }, glow, style]}>
      {shown}
      {animate && shown.length < text.length ? (
        <Text style={{ color: colors.accent }}>▌</Text>
      ) : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: { lineHeight: 21 },
});
