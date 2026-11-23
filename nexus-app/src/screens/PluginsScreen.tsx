import { useCallback, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { PLUGIN_CATALOG, type PluginId } from "../plugins/catalog";
import {
  loadPluginState,
  setPluginEnabled,
  type PluginState,
} from "../plugins/store";
import { MARKET_PAGES } from "../plugins/marketplace/catalog";
import {
  installMarketItem,
  loadInstalled,
  uninstallMarketItem,
  type InstalledMap,
} from "../plugins/marketplace/install";
import type { MarketItem, MarketPageId } from "../plugins/marketplace/types";
import { CheckUpdatesButton } from "../components/CheckUpdatesButton";
import { GlassPanel } from "../components/GlassPanel";
import { ScreenShell } from "../components/ScreenShell";
import { AGENT_GUIDE_URL, OS_UPDATE_URL } from "../updates/links";
import { spacing, useTheme } from "../theme";

const AGENT_CATEGORIES = [
  { id: "knowledge", label: "Knowledge" },
  { id: "files", label: "Files" },
  { id: "system", label: "System" },
] as const;

type Tab = "agent" | MarketPageId;

export function PluginsScreen() {
  const { colors, themeId } = useTheme();
  const navigation = useNavigation<{ navigate: (n: string) => void }>();
  const [state, setState] = useState<PluginState | null>(null);
  const [installed, setInstalled] = useState<InstalledMap>({});
  const [tab, setTab] = useState<Tab>("everyday");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const refresh = useCallback(() => {
    void loadPluginState().then(setState);
    void loadInstalled().then(setInstalled);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  async function toggle(id: PluginId, enabled: boolean) {
    const next = await setPluginEnabled(id, enabled);
    setState(next);
  }

  async function download(item: MarketItem) {
    setBusyId(item.id);
    setNote(null);
    const res = await installMarketItem(item, themeId);
    setBusyId(null);
    if (!res.ok) {
      setNote(res.error || "Download failed.");
      return;
    }
    if (item.kind === "link") {
      setNote(`Opened ${item.name} download page.`);
    } else {
      setNote(`Installed ${item.name} → Files / ${res.path}`);
      void loadInstalled().then(setInstalled);
    }
  }

  async function uninstall(item: MarketItem) {
    setBusyId(item.id);
    await uninstallMarketItem(item.id);
    setBusyId(null);
    setNote(`Removed ${item.name} from installed list.`);
    void loadInstalled().then(setInstalled);
  }

  const page = MARKET_PAGES.find((p) => p.id === tab);

  return (
    <ScreenShell>
      <Text style={[styles.kicker, { color: colors.purple }]}>LIBRARY</Text>
      <Text style={[styles.title, { color: colors.accent }]}>
        Add-ons & Plugins
      </Text>
      <Text style={[styles.lede, { color: colors.fgDim }]}>
        Enable Agent tools, or one-tap download ready-made mini apps into Files
        — clocks, calculators, coding pads, and more. Link packs open official
        download pages.
      </Text>

      <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab("agent")}
          style={[
            styles.tab,
            {
              borderColor: tab === "agent" ? colors.accent : colors.border,
              backgroundColor:
                tab === "agent" ? colors.accentSoft : "transparent",
              borderRadius: colors.radius || 10,
            },
          ]}
        >
          <Text
            style={{
              color: tab === "agent" ? colors.accent : colors.fgDim,
              fontWeight: "800",
              fontSize: 12,
            }}
          >
            Agent tools
          </Text>
        </Pressable>
        {MARKET_PAGES.map((p) => {
          const on = tab === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setTab(p.id)}
              style={[
                styles.tab,
                {
                  borderColor: on ? colors.accent : colors.border,
                  backgroundColor: on ? colors.accentSoft : "transparent",
                  borderRadius: colors.radius || 10,
                },
              ]}
            >
              <Text
                style={{
                  color: on ? colors.accent : colors.fgDim,
                  fontWeight: "800",
                  fontSize: 12,
                }}
              >
                {p.title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {note ? (
        <Text style={{ color: colors.accent, marginBottom: spacing.md }}>
          {note}{" "}
          {note.includes("Files") ? (
            <Text
              style={{ textDecorationLine: "underline" }}
              onPress={() => navigation.navigate("Files")}
            >
              Open Files
            </Text>
          ) : null}
        </Text>
      ) : null}

      {tab === "agent" ? (
        <>
          <GlassPanel title="How Agent uses these">
            In Chat, switch to Agent mode. The agent searches enabled knowledge
            plugins, then can browse / create folders and text files in Files
            (including a simple website/ project). Short status lines show each
            lookup.
          </GlassPanel>

          {!state ? (
            <Text style={{ color: colors.fgDim }}>Loading…</Text>
          ) : (
            AGENT_CATEGORIES.map((cat) => (
              <View key={cat.id} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.fg }]}>
                  {cat.label}
                </Text>
                {PLUGIN_CATALOG.filter((p) => p.category === cat.id).map(
                  (p) => (
                    <View
                      key={p.id}
                      style={[
                        styles.row,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.glass
                            ? colors.bgGlass
                            : colors.bgElev,
                          borderRadius: colors.radius || 0,
                        },
                      ]}
                    >
                      <View style={{ flex: 1, paddingRight: spacing.sm }}>
                        <Text
                          style={{ color: colors.accent, fontWeight: "700" }}
                        >
                          {p.name}
                        </Text>
                        <Text
                          style={{
                            color: colors.fgDim,
                            marginTop: 4,
                            lineHeight: 18,
                            fontSize: 13,
                          }}
                        >
                          {p.blurb}
                        </Text>
                        <Text
                          style={{
                            color: colors.purple,
                            marginTop: 4,
                            fontSize: 11,
                          }}
                        >
                          tool · {p.tool}
                        </Text>
                        <CheckUpdatesButton
                          url={p.updateUrl}
                          label="Guide (optional)"
                          compact
                        />
                      </View>
                      <Switch
                        value={!!state[p.id]}
                        onValueChange={(v) => void toggle(p.id, v)}
                        trackColor={{
                          false: colors.border,
                          true: colors.accent,
                        }}
                        thumbColor={colors.bgElev}
                      />
                    </View>
                  ),
                )}
              </View>
            ))
          )}

          <GlassPanel title="Optional website links" accent="purple">
            Tap only when you want docs or a newer build — Companion does not
            phone home. Day-to-day Agent tools stay on-device.
            <CheckUpdatesButton
              url={AGENT_GUIDE_URL}
              label="Agent guide (optional)"
            />
            <CheckUpdatesButton
              url={OS_UPDATE_URL}
              label="Website downloads (optional)"
            />
          </GlassPanel>
        </>
      ) : page ? (
        <>
          <GlassPanel title={page.title} floatDelay={20}>
            {page.blurb} Tap Download — mini apps land in{" "}
            <Text style={{ color: colors.accent, fontWeight: "700" }}>
              Files / apps/
            </Text>{" "}
            ready to open. We ship ready-made pages; larger tools open their
            official download site.
          </GlassPanel>

          <View style={styles.grid}>
            {page.items.map((item) => {
              const done = Boolean(installed[item.id]);
              const busy = busyId === item.id;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.card,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.glass
                        ? colors.bgGlass
                        : colors.bgElev,
                      borderRadius: colors.radius || 14,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.thumb,
                      {
                        backgroundColor: item.accent + "33",
                        borderColor: item.accent + "88",
                        borderRadius: Math.max(12, (colors.radius || 14) - 4),
                      },
                    ]}
                  >
                    <Text style={styles.thumbEmoji}>{item.emoji}</Text>
                  </View>
                  <Text
                    style={{
                      color: colors.fg,
                      fontWeight: "800",
                      marginTop: spacing.sm,
                    }}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      color: colors.fgDim,
                      fontSize: 12,
                      lineHeight: 17,
                      marginTop: 4,
                      minHeight: 34,
                    }}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                  <Pressable
                    disabled={busy}
                    onPress={() => void download(item)}
                    style={[
                      styles.download,
                      {
                        borderColor: done ? colors.purple : colors.accent,
                        backgroundColor: done
                          ? colors.purpleSoft
                          : colors.accentSoft,
                        borderRadius: colors.radius || 12,
                        opacity: busy ? 0.6 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: done ? colors.purple : colors.accent,
                        fontWeight: "800",
                        fontSize: 12,
                        textAlign: "center",
                      }}
                    >
                      {busy
                        ? "…"
                        : done
                          ? item.kind === "link"
                            ? "Open again"
                            : "Open / Re-download"
                          : "Download"}
                    </Text>
                  </Pressable>
                  {done && item.kind !== "link" ? (
                    <Pressable
                      disabled={busy}
                      onPress={() => void uninstall(item)}
                      style={[
                        styles.download,
                        {
                          borderColor: colors.danger,
                          borderRadius: colors.radius || 12,
                          marginTop: 6,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: colors.danger,
                          fontWeight: "800",
                          fontSize: 12,
                          textAlign: "center",
                        }}
                      >
                        Uninstall
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        </>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontWeight: "800",
    letterSpacing: 2,
    fontSize: 11,
    marginBottom: 4,
  },
  title: { fontWeight: "900", fontSize: 22, marginBottom: spacing.sm },
  lede: { lineHeight: 20, marginBottom: spacing.md },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontWeight: "800",
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    width: "47%",
    flexGrow: 1,
    flexBasis: "42%",
    maxWidth: 280,
    borderWidth: 1,
    padding: spacing.md,
  },
  thumb: {
    height: 72,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbEmoji: { fontSize: 28, fontWeight: "800" },
  download: {
    marginTop: spacing.sm,
    borderWidth: 1,
    paddingVertical: 8,
  },
});
