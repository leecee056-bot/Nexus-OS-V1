import {
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BrowsePanel } from "../components/BrowsePanel";
import { DesktopLauncherPanel } from "../components/DesktopLauncherPanel";
import { ScreenShell } from "../components/ScreenShell";
import { GlowPanel } from "../components/GlowPanel";
import { CheckUpdatesButton } from "../components/CheckUpdatesButton";
import { OfflineGuidesPanel } from "../components/OfflineGuidesPanel";
import { PortableUsbPanel } from "../components/PortableUsbPanel";
import { ThemePicker } from "../components/ThemePicker";
import {
  AGENT_GUIDE_URL,
  CODING_PACKS_URL,
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
            Tri-Cass Companion — Windows, Mac, iOS, and Android (including Android
            TV / leanback sideload) for the Tri-Cass family. Offline-first Chat with
            local models, plus Vault, Packs, and Files. No Tri-Cass cloud account
            required. TV notes: see in-repo android-tv.md; Kodi users can install
            the thin Tri-Cass Kodi add-on for Chat + Vault.
          </Text>
        </View>
      </View>

      <OfflineGuidesPanel />

      <DesktopLauncherPanel />

      <PortableUsbPanel />

      <BrowsePanel />

      <GlowPanel title="Look & feel" accent="purple">
        <ThemePicker />
      </GlowPanel>

      <GlowPanel title="Local models + Agent">
        Chat talks to Ollama on this machine. Flip Agent on when you want Vault
        search, coding packs, Add-ons, or real files written (ask it to make a
        website). Desktop also includes Image Lab and a low-memory Games tab.
      </GlowPanel>

      <GlowPanel title="Small models (~1.5B)" accent="purple">
        Tiny local models are best at short scripts, starters, and edits — not
        large apps. Prefer: coding packs lookup → file tools → one change at a
        time. Import DevDocs / Stack Overflow excerpts via Packs → Import as
        coding pack.
        <CheckUpdatesButton url={AGENT_GUIDE_URL} label="Agent guide (optional)" />
        <CheckUpdatesButton
          url={CODING_PACKS_URL}
          label="Coding packs how-to (optional)"
        />
      </GlowPanel>

      <GlowPanel title="Optional website links" accent="purple">
        These open the public download site or GitHub when you want a newer
        build. Skip them entirely for day-to-day offline use — Companion does
        not phone home.
        <CheckUpdatesButton
          url={OS_UPDATE_URL}
          label="Website downloads (optional)"
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
        a side rail. Windows and Mac builds ship with the Tri-Cass logo as the app
        icon.
      </GlowPanel>

      <GlowPanel title="Version">
        0.12.5 · Spatial · Browse · Add-ons · Coding packs · Offline-first ·
        Desk · Agent{"\n"}
        Running on {Platform.OS}
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
        style={[styles.link, { color: colors.fgDim }]}
        onPress={() => Linking.openURL(`${OS_UPDATE_URL}#companion`)}
      >
        Website downloads (optional) →
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
