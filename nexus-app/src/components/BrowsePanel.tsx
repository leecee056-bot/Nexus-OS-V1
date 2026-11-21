import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  isDesktopBrowseAvailable,
  listBrowsers,
  openBrowse,
  setBrowsePrefs,
  type BrowsePrefs,
  type DetectedBrowser,
} from "../browse/api";
import { GlassPanel } from "./GlassPanel";
import { spacing, useTheme } from "../theme";

/**
 * Desktop-only: open a themed Browse window using Electron + detected browsers.
 */
export function BrowsePanel() {
  const { colors, themeId } = useTheme();
  const [url, setUrl] = useState("https://duckduckgo.com");
  const [browsers, setBrowsers] = useState<DetectedBrowser[]>([]);
  const [prefs, setPrefs] = useState<BrowsePrefs>({ mode: "window" });
  const [note, setNote] = useState<string | null>(null);
  const available = Platform.OS === "web" && isDesktopBrowseAvailable();

  const refresh = useCallback(() => {
    if (!available) return;
    void listBrowsers().then((r) => {
      setBrowsers(r.browsers);
      setPrefs(r.prefs);
    });
  }, [available]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (Platform.OS !== "web") return null;

  async function launch(mode?: BrowsePrefs["mode"]) {
    setNote(null);
    const res = await openBrowse(url.trim() || "https://duckduckgo.com", {
      themeId,
      mode: mode || prefs.mode || "window",
      browserId: prefs.browserId || undefined,
    });
    setNote(
      res.ok
        ? mode === "external" || prefs.mode === "external"
          ? "Opened in your installed browser."
          : "Opened NEXUS Browse window."
        : res.error || "Could not open.",
    );
  }

  async function pickBrowser(id: string) {
    const next = { ...prefs, browserId: id };
    setPrefs(next);
    await setBrowsePrefs(next);
  }

  async function pickMode(mode: BrowsePrefs["mode"]) {
    const next = { ...prefs, mode };
    setPrefs(next);
    await setBrowsePrefs(next);
  }

  return (
    <GlassPanel title="Browse" accent="purple" floatDelay={40}>
      <Text style={[styles.body, { color: colors.fgDim }]}>
        Open the web in a NEXUS window that matches your theme (especially
        Spatial / Open). Uses your installed browsers for detection and optional
        external open — we do not ship a separate browser engine product.
      </Text>
      {!available ? (
        <Text style={[styles.body, { color: colors.fgDim, marginTop: 8 }]}>
          Available in the Windows / Mac desktop app (Electron). Web preview can
          still theme the rest of Companion.
        </Text>
      ) : (
        <>
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="https://…"
            placeholderTextColor={colors.fgDim}
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              styles.input,
              {
                color: colors.fg,
                borderColor: colors.border,
                backgroundColor: colors.bgGlass,
                borderRadius: colors.radius || 12,
              },
            ]}
          />
          <View style={styles.row}>
            <Pressable
              onPress={() => void launch("window")}
              style={[
                styles.btn,
                {
                  borderColor: colors.accent,
                  backgroundColor: colors.accentSoft,
                  borderRadius: colors.radius || 12,
                },
              ]}
            >
              <Text style={{ color: colors.accent, fontWeight: "800" }}>
                Open in NEXUS window
              </Text>
            </Pressable>
            <Pressable
              onPress={() => void launch("external")}
              style={[
                styles.btn,
                {
                  borderColor: colors.border,
                  borderRadius: colors.radius || 12,
                },
              ]}
            >
              <Text style={{ color: colors.fg, fontWeight: "700" }}>
                Open in system browser
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.sub, { color: colors.fgDim }]}>
            Default open mode
          </Text>
          <View style={styles.row}>
            {(
              [
                ["window", "NEXUS window"],
                ["app", "Browser app window"],
                ["external", "System browser"],
              ] as const
            ).map(([id, label]) => {
              const on = prefs.mode === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => void pickMode(id)}
                  style={[
                    styles.chip,
                    {
                      borderColor: on ? colors.accent : colors.border,
                      backgroundColor: on ? colors.accentSoft : "transparent",
                      borderRadius: colors.radius || 12,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: on ? colors.accent : colors.fgDim,
                      fontWeight: "700",
                      fontSize: 12,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.sub, { color: colors.fgDim }]}>
            Detected browsers
          </Text>
          {browsers.length === 0 ? (
            <Text style={{ color: colors.fgDim, fontSize: 12 }}>
              None found yet — you can still use the NEXUS Browse window.
            </Text>
          ) : (
            <View style={styles.row}>
              {browsers.map((b) => {
                const on = prefs.browserId === b.id;
                return (
                  <Pressable
                    key={b.id}
                    onPress={() => void pickBrowser(b.id)}
                    style={[
                      styles.chip,
                      {
                        borderColor: on ? colors.purple : colors.border,
                        backgroundColor: on
                          ? colors.purpleSoft
                          : "transparent",
                        borderRadius: colors.radius || 12,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: on ? colors.purple : colors.fg,
                        fontWeight: "700",
                        fontSize: 12,
                      }}
                    >
                      {b.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          {note ? (
            <Text style={{ color: colors.accent, marginTop: 8, fontSize: 12 }}>
              {note}
            </Text>
          ) : null}
        </>
      )}
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  body: { lineHeight: 20, fontSize: 13 },
  input: {
    borderWidth: 1,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btn: {
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sub: {
    marginTop: spacing.md,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
