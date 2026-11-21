/**
 * Create Desktop + Start Menu / Dock-friendly launchers with the NEXUS icon.
 */
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { app, shell } = require("electron");

function brandIconPaths() {
  const brand = path.join(__dirname, "..", "assets", "brand");
  return {
    ico: path.join(brand, "icon.ico"),
    png: path.join(brand, "icon.png"),
    icns: path.join(brand, "icon.icns"),
  };
}

function resolveAppTarget() {
  if (process.platform === "darwin") {
    // .../NEXUS Companion.app/Contents/MacOS/<bin> → .app bundle
    const execDir = path.dirname(process.execPath);
    const bundle = path.resolve(execDir, "..", "..");
    if (bundle.endsWith(".app") && fs.existsSync(bundle)) {
      return { target: bundle, cwd: path.dirname(bundle), kind: "mac-app" };
    }
  }
  return {
    target: process.execPath,
    cwd: path.dirname(process.execPath),
    kind: process.platform === "win32" ? "win-exe" : "bin",
  };
}

function writeWinShortcut(linkPath, { target, cwd, description }) {
  const icons = brandIconPaths();
  const icon = fs.existsSync(icons.ico) ? icons.ico : target;
  return shell.writeShortcutLink(linkPath, {
    target,
    cwd,
    description: description || "NEXUS Companion",
    icon,
    iconIndex: 0,
    appUserModelId: "bot.grok.nexus.companion",
  });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * @returns {{ ok: boolean, desktop?: string, startMenu?: string, error?: string, created: string[] }}
 */
function addLaunchers() {
  const created = [];
  const { target, cwd } = resolveAppTarget();
  const icons = brandIconPaths();

  try {
    if (process.platform === "win32") {
      const desktop = path.join(app.getPath("desktop"), "NEXUS Companion.lnk");
      if (
        writeWinShortcut(desktop, {
          target,
          cwd,
          description: "NEXUS Companion — local AI Chat",
        })
      ) {
        created.push(desktop);
      }

      const programs = path.join(
        app.getPath("appData"),
        "Microsoft",
        "Windows",
        "Start Menu",
        "Programs",
      );
      ensureDir(programs);
      const startMenu = path.join(programs, "NEXUS Companion.lnk");
      if (
        writeWinShortcut(startMenu, {
          target,
          cwd,
          description: "NEXUS Companion",
        })
      ) {
        created.push(startMenu);
      }

      return {
        ok: created.length > 0,
        desktop,
        startMenu,
        created,
        error: created.length ? undefined : "Could not write shortcut links.",
      };
    }

    if (process.platform === "darwin") {
      const desktop = app.getPath("desktop");
      const aliasPath = path.join(desktop, "NEXUS Companion");
      // Remove stale alias/symlink
      try {
        if (fs.existsSync(aliasPath)) fs.rmSync(aliasPath, { recursive: true });
      } catch {
        /* ignore */
      }

      // Finder alias keeps the app icon thumbnail on Desktop
      const script = `tell application "Finder" to make alias file to POSIX file ${JSON.stringify(
        target,
      )} at POSIX file ${JSON.stringify(desktop)}`;
      spawn("osascript", ["-e", script], {
        detached: true,
        stdio: "ignore",
      }).unref();
      created.push(path.join(desktop, "NEXUS Companion"));

      // Also drop a .command launcher as a fallback
      const cmd = path.join(desktop, "NEXUS Companion.command");
      const body = `#!/bin/bash\nopen ${JSON.stringify(target)}\n`;
      fs.writeFileSync(cmd, body, { mode: 0o755 });
      created.push(cmd);

      return { ok: true, desktop: aliasPath, created };
    }

    // Linux: .desktop file on Desktop + applications
    const desktopDir = app.getPath("desktop");
    const icon = fs.existsSync(icons.png) ? icons.png : target;
    const entry = `[Desktop Entry]
Type=Application
Name=NEXUS Companion
Comment=Local AI Chat for NEXUS OS
Exec=${JSON.stringify(target)}
Icon=${icon}
Terminal=false
Categories=Utility;
`;
    const desktopFile = path.join(desktopDir, "nexus-companion.desktop");
    fs.writeFileSync(desktopFile, entry, { mode: 0o755 });
    created.push(desktopFile);

    const apps = path.join(app.getPath("home"), ".local", "share", "applications");
    ensureDir(apps);
    const appFile = path.join(apps, "nexus-companion.desktop");
    fs.writeFileSync(appFile, entry, { mode: 0o755 });
    created.push(appFile);

    return { ok: true, desktop: desktopFile, startMenu: appFile, created };
  } catch (e) {
    return {
      ok: false,
      created,
      error: e instanceof Error ? e.message : "launcher failed",
    };
  }
}

module.exports = {
  addLaunchers,
  resolveAppTarget,
  brandIconPaths,
};
