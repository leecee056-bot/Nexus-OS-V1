import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MatrixRain } from "./MatrixRain";
import { colors, spacing } from "../theme";

type Props = {
  onDone: () => void;
};

export function BootSplash({ onDone }: Props) {
  const logo = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.65,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.sequence([
      Animated.timing(logo, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(title, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.delay(1100),
      Animated.timing(fade, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onDone();
    });
  }, [fade, logo, onDone, pulse, title]);

  return (
    <Animated.View style={[styles.root, { opacity: fade }]}>
      <MatrixRain />
      <LinearGradient
        colors={["rgba(4,8,4,0.15)", "rgba(4,8,4,0.82)", "#040804"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.center}>
        <Animated.View
          style={{
            opacity: logo,
            transform: [
              {
                translateY: logo.interpolate({
                  inputRange: [0, 1],
                  outputRange: [28, 0],
                }),
              },
              { scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) },
            ],
          }}
        >
          <Animated.View style={{ opacity: pulse }}>
            <Image
              source={require("../../assets/brand/nexus-rabbit-wizard.png")}
              style={styles.mascot}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>
        <Animated.View style={{ opacity: title }}>
          <Text style={styles.brand}>Tri-Cass OS</Text>
          <Text style={styles.sub}>Companion · offline first</Text>
        </Animated.View>
      </View>
      <Text style={styles.boot}>booting hub…</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  center: { alignItems: "center", paddingHorizontal: spacing.xl },
  mascot: {
    width: 168,
    height: 260,
    marginBottom: spacing.md,
  },
  brand: {
    color: colors.accent,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 6,
    textAlign: "center",
    textShadowColor: "rgba(57,255,20,0.55)",
    textShadowRadius: 12,
  },
  sub: {
    color: colors.fgDim,
    textAlign: "center",
    marginTop: spacing.sm,
    letterSpacing: 1,
  },
  boot: {
    position: "absolute",
    bottom: 48,
    color: colors.fgDim,
    fontFamily: "monospace",
    fontSize: 12,
  },
});
