import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { useTheme } from "../theme";

export type OrbState = "idle" | "ready" | "thinking" | "offline";

export function StatusOrb({ state }: { state: OrbState }) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    pulse.stopAnimation();
    if (state === "thinking") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 520,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0.4,
            duration: 520,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ).start();
      return;
    }
    if (state === "ready") {
      Animated.timing(pulse, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
      return;
    }
    Animated.timing(pulse, {
      toValue: state === "offline" ? 0.35 : 0.55,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [state, pulse]);

  const fill =
    state === "offline"
      ? colors.danger
      : state === "thinking"
        ? colors.purple
        : colors.accent;

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.halo,
          {
            backgroundColor: fill,
            opacity: pulse.interpolate({
              inputRange: [0.35, 1],
              outputRange: [0.12, 0.35],
            }),
            transform: [{ scale: pulse }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.core,
          {
            backgroundColor: fill,
            opacity: pulse,
            shadowColor: fill,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 18, height: 18, alignItems: "center", justifyContent: "center" },
  halo: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  core: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
});
