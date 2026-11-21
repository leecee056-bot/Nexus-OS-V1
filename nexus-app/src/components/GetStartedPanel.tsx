import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing, useTheme } from "../theme";
import { monoStyle } from "../theme/fonts";

type Section = { title: string; body: string };

const SECTIONS: Section[] = [
  {
    title: "Quick start",
    body: "1) Install Ollama on this PC.\n2) Open Chat → Model → Get a lightweight model.\n3) Ask anything offline. Toggle Agent when you want Vault, Files, or a website built for you.",
  },
  {
    title: "Chat vs Agent",
    body: "Chat talks straight to your local model.\nAgent can search your Vault, use Add-ons, and write real files (including a website/ folder) when you ask — not when you just say hi.",
  },
  {
    title: "Desk layout",
    body: "On desktop, pick Layout → Desk for a multi-window NEXUS OS home (menu, chat peek, monitor, files, agent). Classic keeps the familiar single-chat app feel.",
  },
  {
    title: "Themes",
    body: "Basic = clean light. Matrix = neon rain. Lumen = frosted glass. Terminal = sharp CRT panels. Pair Terminal or Desk for the full OS vibe.",
  },
  {
    title: "Files & websites",
    body: "Say “make me a website about …” with Agent on. Companion writes website/index.html + CSS in Files. Open the folder anytime to edit.",
  },
  {
    title: "FAQ",
    body: "Q: Why is the rabbit digging?\nA: It’s waiting on your local model — with rotating fun facts (toggle Facts off for GIF only).\n\nQ: Android missing Games?\nA: Games and Image Lab stay on desktop/web to keep phones light.\n\nQ: USB kit?\nA: Unzip the kit to a stick; Vault and chats travel with the drive.",
  },
];

/** Collapsible how-to / FAQ for Companion Home. */
export function GetStartedPanel() {
  const { colors } = useTheme();
  const [open, setOpen] = useState<string | null>("Quick start");

  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: colors.border,
          backgroundColor: colors.glass ? colors.bgGlass : colors.bgElev,
        },
      ]}
    >
      <Text
        style={[
          styles.heading,
          { color: colors.accent },
          colors.mono ? monoStyle({ letterSpacing: 1 }) : null,
        ]}
      >
        Get started
      </Text>
      <Text style={[styles.lede, { color: colors.fgDim }]}>
        How Companion works — tap a row to expand.
      </Text>
      {SECTIONS.map((s) => {
        const isOpen = open === s.title;
        return (
          <View key={s.title} style={[styles.row, { borderColor: colors.border }]}>
            <Pressable
              onPress={() => setOpen(isOpen ? null : s.title)}
              style={styles.head}
            >
              <Text style={{ color: colors.fg, fontWeight: "800", flex: 1 }}>
                {s.title}
              </Text>
              <Text style={{ color: colors.accent, fontWeight: "900" }}>
                {isOpen ? "−" : "+"}
              </Text>
            </Pressable>
            {isOpen ? (
              <Text
                style={[
                  styles.body,
                  { color: colors.fg },
                  colors.mono ? monoStyle({ fontSize: 12 }) : null,
                ]}
              >
                {s.body}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heading: { fontWeight: "900", fontSize: 16, marginBottom: 4 },
  lede: { fontSize: 12, marginBottom: spacing.md },
  row: {
    borderTopWidth: 1,
    paddingVertical: spacing.sm,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  body: { marginTop: spacing.sm, lineHeight: 20, fontSize: 13 },
});
