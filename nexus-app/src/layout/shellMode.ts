import AsyncStorage from "@react-native-async-storage/async-storage";

/** Classic LLM chat chrome vs multi-window Tri-Cass OS desk. */
export type ShellMode = "classic" | "desk";

const KEY = "tricass.companion.shellMode";
const FACTS_KEY = "tricass.companion.funFacts";

export async function loadShellMode(): Promise<ShellMode> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v === "desk" ? "desk" : "classic";
  } catch {
    return "classic";
  }
}

export async function saveShellMode(mode: ShellMode): Promise<void> {
  await AsyncStorage.setItem(KEY, mode);
}

/** Fun facts during wait (default on). Off = rabbit GIF only. */
export async function loadFunFactsEnabled(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(FACTS_KEY);
    if (v === "0") return false;
    return true;
  } catch {
    return true;
  }
}

export async function saveFunFactsEnabled(on: boolean): Promise<void> {
  await AsyncStorage.setItem(FACTS_KEY, on ? "1" : "0");
}
