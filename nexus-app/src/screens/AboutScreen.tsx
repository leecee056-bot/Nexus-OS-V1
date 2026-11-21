import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";

export function AboutScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>About</Text>
      <Text style={styles.body}>
        NEXUS Companion (desktop / mobile) — Windows and iOS app shell for the
        NEXUS OS / Tri-Cass project family. Offline-first core; Network hooks
        can come later.
      </Text>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Not the bootable OS</Text>
        <Text style={styles.body}>
          Flashing a USB/Pi image or Cardputer firmware is still the primary
          path. Install this app when you want Chat, Vault, and Files without
          special boot media.
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Version</Text>
        <Text style={styles.body}>
          0.1.0 companion preview · Expo React Native · phrase-chat stub ·
          on-device Vault notes
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
  content: { padding: spacing.lg },
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
