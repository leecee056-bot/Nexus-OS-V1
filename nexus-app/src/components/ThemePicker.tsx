import { Pressable, StyleSheet, Text, View } from "react-native";
import { THEME_ORDER, spacing, useTheme, type ThemeId } from "../theme";
import { THEMES } from "../theme/palettes";
import { monoStyle } from "../theme/fonts";

export function ThemePicker({ compact = false }: { compact?: boolean }) {
  const { themeId, setThemeId, colors, scanlines, setScanlines } = useTheme();
  const mono = colors.mono;
  const spatial = colors.spatialShell;

  return (
    <View style={styles.wrap}>
      {!compact ? (
        <Text
          style={[
            styles.heading,
            { color: colors.accent },
            mono ? monoStyle() : null,
          ]}
        >
          Theme
        </Text>
      ) : null}
      <View style={styles.row}>
        {THEME_ORDER.map((id: ThemeId) => {
          const t = THEMES[id];
          const on = id === themeId;
          const blockOn = on && mono;
          return (
            <Pressable
              key={id}
              onPress={() => setThemeId(id)}
              style={[
                styles.chip,
                {
                  borderColor: on ? colors.accent : colors.border,
                  backgroundColor: blockOn
                    ? colors.accent
                    : on
                      ? colors.accentSoft
                      : "transparent",
                  borderRadius: spatial || t.spatialShell ? 14 : mono ? 0 : 8,
                },
              ]}
            >
              <View
                style={[
                  styles.swatch,
                  {
                    backgroundColor: t.accent,
                    borderColor: t.bg,
                    borderRadius: mono ? 0 : t.spatialShell ? 6 : 6,
                  },
                ]}
              />
              <Text
                style={[
                  {
                    color: blockOn ? colors.bg : on ? colors.accent : colors.fg,
                    fontWeight: on ? "800" : "600",
                    fontSize: compact ? 11 : 13,
                  },
                  mono ? monoStyle({ fontSize: compact ? 10 : 12 }) : null,
                ]}
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
      {themeId !== "basic" && themeId !== "spatial" ? (
        <Pressable
          onPress={() => setScanlines(!scanlines)}
          style={[
            styles.scan,
            {
              borderColor: scanlines ? colors.accent : colors.border,
              backgroundColor: scanlines ? colors.accentSoft : "transparent",
              borderRadius: spatial ? 12 : 0,
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
