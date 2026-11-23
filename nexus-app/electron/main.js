/**
 * Desktop shell for Tri-Cass Companion (Windows · macOS).
 * Portable USB mode: settings / Vault / chats live under the kit Data/ folder.
 * Browse + desktop launcher helpers are inlined here so packaging cannot
 * omit a sibling require() and crash the main process.
 */
const {
  app,
  BrowserWindow,
  BrowserView,
  ipcMain,
  shell,
  nativeImage,
  dialog,
} = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { applyPortablePaths, ensureDir } = require("./portable");

const APP_VERSION = (() => {
  try {
    return require("../package.json").version || "0.12.4";
  } catch {
    return "0.12.4";
  }
})();

/** Must run before ready — redirects userData onto the USB kit. */
const portableInfo = applyPortablePaths(app);

const isDev = !app.isPackaged;
const startUrl =
  process.env.TRICASS_APP_URL || process.env.NEXUS_APP_URL ||
  (isDev ? "http://127.0.0.1:8081" : null);

const iconPath = path.join(__dirname, "..", "assets", "brand", "icon.png");
const iconIcoPath = path.join(__dirname, "..", "assets", "brand", "icon.ico");

function resolveIcon() {
  if (fs.existsSync(iconPath)) {
    return nativeImage.createFromPath(iconPath);
  }
  return undefined;
}

function fileExists(p) {
  try {
    return Boolean(p) && fs.existsSync(p);
  } catch {
    return false;
  }
}

/* ─── Browser detection (inlined) ───────────────────────────────────── */

function winBrowserCandidates() {
  const local = process.env.LOCALAPPDATA || "";
  const pf = process.env.PROGRAMFILES || "C:\\Program Files";
  const pf86 = process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)";
  return [
    {
      id: "edge",
      name: "Microsoft Edge",
      paths: [
        path.join(pf, "Microsoft", "Edge", "Application", "msedge.exe"),
        path.join(pf86, "Microsoft", "Edge", "Application", "msedge.exe"),
      ],
      appMode: true,
    },
    {
      id: "chrome",
      name: "Google Chrome",
      paths: [
        path.join(pf, "Google", "Chrome", "Application", "chrome.exe"),
        path.join(pf86, "Google", "Chrome", "Application", "chrome.exe"),
        path.join(local, "Google", "Chrome", "Application", "chrome.exe"),
      ],
      appMode: true,
    },
    {
      id: "brave",
      name: "Brave",
      paths: [
        path.join(
          pf,
          "BraveSoftware",
          "Brave-Browser",
          "Application",
          "brave.exe",
        ),
        path.join(
          local,
          "BraveSoftware",
          "Brave-Browser",
          "Application",
          "brave.exe",
        ),
      ],
      appMode: true,
    },
    {
      id: "firefox",
      name: "Mozilla Firefox",
      paths: [
        path.join(pf, "Mozilla Firefox", "firefox.exe"),
        path.join(pf86, "Mozilla Firefox", "firefox.exe"),
      ],
      appMode: false,
    },
    {
      id: "opera",
      name: "Opera",
      paths: [
        path.join(pf, "Opera", "opera.exe"),
        path.join(local, "Programs", "Opera", "opera.exe"),
      ],
      appMode: true,
    },
  ];
}

function macBrowserCandidates() {
  return [
    {
      id: "safari",
      name: "Safari",
      paths: ["/Applications/Safari.app"],
      appMode: false,
    },
    {
      id: "chrome",
      name: "Google Chrome",
      paths: ["/Applications/Google Chrome.app"],
      appMode: true,
    },
    {
      id: "edge",
      name: "Microsoft Edge",
      paths: ["/Applications/Microsoft Edge.app"],
      appMode: true,
    },
    {
      id: "brave",
      name: "Brave",
      paths: ["/Applications/Brave Browser.app"],
      appMode: true,
    },
    {
      id: "firefox",
      name: "Mozilla Firefox",
      paths: ["/Applications/Firefox.app"],
      appMode: false,
    },
    {
      id: "opera",
      name: "Opera",
      paths: ["/Applications/Opera.app"],
      appMode: true,
    },
  ];
}

function detectBrowsers() {
  const list =
    process.platform === "darwin"
      ? macBrowserCandidates()
      : process.platform === "win32"
        ? winBrowserCandidates()
        : [];
  const found = [];
  for (const c of list) {
    const hit = c.paths.find(fileExists);
    if (hit) {
      found.push({
        id: c.id,
        name: c.name,
        path: hit,
        appMode: Boolean(c.appMode),
      });
    }
  }
  return found;
}

