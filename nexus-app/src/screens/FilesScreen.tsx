import { useCallback, useState } from "react";
import {
  FlatList,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import {
  ensureFolder,
  loadDocs,
  saveDocs,
  writeTextFile,
  type DocItem,
} from "../files/store";
import { ContentFrame } from "../components/ContentFrame";
import { spacing, useTheme } from "../theme";

function formatSize(n?: number | null): string {
  if (n == null || Number.isNaN(n)) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilesScreen() {
  const { colors } = useTheme();
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [preview, setPreview] = useState<DocItem | null>(null);
  const [newFolder, setNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("website");

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
      kind: "file" as const,
      content: null,
    }));
    const merged = [...incoming, ...docs].slice(0, 200);
    await saveDocs(merged);
    setDocs(merged);
  }

  async function remove(id: string) {
    const next = docs.filter((d) => d.id !== id);
    await saveDocs(next);
    setDocs(next);
  }

  async function createFolder() {
    const name = folderName.trim();
    if (!name) return;
    await ensureFolder(name);
    setNewFolder(false);
    refresh();
  }

  async function seedWebsite() {
    await writeTextFile(
      "website/index.html",
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>NEXUS site</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <h1>NEXUS</h1>
  <p>Starter site — ask Agent in Chat to edit these files.</p>
</body>
</html>`,
    );
    await writeTextFile(
      "website/styles.css",
      `body{font-family:system-ui,sans-serif;background:#040804;color:#b6ffb6;padding:2rem}
h1{color:#39ff14}`,
    );
    refresh();
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ContentFrame>
        <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
          <Text style={{ color: colors.fgDim, lineHeight: 20 }}>
            Your Files library — import documents or let Agent create folders
            and text files (try a website/ project).
          </Text>
          <View style={styles.actions}>
            <Pressable
              style={[
                styles.btn,
                {
                  borderColor: colors.accent,
                  backgroundColor: colors.accentSoft,
                },
              ]}
              onPress={() => void importDoc()}
            >
              <Text style={{ color: colors.accent, fontWeight: "600" }}>
                Import
              </Text>
            </Pressable>
            <Pressable
              style={[styles.btn, { borderColor: colors.border }]}
              onPress={() => setNewFolder(true)}
            >
              <Text style={{ color: colors.fg }}>New folder</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, { borderColor: colors.purple }]}
              onPress={() => void seedWebsite()}
            >
              <Text style={{ color: colors.purple, fontWeight: "600" }}>
                Seed website/
              </Text>
            </Pressable>
          </View>
        </View>
        <FlatList
          data={docs}
          keyExtractor={(d) => d.id}
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={{ color: colors.fgDim, padding: spacing.lg }}>
              No documents yet. Import files, seed website/, or ask Agent to
              create them.
            </Text>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.bgElev,
                },
              ]}
            >
              <Pressable
                style={{ flex: 1 }}
                onPress={() => {
                  if (item.content) {
                    setPreview(item);
                    return;
                  }
                  void Linking.openURL(item.uri).catch(() => undefined);
                }}
              >
                <Text style={{ color: colors.fg, fontWeight: "600" }}>
                  {item.kind === "folder" ? "📁 " : "📄 "}
                  {item.name}
                </Text>
                <Text
                  style={{ color: colors.fgDim, marginTop: 4, fontSize: 12 }}
                >
                  {[item.kind === "folder" ? "folder" : item.mimeType, formatSize(item.size)]
                    .filter(Boolean)
                    .join(" · ") || "document"}
                  {item.content != null ? " · local text" : ""}
                </Text>
              </Pressable>
              <Pressable onPress={() => void remove(item.id)}>
                <Text style={{ color: colors.danger, fontSize: 12 }}>
                  Remove
                </Text>
              </Pressable>
            </View>
          )}
        />
      </ContentFrame>

      <Modal visible={!!preview} animationType="slide">
        <View style={[styles.modal, { backgroundColor: colors.bg }]}>
          <Text style={{ color: colors.accent, fontWeight: "800", fontSize: 16 }}>
            {preview?.name}
          </Text>
          <ScrollView style={{ flex: 1, marginTop: spacing.md }}>
            <Text
              style={{
                color: colors.fg,
                fontFamily: "monospace",
                lineHeight: 20,
              }}
            >
              {preview?.content}
            </Text>
          </ScrollView>
          <Pressable
            style={[
              styles.btn,
              {
                borderColor: colors.accent,
                alignSelf: "flex-start",
                marginTop: spacing.md,
              },
            ]}
            onPress={() => setPreview(null)}
          >
            <Text style={{ color: colors.accent }}>Close</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal visible={newFolder} animationType="fade" transparent>
        <View style={styles.scrim}>
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.bgBar, borderColor: colors.border },
            ]}
          >
            <Text style={{ color: colors.accent, fontWeight: "800" }}>
              New folder
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.fg,
                  borderColor: colors.border,
                  backgroundColor: colors.bgElev,
                },
              ]}
              value={folderName}
              onChangeText={setFolderName}
              placeholder="website"
              placeholderTextColor={colors.fgDim}
              autoCapitalize="none"
            />
            <View style={styles.actions}>
              <Pressable
                style={[
                  styles.btn,
                  {
                    borderColor: colors.accent,
                    backgroundColor: colors.accentSoft,
                  },
                ]}
                onPress={() => void createFolder()}
              >
                <Text style={{ color: colors.accent, fontWeight: "700" }}>
                  Create
                </Text>
              </Pressable>
              <Pressable
                style={[styles.btn, { borderColor: colors.border }]}
                onPress={() => setNewFolder(false)}
              >
                <Text style={{ color: colors.fg }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  btn: {
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  list: { padding: spacing.md },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  modal: { flex: 1, padding: spacing.lg, paddingTop: spacing.xl * 2 },
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: { borderWidth: 1, padding: spacing.lg, gap: spacing.md },
  input: { borderWidth: 1, padding: spacing.md },
});
