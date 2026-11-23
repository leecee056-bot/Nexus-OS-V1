import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { spacing, useTheme } from "../theme";
import { themeBodyStyle } from "../theme/fonts";

type Props = {
  canBack: boolean;
  canForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onNewWindow: () => void;
  onCloseWindow: () => void;
  title?: string;
};

function isElectron(): boolean {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  return Boolean(window.nexus?.newWindow || window.nexus?.windowBack);
}

/**
 * Desktop OS chrome — back / forward / new window / close (Electron only).
 */
export function DesktopWindowBar({
  canBack,
  canForward,
  onBack,
  onForward,
  onNewWindow,
  onCloseWindow,
  title = "Tri-Cass Companion",
}: Props) {
  const { colors, themeId } = useTheme();
  if (!isElectron()) return null;

  const btn = (label: string, onPress: () => void, enabled = true) => (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      style={[
        styles.btn,
        {
          borderColor: colors.border,
          backgroundColor: colors.bgElev,
          opacity: enabled ? 1 : 0.35,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        style={[
          { color: colors.fg, fontSize: 12, fontWeight: "700" },
          themeBodyStyle(themeId),
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

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
      <View style={styles.group}>
        {btn("← Back", onBack, canBack)}
        {btn("Forward →", onForward, canForward)}
      </View>
      <Text
        style={[
          styles.title,
          { color: colors.accent },
          themeBodyStyle(themeId),
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View style={styles.group}>
        {btn("New window", onNewWindow)}
        {btn("Close", onCloseWindow)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    zIndex: 20,
  },
  group: { flexDirection: "row", gap: 6, flexShrink: 0 },
  btn: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 44,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 12,
  },
});
