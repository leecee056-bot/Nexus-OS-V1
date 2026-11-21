export type PortableInfo = {
  portable: boolean;
  kitRoot?: string;
  knowledgeDir?: string;
  filesDir?: string;
  chatsDir?: string;
  userData?: string;
};

type NexusBridge = {
  getPortableInfo?: () => Promise<PortableInfo>;
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
};

function getBridge(): NexusBridge | undefined {
  if (typeof globalThis === "undefined") return undefined;
  const w = globalThis as {
    nexus?: NexusBridge;
    window?: { nexus?: NexusBridge };
  };
  return w.nexus ?? w.window?.nexus;
}

export async function loadPortableInfo(): Promise<PortableInfo> {
  const bridge = getBridge();
  if (!bridge?.getPortableInfo) return { portable: false };
  try {
    return await bridge.getPortableInfo();
  } catch {
    return { portable: false };
  }
}

export async function importHostToUsb() {
  const bridge = getBridge();
  if (!bridge?.importToUsb) {
    return { ok: false as const, error: "USB import needs the desktop app." };
  }
  return bridge.importToUsb();
}

export async function listUsbKnowledge() {
  const bridge = getBridge();
  if (!bridge?.listKnowledge) {
    return { ok: true as const, entries: [] };
  }
  return bridge.listKnowledge();
}

export async function exportChatToUsb(text: string, filename?: string) {
  const bridge = getBridge();
  if (!bridge?.exportChat) {
    return {
      ok: false as const,
      error: "Chat export to USB needs the desktop app.",
    };
  }
  return bridge.exportChat({ text, filename });
}

export async function openUsbPath(p: string) {
  const bridge = getBridge();
  if (!bridge?.openPath) return { ok: false as const };
  return bridge.openPath({ path: p });
}