function openInBrowser(browser, url, { appWindow = true } = {}) {
  if (!browser?.path) {
    void shell.openExternal(url);
    return { ok: true, mode: "external-default" };
  }

  if (process.platform === "darwin") {
    if (browser.id === "safari") {
      spawn("open", ["-a", "Safari", url], {
        detached: true,
        stdio: "ignore",
      }).unref();
      return { ok: true, mode: "safari" };
    }
    if (appWindow && browser.appMode) {
      const bin = path.join(browser.path, "Contents", "MacOS");
      let exe = null;
      try {
        const names = fs.readdirSync(bin);
        exe = names[0] ? path.join(bin, names[0]) : null;
      } catch {
        exe = null;
      }
      if (exe) {
        spawn(exe, [`--app=${url}`], {
          detached: true,
          stdio: "ignore",
        }).unref();
        return { ok: true, mode: "app-window" };
      }
    }
    spawn("open", ["-a", browser.path, url], {
      detached: true,
      stdio: "ignore",
    }).unref();
    return { ok: true, mode: "open-a" };
  }

  if (process.platform === "win32") {
    const args = appWindow && browser.appMode ? [`--app=${url}`] : [url];
    spawn(browser.path, args, { detached: true, stdio: "ignore" }).unref();
    return {
      ok: true,
      mode: appWindow && browser.appMode ? "app-window" : "browser",
    };
  }

  void shell.openExternal(url);
  return { ok: true, mode: "external-default" };
}

/* ─── Desktop / Start Menu launchers (inlined) ──────────────────────── */

function resolveAppTarget() {
  if (process.platform === "darwin") {
    const execDir = path.dirname(process.execPath);
    const bundle = path.resolve(execDir, "..", "..");
    if (bundle.endsWith(".app") && fileExists(bundle)) {
      return { target: bundle, cwd: path.dirname(bundle) };
    }
  }
  return {
    target: process.execPath,
    cwd: path.dirname(process.execPath),
  };
}

function writeWinShortcut(linkPath, { target, cwd, description }) {
  const icon = fileExists(iconIcoPath) ? iconIcoPath : target;
  return shell.writeShortcutLink(linkPath, {
    target,
    cwd,
    description: description || "Tri-Cass Companion",
    icon,
    iconIndex: 0,
    appUserModelId: "bot.grok.nexus.companion",
  });
}

function addLaunchers() {
  const created = [];
  const { target, cwd } = resolveAppTarget();

  try {
    if (process.platform === "win32") {
      const desktop = path.join(app.getPath("desktop"), "Tri-Cass Companion.lnk");
      if (
        writeWinShortcut(desktop, {
          target,
          cwd,
          description: "Tri-Cass Companion — local AI Chat",
        })
      ) {
        created.push(desktop);
      }

      const programs = path.join(
        app.getPath("appData"),
        "Microsoft",
        "Windows",
        "Start Menu",
        "Programs",
      );
      ensureDir(programs);
      const startMenu = path.join(programs, "Tri-Cass Companion.lnk");
      if (
        writeWinShortcut(startMenu, {
          target,
          cwd,
          description: "Tri-Cass Companion",
        })
      ) {
        created.push(startMenu);
      }

      return {
        ok: created.length > 0,
        desktop,
        startMenu,
        created,
        error: created.length ? undefined : "Could not write shortcut links.",
      };
    }

    if (process.platform === "darwin") {
      const desktop = app.getPath("desktop");
      const aliasPath = path.join(desktop, "Tri-Cass Companion");
      try {
        if (fileExists(aliasPath)) fs.rmSync(aliasPath, { recursive: true });
      } catch {
        /* ignore */
      }
      const script = `tell application "Finder" to make alias file to POSIX file ${JSON.stringify(
        target,
      )} at POSIX file ${JSON.stringify(desktop)}`;
      spawn("osascript", ["-e", script], {
        detached: true,
        stdio: "ignore",
      }).unref();
      created.push(aliasPath);

      const cmd = path.join(desktop, "Tri-Cass Companion.command");
      fs.writeFileSync(cmd, `#!/bin/bash\nopen ${JSON.stringify(target)}\n`, {
        mode: 0o755,
      });
      created.push(cmd);
      return { ok: true, desktop: aliasPath, created };
    }

    const desktopDir = app.getPath("desktop");
    const icon = fileExists(iconPath) ? iconPath : target;
    const entry = `[Desktop Entry]
Type=Application
Name=Tri-Cass Companion
Comment=Local AI Chat for Tri-Cass OS
Exec=${JSON.stringify(target)}
Icon=${icon}
Terminal=false
Categories=Utility;
`;
    const desktopFile = path.join(desktopDir, "tri-cass-companion.desktop");
    fs.writeFileSync(desktopFile, entry, { mode: 0o755 });
    created.push(desktopFile);
    const apps = path.join(
      app.getPath("home"),
      ".local",
      "share",
      "applications",
    );
    ensureDir(apps);
    const appFile = path.join(apps, "tri-cass-companion.desktop");
    fs.writeFileSync(appFile, entry, { mode: 0o755 });
    created.push(appFile);
    return { ok: true, desktop: desktopFile, startMenu: appFile, created };
  } catch (e) {
    return {
      ok: false,
      created,
      error: e instanceof Error ? e.message : "launcher failed",
    };
  }
}

