import { Platform, TextStyle } from "react-native";

/** CRT / terminal monospace stack */
export const monoFont: TextStyle["fontFamily"] = Platform.select({
  ios: "Menlo",
  android: "monospace",
  web: '"IBM Plex Mono", "Courier New", Courier, monospace',
  default: "monospace",
});

export function monoStyle(
  extra?: TextStyle,
): TextStyle {
  return { fontFamily: monoFont, letterSpacing: 0.4, ...extra };
}
