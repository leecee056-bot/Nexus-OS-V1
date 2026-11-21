import { ollamaLibraryUrl } from "../updates/links";

/** Desktop image models — pulled via Ollama when image generation is available. */

export type ImageModel = {
  id: string;
  ollama: string;
  label: string;
  blurb: string;
  sizeLabel: string;
  /** Relative weight (1 = lightest among image picks) */
  weight: 1 | 2 | 3;
  /** Official model / install page */
  updateUrl: string;
  /** Suggested width for generate requests */
  width: number;
  height: number;
};

export const RECOMMENDED_IMAGE_MODELS: ImageModel[] = [
  {
    id: "z-image-turbo",
    ollama: "x/z-image-turbo",
    label: "Z-Image Turbo",
    blurb:
      "6B photoreal + bilingual text. Lightest practical local image pick (GPU recommended).",
    sizeLabel: "~12 GB",
    weight: 1,
    updateUrl: ollamaLibraryUrl("x/z-image-turbo"),
    width: 768,
    height: 768,
  },
  {
    id: "flux2-klein",
    ollama: "x/flux2-klein",
    label: "FLUX.2 Klein · 4B",
    blurb: "Fast FLUX.2 — strong prompt adherence and readable text in images.",
    sizeLabel: "~8–13 GB",
    weight: 1,
    updateUrl: ollamaLibraryUrl("x/flux2-klein"),
    width: 768,
    height: 768,
  },
  {
    id: "flux2-klein-9b",
    ollama: "x/flux2-klein:9b",
    label: "FLUX.2 Klein · 9B",
    blurb: "Heavier Klein variant — better detail; needs more VRAM.",
    sizeLabel: "~10+ GB",
    weight: 2,
    updateUrl: ollamaLibraryUrl("x/flux2-klein"),
    width: 768,
    height: 768,
  },
];

export const DEFAULT_IMAGE_MODEL_ID = "z-image-turbo";

export function findImageModel(
  idOrTag: string | null | undefined,
): ImageModel {
  if (!idOrTag) {
    return RECOMMENDED_IMAGE_MODELS.find(
      (m) => m.id === DEFAULT_IMAGE_MODEL_ID,
    )!;
  }
  return (
    RECOMMENDED_IMAGE_MODELS.find(
      (m) => m.id === idOrTag || m.ollama === idOrTag,
    ) ??
    RECOMMENDED_IMAGE_MODELS.find((m) => m.id === DEFAULT_IMAGE_MODEL_ID)!
  );
}
