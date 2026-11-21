const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nexusBrowse", {
  ready: (payload) => ipcRenderer.send("browse:ready", payload),
  back: () => ipcRenderer.send("browse:back"),
  forward: () => ipcRenderer.send("browse:forward"),
  reload: () => ipcRenderer.send("browse:reload"),
  navigate: (url) => ipcRenderer.send("browse:navigate", url),
  external: () => ipcRenderer.send("browse:external"),
  window: (action) => ipcRenderer.send("browse:window", action),
  onNav: (fn) => {
    ipcRenderer.on("browse:nav", (_e, state) => fn(state));
  },
});
