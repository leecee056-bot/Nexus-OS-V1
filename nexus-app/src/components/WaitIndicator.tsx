import { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { pickFunFact } from "../funfacts";
import {
  loadFunFactsEnabled,
  saveFunFactsEnabled,
} from "../layout/shellMode";
import { spacing, useTheme } from "../theme";
import { monoStyle } from "../theme/fonts";

/**
 * Compact wait state: small rabbit on the side + rotating fun facts
 * (toggleable). Replaces the old “grafting…” block.
 */
export function WaitIndicator({ active }: { active: boolean }) {
  const { colors } = useTheme();
  const [seconds, setSeconds] = useState(0);
  const [fact, setFact] = useState(() => pickFunFact());
  const [factsOn, setFactsOn] = useState(true);
  const seen = useRef<string[]>([]);

  useEffect(() => {
    void loadFunFactsEnabled().then(setFactsOn);
  }, []);

  useEffect(() => {
    if (!active) {
      setSeconds(0);
      return;
    }
    setSeconds(0);
    setFact(pickFunFact(seen.current));
    const tick = setInterval(() => setSeconds((s) => s + 1), 1000);
    const rotate = setInterval(() => {
      setFact((prev) => {
        seen.current = [...seen.current.slice(-40), prev];
        return pickFunFact(seen.current);
      });
    }, 4500);
    return () => {
      clearInterval(tick);
      clearInterval(rotate);
    };
  }, [active]);

  if (!active) return null;

  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: colors.border,
          backgroundColor: colors.glass ? colors.bgGlass : colors.bgElev,
        },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={factsOn ? `Fun fact, ${seconds} seconds` : `Waiting ${seconds} seconds`}
    >
      <Image
        source={require("../../assets/brand/rabbit-dig.gif")}
        style={styles.gif}
        resizeMode="contain"
      />
      <View style={styles.copy}>
        {factsOn ? (
          <Text
            style={[
              styles.fact,
              { color: colors.fg },
              colors.mono ? monoStyle() : null,
            ]}
          >
            {fact}
          </Text>
        ) : (
          <Text style={[styles.quiet, { color: colors.fgDim }]}>
            Digging up a reply…
          </Text>
        )}
        <View style={styles.meta}>
          <Text style={[styles.secs, { color: colors.accent }]}>{seconds}s</Text>
          <Pressable
            onPress={() => {
              const next = !factsOn;
              setFactsOn(next);
              void saveFunFactsEnabled(next);
            }}
            hitSlop={8}
          >
            <Text style={{ color: colors.purple, fontSize: 11, fontWeight: "700" }}>
              {factsOn ? "Facts off" : "Facts on"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.sm,
    borderWidth: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    maxWidth: 420,
  },
  gif: {
    width: 36,
    height: 54,
  },
  copy: { flex: 1, minWidth: 0 },
  fact: { fontSize: 12, lineHeight: 17 },
  quiet: { fontSize: 12 },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: 4,
  },
  secs: { fontSize: 11, fontWeight: "800" },
});
