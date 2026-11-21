import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MatrixRain } from "../components/MatrixRain";
import { colors, spacing } from "../theme";

export function HomeScreen() {
  return (
    <View style={styles.root}>
      <MatrixRain dimmed />
      <LinearGradient
        colors={["rgba(4,8,4,0.55)", "rgba(4,8,4,0.92)", "#040804"]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroRow}>
          <Image
            source={require("../../assets/brand/nexus-rabbit-wizard.png")}
            style={styles.mascot}
            resizeMode="contain"
          />
          <View style={styles.heroText}>
            <Text style={styles.brand}>NEXUS OS</Text>
            <Text style={styles.title}>Companion</Text>
            <Text style={styles.lede}>
              Offline-first Chat, Vault, and Files — without flashing a USB
              stick. {Platform.OS === "android" ? "Built for Android APK sideload." : "Also on Windows / iOS."}
            </Text>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Secondary target</Text>
          <Text style={styles.body}>
            The main project remains the bootable USB / Pi images and Cardputer /
            Pocket firmware. This app is the easier path: same vibe, windowed UI,
            optional knowledge packs on Android.
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>What is in v0.2</Text>
          <Text style={styles.body}>
            • Matrix boot splash with the rabbit-wizard logo{"\n"}
            • Chat — lightweight offline phrase stub{"\n"}
            • Vault — searchable on-device notes{"\n"}
            • Packs — open Kiwix / Gutenberg, import .txt/.md{"\n"}
            • Files — import documents from the device
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
        {Platform.OS === "android" ? (
          <Text
            style={styles.link}
            onPress={() =>
              Linking.openURL(
                "https://nexus-os.apps.grok.bot/guides/android-apk.md",
              )
            }
          >
            Install APK / sideload notes →
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  heroRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  mascot: { width: 110, height: 170 },
  heroText: { flex: 1 },
  brand: {
    color: colors.accent,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 3,
    textShadowColor: "rgba(57,255,20,0.4)",
    textShadowRadius: 10,
  },
  title: {
    color: colors.purple,
    fontSize: 18,
    marginTop: 2,
    marginBottom: spacing.sm,
    fontWeight: "700",
  },
  lede: { color: colors.fgDim, lineHeight: 21 },
  panel: {
    backgroundColor: "rgba(10,18,10,0.88)",
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  panelTitle: {
    color: colors.accent,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  body: { color: colors.fg, lineHeight: 22 },
  link: {
    color: colors.accent,
    marginTop: spacing.sm,
    textDecorationLine: "underline",
  },
});
