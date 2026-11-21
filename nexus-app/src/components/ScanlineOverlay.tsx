import { StyleSheet, View } from "react-native";
import { useTheme } from "../theme";

/** Very light optional CRT scanlines — cheap strip of repeating lines */
export function ScanlineOverlay() {
  const { colors, scanlines, themeId } = useTheme();
  if (!scanlines || themeId === "basic") return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: 48 }).map((_, i) => (
        <View
          key={i}
          style={{
            height: 1,
            marginBottom: 7,
            backgroundColor: colors.scanline,
            opacity: 0.9,
          }}
        />
      ))}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor:
              themeId === "lumen"
                ? "rgba(40,120,70,0.04)"
                : "rgba(0,40,0,0.05)",
          },
        ]}
      />
    </View>
  );
}
