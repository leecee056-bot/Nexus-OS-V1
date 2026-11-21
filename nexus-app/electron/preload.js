const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nexus", {
  ollamaRequest: (args) => ipcRenderer.invoke("ollama:request", args),
  saveImage: (args) => ipcRenderer.invoke("nexus:save-image", args),
  platform: process.platform,
});
