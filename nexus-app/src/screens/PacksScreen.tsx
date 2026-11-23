import { useCallback, useMemo, useState } from "react";
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
import { PACK_SOURCES, type PackSource } from "../packs/catalog";
import { loadNotes, saveNotes, type VaultNote } from "../vault/store";
import { CheckUpdatesButton } from "../components/CheckUpdatesButton";
import { ContentFrame } from "../components/ContentFrame";
import { CODING_PACKS_URL, OS_UPDATE_URL } from "../updates/links";
import { useCompanionLayout } from "../layout";
import { spacing, useTheme } from "../theme";

async function readTextUri(uri: string): Promise<string> {
  try {
    return await readAsStringAsync(uri);
  } catch {
    return "";
  }
}

type ListRow =
  | { type: "header"; id: string; title: string; blurb?: string }
  | { type: "pack"; id: string; pack: PackSource };

export function PacksScreen() {
  const { isTablet } = useCompanionLayout();
  const { colors } = useTheme();
  const [imported, setImported] = useState(0);
  const [codingImported, setCodingImported] = useState(0);

  useFocusEffect(
    useCallback(() => {
      void loadNotes().then((n) => {
        setImported(n.filter((x) => x.id.startsWith("pack-")).length);
        setCodingImported(
          n.filter((x) => x.id.startsWith("pack-coding-")).length,
        );
      });
    }, []),
  );

  async function importPlainText(asCoding: boolean) {
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
      const clipped =
        body.length > 120_000 ? body.slice(0, 120_000) + "\n…" : body;
      const prefix = asCoding ? "pack-coding-" : "pack-";
      added.push({
        id: `${prefix}${Date.now()}-${asset.name}`,
        title: (asCoding ? "[coding] " : "") + asset.name.replace(/\.(txt|md)$/i, ""),
        body: clipped,
        updatedAt: Date.now(),
      });
    }
    if (added.length === 0) return;
    const next = [...added, ...notes].slice(0, 80);
    await saveNotes(next);
    setImported(next.filter((x) => x.id.startsWith("pack-")).length);
    setCodingImported(
      next.filter((x) => x.id.startsWith("pack-coding-")).length,
    );
    Alert.alert(
      asCoding ? "Coding pack imported" : "Imported to Vault",
      `${added.length} file(s) saved on-device. Open Vault to search, or ask Agent (coding packs use search_coding_packs).`,
    );
  }

  const rows: ListRow[] = useMemo(() => {
    const coding = PACK_SOURCES.filter((p) => p.kind === "coding");
    const other = PACK_SOURCES.filter((p) => p.kind !== "coding");
    const out: ListRow[] = [
      {
        type: "header",
        id: "h-coding",
        title: "Coding packs (optional)",
        blurb:
          "DevDocs / Stack Overflow–class ZIMs via Kiwix. We don’t host dumps — download, extract useful .txt/.md, Import as coding pack.",
      },
      ...coding.map((pack) => ({ type: "pack" as const, id: pack.id, pack })),
      {
        type: "header",
        id: "h-general",
        title: "General knowledge sources",
        blurb: "Wikipedia, books, and the full packs guide.",
      },
      ...other.map((pack) => ({ type: "pack" as const, id: pack.id, pack })),
    ];
    return out;
  }, []);

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
          <Text
            style={{
              color: colors.fgDim,
              marginTop: spacing.sm,
              lineHeight: 21,
            }}
          >
            Expand offline knowledge without us hosting huge dumps. Use coding
            packs with a small local model: lookup → file tools → short edits.
            Chat and Vault work without any packs.
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
          onPress={() => void importPlainText(false)}
        >
          <Text style={{ color: colors.accent, fontWeight: "700" }}>
            Import .txt / .md into Vault
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.secondary,
            {
              borderColor: colors.border,
              backgroundColor: colors.bgElev,
            },
          ]}
          onPress={() => void importPlainText(true)}
        >
          <Text style={{ color: colors.fg, fontWeight: "700" }}>
            Import as coding pack
          </Text>
        </Pressable>
        <Text
          style={{ color: colors.fgDim, fontSize: 12, marginTop: spacing.sm }}
        >
          {imported > 0
            ? `${imported} pack note(s) in Vault` +
              (codingImported ? ` · ${codingImported} coding` : "")
            : "No pack files imported yet"}
        </Text>
        <CheckUpdatesButton
          url={CODING_PACKS_URL}
          label="Coding packs guide (optional)"
        />
        <CheckUpdatesButton
          url={OS_UPDATE_URL}
          label="Website downloads (optional)"
        />

        <FlatList
          data={rows}
          keyExtractor={(row) => row.id}
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            if (item.type === "header") {
              return (
                <View style={{ marginBottom: spacing.sm, marginTop: spacing.md }}>
                  <Text
                    style={{
                      color: colors.fg,
                      fontWeight: "800",
                      fontSize: 16,
                    }}
                  >
                    {item.title}
                  </Text>
                  {item.blurb ? (
                    <Text
                      style={{
                        color: colors.fgDim,
                        marginTop: 4,
                        lineHeight: 18,
                        fontSize: 13,
                      }}
                    >
                      {item.blurb}
                    </Text>
                  ) : null}
                </View>
              );
            }
            const pack = item.pack;
            return (
              <Pressable
                style={[
                  styles.card,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.bgElev,
                  },
                ]}
                onPress={() => void Linking.openURL(pack.url)}
              >
                <Text style={{ color: colors.accent, fontWeight: "700" }}>
                  {pack.kind === "coding" ? "⟨code⟩ " : ""}
                  {pack.title}
                </Text>
                <Text style={{ color: colors.fg, marginTop: 6, lineHeight: 20 }}>
                  {pack.blurb}
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
                  url={pack.url}
                  label="Source site (optional)"
                  compact
                />
              </Pressable>
            );
          }}
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
  secondary: {
    marginTop: spacing.sm,
    borderWidth: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  list: { paddingVertical: spacing.lg, paddingBottom: spacing.xl * 2 },
  card: {
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
});
