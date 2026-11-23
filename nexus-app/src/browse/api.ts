/**
 * Desktop Browse integration — themed Tri-Cass window or installed browser.
 * No-op outside Electron.
 */

export type DetectedBrowser = {
  id: string;
  name: string;
  path: string;
  appMode?: boolean;
};

export type BrowsePrefs = {
  mode?: "window" | "external" | "app";
  browserId?: string | null;
};

export function isDesktopBrowseAvailable(): boolean {
  return typeof window !== "undefined" && Boolean(window.nexus?.openBrowse);
}

export async function listBrowsers(): Promise<{
  browsers: DetectedBrowser[];
  prefs: BrowsePrefs;
}> {
  const bridge = window.nexus;
  if (!bridge?.listBrowsers) return { browsers: [], prefs: { mode: "window" } };
  const res = await bridge.listBrowsers();
  return {
    browsers: res.browsers || [],
    prefs: res.prefs || { mode: "window" },
  };
}

export async function setBrowsePrefs(prefs: BrowsePrefs): Promise<void> {
  await window.nexus?.setBrowsePrefs?.(prefs);
}

export async function openBrowse(
  url: string,
  opts?: { themeId?: string; mode?: BrowsePrefs["mode"]; browserId?: string },
): Promise<{ ok: boolean; error?: string }> {
  const bridge = window.nexus;
  if (!bridge?.openBrowse) {
    return { ok: false, error: "Browse is available in the desktop app." };
  }
  try {
    const res = await bridge.openBrowse({
      url,
      themeId: opts?.themeId,
      mode: opts?.mode,
      browserId: opts?.browserId,
    });
    return { ok: Boolean(res?.ok), error: res?.error };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not open browse window",
    };
  }
}
