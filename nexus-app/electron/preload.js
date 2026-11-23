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
  addToDesktop: () => ipcRenderer.invoke("nexus:add-to-desktop"),
  workspace: {
    info: () => ipcRenderer.invoke("nexus:workspace-info"),
    list: (args) => ipcRenderer.invoke("nexus:workspace-list", args),
    read: (args) => ipcRenderer.invoke("nexus:workspace-read", args),
    write: (args) => ipcRenderer.invoke("nexus:workspace-write", args),
    mkdir: (args) => ipcRenderer.invoke("nexus:workspace-mkdir", args),
    rename: (args) => ipcRenderer.invoke("nexus:workspace-rename", args),
    remove: (args) => ipcRenderer.invoke("nexus:workspace-remove", args),
  },
  platform: process.platform,
});
