import { Platform, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme";

/**
 * Soft depth lighting for Spatial / Open — calm orbs, no matrix rain.
 * Decorative only (pointerEvents none).
 */
export function SpatialAtmosphere() {
  const { colors } = useTheme();
  if (!colors.spatialShell) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["#0b0d16", "#07080e", "#05060b"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.orb,
          styles.orbA,
          Platform.OS === "web" ? ({ filter: "blur(64px)" } as object) : null,
        ]}
      />
      <View
        style={[
          styles.orb,
          styles.orbB,
          Platform.OS === "web" ? ({ filter: "blur(80px)" } as object) : null,
        ]}
      />
      <View
        style={[
          styles.orb,
          styles.orbC,
          Platform.OS === "web" ? ({ filter: "blur(72px)" } as object) : null,
        ]}
      />
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.05)",
          "transparent",
          "rgba(0,0,0,0.35)",
        ]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.55,
  },
  orbA: {
    width: 420,
    height: 420,
    top: -80,
    left: -60,
    backgroundColor: "rgba(120, 160, 255, 0.22)",
  },
  orbB: {
    width: 360,
    height: 360,
    bottom: 40,
    right: -40,
    backgroundColor: "rgba(180, 140, 255, 0.16)",
  },
  orbC: {
    width: 280,
    height: 280,
    top: "38%",
    left: "42%",
    backgroundColor: "rgba(100, 220, 255, 0.1)",
  },
});
