import {
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScreenShell } from "../components/ScreenShell";
import { GlowPanel } from "../components/GlowPanel";
import { useCompanionLayout } from "../layout";
import { colors, spacing } from "../theme";

export function HomeScreen() {
  const { isTablet, heroMascot } = useCompanionLayout();

  return (
    <ScreenShell rain>
      <View style={[styles.heroRow, isTablet && styles.heroRowTablet]}>
        <Image
          source={require("../../assets/brand/nexus-rabbit-wizard.png")}
          style={{ width: heroMascot.w, height: heroMascot.h }}
          resizeMode="contain"
        />
        <View style={styles.heroText}>
          <Text style={[styles.brand, isTablet && styles.brandLg]}>NEXUS OS</Text>
          <Text style={styles.title}>Companion</Text>
          <Text style={styles.lede}>
            Offline-first Chat, Vault, Packs, and Files — phone and tablet ready.
            {Platform.OS === "android"
              ? " Sideload the APK; no Play Store required."
              : " One-click downloads on the site when a build is published."}
          </Text>
        </View>
      </View>

      <GlowPanel title="Secondary target">
        The bootable USB / Pi images and Cardputer / Pocket firmware stay primary.
        This app is the stylish, installable path with the same matrix vibe.
      </GlowPanel>

      <GlowPanel title="What’s inside" accent="purple">
        <Text style={styles.body}>
          • Matrix boot splash + rabbit-wizard logo{"\n"}
          • Chat — lightweight offline phrase stub{"\n"}
          • Vault — searchable on-device notes{"\n"}
          • Packs — Kiwix / Gutenberg → import .txt/.md{"\n"}
          • Files — import documents from the device{"\n"}
          • Phone bottom tabs · tablet side rail
        </Text>
      </GlowPanel>

      <View style={styles.actions}>
        <Pressable
          style={styles.btn}
          onPress={() =>
            Linking.openURL("https://nexus-os.apps.grok.bot/download#companion")
          }
        >
          <Text style={styles.btnText}>Get downloads</Text>
        </Pressable>
        <Pressable
          style={styles.btnGhost}
          onPress={() =>
            Linking.openURL("https://nexus-os.apps.grok.bot/knowledge-packs")
          }
        >
          <Text style={styles.btnGhostText}>Knowledge packs</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  heroRowTablet: { gap: spacing.xl },
  heroText: { flex: 1, minWidth: 160 },
  brand: {
    color: colors.accent,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 3,
    textShadowColor: "rgba(57,255,20,0.45)",
    textShadowRadius: 12,
  },
  brandLg: { fontSize: 34, letterSpacing: 5 },
  title: {
    color: colors.purple,
    fontSize: 18,
    marginTop: 2,
    marginBottom: spacing.sm,
    fontWeight: "700",
  },
  lede: { color: colors.fgDim, lineHeight: 22 },
  body: { color: colors.fg, lineHeight: 22 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  btn: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  btnText: { color: colors.accent, fontWeight: "700" },
  btnGhost: {
    borderColor: colors.purple,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.purpleSoft,
  },
  btnGhostText: { color: "#d4b8ff", fontWeight: "700" },
});
