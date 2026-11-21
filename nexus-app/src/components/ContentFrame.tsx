import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useCompanionLayout } from "../layout";
import { colors } from "../theme";

export function ContentFrame({ children }: { children: ReactNode }) {
  const { contentMax, gutter } = useCompanionLayout();
  return (
    <View
      style={[
        styles.wrap,
        {
          paddingHorizontal: gutter,
          maxWidth: contentMax ?? "100%",
          alignSelf: "center",
          width: "100%",
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
});
