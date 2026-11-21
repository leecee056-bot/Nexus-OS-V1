# NEXUS Companion — agent notes

- Expo app for Windows / Mac / Android / iOS. Product positioning for users: a
  real companion app with local AI Chat — do **not** call it “secondary” or a
  “demo” in UI copy.
- Themes: `src/theme/palettes.ts` — `basic` | `matrix` | `lumen` (default lumen).
  Persist via ThemeProvider; desktop rail + About ThemePicker; optional scanlines.
- Chat neural path: `src/chat/ollama.ts` + model catalog `src/chat/models.ts`.
  Phrase fallback only when Ollama/model missing: `src/chat/tinychat.ts`.
- Premium UI: TypewriterText, StatusOrb, GlassPanel, ProgressRing, AppStatusBar.
- Desktop: Electron (`electron/main.js` + `preload.js`) proxies Ollama to avoid
  CORS; icons in `assets/brand/icon.{png,ico,icns}`.
- Phone bottom tabs / tablet side rail in `App.tsx` + `src/layout.ts`.
- Site: `/download#companion`, `public/guides/companion-app.md`.
