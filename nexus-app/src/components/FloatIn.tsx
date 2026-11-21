import { ReactNode, useEffect, useRef } from "react";
import { Animated, Easing, type ViewStyle } from "react-native";
import { useTheme } from "../theme";

/** Gentle physical entrance for Spatial panels; no-op elsewhere. */
export function FloatIn({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(colors.spatialShell ? 0 : 1)).current;
  const translateY = useRef(
    new Animated.Value(colors.spatialShell ? 14 : 0),
  ).current;
  const scale = useRef(new Animated.Value(colors.spatialShell ? 0.98 : 1)).current;

  useEffect(() => {
    if (!colors.spatialShell) return;
    opacity.setValue(0);
    translateY.setValue(16);
    scale.setValue(0.975);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 520,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 560,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 560,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [colors.spatialShell, delay, opacity, scale, translateY]);

  if (!colors.spatialShell) {
    return <>{children}</>;
  }

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
