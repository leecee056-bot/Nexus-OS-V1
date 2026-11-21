import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";

export function GlowPanel({
  title,
  children,
  accent = "green",
}: {
  title?: string;
  children: ReactNode;
  accent?: "green" | "purple";
}) {
  const border =
    accent === "purple" ? "rgba(123,63,228,0.45)" : colors.border;
  const titleColor = accent === "purple" ? colors.purple : colors.accent;
  return (
    <View style={[styles.panel, { borderColor: border }]}>
      {title ? <Text style={[styles.title, { color: titleColor }]}>{title}</Text> : null}
      {typeof children === "string" ? (
        <Text style={styles.body}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "rgba(10,18,10,0.9)",
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.accent,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 2,
  },
  title: { fontWeight: "700", marginBottom: spacing.sm },
  body: { color: colors.fg, lineHeight: 22 },
});
