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
    body: "On desktop, pick Layout → Desk for a multi-window Tri-Cass OS home (menu, chat peek, monitor, files, agent). Classic keeps the familiar single-chat app feel.",
  },
  {
    title: "Themes",
    body: "Basic = clean light. Matrix = neon rain. Lumen = frosted glass. Terminal = sharp CRT panels. Spatial / Open = floating liquid glass on an open canvas (premium desktop look). Pair Terminal or Desk for the CRT vibe; pick Spatial when you want depth and soft light.",
  },
  {
    title: "Browse (desktop)",
    body: "Windows / Mac can open links in a Tri-Cass Browse window styled like your theme. Companion detects Chrome, Edge, Firefox, Safari, Brave, and more so you can also hand off to an installed browser. We do not rebuild a browser — we provide the window chrome and integration.",
  },
  {
    title: "Files & websites",
    body: "Say “make me a website about …” with Agent on. Companion writes website/index.html + CSS in Files. Open the folder anytime to edit.",
  },
  {
    title: "Offline vs website",
    body: "Companion does not need a Tri-Cass cloud account. Chat, Agent, Vault, Files, Games, and themes run on this machine with local Ollama.\n\nThe website link is only for downloads / releases. “Check for updates” and “Downloads” buttons are optional — skip them and keep working offline.\n\nFirst model pull uses Ollama’s library once; after that, AI stays local.",
  },
  {
    title: "FAQ",
    body: "Q: Why is the rabbit digging?\nA: It’s waiting on your local model — with rotating fun facts (toggle Facts off for GIF only).\n\nQ: Android missing Games?\nA: Games and Image Lab stay on desktop/web to keep phones light.\n\nQ: USB kit?\nA: Unzip the kit to a stick; Vault and chats travel with the drive.\n\nQ: Do I need the website while chatting?\nA: No — only if you want a fresh download.",
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
          borderRadius: colors.radius || 0,
          overflow: "hidden",
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
