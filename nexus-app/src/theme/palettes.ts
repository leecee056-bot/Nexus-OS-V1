export type ThemeId = "basic" | "matrix" | "lumen" | "terminal";

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
  /** Multi-panel CRT shell inspired by classic NEXUS OS mockups */
  terminalShell: boolean;
  mono: boolean;
};

/** Site-like clean light theme */
export const BASIC: ThemeColors = {
  id: "basic",
  label: "Basic",
  blurb: "Clean light UI — same spirit as the website Basic theme.",
  bg: "#f4f7f4",
  bgElev: "#ffffff",
  bgBar: "#e8efe8",
  bgGlass: "rgba(255,255,255,0.86)",
  fg: "#142214",
  fgDim: "#4a6a4a",
  accent: "#1a7a28",
  accentSoft: "rgba(26,122,40,0.12)",
  purple: "#5b2db0",
  purpleSoft: "rgba(91,45,176,0.12)",
  danger: "#c0392b",
  border: "rgba(20,50,20,0.16)",
  edgeGlow: "rgba(26,122,40,0.35)",
  phosphor: "#1a7a28",
  scanline: "rgba(0,0,0,0.04)",
  statusBar: "#dfe8df",
  rain: false,
  glass: false,
  terminalShell: false,
  mono: false,
};

/** Classic NEXUS matrix (existing companion look) */
export const MATRIX: ThemeColors = {
  id: "matrix",
  label: "Matrix",
  blurb: "Classic neon green terminal vibe.",
  bg: "#040804",
  bgElev: "#0a120a",
  bgBar: "#0d1a0d",
  bgGlass: "rgba(10,18,10,0.88)",
  fg: "#b6ffb6",
  fgDim: "#5f9a5f",
  accent: "#39ff14",
  accentSoft: "rgba(57,255,20,0.18)",
  purple: "#7b3fe4",
  purpleSoft: "rgba(123,63,228,0.22)",
  danger: "#ff6b6b",
  border: "rgba(57,255,20,0.28)",
  edgeGlow: "rgba(57,255,20,0.55)",
  phosphor: "#39ff14",
  scanline: "rgba(57,255,20,0.06)",
  statusBar: "#071207",
  rain: true,
  glass: false,
  terminalShell: false,
  mono: false,
};

/** Premium frosted glass + soft phosphor (new upgraded look) */
export const LUMEN: ThemeColors = {
  id: "lumen",
  label: "Lumen",
  blurb: "Frosted glass panels, soft edge light, premium NEXUS glow.",
  bg: "#030605",
  bgElev: "#0b1410",
  bgBar: "#08110c",
  bgGlass: "rgba(12,28,18,0.55)",
  fg: "#d8ffe0",
  fgDim: "#6eab7a",
  accent: "#4dff6a",
  accentSoft: "rgba(77,255,106,0.16)",
  purple: "#9b6cff",
  purpleSoft: "rgba(155,108,255,0.2)",
  danger: "#ff7a8a",
  border: "rgba(77,255,106,0.22)",
  edgeGlow: "rgba(77,255,106,0.65)",
  phosphor: "#7dff9a",
  scanline: "rgba(120,255,160,0.045)",
  statusBar: "rgba(6,14,10,0.92)",
  rain: true,
  glass: true,
  terminalShell: false,
  mono: false,
};

/**
 * CRT “NEXUS OS” terminal — sharp panels, phosphor green, dashboard home.
 * Inspired by the portable local-intelligence mockup; uses the real logo mark.
 */
export const TERMINAL: ThemeColors = {
  id: "terminal",
  label: "Terminal",
  blurb:
    "NEXUS OS CRT shell — multi-panel dashboard, mono type, scanlines, real logo.",
  bg: "#000000",
  bgElev: "#020802",
  bgBar: "#001400",
  bgGlass: "rgba(0,20,0,0.92)",
  fg: "#33ff66",
  fgDim: "#1a9940",
  accent: "#00ff41",
  accentSoft: "rgba(0,255,65,0.22)",
  purple: "#66ff99",
  purpleSoft: "rgba(102,255,153,0.14)",
  danger: "#ff4444",
  border: "rgba(0,255,65,0.55)",
  edgeGlow: "rgba(0,255,65,0.75)",
  phosphor: "#00ff41",
  scanline: "rgba(0,255,65,0.09)",
  statusBar: "#001000",
  rain: true,
  glass: false,
  terminalShell: true,
  mono: true,
};

export const THEMES: Record<ThemeId, ThemeColors> = {
  basic: BASIC,
  matrix: MATRIX,
  lumen: LUMEN,
  terminal: TERMINAL,
};

export const THEME_ORDER: ThemeId[] = ["basic", "matrix", "lumen", "terminal"];
export const DEFAULT_THEME: ThemeId = "lumen";
