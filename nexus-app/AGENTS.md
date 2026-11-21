# NEXUS Companion — agent notes

- Expo app for Windows / Mac / Android / iOS. Product positioning for users: a
  real companion app with local AI Chat — do **not** call it “secondary” or a
  “demo” in UI copy.
- Themes: `src/theme/palettes.ts` — `basic` | `matrix` | `lumen` | `terminal` |
  `spatial` (default lumen). Terminal enables CRT multi-panel Home + scanlines.
  Spatial / Open: floating liquid glass (`spatialShell`), `SpatialAtmosphere`,
  `FloatIn` entrances — desktop-first premium canvas.
- Agent: `src/agent/` (schema + tools + runner). Plugins: `src/plugins/`.
  Do **not** call the app “secondary” in UI copy.
- Chat neural path: `src/chat/ollama.ts`. Fallback: `src/chat/tinychat.ts`.
- Image Lab (desktop/web): `src/image/` + `ImageScreen` — Ollama image models;
  Save PNG via Electron `nexus:save-image`. Guide: companion-image.md.
- Games (desktop/web): `src/games/` + `GamesScreen` — Chess + tiny pure-JS 2D
  extras; one mount at a time. Guide: companion-games.md.
- Android APK: `npm run android:apk` (local Gradle via `scripts/build-android-apk.sh`);
  CI job `android-apk` on `companion-v*` tags. Optional EAS: `npm run android:apk:eas`.
- Updates: `src/updates/links.ts` + `CheckUpdatesButton` — manual curated links.
- Premium UI: TypewriterText, StatusOrb, GlassPanel, ProgressRing, AppStatusBar,
  TerminalDashboard / TerminalTitleBar for the Terminal theme.
- Chat wait state: `WaitIndicator` + `assets/brand/rabbit-dig.gif` (small side
  rabbit + rotating fun facts; Facts off = GIF only). Layout: Classic vs Desk
  (`ShellModePicker` / `layout/shellMode.ts`).
- Offline-first: no NEXUS cloud API at runtime. Website links are optional
  downloads only (`updates/links.ts`, `OfflineGuidesPanel`, `offline/guides.ts`).
- Web deep links: `#Chat`, `#About`, … set the initial tab (`App.tsx`).
- USB portable: `electron/portable.js` redirects userData to kit `Data/`;
  kit template in `usb-kit/`; pack with `npm run pack:usb`. Guide:
  companion-usb.md. Chat history persists via `src/chat/history.ts`.
- Desktop: Electron proxies Ollama; icons in `assets/brand/icon.{png,ico,icns}`.
  `electron-builder.yml` must ship **all** of `electron/**/*` (Browse +
  `desktop-launcher.js`). Windows targets: `nsis` setup (Desktop + Start Menu
  shortcuts) and `portable`. In-app **Add to Desktop** via
  `nexus:add-to-desktop` / `DesktopLauncherPanel`.
- Browse (desktop): `electron/browsers.js` + `browse-shell.html` + BrowserView;
  UI `BrowsePanel` / `src/browse/api.ts`. Guide: companion-browse.md.
- Add-ons marketplace: `src/plugins/marketplace/` — pages of one-click mini
  apps installed into Files (`apps/…`) plus a few official download links.
  UI on PluginsScreen. Guide: companion-addons.md.
- Site: `/download#companion`, `/download#companion-usb`,
  `public/guides/companion-agent.md`, `companion-image.md`,
  `companion-updates.md`, `companion-usb.md`, `companion-browse.md`.
