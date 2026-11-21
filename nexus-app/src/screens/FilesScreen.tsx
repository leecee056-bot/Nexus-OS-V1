import { useCallback, useState } from "react";
import {
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import { loadDocs, saveDocs, type DocItem } from "../files/store";
import { colors, spacing } from "../theme";

function formatSize(n?: number | null): string {
  if (n == null || Number.isNaN(n)) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilesScreen() {
  const [docs, setDocs] = useState<DocItem[]>([]);

  const refresh = useCallback(() => {
    void loadDocs().then(setDocs);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  async function importDoc() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: true,
    });
    if (result.canceled) return;
    const incoming: DocItem[] = result.assets.map((a) => ({
      id: `${Date.now()}-${a.name}`,
      name: a.name,
      uri: a.uri,
      size: a.size ?? null,
      mimeType: a.mimeType ?? null,
      addedAt: Date.now(),
    }));
    const merged = [...incoming, ...docs].slice(0, 100);
    await saveDocs(merged);
    setDocs(merged);
  }

  async function remove(id: string) {
    const next = docs.filter((d) => d.id !== id);
    await saveDocs(next);
    setDocs(next);
  }

  return (
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <Text style={styles.hint}>
          Import documents to browse offline. v1 keeps a local list (not a full
          OS file manager).
        </Text>
        <Pressable style={styles.btn} onPress={() => void importDoc()}>
          <Text style={styles.btnText}>Import</Text>
        </Pressable>
      </View>
      <FlatList
        data={docs}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No documents yet. Tap Import to pick files from this device.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable
              style={{ flex: 1 }}
              onPress={() => {
                void Linking.openURL(item.uri).catch(() => undefined);
              }}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {[item.mimeType, formatSize(item.size)]
                  .filter(Boolean)
                  .join(" · ") || "document"}
              </Text>
            </Pressable>
            <Pressable onPress={() => void remove(item.id)}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  toolbar: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  hint: { color: colors.fgDim, lineHeight: 20 },
  btn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  btnText: { color: colors.accent, fontWeight: "600" },
  list: { padding: spacing.md },
  empty: { color: colors.fgDim, padding: spacing.lg },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElev,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  name: { color: colors.fg, fontWeight: "600" },
  meta: { color: colors.fgDim, marginTop: 4, fontSize: 12 },
  remove: { color: colors.danger, fontSize: 12 },
});
