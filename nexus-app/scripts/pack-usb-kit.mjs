#!/usr/bin/env node
/**
 * Assemble NEXUS-Companion-USB-<version>.zip from usb-kit/ + built binaries.
 *
 * Expects (any that exist):
 *   release/*-portable.exe
 *   release/win-unpacked/  (optional, preferred for true portable)
 *   release/*.zip (mac) or a path via NEXUS_MAC_APP
 *
 * Usage: node scripts/pack-usb-kit.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = pkg.version;
const kitSrc = path.join(root, "usb-kit");
const releaseDir = path.join(root, "release");
const outDir = path.join(releaseDir, "usb-staging");
const zipName = `NEXUS-Companion-USB-${version}.zip`;
const zipPath = path.join(releaseDir, zipName);

function rimraf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function copyRecursive(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function findFirst(dir, pred) {
  if (!fs.existsSync(dir)) return null;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (pred(name, full)) return full;
  }
  return null;
}

rimraf(outDir);
fs.mkdirSync(outDir, { recursive: true });
copyRecursive(kitSrc, path.join(outDir, "NEXUS-Companion-USB"));

const kit = path.join(outDir, "NEXUS-Companion-USB");

// Stamp version into marker
const markerPath = path.join(kit, "NEXUS-USB.json");
const marker = JSON.parse(fs.readFileSync(markerPath, "utf8"));
marker.version = version;
fs.writeFileSync(markerPath, JSON.stringify(marker, null, 2) + "\n");

const winDir = path.join(kit, "Windows");
const macDir = path.join(kit, "Mac");

const winUnpacked = path.join(releaseDir, "win-unpacked");
if (fs.existsSync(winUnpacked)) {
  copyRecursive(winUnpacked, path.join(winDir, "NEXUS-Companion"));
  console.log("packed win-unpacked → Windows/NEXUS-Companion");
} else {
  const exe = findFirst(
    releaseDir,
    (n) => n.endsWith(".exe") && n.includes("portable"),
  );
  if (exe) {
    fs.copyFileSync(
      exe,
      path.join(winDir, "NEXUS-Companion-Windows-portable.exe"),
    );
    console.log("packed", path.basename(exe));
  } else {
    console.warn("WARN: no Windows binary in release/ — kit will need Start-NEXUS.bat after you copy one");
  }
}

const macZip = findFirst(
  releaseDir,
  (n) => n.endsWith(".zip") && /mac|darwin|Companion/i.test(n),
);
const macAppEnv = process.env.NEXUS_MAC_APP;
if (macAppEnv && fs.existsSync(macAppEnv)) {
  copyRecursive(macAppEnv, path.join(macDir, "NEXUS Companion.app"));
  console.log("packed Mac app from NEXUS_MAC_APP");
} else if (macZip) {
  const extractTo = path.join(releaseDir, "mac-zip-extract");
  rimraf(extractTo);
  fs.mkdirSync(extractTo, { recursive: true });
  execSync(`unzip -q "${macZip}" -d "${extractTo}"`, { stdio: "inherit" });
  const found = execSync(
    `find "${extractTo}" -name "NEXUS Companion.app" -type d | head -1`,
    { encoding: "utf8" },
  ).trim();
  if (found) {
    copyRecursive(found, path.join(macDir, "NEXUS Companion.app"));
    console.log("packed Mac .app from zip");
  } else {
    console.warn("WARN: zip had no NEXUS Companion.app");
  }
} else {
  console.warn("WARN: no Mac .app/zip — Mac/Start-NEXUS.command will prompt");
}

// Ensure Mac launcher is executable in the zip via mode in staging
try {
  fs.chmodSync(path.join(macDir, "Start-NEXUS.command"), 0o755);
} catch {
  /* windows checkout */
}

fs.mkdirSync(releaseDir, { recursive: true });
rimraf(zipPath);
execSync(`cd "${outDir}" && zip -r -q "${zipPath}" NEXUS-Companion-USB`, {
  stdio: "inherit",
});
console.log("wrote", zipPath);
const st = fs.statSync(zipPath);
console.log("size MB", (st.size / (1024 * 1024)).toFixed(1));
