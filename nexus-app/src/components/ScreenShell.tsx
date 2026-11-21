import { ReactNode } from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MatrixRain } from "./MatrixRain";
import { useCompanionLayout } from "../layout";
import { colors } from "../theme";

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
  const pad = {
    paddingHorizontal: gutter,
    paddingTop: gutter,
    paddingBottom: gutter * 2,
    maxWidth: contentMax,
    width: "100%" as const,
    alignSelf: "center" as const,
  };

  return (
    <View style={styles.root}>
      {rain ? (
        <>
          <MatrixRain dimmed />
          <LinearGradient
            colors={["rgba(4,8,4,0.5)", "rgba(4,8,4,0.9)", "#040804"]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
});
