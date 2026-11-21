# NEXUS Companion — agent notes

- Expo app for Windows / Mac / Android / iOS. Product positioning for users: a
  real companion app with local AI Chat — do **not** call it “secondary” or a
  “demo” in UI copy.
- Themes: `src/theme/palettes.ts` — `basic` | `matrix` | `lumen` | `terminal`
  (default lumen). Terminal enables CRT multi-panel Home + scanlines.
- Agent: `src/agent/` (schema + tools + runner). Plugins: `src/plugins/`.
  Do **not** call the app “secondary” in UI copy.
- Chat neural path: `src/chat/ollama.ts`. Fallback: `src/chat/tinychat.ts`.
- Image Lab (desktop/web): `src/image/` + `ImageScreen` — Ollama image models;
  Save PNG via Electron `nexus:save-image`. Guide: companion-image.md.
- Games (desktop/web): `src/games/` + `GamesScreen` — Chess + tiny pure-JS 2D
  extras; one mount at a time. Guide: companion-games.md.
- Updates: `src/updates/links.ts` + `CheckUpdatesButton` — manual curated links.
- Premium UI: TypewriterText, StatusOrb, GlassPanel, ProgressRing, AppStatusBar,
  TerminalDashboard / TerminalTitleBar for the Terminal theme.
- Chat wait state: `GraftingIndicator` + `assets/brand/rabbit-grafting.gif`
  (looping rabbit dig — label “grafting… Ns”, never “thinking”).
- USB portable: `electron/portable.js` redirects userData to kit `Data/`;
  kit template in `usb-kit/`; pack with `npm run pack:usb`. Guide:
  companion-usb.md. Chat history persists via `src/chat/history.ts`.
- Desktop: Electron proxies Ollama; icons in `assets/brand/icon.{png,ico,icns}`.
- Site: `/download#companion`, `/download#companion-usb`,
  `public/guides/companion-agent.md`, `companion-image.md`,
  `companion-updates.md`, `companion-usb.md`.
