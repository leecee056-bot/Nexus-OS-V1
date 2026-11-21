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
import { colors, spacing } from "../theme";

export function VaultScreen() {
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
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Search notes…"
          placeholderTextColor={colors.fgDim}
        />
        <Pressable style={styles.btn} onPress={openNew}>
          <Text style={styles.btnText}>New</Text>
        </Pressable>
      </View>
      <FlatList
        data={visible}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No notes match. Add one with New.</Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => openEdit(item)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardBody} numberOfLines={3}>
              {item.body}
            </Text>
          </Pressable>
        )}
      />

      <Modal visible={!!editing} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Vault note</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={colors.fgDim}
          />
          <TextInput
            style={[styles.input, styles.bodyInput]}
            value={body}
            onChangeText={setBody}
            placeholder="Plain text body…"
            placeholderTextColor={colors.fgDim}
            multiline
            textAlignVertical="top"
          />
          <View style={styles.modalRow}>
            <Pressable style={styles.btn} onPress={() => setEditing(null)}>
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.btnDanger} onPress={() => void remove()}>
              <Text style={styles.btnDangerText}>Delete</Text>
            </Pressable>
            <Pressable style={styles.btnPrimary} onPress={() => void persist()}>
              <Text style={styles.btnPrimaryText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  toolbar: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  search: {
    flex: 1,
    color: colors.fg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  list: { padding: spacing.md },
  empty: { color: colors.fgDim, padding: spacing.lg },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElev,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: { color: colors.accent, fontWeight: "600", marginBottom: 4 },
  cardBody: { color: colors.fg, lineHeight: 20 },
  btn: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  btnText: { color: colors.fg },
  btnPrimary: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  btnPrimaryText: { color: colors.accent, fontWeight: "600" },
  btnDanger: {
    borderWidth: 1,
    borderColor: colors.danger,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  btnDangerText: { color: colors.danger },
  modal: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    paddingTop: spacing.xl * 2,
  },
  modalTitle: { color: colors.accent, fontSize: 18, marginBottom: spacing.md },
  input: {
    color: colors.fg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  bodyInput: { flex: 1, minHeight: 180 },
  modalRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
});
