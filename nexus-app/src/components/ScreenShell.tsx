import { ReactNode } from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MatrixRain } from "./MatrixRain";
import { ScanlineOverlay } from "./ScanlineOverlay";
import { SpatialAtmosphere } from "./SpatialAtmosphere";
import { useCompanionLayout } from "../layout";
import { useTheme } from "../theme";

type Props = {
  children: ReactNode;
  /** Soft matrix backdrop (Home-style) */
  rain?: boolean;
  scroll?: boolean;
  contentStyle?: ViewStyle;
};

export function ScreenShell({
  children,
  rain = false,
  scroll = true,
  contentStyle,
}: Props) {
  const { contentMax, gutter } = useCompanionLayout();
  const { colors } = useTheme();
  const showRain = rain && colors.rain && !colors.spatialShell;
  const spatial = colors.spatialShell;

  const pad = {
    paddingHorizontal: spatial ? gutter + 4 : gutter,
    paddingTop: spatial ? gutter + 8 : gutter,
    paddingBottom: gutter * 2,
    maxWidth: spatial ? Math.min(contentMax || 1100, 1100) : contentMax,
    width: "100%" as const,
    alignSelf: "center" as const,
    gap: spatial ? 4 : 0,
  };

  const fade =
    colors.id === "basic"
      ? (["rgba(244,247,244,0.2)", "rgba(244,247,244,0.85)", colors.bg] as const)
      : colors.id === "lumen"
        ? (["rgba(3,6,5,0.35)", "rgba(3,6,5,0.82)", colors.bg] as const)
        : colors.id === "terminal"
          ? (["rgba(0,0,0,0.25)", "rgba(0,0,0,0.78)", colors.bg] as const)
          : (["rgba(4,8,4,0.5)", "rgba(4,8,4,0.9)", colors.bg] as const);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      {spatial ? <SpatialAtmosphere /> : null}
      {showRain ? (
        <>
          <MatrixRain dimmed />
          <LinearGradient
            colors={[...fade]}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          />
        </>
      ) : null}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[pad, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, pad, contentStyle]}>{children}</View>
      )}
      {!spatial ? <ScanlineOverlay /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fill: { flex: 1 },
});
