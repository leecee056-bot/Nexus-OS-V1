import { Platform, TextStyle } from "react-native";
import type { ThemeId } from "./palettes";

/** CRT / terminal monospace stack */
export const monoFont: TextStyle["fontFamily"] = Platform.select({
  ios: "Menlo",
  android: "monospace",
  web: '"IBM Plex Mono", "Courier New", Courier, monospace',
  default: "monospace",
});

/** Readable UI sans — used by Basic / Lumen / Spatial */
export const uiSansFont: TextStyle["fontFamily"] = Platform.select({
  ios: "System",
  android: "sans-serif",
  web: '"Source Sans 3", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  default: "System",
});

/** Soft display for Spatial / Lumen headings */
export const displayFont: TextStyle["fontFamily"] = Platform.select({
  ios: "Georgia",
  android: "serif",
  web: '"Fraunces", "Iowan Old Style", Georgia, serif',
  default: "serif",
});

/** Hard neon Matrix headings */
export const matrixFont: TextStyle["fontFamily"] = Platform.select({
  ios: "Menlo",
  android: "monospace",
  web: '"Share Tech Mono", "IBM Plex Mono", monospace',
  default: "monospace",
});

export function monoStyle(extra?: TextStyle): TextStyle {
  return { fontFamily: monoFont, letterSpacing: 0.4, ...extra };
}

/** Body / UI text font for the active theme */
export function themeBodyFont(themeId: ThemeId): TextStyle["fontFamily"] {
  if (themeId === "terminal" || themeId === "matrix") return monoFont;
  return uiSansFont;
}

/** Title / hero font for the active theme */
export function themeTitleFont(themeId: ThemeId): TextStyle["fontFamily"] {
  if (themeId === "terminal" || themeId === "matrix") return matrixFont;
  if (themeId === "spatial" || themeId === "lumen") return displayFont;
  return uiSansFont;
}

export function themeBodyStyle(
  themeId: ThemeId,
  extra?: TextStyle,
): TextStyle {
  return {
    fontFamily: themeBodyFont(themeId),
    letterSpacing: themeId === "terminal" ? 0.35 : 0.15,
    ...extra,
  };
}

export function themeTitleStyle(
  themeId: ThemeId,
  extra?: TextStyle,
): TextStyle {
  return {
    fontFamily: themeTitleFont(themeId),
    letterSpacing: themeId === "terminal" ? 1 : 0.2,
    fontWeight: "700",
    ...extra,
  };
}
