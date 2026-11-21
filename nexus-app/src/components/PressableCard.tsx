import { useRef, type ReactNode } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../theme";

export function PressableCard({
  children,
  onPress,
  selected,
  style,
  disabled,
}: {
  children: ReactNode;
  onPress?: () => void;
  selected?: boolean;
  style?: ViewStyle;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  function setPressed(down: boolean) {
    Animated.spring(scale, {
      toValue: down ? 0.985 : 1,
      useNativeDriver: true,
      friction: 7,
      tension: 160,
    }).start();
  }

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onHoverIn={() => setPressed(true)}
      onHoverOut={() => setPressed(false)}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale }, { translateY: selected ? -1 : 0 }],
            backgroundColor: colors.glass ? colors.bgGlass : colors.bgElev,
            borderColor: selected ? colors.accent : colors.border,
            shadowColor: colors.accent,
            shadowOpacity: selected || colors.glass ? 0.28 : 0.08,
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
});
