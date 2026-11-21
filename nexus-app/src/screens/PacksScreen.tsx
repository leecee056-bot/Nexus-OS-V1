import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import { readAsStringAsync } from "expo-file-system/legacy";
import { PACK_SOURCES } from "../packs/catalog";
import { loadNotes, saveNotes, type VaultNote } from "../vault/store";
import { CheckUpdatesButton } from "../components/CheckUpdatesButton";
import { ContentFrame } from "../components/ContentFrame";
import { OS_UPDATE_URL } from "../updates/links";
import { useCompanionLayout } from "../layout";
import { spacing, useTheme } from "../theme";

async function readTextUri(uri: string): Promise<string> {
  try {
    return await readAsStringAsync(uri);
  } catch {
    // web / some content URIs may fail — fall back empty
    return "";
  }
}

export function PacksScreen() {
  const { isTablet } = useCompanionLayout();
  const { colors } = useTheme();
  const [imported, setImported] = useState(0);

  useFocusEffect(
    useCallback(() => {
      void loadNotes().then((n) =>
        setImported(n.filter((x) => x.id.startsWith("pack-")).length),
      );
    }, []),
  );

  async function importPlainText() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["text/plain", "text/markdown", "text/*"],
      copyToCacheDirectory: true,
      multiple: true,
    });
    if (result.canceled) return;

    const notes = await loadNotes();
    const added: VaultNote[] = [];
    for (const asset of result.assets) {
      const body = await readTextUri(asset.uri);
      if (!body.trim()) {
        Alert.alert(
          "Could not read file",
          `${asset.name} — try a plain .txt / .md from Downloads.`,
        );
        continue;
      }
      // keep Vault light on phones
      const clipped = body.length > 120_000 ? body.slice(0, 120_000) + "\n…" : body;
      added.push({
        id: `pack-${Date.now()}-${asset.name}`,
        title: asset.name.replace(/\.(txt|md)$/i, ""),
        body: clipped,
        updatedAt: Date.now(),
      });
    }
    if (added.length === 0) return;
    const next = [...added, ...notes].slice(0, 80);
    await saveNotes(next);
    setImported(next.filter((x) => x.id.startsWith("pack-")).length);
    Alert.alert(
      "Imported to Vault",
      `${added.length} file(s) saved on-device. Open Vault to search.`,
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ContentFrame>
        <View style={[styles.hero, { borderBottomColor: colors.border }]}>
          <Text style={[styles.kicker, { color: colors.purple }]}>
            Optional
          </Text>
          <Text
            style={[
              styles.title,
              isTablet && styles.titleLg,
              { color: colors.accent },
            ]}
          >
            Knowledge Packs
          </Text>
          <Text style={{ color: colors.fgDim, marginTop: spacing.sm, lineHeight: 21 }}>
            Expand offline knowledge without us hosting huge dumps. Browse
            public sources, save plain text on this device, then Import into
            Vault. Completely optional — Chat and Vault work without packs.
          </Text>
          <Text
            style={[
              styles.badge,
              { color: colors.accent, borderColor: colors.border },
            ]}
          >
            {Platform.OS === "android"
              ? "Phone + tablet · local storage friendly"
              : "Import works on Windows, iOS, and Android"}
          </Text>
        </View>

        <Pressable
          style={[
            styles.primary,
            {
              backgroundColor: colors.accentSoft,
              borderColor: colors.accent,
            },
          ]}
          onPress={() => void importPlainText()}
        >
          <Text style={{ color: colors.accent, fontWeight: "700" }}>
            Import .txt / .md into Vault
          </Text>
        </Pressable>
        <Text style={{ color: colors.fgDim, fontSize: 12, marginTop: spacing.sm }}>
          {imported > 0
            ? `${imported} pack note(s) already in Vault`
            : "No pack files imported yet"}
        </Text>
        <CheckUpdatesButton
          url={OS_UPDATE_URL}
          label="Website downloads (optional)"
        />

        <FlatList
          data={PACK_SOURCES}
          keyExtractor={(p) => p.id}
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          numColumns={isTablet ? 2 : 1}
          key={isTablet ? "tab" : "phone"}
          columnWrapperStyle={isTablet ? styles.row : undefined}
          ListHeaderComponent={
            <Text
              style={{
                color: colors.fg,
                fontWeight: "700",
                marginBottom: spacing.sm,
                width: "100%",
              }}
            >
              Public sources
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.card,
                isTablet && styles.cardHalf,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.bgElev,
                },
              ]}
              onPress={() => void Linking.openURL(item.url)}
            >
              <Text style={{ color: colors.accent, fontWeight: "700" }}>
                {item.title}
              </Text>
              <Text style={{ color: colors.fg, marginTop: 6, lineHeight: 20 }}>
                {item.blurb}
              </Text>
              <Text
                style={{
                  color: colors.purple,
                  marginTop: spacing.sm,
                  fontSize: 12,
                }}
              >
                Open →
              </Text>
              <CheckUpdatesButton
                url={item.url}
                label="Source site (optional)"
                compact
              />
            </Pressable>
          )}
        />
      </ContentFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
  },
  titleLg: { fontSize: 30 },
  badge: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontSize: 11,
  },
  primary: {
    marginTop: spacing.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  list: { paddingVertical: spacing.lg, paddingBottom: spacing.xl * 2 },
  row: { gap: spacing.sm },
  card: {
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flex: 1,
  },
  cardHalf: { minWidth: "48%" },
});
