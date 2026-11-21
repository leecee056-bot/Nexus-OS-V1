import { useCallback, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { GlassPanel } from "./GlassPanel";
import { spacing, useTheme } from "../theme";

function hasDesktopBridge() {
  return typeof window !== "undefined" && Boolean(window.nexus?.addToDesktop);
}

/**
 * Desktop-only: pin NEXUS Companion to the Desktop + Start Menu / Applications
 * with the rabbit-wizard icon thumbnail.
 */
export function DesktopLauncherPanel() {
  const { colors } = useTheme();
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onAdd = useCallback(async () => {
    if (!window.nexus?.addToDesktop) return;
    setBusy(true);
    setNote(null);
    try {
      const result = await window.nexus.addToDesktop();
      if (result.ok) {
        const where =
          result.desktop ||
          (result.created && result.created[0]) ||
          "Desktop";
        setNote(`Launcher ready — look for NEXUS Companion on your Desktop (${where}).`);
      } else {
        setNote(result.error || "Could not create launcher.");
      }
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Launcher failed.");
    } finally {
      setBusy(false);
    }
  }, []);

  if (!hasDesktopBridge()) return null;

  return (
    <GlassPanel title="Desktop launcher" accent="purple">
      <View style={styles.row}>
        <Image
          source={require("../../assets/brand/logo-mark.png")}
          style={styles.thumb}
          resizeMode="contain"
          accessibilityLabel="NEXUS Companion icon"
        />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.fg, lineHeight: 20 }}>
            Add a Desktop shortcut (and Start Menu / Applications entry) with
            the NEXUS icon so you can launch Companion like a normal app.
          </Text>
        </View>
      </View>

      <Pressable
        style={[
          styles.btn,
          {
            backgroundColor: colors.accentSoft,
            borderColor: colors.accent,
            opacity: busy ? 0.6 : 1,
          },
        ]}
        disabled={busy}
        onPress={() => void onAdd()}
      >
        <Text style={[styles.btnText, { color: colors.accent }]}>
          {busy ? "Adding…" : "Add to Desktop"}
        </Text>
      </Pressable>

      {note ? (
        <Text style={{ color: colors.fgDim, marginTop: spacing.sm, fontSize: 12 }}>
          {note}
        </Text>
      ) : null}
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  btn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  btnText: { fontWeight: "800", letterSpacing: 0.3 },
});
