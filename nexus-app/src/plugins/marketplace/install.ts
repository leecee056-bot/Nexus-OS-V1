import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking, Platform } from "react-native";
import { writeTextFile } from "../../files/store";
import { openBrowse, isDesktopBrowseAvailable } from "../../browse/api";
import { buildMiniAppHtml } from "./templates";
import type { MarketItem } from "./types";

const KEY = "tricass.companion.market.installed.v1";

export type InstalledMap = Record<string, { at: number; path?: string }>;

export async function loadInstalled(): Promise<InstalledMap> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as InstalledMap;
  } catch {
    return {};
  }
}

async function saveInstalled(map: InstalledMap) {
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
}

export async function uninstallMarketItem(
  itemId: string,
): Promise<{ ok: boolean }> {
  const map = await loadInstalled();
  if (!map[itemId]) return { ok: true };
  delete map[itemId];
  await saveInstalled(map);
  return { ok: true };
}

export async function installMarketItem(
  item: MarketItem,
  themeId?: string,
): Promise<{ ok: boolean; path?: string; error?: string; opened?: boolean }> {
  if (item.kind === "link") {
    const url = item.url;
    if (!url) return { ok: false, error: "No download link." };
    if (Platform.OS === "web" && isDesktopBrowseAvailable()) {
      const res = await openBrowse(url, { themeId });
      return { ok: res.ok, opened: true, error: res.error };
    }
    await Linking.openURL(url);
    return { ok: true, opened: true };
  }

  const html = buildMiniAppHtml(item.id);
  if (!html) return { ok: false, error: "Mini-app template missing." };
  const path = item.path || `apps/${item.id}/index.html`;
  await writeTextFile(path, html);
  const map = await loadInstalled();
  map[item.id] = { at: Date.now(), path };
  await saveInstalled(map);
  return { ok: true, path };
}
