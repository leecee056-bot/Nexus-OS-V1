/**
 * Optional Electron bridge — real files under USB Files/ or userData/Workspace.
 */

export type WorkspaceDiskApi = {
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
  }) => Promise<{ ok: boolean; path?: string; bytes?: number; error?: string }>;
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
  info?: () => Promise<{
    ok: boolean;
    root?: string;
    portable?: boolean;
    error?: string;
  }>;
};

function getApi(): WorkspaceDiskApi | undefined {
  if (typeof globalThis === "undefined") return undefined;
  const w = globalThis as {
    nexus?: { workspace?: WorkspaceDiskApi };
    window?: { nexus?: { workspace?: WorkspaceDiskApi } };
  };
  return w.nexus?.workspace ?? w.window?.nexus?.workspace;
}

export function hasWorkspaceDisk(): boolean {
  return Boolean(getApi()?.write);
}

export async function diskInfo() {
  const api = getApi();
  if (!api?.info) return { ok: false as const };
  try {
    return await api.info();
  } catch {
    return { ok: false as const };
  }
}

export async function diskList(prefix = "") {
  const api = getApi();
  if (!api?.list) return null;
  return api.list({ prefix });
}

export async function diskRead(path: string) {
  const api = getApi();
  if (!api?.read) return null;
  return api.read({ path });
}

export async function diskWrite(path: string, content: string) {
  const api = getApi();
  if (!api?.write) return null;
  return api.write({ path, content });
}

export async function diskMkdir(path: string) {
  const api = getApi();
  if (!api?.mkdir) return null;
  return api.mkdir({ path });
}

export async function diskRename(from: string, to: string) {
  const api = getApi();
  if (!api?.rename) return null;
  return api.rename({ from, to });
}

export async function diskRemove(path: string) {
  const api = getApi();
  if (!api?.remove) return null;
  return api.remove({ path });
}
