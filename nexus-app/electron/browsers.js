/**
 * Detect common installed browsers on Windows / macOS.
 * Used so Companion can open pages in a themed NEXUS Browse window
 * or hand off to the user's preferred installed browser.
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { shell } = require("electron");

/** @typedef {{ id: string, name: string, path: string, appMode?: boolean }} BrowserInfo */

function exists(p) {
  try {
    return Boolean(p) && fs.existsSync(p);
  } catch {
    return false;
  }
}

function winCandidates() {
  const local = process.env.LOCALAPPDATA || "";
  const pf = process.env.PROGRAMFILES || "C:\\Program Files";
  const pf86 = process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)";
  return [
    {
      id: "edge",
      name: "Microsoft Edge",
      paths: [
        path.join(pf, "Microsoft", "Edge", "Application", "msedge.exe"),
        path.join(pf86, "Microsoft", "Edge", "Application", "msedge.exe"),
      ],
      appMode: true,
    },
    {
      id: "chrome",
      name: "Google Chrome",
      paths: [
        path.join(pf, "Google", "Chrome", "Application", "chrome.exe"),
        path.join(pf86, "Google", "Chrome", "Application", "chrome.exe"),
        path.join(local, "Google", "Chrome", "Application", "chrome.exe"),
      ],
      appMode: true,
    },
    {
      id: "brave",
      name: "Brave",
      paths: [
        path.join(
          pf,
          "BraveSoftware",
          "Brave-Browser",
          "Application",
          "brave.exe",
        ),
        path.join(
          local,
          "BraveSoftware",
          "Brave-Browser",
          "Application",
          "brave.exe",
        ),
      ],
      appMode: true,
    },
    {
      id: "firefox",
      name: "Mozilla Firefox",
      paths: [
        path.join(pf, "Mozilla Firefox", "firefox.exe"),
        path.join(pf86, "Mozilla Firefox", "firefox.exe"),
      ],
      appMode: false,
    },
    {
      id: "opera",
      name: "Opera",
      paths: [
        path.join(pf, "Opera", "opera.exe"),
        path.join(local, "Programs", "Opera", "opera.exe"),
      ],
      appMode: true,
    },
  ];
}

function macCandidates() {
  return [
    {
      id: "safari",
      name: "Safari",
      paths: ["/Applications/Safari.app"],
      appMode: false,
    },
    {
      id: "chrome",
      name: "Google Chrome",
      paths: ["/Applications/Google Chrome.app"],
      appMode: true,
    },
    {
      id: "edge",
      name: "Microsoft Edge",
      paths: ["/Applications/Microsoft Edge.app"],
      appMode: true,
    },
    {
      id: "brave",
      name: "Brave",
      paths: ["/Applications/Brave Browser.app"],
      appMode: true,
    },
    {
      id: "firefox",
      name: "Mozilla Firefox",
      paths: ["/Applications/Firefox.app"],
      appMode: false,
    },
    {
      id: "opera",
      name: "Opera",
      paths: ["/Applications/Opera.app"],
      appMode: true,
    },
  ];
}

/** @returns {BrowserInfo[]} */
function detectBrowsers() {
  const list =
    process.platform === "darwin"
      ? macCandidates()
      : process.platform === "win32"
        ? winCandidates()
        : [];
  /** @type {BrowserInfo[]} */
  const found = [];
  for (const c of list) {
    const hit = c.paths.find(exists);
    if (hit) {
      found.push({
        id: c.id,
        name: c.name,
        path: hit,
        appMode: Boolean(c.appMode),
      });
    }
  }
  return found;
}

/**
 * Open URL in a detected system browser.
 * Chromium-family browsers can use --app= for a chrome-light window.
 */
function openInBrowser(browser, url, { appWindow = true } = {}) {
  if (!browser?.path) {
    void shell.openExternal(url);
    return { ok: true, mode: "external-default" };
  }

  if (process.platform === "darwin") {
    if (browser.id === "safari") {
      spawn("open", ["-a", "Safari", url], { detached: true, stdio: "ignore" }).unref();
      return { ok: true, mode: "safari" };
    }
    if (appWindow && browser.appMode) {
      const bin = path.join(browser.path, "Contents", "MacOS");
      let exe = null;
      try {
        const names = fs.readdirSync(bin);
        exe = names[0] ? path.join(bin, names[0]) : null;
      } catch {
        exe = null;
      }
      if (exe) {
        spawn(exe, [`--app=${url}`], { detached: true, stdio: "ignore" }).unref();
        return { ok: true, mode: "app-window" };
      }
    }
    spawn("open", ["-a", browser.path, url], {
      detached: true,
      stdio: "ignore",
    }).unref();
    return { ok: true, mode: "open-a" };
  }

  if (process.platform === "win32") {
    const args =
      appWindow && browser.appMode ? [`--app=${url}`] : [url];
    spawn(browser.path, args, { detached: true, stdio: "ignore" }).unref();
    return {
      ok: true,
      mode: appWindow && browser.appMode ? "app-window" : "browser",
    };
  }

  void shell.openExternal(url);
  return { ok: true, mode: "external-default" };
}

module.exports = {
  detectBrowsers,
  openInBrowser,
};
