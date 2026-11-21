import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";
import { PLUGIN_CATALOG } from "../plugins/catalog";
import { ThemePicker } from "./ThemePicker";
import { TerminalPanel } from "./TerminalPanel";
import { CheckUpdatesButton } from "./CheckUpdatesButton";
import { OS_UPDATE_URL } from "../updates/links";
import { monoStyle } from "../theme/fonts";
import { spacing, useTheme } from "../theme";

function pane(mid: boolean, flex = 1, minWidth = 160): ViewStyle {
  if (!mid) return { width: "100%" };
  return { flex, flexGrow: flex, flexBasis: 0, minWidth };
}

const DESKTOP = Platform.OS === "web";

type NavName =
  | "Home"
  | "Chat"
  | "Image"
  | "Games"
  | "Vault"
  | "Packs"
  | "Plugins"
  | "Files"
  | "About";

const MENU_CORE: { label: string; hint: string; route: NavName }[] = [
  { label: "AI Chat", hint: "Enter", route: "Chat" },
  { label: "Knowledge Vault", hint: "V", route: "Vault" },
  { label: "Knowledge Packs", hint: "P", route: "Packs" },
  { label: "Add-ons / Agent", hint: "A", route: "Plugins" },
  { label: "File Manager", hint: "F", route: "Files" },
  { label: "Settings", hint: "O", route: "About" },
];

const MENU: { label: string; hint: string; route: NavName }[] = DESKTOP
  ? [
      MENU_CORE[0],
      { label: "Image Lab", hint: "I", route: "Image" },
      { label: "Games", hint: "G", route: "Games" },
      ...MENU_CORE.slice(1),
    ]
  : MENU_CORE;

const ASCII_FRACTAL = [
  "        ░░▓▓",
  "      ░▓████▓░",
  "    ░▓██▓▓██▓░",
  "   ▓██▓░░░▓██▓",
  "  ▓██░  ░░  ░██▓",
  " ▓██░ ░▓██▓░ ░██▓",
  " ▓██ ░██████░ ██▓",
  " ▓██░ ░▓██▓░ ░██▓",
  "  ▓██░  ░░  ░██▓",
  "   ▓██▓░░░▓██▓",
  "    ░▓██▓▓██▓░",
  "      ░▓████▓░",
  "        ░░▓▓",
].join("\n");

function Meter({
  label,
  value,
  unit = "%",
}: {
  label: string;
  value: number;
  unit?: string;
}) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.meter}>
      <Text style={monoStyle({ color: colors.fgDim, fontSize: 10 })}>
        {label}
      </Text>
      <View style={[styles.meterTrack, { borderColor: colors.border }]}>
        <View
          style={[
            styles.meterFill,
            {
              width: `${clamped}%`,
              backgroundColor: colors.accent,
            },
          ]}
        />
      </View>
      <Text style={monoStyle({ color: colors.fg, fontSize: 10, width: 48 })}>
        {Math.round(clamped)}
        {unit}
      </Text>
    </View>
  );
}

function deviceHints() {
  try {
    const nav = globalThis as {
      navigator?: { deviceMemory?: number; hardwareConcurrency?: number };
    };
    const mem = nav.navigator?.deviceMemory;
    const cores = nav.navigator?.hardwareConcurrency;
    return {
      ramPct: typeof mem === "number" ? Math.min(92, 28 + mem * 4) : 48,
      cpuPct: typeof cores === "number" ? Math.min(40, 8 + cores) : 12,
      diskPct: 32,
      cores: cores ?? "—",
      memLabel: typeof mem === "number" ? `~${mem} GB` : "local",
    };
  } catch {
    return { ramPct: 48, cpuPct: 12, diskPct: 32, cores: "—", memLabel: "local" };
  }
}

