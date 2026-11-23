import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { spacing, useTheme } from "../theme";
import { monoStyle, themeBodyStyle } from "../theme/fonts";

/**
 * On-brand wait state — rabbit GIF on a light plate (no dark drop-shadow).
 */
export function GraftingIndicator({ active }: { active: boolean }) {
  const { colors, themeId } = useTheme();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!active) {
      setSeconds(0);
      return;
    }
    setSeconds(0);
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: colors.border,
          backgroundColor: colors.glass ? colors.bgGlass : colors.bgElev,
        },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={`grafting ${seconds} seconds`}
    >
      <View
        style={[
          styles.gifPlate,
          {
            backgroundColor:
              themeId === "basic" ? "#e8e4da" : "rgba(240,248,240,0.94)",
            borderColor: colors.border,
          },
        ]}
      >
        <Image
          source={require("../../assets/brand/rabbit-grafting.gif")}
          style={styles.gif}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
      <Text
        style={[
          styles.label,
          { color: colors.accent },
          colors.mono ? monoStyle({ letterSpacing: 1 }) : null,
        ]}
      >
        grafting… {seconds}s
      </Text>
      <Text
        style={[
          styles.hint,
          { color: colors.fgDim },
          themeBodyStyle(themeId),
        ]}
      >
        rabbit on shovel duty
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
    alignItems: "center",
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    maxWidth: 220,
  },
  gifPlate: {
    borderWidth: 1,
    padding: 6,
    borderRadius: 4,
  },
  gif: {
    width: 96,
    height: 144,
  },
  label: {
    marginTop: spacing.sm,
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  hint: {
    marginTop: 2,
    fontSize: 11,
  },
});
