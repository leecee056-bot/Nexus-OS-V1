import AsyncStorage from "@react-native-async-storage/async-storage";
import { PLUGIN_CATALOG, type PluginId } from "./catalog";

const KEY = "nexus.companion.plugins.v1";

export type PluginState = Record<PluginId, boolean>;

function defaults(): PluginState {
  const out = {} as PluginState;
  for (const p of PLUGIN_CATALOG) {
    out[p.id] = p.defaultEnabled;
  }
  return out;
}

export async function loadPluginState(): Promise<PluginState> {
  const base = defaults();
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<PluginState>;
    return { ...base, ...parsed };
  } catch {
    return base;
  }
}

export async function savePluginState(state: PluginState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

export async function setPluginEnabled(
  id: PluginId,
  enabled: boolean,
): Promise<PluginState> {
  const state = await loadPluginState();
  state[id] = enabled;
  await savePluginState(state);
  return state;
}

export function enabledTools(state: PluginState): string[] {
  return PLUGIN_CATALOG.filter((p) => state[p.id]).map((p) => p.tool);
}
