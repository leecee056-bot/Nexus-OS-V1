import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  loadShellMode,
  saveShellMode,
  type ShellMode,
} from "../layout/shellMode";
import { spacing, useTheme } from "../theme";
import { monoStyle } from "../theme/fonts";

const MODES: { id: ShellMode; label: string; blurb: string }[] = [
  {
    id: "classic",
    label: "Classic",
    blurb: "Familiar chat layout — one conversation at a time.",
  },
  {
    id: "desk",
    label: "Desk",
    blurb: "NEXUS OS windows — multi-panel desk like the CRT mockup.",
  },
];

/** Desktop layout switch: classic LLM chrome vs tiled OS desk. */
export function ShellModePicker({
  onChange,
}: {
  onChange?: (mode: ShellMode) => void;
}) {
  const { colors } = useTheme();
  const [mode, setMode] = useState<ShellMode>("classic");

  useEffect(() => {
    void loadShellMode().then(setMode);
  }, []);

  if (Platform.OS !== "web") return null;

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.title,
          { color: colors.accent },
          colors.mono ? monoStyle({ letterSpacing: 1 }) : null,
        ]}
      >
        Layout
      </Text>
      <View style={styles.row}>
        {MODES.map((m) => {
          const on = mode === m.id;
          return (
            <Pressable
              key={m.id}
              onPress={() => {
                setMode(m.id);
                void saveShellMode(m.id);
                onChange?.(m.id);
              }}
              style={[
                styles.chip,
                {
                  borderColor: on ? colors.accent : colors.border,
                  backgroundColor: on ? colors.accentSoft : "transparent",
                },
              ]}
            >
              <Text
                style={{
                  color: on ? colors.accent : colors.fgDim,
                  fontWeight: on ? "800" : "600",
                  fontSize: 13,
                }}
              >
                {m.label}
              </Text>
              <Text style={{ color: colors.fgDim, fontSize: 11, marginTop: 4 }}>
                {m.blurb}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  title: { fontWeight: "800", marginBottom: spacing.sm, letterSpacing: 1 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    flexGrow: 1,
    flexBasis: "42%",
    borderWidth: 1,
    padding: spacing.md,
    minWidth: 140,
  },
});
