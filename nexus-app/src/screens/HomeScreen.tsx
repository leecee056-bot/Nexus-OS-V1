import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";

export function HomeScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.brand}>NEXUS</Text>
      <Text style={styles.title}>Companion App</Text>
      <Text style={styles.lede}>
        A normal Windows / iOS app for trying the offline-first idea — Chat,
        Knowledge Vault, and simple document browsing — without flashing a USB
        stick or using ESP32 hardware.
      </Text>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Secondary target</Text>
        <Text style={styles.body}>
          The main project remains the bootable USB / Pi images and Cardputer /
          Pocket firmware. This companion is the easier path for a quick look at
          the same core features in a windowed interface.
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>What is in v1</Text>
        <Text style={styles.body}>
          • Chat — lightweight offline phrase stub (not a full local LLM yet){"\n"}
          • Vault — searchable notes stored on-device{"\n"}
          • Files — import and list documents{"\n"}
          • Dark matrix-style theme matching the project look
        </Text>
      </View>

      <Text
        style={styles.link}
        onPress={() => Linking.openURL("https://nexus-os.apps.grok.bot/")}
      >
        Product site →
      </Text>
      <Text
        style={styles.link}
        onPress={() =>
          Linking.openURL("https://nexus-os.apps.grok.bot/knowledge-packs")
        }
      >
        Optional Knowledge Packs →
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  brand: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    color: colors.fg,
    fontSize: 20,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  lede: { color: colors.fgDim, marginBottom: spacing.lg, lineHeight: 22 },
  panel: {
    backgroundColor: colors.bgElev,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  panelTitle: {
    color: colors.accent,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  body: { color: colors.fg, lineHeight: 22 },
  link: {
    color: colors.accent,
    marginTop: spacing.sm,
    textDecorationLine: "underline",
  },
});
