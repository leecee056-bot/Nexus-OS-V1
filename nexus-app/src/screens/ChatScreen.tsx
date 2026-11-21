import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { companionReply } from "../chat/tinychat";
import { colors, spacing } from "../theme";

type Msg = { id: string; role: "you" | "nexus"; text: string };

export function ChatScreen() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "0",
      role: "nexus",
      text: "Offline stub ready. Ask about vault, boot, pocket, or model.",
    },
  ]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const you: Msg = { id: String(Date.now()), role: "you", text };
    const reply: Msg = {
      id: String(Date.now() + 1),
      role: "nexus",
      text: companionReply(text),
    };
    setMsgs((m) => [...m, you, reply]);
    setInput("");
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={88}
    >
      <Text style={styles.hint}>
        Local phrase chat (stub) — not a neural model in v1
      </Text>
      <FlatList
        data={msgs}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === "you" ? styles.you : styles.nexus,
            ]}
          >
            <Text style={styles.role}>
              {item.role === "you" ? "You" : "NEXUS"}
            </Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Short question…"
          placeholderTextColor={colors.fgDim}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Pressable style={styles.btn} onPress={send}>
          <Text style={styles.btnText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hint: {
    color: colors.fgDim,
    fontSize: 12,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  list: { padding: spacing.lg, paddingBottom: spacing.md },
  bubble: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    maxWidth: "92%",
  },
  you: { alignSelf: "flex-end", backgroundColor: colors.accentSoft },
  nexus: { alignSelf: "flex-start", backgroundColor: colors.bgElev },
  role: { color: colors.accent, fontSize: 11, marginBottom: 4 },
  text: { color: colors.fg, lineHeight: 20 },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgBar,
  },
  input: {
    flex: 1,
    color: colors.fg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? spacing.md : spacing.sm,
  },
  btn: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  btnText: { color: colors.accent, fontWeight: "600" },
});
