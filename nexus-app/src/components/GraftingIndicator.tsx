import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { spacing, useTheme } from "../theme";
import { monoStyle } from "../theme/fonts";

/**
 * Cheeky on-brand wait state while the local model grafts a reply.
 * Avoids the word “thinking” — shows rabbit GIF + live seconds.
 */
export function GraftingIndicator({ active }: { active: boolean }) {
  const { colors } = useTheme();
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
          shadowColor: colors.phosphor,
        },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={`grafting ${seconds} seconds`}
    >
      <Image
        source={require("../../assets/brand/rabbit-grafting.gif")}
        style={styles.gif}
        resizeMode="contain"
        // web / Android animate GIF natively via RN Image
        accessibilityIgnoresInvertColors
      />
      <Text
        style={[
          styles.label,
          { color: colors.accent },
          colors.mono ? monoStyle({ letterSpacing: 1 }) : null,
        ]}
      >
        grafting… {seconds}s
      </Text>
      <Text style={[styles.hint, { color: colors.fgDim }]}>
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
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
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
