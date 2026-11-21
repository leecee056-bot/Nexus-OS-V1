import { ReactNode } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { monoStyle } from "../theme/fonts";
import { spacing, useTheme } from "../theme";

export function GlassPanel({
  title,
  children,
  accent = "green",
  style,
}: {
  title?: string;
  children: ReactNode;
  accent?: "green" | "purple";
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const edge = accent === "purple" ? colors.purple : colors.edgeGlow;
  const titleColor = accent === "purple" ? colors.purple : colors.accent;

  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: colors.glass ? edge : colors.border,
          backgroundColor: colors.glass ? colors.bgGlass : colors.bgElev,
          shadowColor: colors.glass ? colors.accent : "transparent",
        },
        style,
      ]}
    >
      {colors.glass ? (
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.06)",
            "transparent",
            "rgba(0,0,0,0.12)",
          ]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      {title ? (
        <Text
          style={[
            styles.title,
            { color: titleColor },
            colors.mono ? monoStyle({ letterSpacing: 1 }) : null,
          ]}
        >
          {title}
        </Text>
      ) : null}
      {typeof children === "string" ? (
        <Text
          style={[
            styles.body,
            { color: colors.fg },
            colors.mono ? monoStyle() : null,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    overflow: "hidden",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: { fontWeight: "700", marginBottom: spacing.sm },
  body: { lineHeight: 22 },
});
