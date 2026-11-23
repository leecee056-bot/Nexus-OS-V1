import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  importHostToUsb,
  listUsbKnowledge,
  loadPortableInfo,
  openUsbPath,
  type PortableInfo,
} from "../portable/info";
import { GlassPanel } from "./GlassPanel";
import { spacing, useTheme } from "../theme";

/** Shown on desktop when running from a Tri-Cass USB kit. */
export function PortableUsbPanel() {
  const { colors } = useTheme();
  const [info, setInfo] = useState<PortableInfo | null>(null);
  const [entries, setEntries] = useState<{ name: string; kind: string }[]>([]);
  const [note, setNote] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const p = await loadPortableInfo();
    setInfo(p);
    if (p.portable) {
      const listed = await listUsbKnowledge();
      setEntries(listed.entries || []);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  if (!info?.portable) return null;

  return (
    <GlassPanel title="USB portable kit" accent="purple">
      <Text style={{ color: colors.fg, lineHeight: 20 }}>
        Settings, Vault, chats, and Files travel with this drive. Unplug and
        take your personal offline setup to another PC.
      </Text>
      {info.kitRoot ? (
        <Text
          style={{
            color: colors.fgDim,
            fontSize: 11,
            marginTop: spacing.sm,
          }}
          numberOfLines={2}
        >
          Kit: {info.kitRoot}
        </Text>
      ) : null}

      {entries.length > 0 ? (
        <View style={{ marginTop: spacing.sm }}>
          <Text style={{ color: colors.accent, fontWeight: "700" }}>
            Knowledge on this USB
          </Text>
          {entries.slice(0, 8).map((e) => (
            <Text
              key={e.name}
              style={{ color: colors.fgDim, fontSize: 12, marginTop: 2 }}
            >
              {e.kind === "folder" ? "📁" : "📄"} {e.name}
            </Text>
          ))}
        </View>
      ) : (
        <Text
          style={{ color: colors.fgDim, marginTop: spacing.sm, fontSize: 12 }}
        >
          Knowledge/ is empty — add notes or copy folders from this PC.
        </Text>
      )}

      <View style={styles.row}>
        <Pressable
          style={[
            styles.btn,
            {
              borderColor: colors.accent,
              backgroundColor: colors.accentSoft,
            },
          ]}
          onPress={() =>
            void (async () => {
              const r = await importHostToUsb();
              if (r.canceled) return;
              if (!r.ok) {
                setNote(r.error || "Import failed");
                return;
              }
              setNote(
                `Added ${(r.copied || []).join(", ")} → Knowledge on USB`,
              );
              await refresh();
            })()
          }
        >
          <Text style={{ color: colors.accent, fontWeight: "800" }}>
            Add from this PC
          </Text>
        </Pressable>
        {info.knowledgeDir ? (
          <Pressable
            style={[styles.btn, { borderColor: colors.border }]}
            onPress={() => void openUsbPath(info.knowledgeDir!)}
          >
            <Text style={{ color: colors.fg, fontWeight: "700" }}>
              Open Knowledge
            </Text>
          </Pressable>
        ) : null}
        {info.filesDir ? (
          <Pressable
            style={[styles.btn, { borderColor: colors.border }]}
            onPress={() => void openUsbPath(info.filesDir!)}
          >
            <Text style={{ color: colors.fg, fontWeight: "700" }}>
              Open Files
            </Text>
          </Pressable>
        ) : null}
      </View>
      {note ? (
        <Text style={{ color: colors.fgDim, marginTop: spacing.sm, fontSize: 12 }}>
          {note}
        </Text>
      ) : null}
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  btn: {
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
