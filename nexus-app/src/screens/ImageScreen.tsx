import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
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
import {
  checkOllama,
  isModelInstalled,
  listLocalTags,
  OLLAMA_INSTALL_URL,
  pullModel,
} from "../chat/ollama";
import { loadOllamaHost, DEFAULT_OLLAMA_HOST } from "../chat/settings";
import {
  DEFAULT_IMAGE_MODEL_ID,
  findImageModel,
  RECOMMENDED_IMAGE_MODELS,
  type ImageModel,
} from "../image/models";
import {
  generateImage,
  saveGeneratedImage,
  toDataUrl,
} from "../image/generate";
import {
  loadSelectedImageModelId,
  saveSelectedImageModelId,
} from "../image/settings";
import { CheckUpdatesButton } from "../components/CheckUpdatesButton";
import { GlassPanel } from "../components/GlassPanel";
import { PressableCard } from "../components/PressableCard";
import { ProgressRing } from "../components/ProgressRing";
import { ScreenShell } from "../components/ScreenShell";
import { StatusOrb, type OrbState } from "../components/StatusOrb";
import {
  COMFYUI_URL,
  IMAGE_GUIDE_URL,
  OLLAMA_DOWNLOAD_URL,
} from "../updates/links";
import { useCompanionLayout } from "../layout";
import { spacing, useTheme } from "../theme";

