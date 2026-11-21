import { Text } from "react-native";
import { colors } from "../theme";

const GLYPH: Record<string, string> = {
  Home: "⌂",
  Chat: "⌘",
  Vault: "▣",
  Packs: "⧉",
  Files: "▤",
  About: "◎",
};

export function TabIcon({
  name,
  focused,
}: {
  name: string;
  focused: boolean;
}) {
  return (
    <Text
      style={{
        color: focused ? colors.accent : colors.fgDim,
        fontSize: 16,
        marginBottom: -2,
      }}
    >
      {GLYPH[name] ?? "·"}
    </Text>
  );
}
