/**
 * Desktop shell for NEXUS Companion (Windows · macOS).
 * Portable USB mode: settings / Vault / chats live under the kit Data/ folder.
 */
const { app, BrowserWindow, ipcMain, shell, nativeImage, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { applyPortablePaths, ensureDir } = require("./portable");

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
    void shell.openExternal(url);
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
