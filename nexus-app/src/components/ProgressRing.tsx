import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme";

/** Lightweight CSS-free progress ring using bordered arcs approximation */
export function ProgressRing({
  progress,
  size = 36,
  label,
}: {
  progress: number;
  size?: number;
  label?: string;
}) {
  const { colors } = useTheme();
  const pct = Math.max(0, Math.min(100, Math.round(progress)));
  const thickness = 3;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={[
          styles.track,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: thickness,
            borderColor: colors.border,
          },
        ]}
      />
      <View
        style={[
          styles.fill,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: thickness,
            borderColor: colors.accent,
            // Approximate arc via rotate + clip with overlapping half
            opacity: pct > 0 ? 1 : 0,
            transform: [{ rotate: `${(pct / 100) * 360 - 90}deg` }],
            borderTopColor: colors.accent,
            borderRightColor: pct > 25 ? colors.accent : "transparent",
            borderBottomColor: pct > 50 ? colors.accent : "transparent",
            borderLeftColor: pct > 75 ? colors.accent : "transparent",
          },
        ]}
      />
      <Text style={[styles.label, { color: colors.accent }]}>
        {label ?? `${pct}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { position: "absolute" },
  fill: { position: "absolute" },
  label: { fontSize: 9, fontWeight: "800" },
});
