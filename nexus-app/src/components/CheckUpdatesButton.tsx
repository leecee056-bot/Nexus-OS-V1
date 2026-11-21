import { Linking, Pressable, StyleSheet, Text } from "react-native";
import { spacing, useTheme } from "../theme";
import { monoStyle } from "../theme/fonts";

/** Manual “Check for updates” — opens the official page; no background scan. */
export function CheckUpdatesButton({
  url,
  label = "Check for updates",
  compact = false,
}: {
  url: string;
  label?: string;
  compact?: boolean;
}) {
  const { colors } = useTheme();
  const mono = colors.mono;

  return (
    <Pressable
      onPress={() => void Linking.openURL(url)}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={[
        compact ? styles.compact : styles.btn,
        {
          borderColor: colors.border,
          backgroundColor: colors.accentSoft,
        },
      ]}
    >
      <Text
        style={[
          {
            color: colors.accent,
            fontWeight: "700",
            fontSize: compact ? 11 : 12,
          },
          mono ? monoStyle({ fontSize: compact ? 10 : 11 }) : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  compact: {
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
  },
});
