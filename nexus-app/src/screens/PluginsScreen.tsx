import { useCallback, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { PLUGIN_CATALOG, type PluginId } from "../plugins/catalog";
import {
  loadPluginState,
  setPluginEnabled,
  type PluginState,
} from "../plugins/store";
import { CheckUpdatesButton } from "../components/CheckUpdatesButton";
import { GlassPanel } from "../components/GlassPanel";
import { ScreenShell } from "../components/ScreenShell";
import { AGENT_GUIDE_URL, OS_UPDATE_URL } from "../updates/links";
import { spacing, useTheme } from "../theme";

const CATEGORIES = [
  { id: "knowledge", label: "Knowledge" },
  { id: "files", label: "Files" },
  { id: "system", label: "System" },
] as const;

export function PluginsScreen() {
  const { colors } = useTheme();
  const [state, setState] = useState<PluginState | null>(null);

  useFocusEffect(
    useCallback(() => {
      void loadPluginState().then(setState);
    }, []),
  );

  async function toggle(id: PluginId, enabled: boolean) {
    const next = await setPluginEnabled(id, enabled);
    setState(next);
  }

  return (
    <ScreenShell>
      <Text style={[styles.kicker, { color: colors.purple }]}>LIBRARY</Text>
      <Text style={[styles.title, { color: colors.accent }]}>
        Add-ons & Plugins
      </Text>
      <Text style={[styles.lede, { color: colors.fgDim }]}>
        Enable the pieces your Agent can use in Chat. This is what makes NEXUS
        feel like a system you assembled — Vault, packs, and Files tools stay
        on this device.
      </Text>

      <GlassPanel title="How Agent uses these">
        In Chat, switch to Agent mode. The agent searches enabled knowledge
        plugins, then can browse / create folders and text files in Files
        (including a simple website/ project). Short status lines show each
        lookup.
      </GlassPanel>

      {!state ? (
        <Text style={{ color: colors.fgDim }}>Loading…</Text>
      ) : (
        CATEGORIES.map((cat) => (
          <View key={cat.id} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.fg }]}>
              {cat.label}
            </Text>
            {PLUGIN_CATALOG.filter((p) => p.category === cat.id).map((p) => (
              <View
                key={p.id}
                style={[
                  styles.row,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.glass
                      ? colors.bgGlass
                      : colors.bgElev,
                  },
                ]}
              >
                <View style={{ flex: 1, paddingRight: spacing.sm }}>
                  <Text style={{ color: colors.accent, fontWeight: "700" }}>
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
            ))}
          </View>
        ))
      )}

      <GlassPanel title="Optional website links" accent="purple">
        Tap only when you want docs or a newer build — Companion does not
        phone home. Day-to-day Agent tools stay on-device.
        <CheckUpdatesButton url={AGENT_GUIDE_URL} label="Agent guide (optional)" />
        <CheckUpdatesButton
          url={OS_UPDATE_URL}
          label="Website downloads (optional)"
        />
      </GlassPanel>

      <Pressable
        onPress={() =>
          void (async () => {
            for (const p of PLUGIN_CATALOG) {
              await setPluginEnabled(p.id, true);
            }
            setState(await loadPluginState());
          })()
        }
        style={[
          styles.reset,
          { borderColor: colors.border },
        ]}
      >
        <Text style={{ color: colors.fgDim, fontWeight: "600" }}>
          Enable all defaults
        </Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  lede: { lineHeight: 21, marginBottom: spacing.lg },
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
  reset: {
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
  },
});
