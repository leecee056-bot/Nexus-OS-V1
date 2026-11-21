/** Electron preload bridge (desktop companion). */
export {};

declare global {
  interface Window {
    nexus?: {
      ollamaRequest?: (args: {
        host: string;
        method: string;
        path: string;
        body?: string | null;
      }) => Promise<{ ok: boolean; status: number; text: string }>;
      saveImage?: (args: {
        base64: string;
        filename: string;
      }) => Promise<{ ok: boolean; path?: string; error?: string }>;
      platform?: string;
    };
  }
}
