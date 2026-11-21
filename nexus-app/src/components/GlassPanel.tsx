import { ReactNode } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FloatIn } from "./FloatIn";
import { monoStyle } from "../theme/fonts";
import { spacing, useTheme } from "../theme";

export function GlassPanel({
  title,
  children,
  accent = "green",
  style,
  floatDelay = 0,
}: {
  title?: string;
  children: ReactNode;
  accent?: "green" | "purple";
  style?: ViewStyle;
  floatDelay?: number;
}) {
  const { colors } = useTheme();
  const edge = accent === "purple" ? colors.purple : colors.edgeGlow;
  const titleColor = accent === "purple" ? colors.purple : colors.accent;
  const spatial = colors.spatialShell;
  const radius = colors.radius;

  const panel = (
    <View
      style={[
        styles.wrap,
        {
          borderColor: colors.glass ? edge : colors.border,
          backgroundColor: colors.glass ? colors.bgGlass : colors.bgElev,
          shadowColor: spatial
            ? "#000"
            : colors.glass
              ? colors.accent
              : "transparent",
          borderRadius: radius,
          borderWidth: spatial ? StyleSheet.hairlineWidth * 2 : 1,
          shadowOpacity: spatial ? 0.45 : colors.glass ? 0.28 : 0,
          shadowRadius: spatial ? 28 : 16,
          shadowOffset: { width: 0, height: spatial ? 14 : 4 },
          elevation: spatial ? 8 : 3,
          ...(Platform.OS === "web" && spatial
            ? ({
                backdropFilter: "blur(28px) saturate(140%)",
                WebkitBackdropFilter: "blur(28px) saturate(140%)",
                boxShadow:
                  "0 18px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
              } as object)
            : null),
        },
        style,
      ]}
    >
      {colors.glass ? (
        <LinearGradient
          colors={
            spatial
              ? [
                  "rgba(255,255,255,0.14)",
                  "rgba(255,255,255,0.03)",
                  "rgba(0,0,0,0.18)",
                ]
              : [
                  "rgba(255,255,255,0.06)",
                  "transparent",
                  "rgba(0,0,0,0.12)",
                ]
          }
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          pointerEvents="none"
        />
      ) : null}
      {title ? (
        <Text
          style={[
            styles.title,
            { color: titleColor },
            colors.mono ? monoStyle({ letterSpacing: 1 }) : null,
            spatial ? { letterSpacing: 0.4, fontWeight: "700" } : null,
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

  return spatial ? <FloatIn delay={floatDelay}>{panel}</FloatIn> : panel;
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
