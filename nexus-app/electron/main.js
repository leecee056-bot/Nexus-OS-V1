/**
 * Desktop shell for NEXUS Companion (Windows · macOS).
 * Portable USB mode: settings / Vault / chats live under the kit Data/ folder.
 * Browse: themed in-app window + detect installed system browsers.
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
const { applyPortablePaths, ensureDir } = require("./portable");
const { detectBrowsers, openInBrowser } = require("./browsers");

/** Must run before ready — redirects userData onto the USB kit. */
const portableInfo = applyPortablePaths(app);

const isDev = !app.isPackaged;
const startUrl =
  process.env.NEXUS_APP_URL ||
  (isDev ? "http://127.0.0.1:8081" : null);

const iconPath = path.join(__dirname, "..", "assets", "brand", "icon.png");

function resolveIcon() {
  if (fs.existsSync(iconPath)) {
    return nativeImage.createFromPath(iconPath);
  }
  return undefined;
}

app.setName("NEXUS Companion");
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
        copied,
      };
    }
  }
  return { ok: true, copied, dest: destRoot };
});

ipcMain.handle("nexus:export-chat", async (_event, args) => {
  try {
    const text = String(args?.text || "");
    const filename = String(
      args?.filename || `nexus-chat-${Date.now()}.md`,
    ).replace(/[^\w.\-]+/g, "_");
    if (!text) return { ok: false, error: "Empty chat." };

    const dir =
      portableInfo.chatsDir ||
      path.join(app.getPath("documents"), "NEXUS-Chats");
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

/** Save a generated PNG — prefer USB Files/Images when portable. */
ipcMain.handle("nexus:save-image", async (_event, args) => {
  try {
    const base64 = String(args?.base64 || "");
    const filename = String(args?.filename || `nexus-${Date.now()}.png`).replace(
      /[^\w.\-]+/g,
      "_",
    );
    if (!base64) return { ok: false, error: "Empty image." };

    const dir =
      portableInfo.imagesDir ||
      app.getPath("pictures") ||
      app.getPath("downloads") ||
      app.getPath("home");
    ensureDir(dir);
    const outPath = path.join(dir, filename);
    fs.writeFileSync(outPath, Buffer.from(base64, "base64"));
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
    title: "NEXUS Browse",
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
  const themeId = String(
    args?.themeId || prefs.lastThemeId || "spatial",
  );
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

  createBrowseWindow(url, themeId);
  return { ok: true, mode: "window" };
});

function createWindow() {
  const icon = resolveIcon();
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 420,
    minHeight: 640,
    backgroundColor: "#040804",
    title: portableInfo.portable
      ? "NEXUS Companion — USB"
      : "NEXUS Companion",
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
      "data:text/html,<body style='background:#040804;color:#39ff14;font-family:monospace;padding:2rem'>NEXUS Companion: missing dist-web. Run npm run build:web first.</body>",
    );
  }
}

app.whenReady().then(() => {
  if (process.platform === "darwin") {
    const icon = resolveIcon();
    if (icon) app.dock?.setIcon(icon);
  }
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
