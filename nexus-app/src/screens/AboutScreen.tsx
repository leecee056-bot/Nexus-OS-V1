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
import { CheckUpdatesButton } from "../components/CheckUpdatesButton";
import { ThemePicker } from "../components/ThemePicker";
import {
  COMPANION_RELEASES_URL,
  IMAGE_GUIDE_URL,
  OS_RELEASES_URL,
  OS_UPDATE_URL,
} from "../updates/links";
import { useCompanionLayout } from "../layout";
import { spacing, useTheme } from "../theme";

export function AboutScreen() {
  const { isTablet, heroMascot } = useCompanionLayout();
  const { colors } = useTheme();

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
          <Text
            style={[
              styles.title,
              isTablet && styles.titleLg,
              { color: colors.accent },
            ]}
          >
            About
          </Text>
          <Text style={[styles.body, { color: colors.fg }]}>
            NEXUS Companion — Windows, Mac, iOS, and Android for the NEXUS OS /
            Tri-Cass family. Offline-first Chat with local models, plus Vault,
            Packs, and Files.
          </Text>
        </View>
      </View>

      <GlowPanel title="Look & feel" accent="purple">
        <ThemePicker />
      </GlowPanel>

      <GlowPanel title="Local models + Agent">
        Chat uses Ollama on this machine (or a host you set). Agent mode draws
        on your Vault, Add-ons library, and Files so answers feel like your own
        system — not a generic chat box. Desktop apps also include Image Lab for
        optional local image models.
      </GlowPanel>

      <GlowPanel title="Check for updates" accent="purple">
        Manual links to official pages — we do not host the large files. Same
        pattern can later cover USB / Pi images and Cardputer firmware.
        <CheckUpdatesButton
          url={OS_UPDATE_URL}
          label="Check for OS updates"
        />
        <CheckUpdatesButton url={OS_RELEASES_URL} label="GitHub releases" />
        <CheckUpdatesButton
          url={COMPANION_RELEASES_URL}
          label="Companion app releases"
        />
        {Platform.OS === "web" ? (
          <CheckUpdatesButton url={IMAGE_GUIDE_URL} label="Image Lab guide" />
        ) : null}
      </GlowPanel>

      <GlowPanel title="Phone + tablet + desktop">
        Phones keep bottom tabs with glow on the active item. Tablets switch to
        a side rail. Windows and Mac builds ship with the NEXUS logo as the app
        icon.
      </GlowPanel>

      <GlowPanel title="Version">
        0.8.1 · grafting rabbit · Image Lab · Updates · Agent{"\n"}Running on{" "}
        {Platform.OS}
      </GlowPanel>

      <Text
        style={[styles.link, { color: colors.accent }]}
        onPress={() =>
          Linking.openURL(
            "https://github.com/leecee056-bot/Nexus-OS-V1/tree/main/nexus-app",
          )
        }
      >
        Source on GitHub →
      </Text>
      <Text
        style={[styles.link, { color: colors.accent }]}
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
    fontSize: 22,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  titleLg: { fontSize: 28 },
  body: { lineHeight: 22 },
  link: {
    marginTop: spacing.sm,
    textDecorationLine: "underline",
  },
});
