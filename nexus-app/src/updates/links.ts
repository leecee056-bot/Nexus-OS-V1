/**
 * Official update / download pages. We do not host the large files —
 * “Check for updates” just opens the right curated link.
 * Same pattern can later cover USB/Pi images and Cardputer firmware.
 */

export const OS_UPDATE_URL = "https://nexus-os.apps.grok.bot/download";
export const OS_RELEASES_URL =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases";
export const COMPANION_RELEASES_URL =
  "https://github.com/leecee056-bot/Nexus-OS-V1/releases?q=companion";
export const COMPANION_GUIDE_URL =
  "https://nexus-os.apps.grok.bot/guides/companion-app.md";
export const AGENT_GUIDE_URL =
  "https://nexus-os.apps.grok.bot/guides/companion-agent.md";
export const IMAGE_GUIDE_URL =
  "https://nexus-os.apps.grok.bot/guides/companion-image.md";
export const OLLAMA_LIBRARY_URL = "https://ollama.com/library";
export const OLLAMA_DOWNLOAD_URL = "https://ollama.com/download";
export const COMFYUI_URL = "https://www.comfy.org/";

/** Build an Ollama library page for a model name / tag. */
export function ollamaLibraryUrl(ollamaName: string): string {
  const base = ollamaName.split(":")[0];
  return `${OLLAMA_LIBRARY_URL}/${base}`;
}
