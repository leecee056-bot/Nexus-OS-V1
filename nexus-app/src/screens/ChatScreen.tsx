import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  type FlatList as FlatListType,
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
  deleteModel,
  DEFAULT_NUM_CTX,
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
import {
  chatToMarkdown,
  loadChatHistory,
  saveChatHistory,
} from "../chat/history";
import { runAgentTurn } from "../agent/runner";
import type { AgentStep } from "../agent/schema";
import { tryBuildWebsiteFromMessage } from "../agent/website";
import { AppStatusBar } from "../components/AppStatusBar";
import { CheckUpdatesButton } from "../components/CheckUpdatesButton";
import { ContentFrame } from "../components/ContentFrame";
import { WaitIndicator } from "../components/WaitIndicator";
import { PressableCard } from "../components/PressableCard";
import { ProgressRing } from "../components/ProgressRing";
import { ScanlineOverlay } from "../components/ScanlineOverlay";
import { StatusOrb, type OrbState } from "../components/StatusOrb";
import { TypewriterText } from "../components/TypewriterText";
import { exportChatToUsb } from "../portable/info";
import { AGENT_GUIDE_URL, OS_UPDATE_URL } from "../updates/links";
import { useCompanionLayout } from "../layout";
import { spacing, useTheme } from "../theme";
import { monoStyle, themeBodyStyle } from "../theme/fonts";

/** Keep enough turns for local models with ~8k context. */
const HISTORY_TURNS = 40;

type Msg = { id: string; role: "you" | "tricass"; text: string; typed?: boolean };
type ChatMode = "chat" | "agent";

const SYSTEM_PROMPT =
  "You are Tri-Cass, a helpful offline assistant in the Tri-Cass Companion app. Be concise and practical. For greetings, reply briefly — never invent tool activity.";

