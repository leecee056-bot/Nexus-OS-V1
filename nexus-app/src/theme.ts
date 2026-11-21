/** Compat re-exports — prefer useTheme() for live palette. */
export { MATRIX as colors } from "./theme/palettes";
export type { ThemeId, ThemeColors } from "./theme/palettes";
export { THEMES, THEME_ORDER, DEFAULT_THEME } from "./theme/palettes";
export { ThemeProvider, useTheme } from "./theme/ThemeContext";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;
