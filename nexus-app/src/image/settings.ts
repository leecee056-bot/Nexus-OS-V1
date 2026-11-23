import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_IMAGE_MODEL_ID } from "./models";

const KEY_MODEL = "tricass.image.modelId";

export async function loadSelectedImageModelId(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(KEY_MODEL)) || DEFAULT_IMAGE_MODEL_ID;
  } catch {
    return DEFAULT_IMAGE_MODEL_ID;
  }
}

export async function saveSelectedImageModelId(id: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_MODEL, id);
  } catch {
    /* ignore */
  }
}
