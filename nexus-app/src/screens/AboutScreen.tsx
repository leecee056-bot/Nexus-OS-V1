import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, spacing } from "../theme";

export function AboutScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Image
        source={require("../../assets/brand/nexus-rabbit-wizard.png")}
        style={styles.mascot}
        resizeMode="contain"
      />
      <Text style={styles.title}>About</Text>
      <Text style={styles.body}>
        NEXUS Companion — Windows, iOS, and Android app shell for the NEXUS OS /
        Tri-Cass family. Offline-first core; Network hooks can come later.
      </Text>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Not the bootable OS</Text>
        <Text style={styles.body}>
          Flashing a USB/Pi image or Cardputer firmware is still the primary
          path. Install this app when you want Chat, Vault, Packs, and Files
          without special boot media.
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Android APK</Text>
        <Text style={styles.body}>
          We ship sideload APKs (not Play Store yet). Build with EAS preview
          profile or assemble locally — see README / android-apk guide. Host on
          GitHub Releases and link from the site Download page.
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Version</Text>
        <Text style={styles.body}>
          0.2.0 companion · Expo · matrix boot · phrase-chat stub · Vault + Packs
          {"\n"}Running on {Platform.OS}
        </Text>
      </View>

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
        onPress={() => Linking.openURL("https://nexus-os.apps.grok.bot/download")}
      >
        Download bootable images →
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, alignItems: "stretch" },
  mascot: {
    width: 120,
    height: 190,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  title: { color: colors.accent, fontSize: 22, marginBottom: spacing.md },
  body: { color: colors.fg, lineHeight: 22, marginBottom: spacing.md },
  panel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElev,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  panelTitle: {
    color: colors.accent,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  link: {
    color: colors.accent,
    marginTop: spacing.sm,
    textDecorationLine: "underline",
  },
});
