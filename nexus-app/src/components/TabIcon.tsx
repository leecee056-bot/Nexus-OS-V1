import { Text } from "react-native";
import { useTheme } from "../theme";

const GLYPH: Record<string, string> = {
  Home: "⌂",
  Chat: "⌘",
  Image: "▦",
  Vault: "▣",
  Packs: "⧉",
  Plugins: "⬡",
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
  const { colors } = useTheme();
  return (
    <Text
      style={{
        color: focused ? colors.accent : colors.fgDim,
        fontSize: 16,
        marginBottom: -2,
        textShadowColor: focused ? colors.phosphor : "transparent",
        textShadowRadius: focused ? 6 : 0,
      }}
    >
      {GLYPH[name] ?? "·"}
    </Text>
  );
}
