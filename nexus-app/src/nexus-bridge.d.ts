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
      addToDesktop?: () => Promise<{
        ok: boolean;
        desktop?: string;
        startMenu?: string;
        created?: string[];
        error?: string;
      }>;
      newWindow?: () => Promise<{ ok: boolean }>;
      closeWindow?: () => Promise<{ ok: boolean }>;
      windowBack?: () => Promise<{ ok: boolean; navigated?: boolean }>;
      windowForward?: () => Promise<{ ok: boolean; navigated?: boolean }>;
      windowNavState?: () => Promise<{
        ok: boolean;
        canBack?: boolean;
        canForward?: boolean;
      }>;
      workspace?: {
        info?: () => Promise<{
          ok: boolean;
          root?: string;
          portable?: boolean;
          error?: string;
        }>;
        list?: (args: {
          prefix?: string;
        }) => Promise<{
          ok: boolean;
          entries?: { name: string; kind: "file" | "folder" }[];
          root?: string;
          error?: string;
        }>;
        read?: (args: {
          path: string;
        }) => Promise<{ ok: boolean; text?: string; error?: string }>;
        write?: (args: {
          path: string;
          content: string;
        }) => Promise<{
          ok: boolean;
          path?: string;
          bytes?: number;
          error?: string;
        }>;
        mkdir?: (args: {
          path: string;
        }) => Promise<{ ok: boolean; path?: string; error?: string }>;
        rename?: (args: {
          from: string;
          to: string;
        }) => Promise<{ ok: boolean; path?: string; error?: string }>;
        remove?: (args: {
          path: string;
        }) => Promise<{ ok: boolean; error?: string }>;
      };
      platform?: string;
    };
  }
}
