/**
 * Optional Windows desktop shell.
 * Loads the Expo web build from http://127.0.0.1:8081 (dev)
 * or a static export if you set NEXUS_APP_URL.
 *
 * Dev:  terminal A → npm run web
 *       terminal B → npm run windows:electron
 */
const { app, BrowserWindow } = require("electron");

const startUrl =
  process.env.NEXUS_APP_URL || "http://127.0.0.1:8081";

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    backgroundColor: "#040804",
    title: "NEXUS Companion",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadURL(startUrl).catch((err) => {
    console.error("Failed to load", startUrl, err);
  });
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
