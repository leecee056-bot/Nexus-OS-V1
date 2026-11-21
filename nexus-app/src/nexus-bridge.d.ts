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
      getPortableInfo?: () => Promise<{
        portable: boolean;
        kitRoot?: string;
        knowledgeDir?: string;
        filesDir?: string;
        chatsDir?: string;
        userData?: string;
      }>;
      listKnowledge?: () => Promise<{
        ok: boolean;
        entries: { name: string; kind: string }[];
        error?: string;
      }>;
      importToUsb?: () => Promise<{
        ok: boolean;
        canceled?: boolean;
        copied?: string[];
        dest?: string;
        error?: string;
      }>;
      exportChat?: (args: {
        text: string;
        filename?: string;
      }) => Promise<{ ok: boolean; path?: string; error?: string }>;
      openPath?: (args: {
        path: string;
      }) => Promise<{ ok: boolean; error?: string }>;
      listBrowsers?: () => Promise<{
        ok: boolean;
        browsers: {
          id: string;
          name: string;
          path: string;
          appMode?: boolean;
        }[];
        prefs: {
          mode?: "window" | "external" | "app";
          browserId?: string | null;
          lastThemeId?: string;
        };
      }>;
      setBrowsePrefs?: (args: {
        mode?: "window" | "external" | "app";
        browserId?: string | null;
        lastThemeId?: string;
      }) => Promise<{ ok: boolean; prefs?: object }>;
      openBrowse?: (args: {
        url: string;
        themeId?: string;
        mode?: "window" | "external" | "app";
        browserId?: string;
      }) => Promise<{ ok: boolean; mode?: string; error?: string }>;
      platform?: string;
    };
  }
}