/** Desktop Image Lab — local prompt → image via Ollama when supported. */
export function ImageScreen() {
  const { isTablet } = useCompanionLayout();
  const { colors } = useTheme();
  const isDesktopShell = Platform.OS === "web";

  const [prompt, setPrompt] = useState(
    "Pixel art moon over mountains, vaporwave neon, Tri-Cass green accents",
  );
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [host, setHost] = useState(DEFAULT_OLLAMA_HOST);
  const [modelId, setModelId] = useState(DEFAULT_IMAGE_MODEL_ID);
  const [ollamaOk, setOllamaOk] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [pullPct, setPullPct] = useState<number | null>(null);
  const [pullNote, setPullNote] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [resultB64, setResultB64] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);

  const model = useMemo(() => findImageModel(modelId), [modelId]);
  const installed = isModelInstalled(tags, model.ollama);

  const orb: OrbState = busy
    ? "thinking"
    : !ollamaOk
      ? "offline"
      : installed
        ? "ready"
        : "idle";

  const refresh = useCallback(async () => {
    const [savedModel, savedHost] = await Promise.all([
      loadSelectedImageModelId(),
      loadOllamaHost(),
    ]);
    setModelId(savedModel);
    setHost(savedHost);
    const status = await checkOllama(savedHost);
    if (status.ok) {
      setOllamaOk(true);
      setStatusNote(null);
      setTags(await listLocalTags(savedHost));
    } else {
      setOllamaOk(false);
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

  async function selectModel(m: ImageModel) {
    setModelId(m.id);
    await saveSelectedImageModelId(m.id);
    setPickerOpen(false);
  }

  async function installModel(m: ImageModel) {
    if (!ollamaOk) {
      setStatusNote("Install and start Ollama first, then tap Get model.");
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
    setTags(await listLocalTags(host));
    await selectModel(m);
  }

  async function onGenerate() {
    setSaveNote(null);
    if (!ollamaOk) {
      setStatusNote("Start Ollama on this machine first.");
      return;
    }
    if (!installed) {
      setStatusNote("Download the image model first (Get model).");
      return;
    }
    setBusy(true);
    setStatusNote("Generating locally…");
    const result = await generateImage(host, model, prompt);
    setBusy(false);
    if (!result.ok) {
      setResultB64(null);
      setStatusNote(result.error);
      return;
    }
    setResultB64(result.base64);
    setStatusNote("Done — image stays on this machine.");
  }

  async function onSave() {
    if (!resultB64) return;
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `tri-cass-image-${stamp}.png`;
    const saved = await saveGeneratedImage(resultB64, filename);
    if (saved.ok) {
      setSaveNote(saved.path ? `Saved: ${saved.path}` : "Saved.");
    } else {
      setSaveNote(saved.error || "Could not save.");
    }
  }

  return (
    <ScreenShell>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.kicker, { color: colors.purple }]}>
            IMAGE LAB
          </Text>
          <Text style={[styles.title, { color: colors.accent }]}>
            Generate
          </Text>
          <Text style={[styles.lede, { color: colors.fgDim }]}>
            Optional local images for Windows / Mac. Pick a model, download
            once via Ollama, then prompt offline. Same spirit as Chat — your
            machine, your weights.
          </Text>
        </View>
        <StatusOrb state={orb} />
      </View>

      {!isDesktopShell ? (
        <GlassPanel title="Desktop first" accent="purple">
          Image Lab is built for the Windows and Mac companion apps (GPU +
          Ollama). On phone it is preview-only — use desktop for real
          generation.
        </GlassPanel>
      ) : null}

      <GlassPanel title="Model">
        <View style={styles.modelRow}>
          <Pressable
            onPress={() => setPickerOpen(true)}
            style={[
              styles.modelBtn,
              {
                borderColor: colors.accent,
                backgroundColor: colors.accentSoft,
              },
            ]}
          >
            <Text style={{ color: colors.accent, fontWeight: "800" }}>
              {model.label}
            </Text>
            <Text style={{ color: colors.fgDim, fontSize: 12, marginTop: 2 }}>
              {installed ? "Installed · tap to change" : "Needs download"}
            </Text>
          </Pressable>
          {!installed ? (
            <Pressable
              disabled={busy || !ollamaOk}
              onPress={() => void installModel(model)}
              style={[
                styles.getBtn,
                { borderColor: colors.accent, opacity: busy ? 0.6 : 1 },
              ]}
            >
              {busy && pullPct != null ? (
                <ProgressRing progress={pullPct} size={36} />
              ) : (
                <Text style={{ color: colors.accent, fontWeight: "800" }}>
                  Get model
                </Text>
              )}
            </Pressable>
          ) : null}
        </View>
        {pullNote ? (
          <Text style={{ color: colors.fgDim, marginTop: 8, fontSize: 12 }}>
            {pullNote}
          </Text>
        ) : null}
        <CheckUpdatesButton url={model.updateUrl} compact />
      </GlassPanel>

      <GlassPanel title="Prompt">
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          multiline
          placeholder="Describe the image…"
          placeholderTextColor={colors.fgDim}
          style={[
            styles.prompt,
            {
              color: colors.fg,
              borderColor: colors.border,
              backgroundColor: colors.bgElev,
            },
          ]}
        />
        <Pressable
          onPress={() => void onGenerate()}
          disabled={busy}
          style={[
            styles.genBtn,
            {
              backgroundColor: colors.accent,
              opacity: busy ? 0.7 : 1,
            },
          ]}
        >
          {busy ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={{ color: colors.bg, fontWeight: "900" }}>
              Generate locally
            </Text>
          )}
        </Pressable>
      </GlassPanel>

      {statusNote ? (
        <Text style={[styles.status, { color: colors.fgDim }]}>
          {statusNote}
        </Text>
      ) : null}

      {resultB64 ? (
        <GlassPanel title="Result">
          <Image
            source={{ uri: toDataUrl(resultB64) }}
            style={styles.preview}
            resizeMode="contain"
          />
          <View style={styles.resultActions}>
            <Pressable
              onPress={() => void onSave()}
              style={[
                styles.secondaryBtn,
                {
                  borderColor: colors.accent,
                  backgroundColor: colors.accentSoft,
                },
              ]}
            >
              <Text style={{ color: colors.accent, fontWeight: "700" }}>
                Save PNG
              </Text>
            </Pressable>
            <CheckUpdatesButton url={IMAGE_GUIDE_URL} label="Image guide" />
          </View>
          {saveNote ? (
            <Text style={{ color: colors.fgDim, marginTop: 8, fontSize: 12 }}>
              {saveNote}
            </Text>
          ) : null}
        </GlassPanel>
      ) : null}

      <GlassPanel title="Install paths" accent="purple">
        <Text style={{ color: colors.fg, lineHeight: 20 }}>
          1. Install Ollama → pull an image model above (Get model).{"\n"}
          2. If generate says unsupported, your Ollama build may have removed
          experimental image gen — check updates on the model page, or try
          ComfyUI as an alternate local path.{"\n"}
          3. After the weights are on disk, generation stays offline.
        </Text>
        <View style={styles.linkRow}>
          <CheckUpdatesButton url={OLLAMA_DOWNLOAD_URL} label="Get Ollama" />
          <CheckUpdatesButton url={COMFYUI_URL} label="ComfyUI" />
          <CheckUpdatesButton
            url={IMAGE_GUIDE_URL}
            label="Companion image guide"
          />
        </View>
      </GlassPanel>

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
              Image models
            </Text>
            <Text style={[styles.modalLede, { color: colors.fgDim }]}>
              Lightweight-as-practical local image picks. Download once, then
              generate offline on desktop.
            </Text>
            <FlatList
              data={RECOMMENDED_IMAGE_MODELS}
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
                    <Text
                      style={{ color: colors.accent, fontWeight: "800" }}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={{
                        color: colors.fg,
                        marginTop: 4,
                        lineHeight: 18,
                      }}
                    >
                      {item.blurb}
                    </Text>
                    <Text
                      style={{
                        color: colors.fgDim,
                        marginTop: 4,
                        fontSize: 12,
                      }}
                    >
                      {item.sizeLabel}
                      {on ? " · installed" : " · needs download"}
                    </Text>
                    <View style={styles.cardActions}>
                      {!on ? (
                        <Pressable
                          style={[
                            styles.cardGet,
                            { borderColor: colors.accent },
                          ]}
                          disabled={busy || !ollamaOk}
                          onPress={() => void installModel(item)}
                        >
                          <Text
                            style={{ color: colors.accent, fontWeight: "700" }}
                          >
                            Get
                          </Text>
                        </Pressable>
                      ) : (
                        <Text
                          style={{ color: colors.purple, fontWeight: "700" }}
                        >
                          Use
                        </Text>
                      )}
                      <CheckUpdatesButton
                        url={item.updateUrl}
                        label="Updates"
                        compact
                      />
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
                <Text style={{ color: colors.accent, fontWeight: "700" }}>
                  Get Ollama
                </Text>
              </Pressable>
              <Pressable
                style={[styles.linkBtnGhost, { borderColor: colors.border }]}
                onPress={() => setPickerOpen(false)}
              >
                <Text style={{ color: colors.fg, fontWeight: "600" }}>
                  Close
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  kicker: { fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  lede: { lineHeight: 21 },
  modelRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    alignItems: "center",
  },
  modelBtn: {
    flexGrow: 1,
    borderWidth: 1,
    padding: spacing.md,
    minWidth: 180,
  },
  getBtn: {
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minWidth: 100,
    alignItems: "center",
  },
  prompt: {
    borderWidth: 1,
    minHeight: 96,
    padding: spacing.md,
    textAlignVertical: "top",
    marginBottom: spacing.md,
  },
  genBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  status: { marginBottom: spacing.md, lineHeight: 20 },
  preview: {
    width: "100%",
    height: 320,
    backgroundColor: "#000",
  },
  resultActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
    alignItems: "center",
  },
  secondaryBtn: {
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  linkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modalScrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
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
    borderWidth: 1,
    marginBottom: 40,
    borderRadius: 0,
  },
  modalTitle: { fontWeight: "800", fontSize: 18 },
  modalLede: { marginTop: 6, marginBottom: spacing.md, lineHeight: 18 },
  cardPad: { marginBottom: spacing.sm },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cardGet: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  linkBtn: {
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  linkBtnGhost: {
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
