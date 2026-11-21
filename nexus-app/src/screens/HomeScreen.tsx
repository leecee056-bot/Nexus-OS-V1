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
import { PortableUsbPanel } from "../components/PortableUsbPanel";
import { TerminalDashboard } from "../components/TerminalDashboard";
import { ThemePicker } from "../components/ThemePicker";
import { useCompanionLayout } from "../layout";
import { spacing, useTheme } from "../theme";

export function HomeScreen() {
  const { isTablet, heroMascot } = useCompanionLayout();
  const { colors, themeId } = useTheme();
  const showThemes = Platform.OS === "web" || isTablet || Platform.OS === "android";

  if (themeId === "terminal" || colors.terminalShell) {
    return (
      <ScreenShell rain contentStyle={styles.terminalPad}>
        <TerminalDashboard />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell rain>
      <View style={[styles.heroRow, isTablet && styles.heroRowTablet]}>
        <Image
          source={require("../../assets/brand/nexus-rabbit-wizard.png")}
          style={{ width: heroMascot.w, height: heroMascot.h }}
          resizeMode="contain"
        />
        <View style={styles.heroText}>
          <Text
            style={[
              styles.brand,
              isTablet && styles.brandLg,
              {
                color: colors.accent,
                textShadowColor: colors.phosphor,
              },
            ]}
          >
            NEXUS OS
          </Text>
          <Text style={[styles.title, { color: colors.purple }]}>
            Companion
          </Text>
          <Text style={[styles.lede, { color: colors.fgDim }]}>
            Local AI Chat, Vault, Packs, and Files — crafted for phone, tablet,
            and desktop with the NEXUS mark on every surface.
          </Text>
        </View>
      </View>

      <PortableUsbPanel />

      <GlowPanel title="Local AI + Agent">
        Open Chat → pick a model → switch Agent on. It can search your Vault /
        packs, use Add-ons, and create files (even a website/ folder) while you
        watch short status lines.
      </GlowPanel>

      {showThemes ? (
        <GlowPanel title="Look & feel" accent="purple">
          <ThemePicker />
        </GlowPanel>
      ) : null}

      <GlowPanel title="What’s inside" accent={showThemes ? "green" : "purple"}>
        <Text style={[styles.body, { color: colors.fg }]}>
          • NEXUS logo + rabbit-wizard presence{"\n"}
          • Chat / Agent — local models + Vault / Plugins / Files{"\n"}
          • Add-ons library — toggle the tools Agent may use{"\n"}
          • Themes — Basic, Matrix, Lumen, Terminal{"\n"}
          • Image Lab (desktop) · Check for updates{"\n"}
          • Games (desktop) — Chess + tiny 2D extras{"\n"}
          • USB portable kit — vault, chats, files on the stick{"\n"}
          • Vault · Packs · Files — offline-first{"\n"}
          • Phone tabs · tablet rail · desktop icon
        </Text>
      </GlowPanel>

      <View style={styles.actions}>
        <Pressable
          style={[
            styles.btn,
            {
              backgroundColor: colors.accentSoft,
              borderColor: colors.accent,
            },
          ]}
          onPress={() =>
            Linking.openURL("https://nexus-os.apps.grok.bot/download#companion")
          }
        >
          <Text style={[styles.btnText, { color: colors.accent }]}>
            Get downloads
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.btnGhost,
            {
              borderColor: colors.purple,
              backgroundColor: colors.purpleSoft,
            },
          ]}
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
  terminalPad: { maxWidth: 1200 },
  heroRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  heroRowTablet: { gap: spacing.xl },
  heroText: { flex: 1, minWidth: 160 },
  brand: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 3,
    textShadowRadius: 12,
  },
  brandLg: { fontSize: 34, letterSpacing: 5 },
  title: {
    fontSize: 18,
    marginTop: 2,
    marginBottom: spacing.sm,
    fontWeight: "700",
  },
  lede: { lineHeight: 22 },
  body: { lineHeight: 22 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  btn: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  btnText: { fontWeight: "700" },
  btnGhost: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  btnGhostText: { color: "#d4b8ff", fontWeight: "700" },
});
