import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { companionReply } from "../chat/tinychat";
import {
  DEFAULT_MODEL_ID,
  findModel,
  RECOMMENDED_MODELS,
  type LocalModel,
} from "../chat/models";
import {
  chatCompletion,
  checkOllama,
  isModelInstalled,
  listLocalTags,
  OLLAMA_INSTALL_URL,
  pullModel,
  type ChatMessage,
} from "../chat/ollama";
import {
  DEFAULT_OLLAMA_HOST,
  loadOllamaHost,
  loadSelectedModelId,
  saveOllamaHost,
  saveSelectedModelId,
} from "../chat/settings";
import { ContentFrame } from "../components/ContentFrame";
import { useCompanionLayout } from "../layout";
import { colors, spacing } from "../theme";

type Msg = { id: string; role: "you" | "nexus"; text: string };

const SYSTEM_PROMPT =
  "You are NEXUS, a helpful offline assistant in the NEXUS Companion app. Be concise and practical.";

function formatPull(status: string, completed?: number, total?: number): string {
  if (total && completed != null && total > 0) {
    const pct = Math.min(100, Math.round((completed / total) * 100));
    return `${status} · ${pct}%`;
  }
  return status || "Working…";
}

export function ChatScreen() {
  const { isTablet } = useCompanionLayout();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hostEdit, setHostEdit] = useState(false);
  const [hostDraft, setHostDraft] = useState(DEFAULT_OLLAMA_HOST);
  const [host, setHost] = useState(DEFAULT_OLLAMA_HOST);
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [ollamaOk, setOllamaOk] = useState(false);
  const [ollamaVersion, setOllamaVersion] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [pullNote, setPullNote] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "0",
      role: "nexus",
      text: "Pick a local model above, download it once, then chat offline.",
    },
  ]);

  const model = useMemo(() => findModel(modelId), [modelId]);
  const installed = isModelInstalled(tags, model.ollama);

  const refresh = useCallback(async () => {
    const [savedModel, savedHost] = await Promise.all([
      loadSelectedModelId(),
      loadOllamaHost(),
    ]);
    setModelId(savedModel);
    setHost(savedHost);
    setHostDraft(savedHost);

    const status = await checkOllama(savedHost);
    if (status.ok) {
      setOllamaOk(true);
      setOllamaVersion(status.version);
      setStatusNote(null);
      const local = await listLocalTags(savedHost);
      setTags(local);
    } else {
      setOllamaOk(false);
      setOllamaVersion(undefined);
      setTags([]);
      setStatusNote(status.reason);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function selectModel(m: LocalModel) {
    setModelId(m.id);
    await saveSelectedModelId(m.id);
    setPickerOpen(false);
  }

  async function installModel(m: LocalModel) {
    if (!ollamaOk) {
      setStatusNote(
        "Install and start Ollama first, then tap Get model again.",
      );
      return;
    }
    setBusy(true);
    setPullNote(`Getting ${m.label}…`);
    const result = await pullModel(host, m.ollama, (p) => {
      setPullNote(formatPull(p.status, p.completed, p.total));
    });
    setBusy(false);
    if (!result.ok) {
      setPullNote(null);
      setStatusNote(result.error || "Download failed.");
      return;
    }
    setPullNote(null);
    await selectModel(m);
    await refresh();
    setMsgs((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        role: "nexus",
        text: `${m.label} is ready. Ask me anything — it runs locally.`,
      },
    ]);
  }

  async function saveHost() {
    await saveOllamaHost(hostDraft);
    setHostEdit(false);
    await refresh();
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    const you: Msg = { id: String(Date.now()), role: "you", text };
    setMsgs((m) => [...m, you]);
    setInput("");
    setBusy(true);

    if (!ollamaOk || !installed) {
      const fallback = companionReply(text);
      const note =
        !ollamaOk
          ? "\n\n(Local model offline — install Ollama + a model in the selector for real AI.)"
          : "\n\n(Selected model is not downloaded yet — tap Get model.)";
      setMsgs((m) => [
        ...m,
        {
          id: String(Date.now() + 1),
          role: "nexus",
          text: fallback + note,
        },
      ]);
      setBusy(false);
      return;
    }

    const history: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...msgs
        .filter((x) => x.id !== "0")
        .slice(-12)
        .map((x) => ({
          role: (x.role === "you" ? "user" : "assistant") as "user" | "assistant",
          content: x.text,
        })),
      { role: "user", content: text },
    ];

    const result = await chatCompletion(host, model.ollama, history);
    setMsgs((m) => [
      ...m,
      {
        id: String(Date.now() + 1),
        role: "nexus",
        text: result.ok ? result.text : result.error,
      },
    ]);
    setBusy(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={isTablet ? 24 : 88}
    >
      <ContentFrame>
        <View style={styles.toolbar}>
          <Pressable
            style={styles.modelBtn}
            onPress={() => setPickerOpen(true)}
          >
            <Text style={styles.modelLabel}>Model</Text>
            <Text style={styles.modelName} numberOfLines={1}>
              {model.label}
            </Text>
            <Text style={styles.modelMeta}>
              {ollamaOk
                ? installed
                  ? "Ready · local"
                  : "Not downloaded"
                : "Ollama offline"}
              {ollamaVersion ? ` · v${ollamaVersion}` : ""}
            </Text>
          </Pressable>
          {!installed && ollamaOk ? (
            <Pressable
              style={styles.getBtn}
              disabled={busy}
              onPress={() => void installModel(model)}
            >
              <Text style={styles.getBtnText}>Get model</Text>
            </Pressable>
          ) : null}
        </View>

        {pullNote ? (
          <View style={styles.banner}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.bannerText}>{pullNote}</Text>
          </View>
        ) : null}
        {statusNote && !ollamaOk ? (
          <View style={styles.bannerWarn}>
            <Text style={styles.bannerText}>{statusNote}</Text>
            <View style={styles.bannerRow}>
              <Pressable
                style={styles.linkBtn}
                onPress={() => void Linking.openURL(OLLAMA_INSTALL_URL)}
              >
                <Text style={styles.linkBtnText}>Install Ollama</Text>
              </Pressable>
              <Pressable
                style={styles.linkBtnGhost}
                onPress={() => setHostEdit(true)}
              >
                <Text style={styles.linkBtnGhostText}>Set host</Text>
              </Pressable>
              <Pressable style={styles.linkBtnGhost} onPress={() => void refresh()}>
                <Text style={styles.linkBtnGhostText}>Retry</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <FlatList
          data={msgs}
          keyExtractor={(m) => m.id}
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === "you" ? styles.you : styles.nexus,
                isTablet && styles.bubbleWide,
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
            placeholder={
              installed ? "Message your local model…" : "Message…"
            }
            placeholderTextColor={colors.fgDim}
            onSubmitEditing={() => void send()}
            returnKeyType="send"
            editable={!busy}
          />
          <Pressable
            style={[styles.btn, busy && styles.btnDisabled]}
            onPress={() => void send()}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <Text style={styles.btnText}>Send</Text>
            )}
          </Pressable>
        </View>
      </ContentFrame>

      <Modal visible={pickerOpen} animationType="slide" transparent>
        <View style={styles.modalScrim}>
          <View style={[styles.modalSheet, isTablet && styles.modalWide]}>
            <Text style={styles.modalTitle}>Local models</Text>
            <Text style={styles.modalLede}>
              Lightweight picks via Ollama. Download once, then chat offline.
            </Text>
            <FlatList
              data={RECOMMENDED_MODELS}
              keyExtractor={(m) => m.id}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => {
                const on = isModelInstalled(tags, item.ollama);
                const selected = item.id === modelId;
                return (
                  <View
                    style={[
                      styles.card,
                      selected && styles.cardOn,
                    ]}
                  >
                    <Pressable
                      onPress={() => void selectModel(item)}
                      style={{ flex: 1 }}
                    >
                      <Text style={styles.cardTitle}>{item.label}</Text>
                      <Text style={styles.cardBody}>{item.blurb}</Text>
                      <Text style={styles.cardMeta}>
                        {item.sizeLabel}
                        {on ? " · installed" : " · needs download"}
                      </Text>
                    </Pressable>
                    {!on ? (
                      <Pressable
                        style={styles.cardGet}
                        disabled={busy || !ollamaOk}
                        onPress={() => void installModel(item)}
                      >
                        <Text style={styles.cardGetText}>Get</Text>
                      </Pressable>
                    ) : (
                      <Text style={styles.cardReady}>Use</Text>
                    )}
                  </View>
                );
              }}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.linkBtn}
                onPress={() => void Linking.openURL(OLLAMA_INSTALL_URL)}
              >
                <Text style={styles.linkBtnText}>Get Ollama</Text>
              </Pressable>
              <Pressable
                style={styles.linkBtnGhost}
                onPress={() => {
                  setPickerOpen(false);
                  setHostEdit(true);
                }}
              >
                <Text style={styles.linkBtnGhostText}>Ollama host</Text>
              </Pressable>
              <Pressable
                style={styles.linkBtnGhost}
                onPress={() => setPickerOpen(false)}
              >
                <Text style={styles.linkBtnGhostText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={hostEdit} animationType="fade" transparent>
        <View style={styles.modalScrim}>
          <View style={[styles.modalSheet, isTablet && styles.modalWide]}>
            <Text style={styles.modalTitle}>Ollama host</Text>
            <Text style={styles.modalLede}>
              Desktop default is localhost. On Android, use your PC’s LAN IP
              (example: http://192.168.1.20:11434) with Ollama running there.
            </Text>
            <TextInput
              style={styles.hostInput}
              value={hostDraft}
              onChangeText={setHostDraft}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={DEFAULT_OLLAMA_HOST}
              placeholderTextColor={colors.fgDim}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.getBtn} onPress={() => void saveHost()}>
                <Text style={styles.getBtnText}>Save</Text>
              </Pressable>
              <Pressable
                style={styles.linkBtnGhost}
                onPress={() => setHostEdit(false)}
              >
                <Text style={styles.linkBtnGhostText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  toolbar: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "stretch",
  },
  modelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElev,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modelLabel: {
    color: colors.purple,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  modelName: { color: colors.accent, fontWeight: "800", marginTop: 2 },
  modelMeta: { color: colors.fgDim, fontSize: 11, marginTop: 2 },
  getBtn: {
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  getBtnText: { color: colors.accent, fontWeight: "700" },
  banner: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  bannerWarn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElev,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  bannerText: { color: colors.fgDim, flex: 1, fontSize: 12, lineHeight: 18 },
  bannerRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  linkBtn: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  linkBtnText: { color: colors.accent, fontWeight: "700", fontSize: 12 },
  linkBtnGhost: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  linkBtnGhostText: { color: colors.fg, fontSize: 12 },
  list: { paddingBottom: spacing.md, flexGrow: 1, paddingTop: spacing.sm },
  bubble: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    maxWidth: "92%",
  },
  bubbleWide: { maxWidth: "70%" },
  you: { alignSelf: "flex-end", backgroundColor: colors.accentSoft },
  nexus: { alignSelf: "flex-start", backgroundColor: colors.bgElev },
  role: { color: colors.accent, fontSize: 11, marginBottom: 4 },
  text: { color: colors.fg, lineHeight: 20 },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
    minWidth: 72,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.accent, fontWeight: "600" },
  modalScrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.bgBar,
    borderTopWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    maxHeight: "88%",
  },
  modalWide: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 560,
    marginBottom: 40,
    borderWidth: 1,
  },
  modalTitle: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  modalLede: {
    color: colors.fgDim,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElev,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardOn: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  cardTitle: { color: colors.accent, fontWeight: "700" },
  cardBody: { color: colors.fg, marginTop: 4, lineHeight: 18, fontSize: 13 },
  cardMeta: { color: colors.fgDim, marginTop: 4, fontSize: 11 },
  cardGet: {
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cardGetText: { color: colors.accent, fontWeight: "700" },
  cardReady: { color: colors.purple, fontWeight: "700", paddingHorizontal: 8 },
  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  hostInput: {
    color: colors.fg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
});
