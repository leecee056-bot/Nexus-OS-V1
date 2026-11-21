import { Pressable, StyleSheet, Text, View } from "react-native";
import { THEME_ORDER, spacing, useTheme, type ThemeId } from "../theme";
import { THEMES } from "../theme/palettes";

export function ThemePicker({ compact = false }: { compact?: boolean }) {
  const { themeId, setThemeId, colors, scanlines, setScanlines } = useTheme();

  return (
    <View style={styles.wrap}>
      {!compact ? (
        <Text style={[styles.heading, { color: colors.accent }]}>Theme</Text>
      ) : null}
      <View style={styles.row}>
        {THEME_ORDER.map((id: ThemeId) => {
          const t = THEMES[id];
          const on = id === themeId;
          return (
            <Pressable
              key={id}
              onPress={() => setThemeId(id)}
              style={[
                styles.chip,
                {
                  borderColor: on ? colors.accent : colors.border,
                  backgroundColor: on ? colors.accentSoft : "transparent",
                },
              ]}
            >
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: t.accent, borderColor: t.bg },
                ]}
              />
              <Text
                style={{
                  color: on ? colors.accent : colors.fg,
                  fontWeight: on ? "800" : "600",
                  fontSize: compact ? 11 : 13,
                }}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!compact ? (
        <Text style={[styles.blurb, { color: colors.fgDim }]}>
          {THEMES[themeId].blurb}
        </Text>
      ) : null}
      {themeId !== "basic" ? (
        <Pressable
          onPress={() => setScanlines(!scanlines)}
          style={[
            styles.scan,
            {
              borderColor: scanlines ? colors.accent : colors.border,
              backgroundColor: scanlines ? colors.accentSoft : "transparent",
            },
          ]}
        >
          <Text
            style={{
              color: scanlines ? colors.accent : colors.fgDim,
              fontWeight: "700",
              fontSize: 12,
            }}
          >
            Scanlines {scanlines ? "on" : "off"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  heading: { fontWeight: "800", letterSpacing: 1 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  blurb: { fontSize: 12, lineHeight: 18 },
  scan: {
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
