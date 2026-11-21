const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nexus", {
  ollamaRequest: (args) => ipcRenderer.invoke("ollama:request", args),
  saveImage: (args) => ipcRenderer.invoke("nexus:save-image", args),
  getPortableInfo: () => ipcRenderer.invoke("nexus:portable-info"),
  listKnowledge: () => ipcRenderer.invoke("nexus:list-knowledge"),
  importToUsb: () => ipcRenderer.invoke("nexus:import-to-usb"),
  exportChat: (args) => ipcRenderer.invoke("nexus:export-chat", args),
  openPath: (args) => ipcRenderer.invoke("nexus:open-path", args),
  platform: process.platform,
});
