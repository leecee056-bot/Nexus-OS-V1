/**
 * Windows / desktop shell for NEXUS Companion.
 * Dev:  loads Expo web at http://127.0.0.1:8081
 * Prod: loads packaged static web from ../dist-web/index.html
 */
const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

const isDev = !app.isPackaged;
const startUrl =
  process.env.NEXUS_APP_URL ||
  (isDev ? "http://127.0.0.1:8081" : null);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 390,
    minHeight: 640,
    backgroundColor: "#040804",
    title: "NEXUS Companion",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
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

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
