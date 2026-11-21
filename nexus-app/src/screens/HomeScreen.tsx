import { useEffect, useState } from "react";
import {
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BrowsePanel } from "../components/BrowsePanel";
import { GetStartedPanel } from "../components/GetStartedPanel";
import { GlowPanel } from "../components/GlowPanel";
import { OfflineGuidesPanel } from "../components/OfflineGuidesPanel";
import { PortableUsbPanel } from "../components/PortableUsbPanel";
import { ShellModePicker } from "../components/ShellModePicker";
import { ScreenShell } from "../components/ScreenShell";
import { TerminalDashboard } from "../components/TerminalDashboard";
import { ThemePicker } from "../components/ThemePicker";
import { loadShellMode, type ShellMode } from "../layout/shellMode";
import { useCompanionLayout } from "../layout";
import { spacing, useTheme } from "../theme";
import { OS_UPDATE_URL } from "../updates/links";
import { openBrowse, isDesktopBrowseAvailable } from "../browse/api";

export function HomeScreen() {
  const { isTablet, heroMascot } = useCompanionLayout();
  const { colors, themeId } = useTheme();
  const navigation = useNavigation<{ navigate: (n: string) => void }>();
  const showThemes =
    Platform.OS === "web" || isTablet || Platform.OS === "android";
  const [shell, setShell] = useState<ShellMode>("classic");

  useEffect(() => {
    void loadShellMode().then(setShell);
  }, []);

  const useDesk =
    Platform.OS === "web" &&
    (shell === "desk" || themeId === "terminal" || colors.terminalShell);

  if (useDesk) {
    return (
      <ScreenShell rain contentStyle={styles.terminalPad}>
        <ShellModePicker onChange={setShell} />
        <TerminalDashboard />
        <BrowsePanel />
        <GetStartedPanel />
        <OfflineGuidesPanel />
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
            Your local AI computer — chat offline, keep a Vault, build a small
            website, and carry it on USB when you want.
          </Text>
        </View>
      </View>

      <View style={styles.ctaRow}>
        <Pressable
          style={[
            styles.btn,
            {
              backgroundColor: colors.accentSoft,
              borderColor: colors.accent,
              borderRadius: colors.radius || 0,
            },
          ]}
          onPress={() => navigation.navigate("Chat")}
        >
          <Text style={[styles.btnText, { color: colors.accent }]}>
            Open Chat
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.btnGhost,
            {
              borderColor: colors.purple,
              backgroundColor: colors.purpleSoft,
              borderRadius: colors.radius || 0,
            },
          ]}
          onPress={() => navigation.navigate("Files")}
        >
          <Text style={[styles.btnGhostText, { color: colors.purple }]}>
            Files
          </Text>
        </Pressable>
        {Platform.OS === "web" ? (
          <Pressable
            style={[
              styles.btnGhost,
              {
                borderColor: colors.border,
                backgroundColor: colors.accentSoft,
                borderRadius: colors.radius || 0,
              },
            ]}
            onPress={() => {
              if (isDesktopBrowseAvailable()) {
                void openBrowse("https://duckduckgo.com", { themeId });
              }
            }}
          >
            <Text style={[styles.btnGhostText, { color: colors.accent }]}>
              Browse
            </Text>
          </Pressable>
        ) : null}
      </View>

      <GetStartedPanel />
      <OfflineGuidesPanel />
      <BrowsePanel />

      {Platform.OS === "web" ? (
        <GlowPanel title="Layout" accent="purple">
          <ShellModePicker onChange={setShell} />
        </GlowPanel>
      ) : null}

      <PortableUsbPanel />

      {showThemes ? (
        <GlowPanel title="Themes">
          <ThemePicker />
        </GlowPanel>
      ) : null}

      <GlowPanel title="At a glance" accent={showThemes ? "purple" : "green"}>
        <Text style={[styles.body, { color: colors.fg }]}>
          Fully local once installed · Chat / Agent / Vault / Files need no
          cloud · Image Lab & Games on desktop · USB kit carries your data ·
          Website is optional (downloads only)
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
          onPress={() => Linking.openURL(`${OS_UPDATE_URL}#companion`)}
        >
          <Text style={[styles.btnText, { color: colors.accent }]}>
            Website downloads (optional)
          </Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  terminalPad: { maxWidth: 1200 },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroRowTablet: { gap: spacing.xl },
  heroText: { flex: 1 },
  brand: {
    fontWeight: "900",
    letterSpacing: 3,
    fontSize: 22,
    textShadowRadius: 12,
  },
  brandLg: { fontSize: 28 },
  title: { fontWeight: "800", fontSize: 18, marginTop: 2 },
  lede: { marginTop: spacing.sm, lineHeight: 22, fontSize: 14 },
  body: { lineHeight: 22 },
  ctaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btn: {
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  btnText: { fontWeight: "800" },
  btnGhost: {
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  btnGhostText: { fontWeight: "700" },
});
