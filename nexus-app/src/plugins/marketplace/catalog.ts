import type { MarketPage } from "./types";

/** One-click add-ons — mini-apps install into Files; links open official downloads. */
export const MARKET_PAGES: MarketPage[] = [
  {
    id: "everyday",
    title: "Everyday",
    blurb: "Clocks, calculators, and small helpers for daily use.",
    items: [
      { id: "clock", name: "Clock", description: "Live local time and date.", emoji: "🕒", accent: "#9ec5ff", kind: "miniapp", path: "apps/clock/index.html" },
      { id: "calculator", name: "Calculator", description: "Simple on-device calculator.", emoji: "🧮", accent: "#5eead4", kind: "miniapp", path: "apps/calculator/index.html" },
      { id: "timer", name: "Timer", description: "Countdown minutes and seconds.", emoji: "⏳", accent: "#c4b5fd", kind: "miniapp", path: "apps/timer/index.html" },
      { id: "stopwatch", name: "Stopwatch", description: "Lap timer with pause.", emoji: "⏱️", accent: "#fb7185", kind: "miniapp", path: "apps/stopwatch/index.html" },
      { id: "notes", name: "Sticky notes", description: "Quick notes saved in the page.", emoji: "🗒️", accent: "#f5c542", kind: "miniapp", path: "apps/notes/index.html" },
      { id: "units", name: "Unit converter", description: "Length, temperature, mass.", emoji: "📐", accent: "#7dd3fc", kind: "miniapp", path: "apps/units/index.html" },
      { id: "tip", name: "Tip calculator", description: "Bill, tip %, split by people.", emoji: "💸", accent: "#34d399", kind: "miniapp", path: "apps/tip/index.html" },
      { id: "password", name: "Password generator", description: "Random strong passwords.", emoji: "🔐", accent: "#a78bfa", kind: "miniapp", path: "apps/password/index.html" },
      { id: "colors", name: "Color picker", description: "Pick a color and copy RGB.", emoji: "🎨", accent: "#f472b6", kind: "miniapp", path: "apps/colors/index.html" },
      { id: "checklist", name: "Checklist", description: "Tap-done list that persists.", emoji: "✅", accent: "#38bdf8", kind: "miniapp", path: "apps/checklist/index.html" },
      { id: "worldclock", name: "World clocks", description: "Several time zones at a glance.", emoji: "🌍", accent: "#818cf8", kind: "miniapp", path: "apps/worldclock/index.html" },
      { id: "pomodoro", name: "Pomodoro", description: "Focus 25 / break 5 sessions.", emoji: "🍅", accent: "#fb923c", kind: "miniapp", path: "apps/pomodoro/index.html" },
    ],
  },
  {
    id: "coding",
    title: "Coding",
    blurb: "Formatters, sandboxes, and developer scratch pads.",
    items: [
      { id: "jsonfmt", name: "JSON formatter", description: "Pretty-print or minify JSON.", emoji: "{ }", accent: "#22d3ee", kind: "miniapp", path: "apps/jsonfmt/index.html" },
      { id: "regex", name: "Regex tester", description: "Try patterns against sample text.", emoji: ".*", accent: "#e879f9", kind: "miniapp", path: "apps/regex/index.html" },
      { id: "base64", name: "Base64", description: "Encode and decode strings.", emoji: "64", accent: "#67e8f9", kind: "miniapp", path: "apps/base64/index.html" },
      { id: "uuid", name: "UUID generator", description: "Create random UUIDs.", emoji: "🆔", accent: "#a3e635", kind: "miniapp", path: "apps/uuid/index.html" },
      { id: "markdown", name: "Markdown preview", description: "Lightweight MD → HTML preview.", emoji: "MD", accent: "#94a3b8", kind: "miniapp", path: "apps/markdown/index.html" },
      { id: "htmlpad", name: "HTML sandbox", description: "Edit HTML and preview live.", emoji: "</>", accent: "#fbbf24", kind: "miniapp", path: "apps/htmlpad/index.html" },
      { id: "hash", name: "SHA-256", description: "Hash text in the browser.", emoji: "#", accent: "#2dd4bf", kind: "miniapp", path: "apps/hash/index.html" },
      { id: "diff", name: "Text diff", description: "Line compare two snippets.", emoji: "±", accent: "#f87171", kind: "miniapp", path: "apps/diff/index.html" },
      { id: "jwt", name: "JWT decode", description: "Inspect header + payload.", emoji: "🔑", accent: "#c084fc", kind: "miniapp", path: "apps/jwt/index.html" },
      { id: "cron", name: "Cron cheat sheet", description: "Quick cron field reminder.", emoji: "⏰", accent: "#4ade80", kind: "miniapp", path: "apps/cron/index.html" },
      { id: "sqlpad", name: "SQL scratch", description: "Draft queries offline.", emoji: "SQL", accent: "#60a5fa", kind: "miniapp", path: "apps/sqlpad/index.html" },
      { id: "hex", name: "Hex ↔ RGB", description: "Convert color codes.", emoji: "🎛", accent: "#f472b6", kind: "miniapp", path: "apps/hex/index.html" },
    ],
  },
  {
    id: "media",
    title: "Media & fun",
    blurb: "Light creative toys and practice tools.",
    items: [
      { id: "draw", name: "Drawing pad", description: "Sketch with mouse or touch.", emoji: "✏️", accent: "#fbbf24", kind: "miniapp", path: "apps/draw/index.html" },
      { id: "metronome", name: "Metronome", description: "Click track with BPM control.", emoji: "🎵", accent: "#fb7185", kind: "miniapp", path: "apps/metronome/index.html" },
      { id: "dice", name: "Dice", description: "Roll d6, d20, or d100.", emoji: "🎲", accent: "#34d399", kind: "miniapp", path: "apps/dice/index.html" },
      { id: "typing", name: "Typing test", description: "WPM and accuracy check.", emoji: "⌨️", accent: "#38bdf8", kind: "miniapp", path: "apps/typing/index.html" },
      { id: "pixel", name: "Pixel pad", description: "16×16 pixel doodle.", emoji: "🟪", accent: "#a78bfa", kind: "miniapp", path: "apps/pixel/index.html" },
      { id: "ascii", name: "ASCII banner", description: "Tiny block-letter banners.", emoji: "🔤", accent: "#94a3b8", kind: "miniapp", path: "apps/ascii/index.html" },
      { id: "flashcards", name: "Flashcards", description: "Flip cards for quick drills.", emoji: "🃏", accent: "#f472b6", kind: "miniapp", path: "apps/flashcards/index.html" },
      { id: "soundboard", name: "Tone pad", description: "Eight soft synth notes.", emoji: "🎶", accent: "#f59e0b", kind: "miniapp", path: "apps/soundboard/index.html" },
      { id: "particles", name: "Particle toy", description: "Calm bouncing dots.", emoji: "✨", accent: "#67e8f9", kind: "miniapp", path: "apps/particles/index.html" },
      { id: "emoji", name: "Emoji board", description: "Tap to build an emoji string.", emoji: "😎", accent: "#facc15", kind: "miniapp", path: "apps/emoji/index.html" },
      {
        id: "vscode",
        name: "VS Code",
        description: "Official editor download page (opens Browse / browser).",
        emoji: "💻",
        accent: "#0078d4",
        kind: "link",
        url: "https://code.visualstudio.com/Download",
      },
      {
        id: "godot",
        name: "Godot Engine",
        description: "Open-source game engine downloads.",
        emoji: "🎮",
        accent: "#478cbf",
        kind: "link",
        url: "https://godotengine.org/download",
      },
    ],
  },
  {
    id: "study",
    title: "Study & office",
    blurb: "Notes, tables, and light planning helpers.",
    items: [
      { id: "kanban", name: "Kanban lite", description: "Todo → Doing → Done cards.", emoji: "📋", accent: "#818cf8", kind: "miniapp", path: "apps/kanban/index.html" },
      { id: "csv", name: "CSV viewer", description: "Paste CSV into a table.", emoji: "📊", accent: "#4ade80", kind: "miniapp", path: "apps/csv/index.html" },
      { id: "glossary", name: "Glossary", description: "Searchable NEXUS terms.", emoji: "📖", accent: "#c4b5fd", kind: "miniapp", path: "apps/glossary/index.html" },
      { id: "meeting", name: "Meeting notes", description: "Agenda and action template.", emoji: "📝", accent: "#fb923c", kind: "miniapp", path: "apps/meeting/index.html" },
      { id: "resume", name: "Resume outline", description: "Starter resume markdown.", emoji: "🧾", accent: "#38bdf8", kind: "miniapp", path: "apps/resume/index.html" },
      { id: "mindmap", name: "Mind map list", description: "Root idea with branches.", emoji: "🧠", accent: "#f472b6", kind: "miniapp", path: "apps/mindmap/index.html" },
      { id: "readtimer", name: "Reading timer", description: "Estimate time from pages.", emoji: "📚", accent: "#2dd4bf", kind: "miniapp", path: "apps/readtimer/index.html" },
      { id: "cite", name: "Citation helper", description: "Quick author-year-title line.", emoji: "📎", accent: "#a3e635", kind: "miniapp", path: "apps/cite/index.html" },
      { id: "drill", name: "Quick drill", description: "Short Q&A practice set.", emoji: "🎯", accent: "#f87171", kind: "miniapp", path: "apps/drill/index.html" },
      { id: "sheet", name: "Mini sheet", description: "Nine cells with sum / avg.", emoji: "▦", accent: "#4ade80", kind: "miniapp", path: "apps/sheet/index.html" },
      {
        id: "libreoffice",
        name: "LibreOffice",
        description: "Free office suite download page.",
        emoji: "📄",
        accent: "#18A303",
        kind: "link",
        url: "https://www.libreoffice.org/download/download-libreoffice/",
      },
      {
        id: "obsidian",
        name: "Obsidian",
        description: "Markdown knowledge-base app download.",
        emoji: "🪨",
        accent: "#7c3aed",
        kind: "link",
        url: "https://obsidian.md/download",
      },
    ],
  },
];

export function marketItemById(id: string) {
  for (const page of MARKET_PAGES) {
    const hit = page.items.find((i) => i.id === id);
    if (hit) return hit;
  }
  return undefined;
}