/* ─── App shell ─────────────────────────────────────────────────────── */

app.setName("Tri-Cass Companion");
if (process.platform === "win32") {
  app.setAppUserModelId("bot.grok.nexus.companion");
}

ipcMain.handle("ollama:request", async (_event, args) => {
  const host = String(args?.host || "http://127.0.0.1:11434").replace(
    /\/$/,
    "",
  );
  const method = String(args?.method || "GET").toUpperCase();
  const apiPath = String(args?.path || "/");
  const body = args?.body ?? null;
  const url = `${host}${apiPath.startsWith("/") ? apiPath : `/${apiPath}`}`;

  try {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body || undefined,
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      text: e instanceof Error ? e.message : "network error",
    };
  }
});

ipcMain.handle("nexus:portable-info", async () => {
  if (!portableInfo.portable) {
    return { portable: false };
  }
  return {
    portable: true,
    kitRoot: portableInfo.kitRoot,
    knowledgeDir: portableInfo.knowledgeDir,
    filesDir: portableInfo.filesDir,
    chatsDir: portableInfo.chatsDir,
    userData: portableInfo.userData,
  };
});

ipcMain.handle("nexus:list-knowledge", async () => {
  const dir = portableInfo.knowledgeDir;
  if (!dir || !fs.existsSync(dir)) return { ok: true, entries: [] };
  try {
    const entries = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => !d.name.startsWith("."))
      .map((d) => ({
        name: d.name,
        kind: d.isDirectory() ? "folder" : "file",
      }));
    return { ok: true, entries };
  } catch (e) {
    return {
      ok: false,
      entries: [],
      error: e instanceof Error ? e.message : "list failed",
    };
  }
});

ipcMain.handle("nexus:import-to-usb", async (event) => {
  const destRoot = portableInfo.knowledgeDir || portableInfo.filesDir;
  if (!destRoot) {
    return { ok: false, error: "Not running in portable USB mode." };
  }
  const win = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showOpenDialog(win || undefined, {
    title: "Add folders or files to this USB",
    properties: ["openFile", "openDirectory", "multiSelections"],
  });
  if (result.canceled || !result.filePaths.length) {
    return { ok: false, canceled: true };
  }

  const copied = [];
  for (const src of result.filePaths) {
    try {
      const base = path.basename(src);
      const dest = path.join(destRoot, base);
      const st = fs.statSync(src);
      if (st.isDirectory()) {
        fs.cpSync(src, dest, { recursive: true });
      } else {
        fs.copyFileSync(src, dest);
      }
      copied.push(base);
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "copy failed",
      };
    }
  }
  return { ok: true, copied, dest: destRoot };
});

ipcMain.handle("nexus:export-chat", async (_event, args) => {
  try {
    const text = String(args?.text || "");
    const filename = String(
      args?.filename || `tri-cass-chat-${Date.now()}.md`,
    ).replace(/[^\w.\-]+/g, "_");
    if (!text) return { ok: false, error: "Empty chat." };
    const dir =
      portableInfo.chatsDir ||
      path.join(app.getPath("documents"), "Tri-Cass-Chats");
    ensureDir(dir);
    const outPath = path.join(dir, filename);
    fs.writeFileSync(outPath, text, "utf8");
    return { ok: true, path: outPath };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "export failed",
    };
  }
});

ipcMain.handle("nexus:open-path", async (_event, args) => {
  const target = String(args?.path || "");
  if (!target) return { ok: false };
  const err = await shell.openPath(target);
  return { ok: !err, error: err || undefined };
});

ipcMain.handle("nexus:save-image", async (_event, args) => {
  try {
    const base64 = String(args?.base64 || "");
    const filename = String(
      args?.filename || `tri-cass-${Date.now()}.png`,
    ).replace(/[^\w.\-]+/g, "_");
    if (!base64) return { ok: false, error: "Empty image." };
    const dir =
      portableInfo.imagesDir ||
      app.getPath("pictures") ||
      app.getPath("downloads") ||
      app.getPath("home");
    ensureDir(dir);
    const outPath = path.join(dir, filename);
    const raw = base64.includes("base64,")
      ? base64.slice(base64.indexOf("base64,") + 7)
      : base64;
    fs.writeFileSync(outPath, Buffer.from(raw, "base64"));
    return { ok: true, path: outPath };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "save failed",
    };
  }
});

