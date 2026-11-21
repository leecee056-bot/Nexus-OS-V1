const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nexus", {
  ollamaRequest: (args) => ipcRenderer.invoke("ollama:request", args),
  platform: process.platform,
});
