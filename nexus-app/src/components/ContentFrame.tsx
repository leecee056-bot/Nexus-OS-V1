import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useCompanionLayout } from "../layout";
import { useTheme } from "../theme";

export function ContentFrame({ children }: { children: ReactNode }) {
  const { contentMax, gutter } = useCompanionLayout();
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        {
          paddingHorizontal: gutter,
          maxWidth: contentMax ?? "100%",
          alignSelf: "center",
          width: "100%",
          backgroundColor: colors.bg,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
});