const BROWSE_CHROME = 56;

const browsePrefsPath = () =>
  path.join(app.getPath("userData"), "browse-prefs.json");

function readBrowsePrefs() {
  try {
    const raw = fs.readFileSync(browsePrefsPath(), "utf8");
    return JSON.parse(raw);
  } catch {
    return { mode: "window", browserId: null };
  }
}

function writeBrowsePrefs(prefs) {
  try {
    ensureDir(path.dirname(browsePrefsPath()));
    fs.writeFileSync(browsePrefsPath(), JSON.stringify(prefs, null, 2), "utf8");
  } catch {
    /* ignore */
  }
}

ipcMain.handle("nexus:list-browsers", async () => {
  const browsers = detectBrowsers();
  const prefs = readBrowsePrefs();
  return { ok: true, browsers, prefs };
});

ipcMain.handle("nexus:set-browse-prefs", async (_event, args) => {
  const next = {
    ...readBrowsePrefs(),
    ...(args && typeof args === "object" ? args : {}),
  };
  writeBrowsePrefs(next);
  return { ok: true, prefs: next };
});

/** @type {Map<number, { win: Electron.BrowserWindow, view: Electron.BrowserView, url: string }>} */
const browseSessions = new Map();

function themeBackground(themeId) {
  if (themeId === "spatial") return "#07080e";
  if (themeId === "basic") return "#f7f5f0";
  if (themeId === "lumen") return "#050a0c";
  if (themeId === "terminal") return "#000000";
  return "#040804";
}

function layoutBrowseView(win, view) {
  const [w, h] = win.getContentSize();
  view.setBounds({
    x: 0,
    y: BROWSE_CHROME,
    width: w,
    height: Math.max(100, h - BROWSE_CHROME),
  });
  view.setAutoResize({ width: true, height: true });
}

function emitNav(win, view) {
  const wc = view.webContents;
  win.webContents.send("browse:nav", {
    url: wc.getURL(),
    canGoBack: wc.canGoBack(),
    canGoForward: wc.canGoForward(),
    title: wc.getTitle(),
  });
}

function createBrowseWindow(rawUrl, themeId = "spatial") {
  const url = String(rawUrl || "https://duckduckgo.com").trim();
  const icon = resolveIcon();
  const win = new BrowserWindow({
    width: 1120,
    height: 780,
    minWidth: 640,
    minHeight: 480,
    backgroundColor: themeBackground(themeId),
    title: `Tri-Cass Browse · ${APP_VERSION}`,
    frame: false,
    show: false,
    icon,
    webPreferences: {
      preload: path.join(__dirname, "browse-preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const view = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.setBrowserView(view);
  layoutBrowseView(win, view);

  const session = { win, view, url };
  browseSessions.set(win.id, session);

  const shellFile = path.join(__dirname, "browse-shell.html");
  void win
    .loadFile(shellFile, {
      query: { theme: String(themeId), url: String(url) },
    })
    .catch((err) => console.error("browse shell", err));

  win.once("ready-to-show", () => win.show());
  win.on("resize", () => layoutBrowseView(win, view));
  win.on("closed", () => browseSessions.delete(win.id));

  view.webContents.on("did-navigate", () => emitNav(win, view));
  view.webContents.on("did-navigate-in-page", () => emitNav(win, view));
  view.webContents.on("page-title-updated", () => emitNav(win, view));
  view.webContents.setWindowOpenHandler(({ url: openUrl }) => {
    void view.webContents.loadURL(openUrl);
    return { action: "deny" };
  });

  return win;
}

ipcMain.on("browse:ready", (event, payload) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  const session = browseSessions.get(win.id);
  if (!session) return;
  const target = String(payload?.url || session.url || "https://duckduckgo.com");
  void session.view.webContents.loadURL(target).then(() => {
    emitNav(win, session.view);
  });
});

ipcMain.on("browse:back", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const session = win && browseSessions.get(win.id);
  if (session?.view.webContents.canGoBack()) session.view.webContents.goBack();
});

ipcMain.on("browse:forward", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const session = win && browseSessions.get(win.id);
  if (session?.view.webContents.canGoForward())
    session.view.webContents.goForward();
});

ipcMain.on("browse:reload", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const session = win && browseSessions.get(win.id);
  session?.view.webContents.reload();
});