/** Home dashboard for Terminal theme — multi-pane CRT shell + NEXUS logo. */
export function TerminalDashboard() {
  const { colors } = useTheme();
  const navigation = useNavigation<{ navigate: (n: NavName) => void }>();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const mid = width >= 640;
  const [tick, setTick] = useState(0);
  const hints = deviceHints();

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, []);

  const go = (route: NavName) => navigation.navigate(route);
  const wave = "▁▂▃▅▆▇█▇▆▅▃▂".split("");
  const waveLine = Array.from({ length: 18 }, (_, i) =>
    wave[(i + tick) % wave.length],
  ).join("");

  const rowStyle: ViewStyle = mid
    ? styles.row
    : { ...styles.row, flexDirection: "column" };

  return (
    <View style={styles.root}>
      <View style={rowStyle}>
        {/* Main menu + brand */}
        <TerminalPanel title="Main Menu" style={pane(mid, 1.1, 200)}>
          <View style={styles.brandBlock}>
            <Image
              source={require("../../assets/brand/logo-mark.png")}
              style={styles.logo}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={monoStyle({
                  color: colors.accent,
                  fontWeight: "900",
                  fontSize: 18,
                  letterSpacing: 2,
                  textShadowColor: colors.phosphor,
                  textShadowRadius: 10,
                })}
              >
                NEXUS OS
              </Text>
              <Text style={monoStyle({ color: colors.fgDim, fontSize: 11 })}>
                Your AI Computer. Anywhere.
              </Text>
            </View>
            <Image
              source={require("../../assets/brand/nexus-rabbit-wizard.png")}
              style={styles.mascot}
              resizeMode="contain"
            />
          </View>
          {MENU.map((item) => (
            <Pressable
              key={item.route}
              onPress={() => go(item.route)}
              style={({ pressed }) => [
                styles.menuRow,
                {
                  backgroundColor: pressed ? colors.accent : "transparent",
                },
              ]}
            >
              <Text
                style={monoStyle({
                  color: colors.fg,
                  fontSize: 13,
                  fontWeight: "700",
                })}
              >
                {item.label} [{item.hint}]
              </Text>
            </Pressable>
          ))}
        </TerminalPanel>

        {/* AI Chat preview */}
        <TerminalPanel
          title="AI Chat — local model"
          style={pane(mid, 1.4, 220)}
          onPress={() => go("Chat")}
        >
          <Text style={monoStyle({ color: colors.fgDim, fontSize: 11 })}>
            You &gt; search vault for windows notes
          </Text>
          <Text style={monoStyle({ color: colors.accent, fontSize: 11 })}>
            AI &gt; ✓ Found matching vault docs
          </Text>
          <Text style={monoStyle({ color: colors.fg, fontSize: 11 })}>
            {"  "}• open Chat → Agent for live tools
          </Text>
          <Text style={monoStyle({ color: colors.fg, fontSize: 11 })}>
            {"  "}• Ollama models stay on-device
          </Text>
          <Text
            style={monoStyle({
              color: colors.accent,
              fontSize: 13,
              marginTop: spacing.sm,
            })}
          >
            &gt; _
          </Text>
        </TerminalPanel>

        {/* System monitor */}
        <TerminalPanel title="System Monitor" style={pane(mid, 1, 180)}>
          <Meter label="CPU" value={hints.cpuPct + (tick % 5)} />
          <Meter label="RAM" value={hints.ramPct} />
          <Meter label="Disk" value={hints.diskPct} />
          <Text
            style={monoStyle({
              color: colors.fgDim,
              fontSize: 10,
              marginTop: spacing.sm,
            })}
          >
            Threads: {hints.cores} · Mem {hints.memLabel}
          </Text>
          <Text style={monoStyle({ color: colors.fg, fontSize: 10 })}>
            Mode: Offline-first · Companion
          </Text>
        </TerminalPanel>
      </View>

      <View style={rowStyle}>
        <TerminalPanel
          title="File Manager"
          style={pane(mid, 1.2)}
          onPress={() => go("Files")}
        >
          <Text style={monoStyle({ color: colors.accent, fontSize: 11 })}>
            /Nexus/
          </Text>
          <Text style={monoStyle({ color: colors.fg, fontSize: 11 })}>
            {"  "}📁 AI_Models
          </Text>
          <Text style={monoStyle({ color: colors.fg, fontSize: 11 })}>
            {"  "}📁 Notes
          </Text>
          <Text style={monoStyle({ color: colors.fg, fontSize: 11 })}>
            {"  "}📁 Projects/website
          </Text>
          <Text
            style={monoStyle({
              color: colors.fgDim,
              fontSize: 10,
              marginTop: spacing.sm,
            })}
          >
            F3 View · F5 Seed site · tap to open
          </Text>
        </TerminalPanel>

        <TerminalPanel
          title="Knowledge Vault"
          style={pane(mid, 1)}
          onPress={() => go("Vault")}
        >
          <Text style={monoStyle({ color: colors.fgDim, fontSize: 11 })}>
            Search &gt; your notes
          </Text>
          <Text style={monoStyle({ color: colors.fg, fontSize: 11 })}>
            ▸ offline vault entries
          </Text>
          <Text style={monoStyle({ color: colors.fg, fontSize: 11 })}>
            ▸ pack imports ready
          </Text>
          <Text
            style={monoStyle({
              color: colors.accent,
              fontSize: 11,
              marginTop: spacing.sm,
            })}
          >
            [ open vault ]
          </Text>
        </TerminalPanel>

        <TerminalPanel
          title="Agent-Controller"
          style={pane(mid, 1.1)}
          onPress={() => go("Plugins")}
        >
          <Text
            style={monoStyle({
              color: colors.accent,
              fontSize: 11,
              marginBottom: 4,
            })}
          >
            Available Tools
          </Text>
          {PLUGIN_CATALOG.slice(0, 5).map((p) => (
            <Text
              key={p.id}
              style={monoStyle({ color: colors.fg, fontSize: 11 })}
            >
              · {p.name}
            </Text>
          ))}
          <Text
            style={monoStyle({
              color: colors.accent,
              fontSize: 11,
              marginTop: spacing.sm,
              fontWeight: "800",
            })}
          >
            ● Agent Ready
          </Text>
        </TerminalPanel>

        {wide ? (
          <TerminalPanel title="Signal" style={pane(mid, 0.9, 140)}>
            <Text style={monoStyle({ color: colors.fgDim, fontSize: 10 })}>
              Voice / pulse
            </Text>
            <Text
              style={monoStyle({
                color: colors.accent,
                fontSize: 14,
                marginTop: 6,
              })}
            >
              {waveLine}
            </Text>
            <Text
              style={monoStyle({
                color: colors.fgDim,
                fontSize: 10,
                marginTop: spacing.sm,
              })}
            >
              Listening…
            </Text>
          </TerminalPanel>
        ) : null}
      </View>

      <View style={rowStyle}>
        {wide ? (
          <TerminalPanel title="ASCII Art & Fractals" style={pane(mid, 0.9)}>
            <Text
              style={monoStyle({
                color: colors.accent,
                fontSize: 9,
                lineHeight: 11,
              })}
            >
              {ASCII_FRACTAL}
            </Text>
          </TerminalPanel>
        ) : null}

        <TerminalPanel title="Settings" style={pane(mid, 1.3)}>
          <Text
            style={monoStyle({
              color: colors.fgDim,
              fontSize: 11,
              marginBottom: spacing.sm,
            })}
          >
            Theme · Terminal selected (CRT shell)
          </Text>
          <ThemePicker />
        </TerminalPanel>

        <TerminalPanel title="Welcome" style={pane(mid, 1)}>
          <Text style={monoStyle({ color: colors.fg, fontSize: 12 })}>
            Local AI desk — Chat
            {DESKTOP ? ", Image Lab, Games" : ""}, Vault, Files, and Agent when
            you need tools.
          </Text>
          <Pressable
            onPress={() => go("Chat")}
            style={[
              styles.cta,
              {
                borderColor: colors.accent,
                backgroundColor: colors.accent,
              },
            ]}
          >
            <Text
              style={monoStyle({
                color: colors.bg,
                fontWeight: "900",
                fontSize: 12,
              })}
            >
              Ready when you are… :)
            </Text>
          </Pressable>
          <CheckUpdatesButton
            url={OS_UPDATE_URL}
            label="Website (optional)"
            compact
          />
        </TerminalPanel>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    alignItems: "stretch",
  },
  brandBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  logo: { width: 40, height: 40 },
  mascot: { width: 36, height: 56 },
  menuRow: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  meter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  meterTrack: {
    flex: 1,
    height: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  meterFill: { height: "100%" },
  cta: {
    marginTop: spacing.md,
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
