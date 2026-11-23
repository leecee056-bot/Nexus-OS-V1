export type ThemeId =
  | "basic"
  | "matrix"
  | "lumen"
  | "terminal"
  | "spatial";

export type ThemeColors = {
  id: ThemeId;
  label: string;
  blurb: string;
  bg: string;
  bgElev: string;
  bgBar: string;
  bgGlass: string;
  fg: string;
  fgDim: string;
  accent: string;
  accentSoft: string;
  purple: string;
  purpleSoft: string;
  danger: string;
  border: string;
  edgeGlow: string;
  phosphor: string;
  scanline: string;
  statusBar: string;
  rain: boolean;
  glass: boolean;
  /** Multi-panel CRT shell inspired by classic Tri-Cass OS mockups */
  terminalShell: boolean;
  /** Open canvas — floating glass, depth, soft light (desktop-first) */
  spatialShell: boolean;
  mono: boolean;
  /** Corner radius hint for panels (web/desktop) */
  radius: number;
};

/** Clean paper / ink — deliberately not neon. */
export const BASIC: ThemeColors = {
  id: "basic",
  label: "Basic",
  blurb: "Paper-light workspace — calm ink, soft sage accents.",
  bg: "#f7f5f0",
  bgElev: "#ffffff",
  bgBar: "#ebe6dc",
  bgGlass: "rgba(255,255,255,0.92)",
  fg: "#1c241c",
  fgDim: "#5a6558",
  accent: "#2f6b3a",
  accentSoft: "rgba(47,107,58,0.1)",
  purple: "#5a3d8c",
  purpleSoft: "rgba(90,61,140,0.1)",
  danger: "#b33a2b",
  border: "rgba(28,36,28,0.12)",
  edgeGlow: "rgba(47,107,58,0.25)",
  phosphor: "#2f6b3a",
  scanline: "rgba(0,0,0,0.03)",
  statusBar: "#e4dfd4",
  rain: false,
  glass: false,
  terminalShell: false,
  spatialShell: false,
  mono: false,
  radius: 8,
};

/** Classic hard neon rain — denser green, sharper contrast. */
export const MATRIX: ThemeColors = {
  id: "matrix",
  label: "Matrix",
  blurb: "Hard neon rain — high-contrast green phosphor.",
  bg: "#010401",
  bgElev: "#071007",
  bgBar: "#0a160a",
  bgGlass: "rgba(6,16,6,0.9)",
  fg: "#d6ffd6",
  fgDim: "#7ec87e",
  accent: "#2dff12",
  accentSoft: "rgba(45,255,18,0.14)",
  purple: "#a855f7",
  purpleSoft: "rgba(168,85,247,0.18)",
  danger: "#ff5555",
  border: "rgba(45,255,18,0.32)",
  edgeGlow: "rgba(45,255,18,0.7)",
  phosphor: "#2dff12",
  scanline: "rgba(45,255,18,0.07)",
  statusBar: "#040a04",
  rain: true,
  glass: false,
  terminalShell: false,
  spatialShell: false,
  mono: false,
  radius: 4,
};

/** Soft teal glass — premium, less “matrix clone”. */
export const LUMEN: ThemeColors = {
  id: "lumen",
  label: "Lumen",
  blurb: "Frosted teal glass, soft bloom, quieter glow.",
  bg: "#050a0c",
  bgElev: "#0c1618",
  bgBar: "#091214",
  bgGlass: "rgba(14,36,40,0.5)",
  fg: "#eefaf7",
  fgDim: "#9bc4bf",
  accent: "#5eead4",
  accentSoft: "rgba(94,234,212,0.14)",
  purple: "#c4b5fd",
  purpleSoft: "rgba(196,181,253,0.16)",
  danger: "#fb7185",
  border: "rgba(94,234,212,0.2)",
  edgeGlow: "rgba(94,234,212,0.55)",
  phosphor: "#99f6e4",
  scanline: "rgba(150,240,230,0.04)",
  statusBar: "rgba(6,14,16,0.94)",
  rain: true,
  glass: true,
  terminalShell: false,
  spatialShell: false,
  mono: false,
  radius: 12,
};

/**
 * CRT “Tri-Cass OS” terminal — sharp panels, phosphor green, dashboard home.
 * Inspired by the portable local-intelligence mockup; uses the real logo mark.
 */
export const TERMINAL: ThemeColors = {
  id: "terminal",
  label: "Terminal",
  blurb:
    "Tri-Cass OS CRT — tiled windows, mono type, scanlines, real logo mark.",
  bg: "#000000",
  bgElev: "#010901",
  bgBar: "#001200",
  bgGlass: "rgba(0,18,0,0.94)",
  fg: "#5dff8a",
  fgDim: "#2db85a",
  accent: "#00ff41",
  accentSoft: "rgba(0,255,65,0.18)",
  purple: "#7CFFB2",
  purpleSoft: "rgba(124,255,178,0.12)",
  danger: "#ff3b3b",
  border: "rgba(0,255,65,0.62)",
  edgeGlow: "rgba(0,255,65,0.85)",
  phosphor: "#00ff41",
  scanline: "rgba(0,255,65,0.1)",
  statusBar: "#000e00",
  rain: true,
  glass: false,
  terminalShell: true,
  spatialShell: false,
  mono: true,
  radius: 0,
};

/**
 * Spatial / Open — optional premium desktop theme.
 * Calm dark open canvas, floating liquid-glass panels, soft depth lighting.
 */
export const SPATIAL: ThemeColors = {
  id: "spatial",
  label: "Spatial / Open",
  blurb:
    "Open canvas with floating liquid glass — depth, soft light, spatial feel (desktop).",
  bg: "#07080e",
  bgElev: "rgba(22, 26, 38, 0.72)",
  bgBar: "rgba(12, 14, 22, 0.78)",
  bgGlass: "rgba(255, 255, 255, 0.07)",
  fg: "#f4f6ff",
  fgDim: "#b4bce0",
  accent: "#9ec5ff",
  accentSoft: "rgba(158, 197, 255, 0.16)",
  purple: "#c4b5fd",
  purpleSoft: "rgba(196, 181, 253, 0.14)",
  danger: "#fb7185",
  border: "rgba(255, 255, 255, 0.14)",
  edgeGlow: "rgba(158, 197, 255, 0.45)",
  phosphor: "#c7d7ff",
  scanline: "rgba(255,255,255,0.02)",
  statusBar: "rgba(8, 10, 18, 0.88)",
  rain: false,
  glass: true,
  terminalShell: false,
  spatialShell: true,
  mono: false,
  radius: 22,
};

export const THEMES: Record<ThemeId, ThemeColors> = {
  basic: BASIC,
  matrix: MATRIX,
  lumen: LUMEN,
  terminal: TERMINAL,
  spatial: SPATIAL,
};

export const THEME_ORDER: ThemeId[] = [
  "basic",
  "matrix",
  "lumen",
  "terminal",
  "spatial",
];
export const DEFAULT_THEME: ThemeId = "lumen";