ipcMain.on("browse:navigate", (event, nextUrl) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const session = win && browseSessions.get(win.id);
  if (!session) return;
  const u = String(nextUrl || "").trim();
  if (!u) return;
  void session.view.webContents.loadURL(u);
});

ipcMain.on("browse:external", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const session = win && browseSessions.get(win.id);
  const url = session?.view.webContents.getURL() || session?.url;
  if (!url) return;
  const prefs = readBrowsePrefs();
  const browsers = detectBrowsers();
  const browser =
    browsers.find((b) => b.id === prefs.browserId) || browsers[0] || null;
  openInBrowser(browser, url, { appWindow: false });
});

ipcMain.on("browse:window", (event, action) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  if (action === "min") win.minimize();
  else if (action === "max") {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  } else if (action === "close") win.close();
});

ipcMain.handle("nexus:open-browse", async (_event, args) => {
  const url = String(args?.url || "https://duckduckgo.com").trim();
  const prefs = readBrowsePrefs();
  const themeId = String(args?.themeId || prefs.lastThemeId || "spatial");
  if (args?.themeId) {
    writeBrowsePrefs({ ...prefs, lastThemeId: String(args.themeId) });
  }
  const mode = String(args?.mode || prefs.mode || "window");

  if (mode === "external" || mode === "app") {
    const browsers = detectBrowsers();
    const browser =
      browsers.find((b) => b.id === (args?.browserId || prefs.browserId)) ||
      browsers[0] ||
      null;
    const result = openInBrowser(browser, url, {
      appWindow: mode === "app",
    });
    return { ok: true, ...result, browser: browser?.id || null };
  }

  const shellFile = path.join(__dirname, "browse-shell.html");
  if (!fs.existsSync(shellFile)) {
    void shell.openExternal(url);
    return {
      ok: true,
      mode: "external-default",
      error: "Browse shell missing from this build — opened system browser.",
    };
  }

  createBrowseWindow(url, themeId);
  return { ok: true, mode: "window" };
});

ipcMain.handle("nexus:add-to-desktop", async () => {
  try {
    return addLaunchers();
  } catch (e) {
    return {
      ok: false,
      created: [],
      error: e instanceof Error ? e.message : "launcher failed",
    };
  }
});

ipcMain.handle("nexus:app-version", async () => ({
  ok: true,
  version: APP_VERSION,
  packaged: app.isPackaged,
}));

function windowTitle() {
  const base = portableInfo.portable
    ? "Tri-Cass Companion — USB"
    : "Tri-Cass Companion";
  return `${base} ${APP_VERSION}`;
}

function createWindow() {
  const icon = resolveIcon();
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 420,
    minHeight: 640,
    backgroundColor: "#040804",
    title: windowTitle(),
    autoHideMenuBar: true,
    show: false,
    icon,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.once("ready-to-show", () => win.show());

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      const themeId = String(readBrowsePrefs().lastThemeId || "spatial");
      createBrowseWindow(url, themeId);
    } else {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });

  if (startUrl) {
    win.loadURL(startUrl).catch((err) => console.error(err));
    return;
  }

  const indexHtml = path.join(__dirname, "..", "dist-web", "index.html");
  if (fs.existsSync(indexHtml)) {
    win.loadFile(indexHtml).catch((err) => console.error(err));
  } else {
    win.loadURL(
      "data:text/html,<body style='background:#040804;color:#39ff14;font-family:monospace;padding:2rem'>Tri-Cass Companion: missing dist-web. Run npm run build:web first.</body>",
    );
  }
}

app.whenReady().then(async () => {
  if (process.platform === "darwin") {
    const icon = resolveIcon();
    if (icon) app.dock?.setIcon(icon);
  }
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  try {
    const flag = path.join(
      app.getPath("userData"),
      "desktop-launcher-offered.json",
    );
    if (!fs.existsSync(flag)) {
      const { response } = await dialog.showMessageBox({
        type: "question",
        buttons: ["Add to Desktop", "Not now"],
        defaultId: 0,
        cancelId: 1,
        title: `Tri-Cass Companion ${APP_VERSION}`,
        message: "Add Tri-Cass Companion to your Desktop?",
        detail:
          "Creates a Desktop shortcut and Start Menu / Applications launcher with the Tri-Cass icon so you can open Companion like a normal app.",
      });
      if (response === 0) {
        addLaunchers();
      }
      fs.writeFileSync(
        flag,
        JSON.stringify({ at: new Date().toISOString(), version: APP_VERSION }),
        "utf8",
      );
    }
  } catch (e) {
    console.warn("desktop launcher offer", e);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
