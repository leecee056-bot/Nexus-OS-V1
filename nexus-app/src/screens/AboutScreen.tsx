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
            NEXUS Companion — Windows, Mac, iOS, and Android app for the NEXUS
            OS / Tri-Cass family. Offline-first Chat with local models, plus
            Vault, Packs, and Files.
          </Text>
        </View>
      </View>

      <GlowPanel title="Local models">
        Chat uses Ollama on this machine (or a host you set). Pick a lightweight
        model, download once, then keep chatting without the cloud.
      </GlowPanel>

      <GlowPanel title="Phone + tablet + desktop" accent="purple">
        Phones keep bottom tabs. Tablets switch to a side rail. Windows and Mac
        builds ship with the NEXUS logo as the app icon.
      </GlowPanel>

      <GlowPanel title="Android APK">
        Sideload APKs from the companion GitHub Release when attached (not Play
        Store yet). Point Chat at Ollama on a PC on the same Wi‑Fi if needed.
      </GlowPanel>

      <GlowPanel title="Version">
        0.4.0 · local AI Chat · matrix boot · Vault + Packs{"\n"}Running on{" "}
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
        Companion downloads →
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
