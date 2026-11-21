# NEXUS Companion — agent notes

- Expo app for Windows / Mac / Android / iOS. Product positioning for users: a
  real companion app with local AI Chat — do **not** call it “secondary” or a
  “demo” in UI copy.
- Themes: `src/theme/palettes.ts` — `basic` | `matrix` | `lumen` (default lumen).
- Agent: `src/agent/` (schema + tools + runner). Plugins: `src/plugins/`.
  Do **not** call the app “secondary” in UI copy.
- Chat neural path: `src/chat/ollama.ts`. Fallback: `src/chat/tinychat.ts`.
- Premium UI: TypewriterText, StatusOrb, GlassPanel, ProgressRing, AppStatusBar.
- Desktop: Electron proxies Ollama; icons in `assets/brand/icon.{png,ico,icns}`.
- Site: `/download#companion`, `public/guides/companion-agent.md`.
