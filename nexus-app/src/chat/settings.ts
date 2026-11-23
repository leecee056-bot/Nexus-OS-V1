import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_MODEL_ID } from "./models";

const KEY_MODEL = "tricass.chat.modelId";
const KEY_HOST = "tricass.chat.ollamaHost";

/** Default Ollama base URL (desktop / same device). */
export const DEFAULT_OLLAMA_HOST = "http://127.0.0.1:11434";

export async function loadSelectedModelId(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(KEY_MODEL)) || DEFAULT_MODEL_ID;
  } catch {
    return DEFAULT_MODEL_ID;
  }
}

export async function saveSelectedModelId(id: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_MODEL, id);
  } catch {
    /* ignore */
  }
}

export async function loadOllamaHost(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(KEY_HOST)) || DEFAULT_OLLAMA_HOST;
  } catch {
    return DEFAULT_OLLAMA_HOST;
  }
}

export async function saveOllamaHost(host: string): Promise<void> {
  try {
    const cleaned = host.trim().replace(/\/$/, "") || DEFAULT_OLLAMA_HOST;
    await AsyncStorage.setItem(KEY_HOST, cleaned);
  } catch {
    /* ignore */
  }
}
