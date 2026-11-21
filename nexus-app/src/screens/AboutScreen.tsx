import {
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScreenShell } from "../components/ScreenShell";
import { GlowPanel } from "../components/GlowPanel";
import { useCompanionLayout } from "../layout";
import { colors, spacing } from "../theme";

export function AboutScreen() {
  const { isTablet, heroMascot } = useCompanionLayout();

  return (
    <ScreenShell>
      <View style={[styles.hero, isTablet && styles.heroTablet]}>
        <Image
          source={require("../../assets/brand/nexus-rabbit-wizard.png")}
          style={{
            width: heroMascot.w * 0.85,
            height: heroMascot.h * 0.85,
          }}
          resizeMode="contain"
        />
        <View style={styles.heroText}>
          <Text style={[styles.title, isTablet && styles.titleLg]}>About</Text>
          <Text style={styles.body}>
            NEXUS Companion — Windows, iOS, and Android shell for the NEXUS OS /
            Tri-Cass family. Offline-first core; Network hooks can come later.
          </Text>
        </View>
      </View>

      <GlowPanel title="Not the bootable OS">
        Flashing a USB/Pi image or Cardputer firmware is still the primary path.
        Install this app when you want Chat, Vault, Packs, and Files without
        special boot media.
      </GlowPanel>

      <GlowPanel title="Phone + tablet" accent="purple">
        Phones keep bottom tabs. Tablets and wide Android devices switch to a
        side rail so the matrix chrome stays usable in landscape.
      </GlowPanel>

      <GlowPanel title="Android APK">
        Sideload APKs from the companion GitHub Release when attached (not Play
        Store yet). Build with EAS preview if you need a fresh binary.
      </GlowPanel>

      <GlowPanel title="Version">
        0.3.0 companion · Expo · matrix boot · Vault + Packs{"\n"}Running on{" "}
        {Platform.OS}
      </GlowPanel>

      <Text
        style={styles.link}
        onPress={() =>
          Linking.openURL(
            "https://github.com/leecee056-bot/Nexus-OS-V1/tree/main/nexus-app",
          )
        }
      >
        Source on GitHub →
      </Text>
      <Text
        style={styles.link}
        onPress={() =>
          Linking.openURL("https://nexus-os.apps.grok.bot/download#companion")
        }
      >
        One-click companion downloads →
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  heroTablet: { gap: spacing.xl },
  heroText: { flex: 1, minWidth: 160 },
  title: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  titleLg: { fontSize: 28 },
  body: { color: colors.fg, lineHeight: 22 },
  link: {
    color: colors.accent,
    marginTop: spacing.sm,
    textDecorationLine: "underline",
  },
});
