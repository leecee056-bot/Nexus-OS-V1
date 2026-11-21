/**
 * Resolve USB / portable kit root so settings, Vault, chats, and files
 * live next to the app on the stick — not in the host AppData folder.
 */
const path = require("path");
const fs = require("fs");

const MARKER = "NEXUS-USB.json";

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function findMarkerUp(startDir, maxUp = 4) {
  let dir = startDir;
  for (let i = 0; i < maxUp; i++) {
    const marker = path.join(dir, MARKER);
    if (exists(marker)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Kit root when running from a NEXUS USB folder, else null.
 * Windows portable: PORTABLE_EXECUTABLE_DIR (exe often in Windows/).
 * Mac .app: sibling of the .app bundle.
 */
function resolveKitRoot() {
  if (process.env.NEXUS_USB_ROOT && exists(process.env.NEXUS_USB_ROOT)) {
    return path.resolve(process.env.NEXUS_USB_ROOT);
  }

  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    const dir = process.env.PORTABLE_EXECUTABLE_DIR;
    return (
      findMarkerUp(dir) ||
      findMarkerUp(path.join(dir, "..")) ||
      dir
    );
  }

  // Packaged Mac: .../Mac/NEXUS Companion.app/Contents/MacOS/<bin>
  const execDir = path.dirname(process.execPath);
  const appBundle = path.resolve(execDir, "..", "..");
  const nextToApp = path.dirname(appBundle);
  const fromApp = findMarkerUp(nextToApp);
  if (fromApp) return fromApp;

  // Unpacked win-unpacked next to marker
  const fromExec = findMarkerUp(execDir);
  if (fromExec) return fromExec;

  return null;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Apply portable paths before app.ready. Returns kit info or null.
 */
function applyPortablePaths(app) {
  const kitRoot = resolveKitRoot();
  const portable =
    !!kitRoot ||
    !!process.env.PORTABLE_EXECUTABLE_DIR ||
    process.env.NEXUS_PORTABLE === "1";

  if (!portable) {
    return { portable: false, kitRoot: null };
  }

  const root =
    kitRoot ||
    process.env.PORTABLE_EXECUTABLE_DIR ||
    path.dirname(process.execPath);

  const dataRoot = ensureDir(path.join(root, "Data"));
  const userData = ensureDir(path.join(dataRoot, "app"));
  const knowledgeDir = ensureDir(path.join(root, "Knowledge"));
  const filesDir = ensureDir(path.join(root, "Files"));
  const imagesDir = ensureDir(path.join(filesDir, "Images"));
  const chatsDir = ensureDir(path.join(root, "Chats"));

  try {
    app.setPath("userData", userData);
  } catch (e) {
    console.warn("portable userData", e);
  }

  return {
    portable: true,
    kitRoot: root,
    userData,
    knowledgeDir,
    filesDir,
    imagesDir,
    chatsDir,
  };
}

module.exports = {
  MARKER,
  resolveKitRoot,
  applyPortablePaths,
  ensureDir,
};
