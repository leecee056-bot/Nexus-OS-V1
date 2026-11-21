/** Recommended lightweight local models (Ollama tags). */

export type LocalModel = {
  id: string;
  /** Ollama model name / tag */
  ollama: string;
  label: string;
  blurb: string;
  /** Rough download size label */
  sizeLabel: string;
  /** Relative “weight” for modest hardware (1 = lightest) */
  weight: 1 | 2 | 3;
};

export const RECOMMENDED_MODELS: LocalModel[] = [
  {
    id: "qwen25-05b",
    ollama: "qwen2.5:0.5b",
    label: "Qwen 2.5 · 0.5B",
    blurb: "Fastest pick for older PCs and phones via LAN Ollama.",
    sizeLabel: "~400 MB",
    weight: 1,
  },
  {
    id: "tinyllama",
    ollama: "tinyllama",
    label: "TinyLlama 1.1B",
    blurb: "Classic tiny chat model — great first install.",
    sizeLabel: "~640 MB",
    weight: 1,
  },
  {
    id: "llama32-1b",
    ollama: "llama3.2:1b",
    label: "Llama 3.2 · 1B",
    blurb: "Strong small model with clear answers.",
    sizeLabel: "~1.3 GB",
    weight: 2,
  },
  {
    id: "qwen25-15b",
    ollama: "qwen2.5:1.5b",
    label: "Qwen 2.5 · 1.5B",
    blurb: "Better quality while still modest on RAM.",
    sizeLabel: "~1.0 GB",
    weight: 2,
  },
  {
    id: "gemma2-2b",
    ollama: "gemma2:2b",
    label: "Gemma 2 · 2B",
    blurb: "Heavier but still workable on modern laptops.",
    sizeLabel: "~1.6 GB",
    weight: 3,
  },
];

export const DEFAULT_MODEL_ID = "tinyllama";

export function findModel(idOrTag: string | null | undefined): LocalModel {
  if (!idOrTag) {
    return RECOMMENDED_MODELS.find((m) => m.id === DEFAULT_MODEL_ID)!;
  }
  return (
    RECOMMENDED_MODELS.find(
      (m) => m.id === idOrTag || m.ollama === idOrTag,
    ) ?? RECOMMENDED_MODELS.find((m) => m.id === DEFAULT_MODEL_ID)!
  );
}
