import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { monoStyle } from "../theme/fonts";
import { spacing, useTheme } from "../theme";

/** Sharp CRT pane — title strip + body, inspired by the Tri-Cass OS mockup. */
export function TerminalPanel({
  title,
  children,
  style,
  bodyStyle,
  onPress,
  selected = false,
}: {
  title: string;
  children: ReactNode;
  style?: ViewStyle;
  bodyStyle?: ViewStyle;
  onPress?: () => void;
  selected?: boolean;
}) {
  const { colors } = useTheme();
  const border = selected ? colors.accent : colors.border;
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      style={[
        styles.wrap,
        {
          borderColor: border,
          backgroundColor: colors.bgElev,
          shadowColor: colors.phosphor,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.titleBar,
          {
            borderBottomColor: border,
            backgroundColor: selected ? colors.accent : colors.bgBar,
          },
        ]}
      >
        <Text
          style={[
            monoStyle({
              color: selected ? colors.bg : colors.accent,
              fontWeight: "800",
              fontSize: 11,
              letterSpacing: 1,
            }),
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      <View style={[styles.body, bodyStyle]}>
        {typeof children === "string" ? (
          <Text style={monoStyle({ color: colors.fg, fontSize: 12, lineHeight: 18 })}>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    overflow: "hidden",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  titleBar: {
    borderBottomWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  body: {
    padding: spacing.sm,
    flexGrow: 1,
  },
});
