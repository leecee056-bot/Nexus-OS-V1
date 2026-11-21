import { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  loadNotes,
  saveNotes,
  searchNotes,
  type VaultNote,
} from "../vault/store";
import { ContentFrame } from "../components/ContentFrame";
import { useCompanionLayout } from "../layout";
import { spacing, useTheme } from "../theme";

export function VaultScreen() {
  const { isTablet } = useCompanionLayout();
  const { colors } = useTheme();
  const [notes, setNotes] = useState<VaultNote[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<VaultNote | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const refresh = useCallback(() => {
    void loadNotes().then(setNotes);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const visible = searchNotes(notes, query);

  function openNew() {
    setEditing({
      id: `note-${Date.now()}`,
      title: "",
      body: "",
      updatedAt: Date.now(),
    });
    setTitle("");
    setBody("");
  }

  function openEdit(n: VaultNote) {
    setEditing(n);
    setTitle(n.title);
    setBody(n.body);
  }

  async function persist() {
    if (!editing) return;
    const next: VaultNote = {
      ...editing,
      title: title.trim() || "Untitled",
      body: body.trim(),
      updatedAt: Date.now(),
    };
    const others = notes.filter((n) => n.id !== next.id);
    const updated = [next, ...others].sort((a, b) => b.updatedAt - a.updatedAt);
    await saveNotes(updated);
    setNotes(updated);
    setEditing(null);
  }

  async function remove() {
    if (!editing) return;
    const updated = notes.filter((n) => n.id !== editing.id);
    await saveNotes(updated);
    setNotes(updated);
    setEditing(null);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ContentFrame>
        <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
          <TextInput
            style={[
              styles.search,
              {
                color: colors.fg,
                borderColor: colors.border,
                backgroundColor: colors.bgElev,
              },
            ]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search notes…"
            placeholderTextColor={colors.fgDim}
          />
          <Pressable
            style={[styles.btn, { borderColor: colors.border }]}
            onPress={openNew}
          >
            <Text style={{ color: colors.fg }}>New</Text>
          </Pressable>
        </View>
        <FlatList
          data={visible}
          keyExtractor={(n) => n.id}
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          numColumns={isTablet ? 2 : 1}
          key={isTablet ? "vault-tab" : "vault-phone"}
          columnWrapperStyle={isTablet ? styles.row : undefined}
          ListEmptyComponent={
            <Text style={{ color: colors.fgDim, padding: spacing.lg }}>
              No notes match. Add one with New.
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
              onPress={() => openEdit(item)}
            >
              <Text
                style={{
                  color: colors.accent,
                  fontWeight: "600",
                  marginBottom: 4,
                }}
              >
                {item.title}
              </Text>
              <Text style={{ color: colors.fg, lineHeight: 20 }} numberOfLines={3}>
                {item.body}
              </Text>
            </Pressable>
          )}
        />
      </ContentFrame>

      <Modal visible={!!editing} animationType="slide">
        <View
          style={[
            styles.modal,
            isTablet && styles.modalWide,
            { backgroundColor: colors.bg },
          ]}
        >
          <Text
            style={{
              color: colors.accent,
              fontSize: 18,
              marginBottom: spacing.md,
            }}
          >
            Vault note
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
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={colors.fgDim}
          />
          <TextInput
            style={[
              styles.input,
              styles.bodyInput,
              {
                color: colors.fg,
                borderColor: colors.border,
                backgroundColor: colors.bgElev,
              },
            ]}
            value={body}
            onChangeText={setBody}
            placeholder="Plain text body…"
            placeholderTextColor={colors.fgDim}
            multiline
            textAlignVertical="top"
          />
          <View style={styles.modalRow}>
            <Pressable
              style={[styles.btn, { borderColor: colors.border }]}
              onPress={() => setEditing(null)}
            >
              <Text style={{ color: colors.fg }}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, { borderColor: colors.danger }]}
              onPress={() => void remove()}
            >
              <Text style={{ color: colors.danger }}>Delete</Text>
            </Pressable>
            <Pressable
              style={[
                styles.btn,
                {
                  borderColor: colors.accent,
                  backgroundColor: colors.accentSoft,
                },
              ]}
              onPress={() => void persist()}
            >
              <Text style={{ color: colors.accent, fontWeight: "600" }}>
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  search: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  list: { padding: spacing.md },
  row: { gap: spacing.sm },
  card: {
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flex: 1,
  },
  cardHalf: { minWidth: "48%" },
  btn: {
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  modal: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl * 2,
  },
  modalWide: {
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  input: {
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  bodyInput: { flex: 1, minHeight: 180 },
  modalRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
});
