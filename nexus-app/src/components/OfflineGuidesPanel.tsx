import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { OFFLINE_GUIDES } from "../offline/guides";
import { spacing, useTheme } from "../theme";
import { monoStyle } from "../theme/fonts";

/** Expandable in-app help — no network required. */
export function OfflineGuidesPanel() {
  const { colors } = useTheme();
  const [open, setOpen] = useState<string | null>("offline");

  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: colors.border,
          backgroundColor: colors.glass ? colors.bgGlass : colors.bgElev,
          borderRadius: colors.radius || 0,
          overflow: "hidden",
        },
      ]}
    >
      <Text
        style={[
          styles.heading,
          { color: colors.accent },
          colors.mono ? monoStyle({ letterSpacing: 1 }) : null,
        ]}
      >
        Works offline
      </Text>
      <Text style={[styles.lede, { color: colors.fgDim }]}>
        Built-in help — no website or cloud account needed. Website links stay
        optional for downloads only.
      </Text>
      {OFFLINE_GUIDES.map((g) => {
        const isOpen = open === g.id;
        return (
          <View key={g.id} style={[styles.row, { borderColor: colors.border }]}>
            <Pressable
              onPress={() => setOpen(isOpen ? null : g.id)}
              style={styles.head}
            >
              <Text style={{ color: colors.fg, fontWeight: "800", flex: 1 }}>
                {g.title}
              </Text>
              <Text style={{ color: colors.accent, fontWeight: "900" }}>
                {isOpen ? "−" : "+"}
              </Text>
            </Pressable>
            {isOpen ? (
              <Text
                style={[
                  styles.body,
                  { color: colors.fg },
                  colors.mono ? monoStyle({ fontSize: 12 }) : null,
                ]}
              >
                {g.body}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heading: { fontWeight: "900", fontSize: 16, marginBottom: 4 },
  lede: { fontSize: 12, marginBottom: spacing.md },
  row: { borderTopWidth: 1, paddingVertical: spacing.sm },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  body: { marginTop: spacing.sm, lineHeight: 20, fontSize: 13 },
});
