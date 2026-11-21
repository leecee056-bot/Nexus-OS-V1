/** Recommended lightweight local models (Ollama tags). */

import { ollamaLibraryUrl } from "../updates/links";

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
  /** Official library / update page */
  updateUrl: string;
};

export const RECOMMENDED_MODELS: LocalModel[] = [
  {
    id: "qwen25-05b",
    ollama: "qwen2.5:0.5b",
    label: "Qwen 2.5 · 0.5B",
    blurb: "Fastest pick for older PCs and phones via LAN Ollama.",
    sizeLabel: "~400 MB",
    weight: 1,
    updateUrl: ollamaLibraryUrl("qwen2.5"),
  },
  {
    id: "tinyllama",
    ollama: "tinyllama",
    label: "TinyLlama 1.1B",
    blurb: "Classic tiny chat model — great first install.",
    sizeLabel: "~640 MB",
    weight: 1,
    updateUrl: ollamaLibraryUrl("tinyllama"),
  },
  {
    id: "llama32-1b",
    ollama: "llama3.2:1b",
    label: "Llama 3.2 · 1B",
    blurb: "Strong small model with clear answers.",
    sizeLabel: "~1.3 GB",
    weight: 2,
    updateUrl: ollamaLibraryUrl("llama3.2"),
  },
  {
    id: "qwen25-15b",
    ollama: "qwen2.5:1.5b",
    label: "Qwen 2.5 · 1.5B",
    blurb: "Better quality while still modest on RAM.",
    sizeLabel: "~1.0 GB",
    weight: 2,
    updateUrl: ollamaLibraryUrl("qwen2.5"),
  },
  {
    id: "deepseek-r1-15b",
    ollama: "deepseek-r1:1.5b",
    label: "DeepSeek R1 · 1.5B",
    blurb: "Tiny reasoning-style model — fun for step-by-step answers.",
    sizeLabel: "~1.1 GB",
    weight: 2,
    updateUrl: ollamaLibraryUrl("deepseek-r1"),
  },
  {
    id: "phi3-mini",
    ollama: "phi3:mini",
    label: "Phi-3 Mini",
    blurb: "Compact Microsoft model — solid general chat on modest hardware.",
    sizeLabel: "~2.2 GB",
    weight: 2,
    updateUrl: ollamaLibraryUrl("phi3"),
  },
  {
    id: "gemma2-2b",
    ollama: "gemma2:2b",
    label: "Gemma 2 · 2B",
    blurb: "Heavier but still workable on modern laptops.",
    sizeLabel: "~1.6 GB",
    weight: 3,
    updateUrl: ollamaLibraryUrl("gemma2"),
  },
  {
    id: "llama32-3b",
    ollama: "llama3.2:3b",
    label: "Llama 3.2 · 3B",
    blurb: "More headroom when you have RAM to spare.",
    sizeLabel: "~2.0 GB",
    weight: 3,
    updateUrl: ollamaLibraryUrl("llama3.2"),
  },
  {
    id: "qwen25-3b",
    ollama: "qwen2.5:3b",
    label: "Qwen 2.5 · 3B",
    blurb: "Strong mid-size Qwen — nicer prose, still local.",
    sizeLabel: "~1.9 GB",
    weight: 3,
    updateUrl: ollamaLibraryUrl("qwen2.5"),
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
