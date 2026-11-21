/**
 * Desktop shell for NEXUS Companion (Windows · macOS).
 * Dev:  Expo web at http://127.0.0.1:8081
 * Prod: packaged static web from ../dist-web/index.html
 */
const { app, BrowserWindow, ipcMain, shell, nativeImage } = require("electron");
const path = require("path");
const fs = require("fs");

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

function createWindow() {
  const icon = resolveIcon();
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 420,
    minHeight: 640,
    backgroundColor: "#040804",
    title: "NEXUS Companion",
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
