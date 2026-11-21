const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nexus", {
  ollamaRequest: (args) => ipcRenderer.invoke("ollama:request", args),
  saveImage: (args) => ipcRenderer.invoke("nexus:save-image", args),
  getPortableInfo: () => ipcRenderer.invoke("nexus:portable-info"),
  listKnowledge: () => ipcRenderer.invoke("nexus:list-knowledge"),
  importToUsb: () => ipcRenderer.invoke("nexus:import-to-usb"),
  exportChat: (args) => ipcRenderer.invoke("nexus:export-chat", args),
  openPath: (args) => ipcRenderer.invoke("nexus:open-path", args),
  listBrowsers: () => ipcRenderer.invoke("nexus:list-browsers"),
  setBrowsePrefs: (args) => ipcRenderer.invoke("nexus:set-browse-prefs", args),
  openBrowse: (args) => ipcRenderer.invoke("nexus:open-browse", args),
  platform: process.platform,
});