export function ChatScreen() {
  const { isTablet } = useCompanionLayout();
  const { colors, themeId } = useTheme();
  const [mode, setMode] = useState<ChatMode>("chat");
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
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
  const [pullPct, setPullPct] = useState<number | null>(null);
  const [pullNote, setPullNote] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [latestTypedId, setLatestTypedId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [exportNote, setExportNote] = useState<string | null>(null);
  const listRef = useRef<FlatListType<Msg>>(null);

  useEffect(() => {
    void loadChatHistory().then((h) => {
      setMsgs(h);
      setHistoryReady(true);
    });
  }, []);

  useEffect(() => {
    if (!historyReady) return;
    void saveChatHistory(msgs);
  }, [msgs, historyReady]);

  const model = useMemo(() => findModel(modelId), [modelId]);
  const installed = isModelInstalled(tags, model.ollama);

  /** Reply wait (not model download) — compact rabbit + fun facts. */
  const waiting = busy && pullPct == null && !pullNote;

  useEffect(() => {
    if (!waiting) return;
    const t = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(t);
  }, [waiting, msgs.length]);

  const orb: OrbState = busy
    ? "thinking"
    : !ollamaOk
      ? "offline"
      : installed
        ? "ready"
        : "idle";

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
    setPullPct(0);
    setPullNote(`Getting ${m.label}…`);
    const result = await pullModel(host, m.ollama, (p) => {
      if (p.total && p.completed != null && p.total > 0) {
        setPullPct(Math.min(100, Math.round((p.completed / p.total) * 100)));
      }
      setPullNote(p.status || "Downloading…");
    });
    setBusy(false);
    setPullPct(null);
    if (!result.ok) {
      setPullNote(null);
      setStatusNote(result.error || "Download failed.");
      return;
    }
    setPullNote(null);
    await selectModel(m);
    await refresh();
    const id = String(Date.now());
    setLatestTypedId(id);
    setMsgs((prev) => [
      ...prev,
      {
        id,
        role: "tricass",
        text: `${m.label} is ready. Ask me anything — it runs locally on Tri-Cass.`,
        typed: true,
      },
    ]);
  }

  async function saveHost() {
    await saveOllamaHost(hostDraft);
    setHostEdit(false);
    await refresh();
  }

  async function uninstallModel(m: LocalModel) {
    if (!ollamaOk) return;
    setBusy(true);
    setPullNote(`Uninstalling ${m.label}…`);
    const result = await deleteModel(host, m.ollama);
    setBusy(false);
    setPullNote(null);
    if (!result.ok) {
      setStatusNote(result.error || "Uninstall failed.");
      return;
    }
    await refresh();
    setStatusNote(null);
  }

  function newChat() {
    setMsgs([]);
    setAgentSteps([]);
    setExportNote(null);
    setLatestTypedId(null);
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    const you: Msg = { id: String(Date.now()), role: "you", text };
    setMsgs((m) => [...m, you]);
    setInput("");
    setBusy(true);
    setAgentSteps([]);

    const historyForAgent: ChatMessage[] = msgs
      .filter((x) => x.id !== "0")
      .slice(-HISTORY_TURNS)
      .map((x) => ({
        role: (x.role === "you" ? "user" : "assistant") as "user" | "assistant",
        content: x.text,
      }));

    // Website asks work in Chat or Agent — one clear request → files.
    const siteNote = await tryBuildWebsiteFromMessage(text);

    if (mode === "agent") {
      const result = await runAgentTurn({
        host,
        model: model.ollama,
        userMessage: text,
        history: historyForAgent,
        modelReady: ollamaOk && installed,
        onStep: (_s, all) => setAgentSteps(all),
      });
      const id = String(Date.now() + 1);
      setLatestTypedId(id);
      const merged =
        siteNote && !/website\//i.test(result.text)
          ? `${result.text}\n\n${siteNote}`
          : result.text;
      setMsgs((m) => [
        ...m,
        { id, role: "tricass", text: merged, typed: true },
      ]);
      setBusy(false);
      return;
    }

    if (!ollamaOk || !installed) {
      const fallback = siteNote || companionReply(text);
      const note = siteNote
        ? ""
        : !ollamaOk
          ? "\n\nLocal model offline — install Ollama, then tap Get model."
          : "\n\nModel not downloaded yet — tap Get model.";
      const id = String(Date.now() + 1);
      setLatestTypedId(id);
      setMsgs((m) => [
        ...m,
        { id, role: "tricass", text: fallback + note, typed: true },
      ]);
      setBusy(false);
      return;
    }

    const history: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...historyForAgent,
      { role: "user", content: text },
    ];

    const result = await chatCompletion(host, model.ollama, history, {
      numCtx: DEFAULT_NUM_CTX,
      numPredict: 1024,
    });
    const id = String(Date.now() + 1);
    setLatestTypedId(id);
    const reply = result.ok ? result.text : result.error;
    setMsgs((m) => [
      ...m,
      {
        id,
        role: "tricass",
        text: siteNote ? `${reply}\n\n${siteNote}` : reply,
        typed: true,
      },
    ]);
    setBusy(false);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={isTablet ? 24 : 88}
    >
      <ContentFrame>
        <View
          style={[
            styles.toolbar,
            {
              borderBottomColor: colors.border,
              backgroundColor: colors.glass ? colors.bgGlass : colors.bgElev,
            },
          ]}
        >
          <Pressable
            style={[
              styles.modelBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.bg,
              },
            ]}
            onPress={() => setPickerOpen(true)}
          >
            <View style={styles.modelTop}>
              <StatusOrb state={orb} />
              <Text style={[styles.modelLabel, { color: colors.purple }]}>
                Model
              </Text>
            </View>
            <Text
              style={[styles.modelName, { color: colors.accent }]}
              numberOfLines={1}
            >
              {model.label}
            </Text>
            <Text style={[styles.modelMeta, { color: colors.fgDim }]}>
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
              style={[
                styles.getBtn,
                {
                  backgroundColor: colors.accentSoft,
                  borderColor: colors.accent,
                },
              ]}
              disabled={busy}
              onPress={() => void installModel(model)}
            >
              {pullPct != null ? (
                <ProgressRing progress={pullPct} size={34} />
              ) : (
                <Text style={[styles.getBtnText, { color: colors.accent }]}>
                  Get model
                </Text>
              )}
            </Pressable>
          ) : null}
        </View>

        <View style={styles.updateStrip}>
          <CheckUpdatesButton
            url={model.updateUrl}
            label="Model library (optional)"
            compact
          />
          {mode === "agent" ? (
            <CheckUpdatesButton
              url={AGENT_GUIDE_URL}
              label="Agent guide (optional)"
              compact
            />
          ) : null}
          <CheckUpdatesButton
            url={OS_UPDATE_URL}
            label="Website downloads (optional)"
            compact
          />
          <Pressable
            onPress={newChat}
            style={[
              styles.saveChatBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.bgElev,
              },
            ]}
          >
            <Text
              style={[
                {
                  color: colors.fg,
                  fontWeight: "700",
                  fontSize: 11,
                },
                themeBodyStyle(themeId),
              ]}
            >
              New chat
            </Text>
          </Pressable>
          <Pressable
            onPress={() =>
              void (async () => {
                const md = chatToMarkdown(msgs);
                const stamp = new Date().toISOString().replace(/[:.]/g, "-");
                const r = await exportChatToUsb(
                  md,
                  `tri-cass-chat-${stamp}.md`,
                );
                setExportNote(
                  r.ok
                    ? r.path
                      ? `Saved chat → ${r.path}`
                      : "Chat saved on this drive"
                    : r.error || "Could not save chat",
                );
              })()
            }
            style={[
              styles.saveChatBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.accentSoft,
              },
            ]}
          >
            <Text
              style={{
                color: colors.accent,
                fontWeight: "700",
                fontSize: 11,
              }}
            >
              Save chat
            </Text>
          </Pressable>
        </View>
        {exportNote ? (
          <Text
            style={{
              color: colors.fgDim,
              fontSize: 11,
              paddingHorizontal: spacing.md,
              marginBottom: 4,
            }}
            numberOfLines={2}
          >
            {exportNote}
          </Text>
        ) : null}

        <View style={styles.modeRow}>
          <Pressable
            onPress={() => setMode(mode === "agent" ? "chat" : "agent")}
            style={[
              styles.modeChip,
              {
                borderColor: mode === "agent" ? colors.accent : colors.border,
                backgroundColor:
                  mode === "agent" ? colors.accentSoft : "transparent",
              },
            ]}
          >
            <Text
              style={{
                color: mode === "agent" ? colors.accent : colors.fgDim,
                fontWeight: "800",
                fontSize: 12,
                letterSpacing: 0.4,
              }}
            >
              {mode === "agent" ? "Agent on" : "Agent off"}
            </Text>
          </Pressable>
          <Text style={[styles.modeHint, { color: colors.fgDim }]}>
            {mode === "agent"
              ? "One tap · Vault / Files / websites when you ask"
              : "Straight chat · still builds a website if you ask"}
          </Text>
        </View>

        {mode === "agent" && agentSteps.length > 0 ? (
          <View
            style={[
              styles.agentStrip,
              {
                borderColor: colors.border,
                backgroundColor: colors.glass ? colors.bgGlass : colors.bgElev,
              },
            ]}
          >
            {agentSteps.slice(-4).map((s) => (
              <Text
                key={s.id}
                style={{ color: colors.fgDim, fontSize: 11, lineHeight: 16 }}
              >
                ▸ {s.phase}
                {s.detail ? ` — ${s.detail}` : ""}
              </Text>
            ))}
          </View>
        ) : null}

        {pullNote ? (
          <View style={styles.banner}>
            <ActivityIndicator color={colors.accent} />
            <Text style={[styles.bannerText, { color: colors.fgDim }]}>
              {pullNote}
              {pullPct != null ? ` · ${pullPct}%` : ""}
            </Text>
          </View>
        ) : null}
        {statusNote && !ollamaOk ? (
          <View
            style={[
              styles.bannerWarn,
              {
                borderColor: colors.border,
                backgroundColor: colors.bgElev,
              },
            ]}
          >
            <Text style={[styles.bannerText, { color: colors.fgDim }]}>
              {statusNote}
            </Text>
            <View style={styles.bannerRow}>
              <Pressable
                style={[
                  styles.linkBtn,
                  {
                    borderColor: colors.accent,
                    backgroundColor: colors.accentSoft,
                  },
                ]}
                onPress={() => void Linking.openURL(OLLAMA_INSTALL_URL)}
              >
                <Text style={[styles.linkBtnText, { color: colors.accent }]}>
                  Install Ollama
                </Text>
              </Pressable>
              <Pressable
                style={[styles.linkBtnGhost, { borderColor: colors.border }]}
                onPress={() => setHostEdit(true)}
              >
                <Text style={[styles.linkBtnGhostText, { color: colors.fg }]}>
                  Set host
                </Text>
              </Pressable>
              <Pressable
                style={[styles.linkBtnGhost, { borderColor: colors.border }]}
                onPress={() => void refresh()}
              >
                <Text style={[styles.linkBtnGhostText, { color: colors.fg }]}>
                  Retry
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={(m) => m.id}
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          ListFooterComponent={<WaitIndicator active={waiting} />}
          renderItem={({ item }) => {
            const isYou = item.role === "you";
            return (
              <View
                style={[
                  styles.bubble,
                  isYou ? styles.you : styles.tricass,
                  isTablet && styles.bubbleWide,
                  {
                    borderColor: isYou
                      ? colors.accent
                      : "transparent",
                    borderLeftColor: isYou ? colors.accent : colors.phosphor,
                    backgroundColor: isYou
                      ? colors.accentSoft
                      : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.role,
                    { color: isYou ? colors.purple : colors.accent },
                    colors.mono ? monoStyle({ fontSize: 11 }) : null,
                  ]}
                >
                  {isYou ? "You" : "Tri-Cass"}
                </Text>
                {isYou ? (
                  <Text style={{ color: colors.fg, lineHeight: 22 }}>
                    {item.text}
                  </Text>
                ) : (
                  <TypewriterText
                    text={item.text}
                    animate={item.typed === true && item.id === latestTypedId}
                  />
                )}
              </View>
            );
          }}
        />
        <View style={[styles.row, { borderTopColor: colors.border }]}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.fg,
                borderColor: colors.border,
                backgroundColor: colors.bgElev,
              },
            ]}
            value={input}
            onChangeText={setInput}
            placeholder={
              installed ? "Ask Tri-Cass…" : "Ask anything…"
            }
            placeholderTextColor={colors.fgDim}
            onSubmitEditing={() => void send()}
            returnKeyType="send"
            editable={!busy}
          />
          <Pressable
            style={[
              styles.btn,
              {
                backgroundColor: colors.accentSoft,
                borderColor: colors.accent,
                opacity: busy ? 0.6 : 1,
              },
            ]}
            onPress={() => void send()}
            disabled={busy}
          >
            <Text style={[styles.btnText, { color: colors.accent }]}>
              {waiting ? "…" : "Send"}
            </Text>
          </Pressable>
        </View>
      </ContentFrame>

      <AppStatusBar
        modelLabel={model.label}
        orb={orb}
        offline={!ollamaOk || !installed}
        ollamaOk={ollamaOk}
      />
      <ScanlineOverlay />

      <Modal visible={pickerOpen} animationType="slide" transparent>
        <View style={styles.modalScrim}>
          <View
            style={[
              styles.modalSheet,
              isTablet && styles.modalWide,
              {
                backgroundColor: colors.bgBar,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.accent }]}>
              Local models
            </Text>
            <Text
              style={[
                styles.modalLede,
                { color: colors.fgDim },
                themeBodyStyle(themeId),
              ]}
            >
              Browse recommended picks or anything already installed in Ollama.
              Get / Use / Uninstall — models stay on this machine.
            </Text>
            {tags.length > 0 ? (
              <Text
                style={{
                  color: colors.purple,
                  fontSize: 12,
                  fontWeight: "700",
                  marginBottom: 8,
                }}
              >
                Installed on this PC ({tags.length}): {tags.slice(0, 8).join(", ")}
                {tags.length > 8 ? "…" : ""}
              </Text>
            ) : null}
            <FlatList
              data={RECOMMENDED_MODELS}
              keyExtractor={(m) => m.id}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => {
                const on = isModelInstalled(tags, item.ollama);
                const selected = item.id === modelId;
                return (
                  <PressableCard
                    selected={selected}
                    style={styles.cardPad}
                    onPress={() => void selectModel(item)}
                  >
                    <View style={styles.cardRow}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.cardTitle, { color: colors.accent }]}
                        >
                          {item.label}
                        </Text>
                        <Text
                          style={[styles.cardBody, { color: colors.fg }]}
                        >
                          {item.blurb}
                        </Text>
                        <Text
                          style={[styles.cardMeta, { color: colors.fgDim }]}
                        >
                          {item.sizeLabel}
                          {on ? " · installed" : " · needs download"}
                        </Text>
                        <CheckUpdatesButton
                          url={item.updateUrl}
                          label="Updates"
                          compact
                        />
                      </View>
                      <View style={{ gap: 6, alignItems: "flex-end" }}>
                        {!on ? (
                          <Pressable
                            style={[
                              styles.cardGet,
                              { borderColor: colors.accent },
                            ]}
                            disabled={busy || !ollamaOk}
                            onPress={() => void installModel(item)}
                          >
                            {busy && pullPct != null && modelId === item.id ? (
                              <ProgressRing progress={pullPct} size={32} />
                            ) : (
                              <Text
                                style={[
                                  styles.cardGetText,
                                  { color: colors.accent },
                                ]}
                              >
                                Get
                              </Text>
                            )}
                          </Pressable>
                        ) : (
                          <>
                            <Text
                              style={{
                                color: colors.purple,
                                fontWeight: "700",
                                paddingHorizontal: 8,
                              }}
                            >
                              Use
                            </Text>
                            <Pressable
                              style={[
                                styles.cardGet,
                                { borderColor: colors.danger },
                              ]}
                              disabled={busy || !ollamaOk}
                              onPress={() => void uninstallModel(item)}
                            >
                              <Text
                                style={{
                                  color: colors.danger,
                                  fontWeight: "700",
                                  fontSize: 11,
                                }}
                              >
                                Uninstall
                              </Text>
                            </Pressable>
                          </>
                        )}
                      </View>
                    </View>
                  </PressableCard>
                );
              }}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.linkBtn,
                  {
                    borderColor: colors.accent,
                    backgroundColor: colors.accentSoft,
                  },
                ]}
                onPress={() => void Linking.openURL(OLLAMA_INSTALL_URL)}
              >
                <Text style={[styles.linkBtnText, { color: colors.accent }]}>
                  Get Ollama
                </Text>
              </Pressable>
              <Pressable
                style={[styles.linkBtnGhost, { borderColor: colors.border }]}
                onPress={() => {
                  setPickerOpen(false);
                  setHostEdit(true);
                }}
              >
                <Text style={[styles.linkBtnGhostText, { color: colors.fg }]}>
                  Ollama host
                </Text>
              </Pressable>
              <Pressable
                style={[styles.linkBtnGhost, { borderColor: colors.border }]}
                onPress={() => setPickerOpen(false)}
              >
                <Text style={[styles.linkBtnGhostText, { color: colors.fg }]}>
                  Close
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={hostEdit} animationType="fade" transparent>
        <View style={styles.modalScrim}>
          <View
            style={[
              styles.modalSheet,
              isTablet && styles.modalWide,
              {
                backgroundColor: colors.bgBar,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.accent }]}>
              Ollama host
            </Text>
            <Text style={[styles.modalLede, { color: colors.fgDim }]}>
              Desktop default is localhost. On Android, use your PC’s LAN IP
              (example: http://192.168.1.20:11434).
            </Text>
            <TextInput
              style={[
                styles.hostInput,
                {
                  color: colors.fg,
                  borderColor: colors.border,
                  backgroundColor: colors.bgElev,
                },
              ]}
              value={hostDraft}
              onChangeText={setHostDraft}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={DEFAULT_OLLAMA_HOST}
              placeholderTextColor={colors.fgDim}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.getBtn,
                  {
                    backgroundColor: colors.accentSoft,
                    borderColor: colors.accent,
                    paddingVertical: 10,
                  },
                ]}
                onPress={() => void saveHost()}
              >
                <Text style={[styles.getBtnText, { color: colors.accent }]}>
                  Save
                </Text>
              </Pressable>
              <Pressable
                style={[styles.linkBtnGhost, { borderColor: colors.border }]}
                onPress={() => setHostEdit(false)}
              >
                <Text style={[styles.linkBtnGhostText, { color: colors.fg }]}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    alignItems: "stretch",
  },
  modelBtn: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modelTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  modelLabel: {
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  modelName: { fontWeight: "800", marginTop: 4 },
  modelMeta: { fontSize: 11, marginTop: 2 },
  updateStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    alignItems: "center",
  },
  saveChatBtn: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.sm,
    flexWrap: "wrap",
  },
  modeChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modeHint: { fontSize: 11, flexShrink: 1 },
  agentStrip: {
    borderWidth: 1,
    padding: spacing.sm,
    marginTop: spacing.sm,
    gap: 2,
  },
  getBtn: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    minWidth: 88,
  },
  getBtnText: { fontWeight: "700" },
  banner: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  bannerWarn: {
    borderWidth: 1,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  bannerText: { flex: 1, fontSize: 12, lineHeight: 18 },
  bannerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  linkBtn: {
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  linkBtnText: { fontWeight: "700", fontSize: 12 },
  linkBtnGhost: {
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  linkBtnGhostText: { fontSize: 12 },
  list: { paddingBottom: spacing.md, flexGrow: 1, paddingTop: spacing.sm },
  bubble: {
    borderWidth: 0,
    borderLeftWidth: 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    maxWidth: "92%",
  },
  bubbleWide: { maxWidth: "72%" },
  you: { alignSelf: "flex-end", borderLeftWidth: 0, borderWidth: 1 },
  tricass: { alignSelf: "flex-start" },
  role: {
    fontSize: 10,
    marginBottom: 6,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? spacing.md : spacing.sm,
  },
  btn: {
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    minWidth: 72,
    alignItems: "center",
  },
  btnText: { fontWeight: "600" },
  modalScrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopWidth: 1,
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
    fontSize: 20,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  modalLede: {
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  cardPad: { padding: spacing.md, marginBottom: spacing.sm },
  cardRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  cardTitle: { fontWeight: "700" },
  cardBody: { marginTop: 4, lineHeight: 18, fontSize: 13 },
  cardMeta: { marginTop: 4, fontSize: 11 },
  cardGet: {
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 52,
    alignItems: "center",
  },
  cardGetText: { fontWeight: "700" },
  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  hostInput: {
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
});
