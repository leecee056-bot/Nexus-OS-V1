import { Image, StyleSheet, Text, View } from "react-native";
import { StatusOrb, type OrbState } from "./StatusOrb";
import { spacing, useTheme } from "../theme";

function deviceMemoryLabel(): string {
  try {
    const nav = globalThis as {
      navigator?: { deviceMemory?: number; hardwareConcurrency?: number };
    };
    const mem = nav.navigator?.deviceMemory;
    const cores = nav.navigator?.hardwareConcurrency;
    const parts: string[] = [];
    if (typeof mem === "number") parts.push(`~${mem} GB RAM`);
    if (typeof cores === "number") parts.push(`${cores} threads`);
    return parts.join(" · ") || "Local device";
  } catch {
    return "Local device";
  }
}

export function AppStatusBar({
  modelLabel,
  orb,
  offline,
  ollamaOk,
}: {
  modelLabel: string;
  orb: OrbState;
  offline: boolean;
  ollamaOk: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.statusBar,
          borderTopColor: colors.border,
        },
      ]}
    >
      <Image
        source={require("../../assets/brand/logo-mark.png")}
        style={styles.mark}
      />
      <StatusOrb state={orb} />
      <View style={styles.mid}>
        <Text style={[styles.model, { color: colors.fg }]} numberOfLines={1}>
          {modelLabel}
        </Text>
        <Text style={[styles.meta, { color: colors.fgDim }]} numberOfLines={1}>
          {deviceMemoryLabel()}
          {ollamaOk ? " · Ollama" : ""}
        </Text>
      </View>
      <View
        style={[
          styles.badge,
          {
            borderColor: offline ? colors.danger : colors.accent,
            backgroundColor: offline ? "transparent" : colors.accentSoft,
          },
        ]}
      >
        <Text
          style={{
            color: offline ? colors.danger : colors.accent,
            fontSize: 10,
            fontWeight: "800",
            letterSpacing: 1,
          }}
        >
          {offline ? "OFFLINE AI" : "LOCAL"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  mark: { width: 18, height: 18 },
  mid: { flex: 1, minWidth: 0 },
  model: { fontWeight: "700", fontSize: 12 },
  meta: { fontSize: 10, marginTop: 1 },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
