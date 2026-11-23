import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { monoStyle } from "../theme/fonts";
import { spacing, useTheme } from "../theme";

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function formatClock(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatDate(d: Date) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Top strip: Tri-Cass OS v1.0 | … + live clock (Europe/London-facing local). */
export function TerminalTitleBar({
  offline = false,
}: {
  offline?: boolean;
}) {
  const { colors } = useTheme();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.bgBar,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Image
        source={require("../../assets/brand/logo-mark.png")}
        style={styles.mark}
      />
      <Text
        style={monoStyle({
          color: colors.accent,
          fontWeight: "800",
          fontSize: 11,
          flexShrink: 1,
        })}
        numberOfLines={1}
      >
        Tri-Cass OS v1.0 | Portable Local Intelligence System
      </Text>
      <View style={styles.spacer} />
      <Text style={monoStyle({ color: colors.fgDim, fontSize: 10 })}>
        {offline ? "Offline" : "Local"}
      </Text>
      <Text style={monoStyle({ color: colors.fg, fontSize: 10 })}>
        {formatClock(now)}
      </Text>
      <Text style={monoStyle({ color: colors.fgDim, fontSize: 10 })}>
        {formatDate(now)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  mark: { width: 16, height: 16 },
  spacer: { flex: 1 },
});
