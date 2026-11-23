/**
 * Local model runtime via Ollama HTTP API.
 * Desktop Electron uses a main-process proxy (no CORS). Web / mobile use fetch.
 */

export type OllamaStatus =
  | { ok: true; version?: string }
  | { ok: false; reason: string };

export type PullProgress = {
  status: string;
  completed?: number;
  total?: number;
  done?: boolean;
  error?: string;
};

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type NexusBridge = {
  ollamaRequest?: (args: {
    host: string;
    method: string;
    path: string;
    body?: string | null;
  }) => Promise<{ ok: boolean; status: number; text: string }>;
};

function getBridge(): NexusBridge | undefined {
  if (typeof globalThis === "undefined") return undefined;
  const w = globalThis as {
    nexus?: NexusBridge;
    window?: { nexus?: NexusBridge };
  };
  return w.nexus ?? w.window?.nexus;
}

async function request(
  host: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ ok: boolean; status: number; text: string }> {
  const bridge = getBridge();
  const payload = body === undefined ? null : JSON.stringify(body);

  if (bridge?.ollamaRequest) {
    return bridge.ollamaRequest({ host, method, path, body: payload });
  }

  const url = `${host.replace(/\/$/, "")}${path}`;
  try {
    const res = await fetch(url, {
      method,
      headers:
        body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: payload ?? undefined,
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "network error";
    return { ok: false, status: 0, text: msg };
  }
}

export async function checkOllama(host: string): Promise<OllamaStatus> {
  const res = await request(host, "GET", "/api/version");
  if (!res.ok) {
    if (res.status === 0) {
      return {
        ok: false,
        reason:
          "Ollama is not reachable. Install it from Chat, then start it — models stay on this machine.",
      };
    }
    return { ok: false, reason: `Ollama error (${res.status}).` };
  }
  try {
    const json = JSON.parse(res.text) as { version?: string };
    return { ok: true, version: json.version };
  } catch {
    return { ok: true };
  }
}

export async function listLocalTags(host: string): Promise<string[]> {
  const res = await request(host, "GET", "/api/tags");
  if (!res.ok) return [];
  try {
    const json = JSON.parse(res.text) as {
      models?: { name?: string }[];
    };
    return (json.models ?? []).map((m) => m.name || "").filter(Boolean);
  } catch {
    return [];
  }
}

/** True if installed tags include this Ollama model name. */
export function isModelInstalled(tags: string[], ollamaName: string): boolean {
  const want = ollamaName.toLowerCase();
  const [wantName, wantTag = "latest"] = want.split(":");
  return tags.some((t) => {
    const n = t.toLowerCase();
    const [name, tag = "latest"] = n.split(":");
    return (
      name === wantName &&
      (tag === wantTag || wantTag === "latest" || tag === "latest")
    );
  });
}

/**
 * Pull a model. Streams NDJSON progress over fetch; Electron proxy pulls
 * without stream and reports a single completion.
 */
export async function pullModel(
  host: string,
  ollamaName: string,
  onProgress?: (p: PullProgress) => void,
): Promise<{ ok: boolean; error?: string }> {
  const bridge = getBridge();

  if (bridge?.ollamaRequest) {
    onProgress?.({ status: "downloading…" });
    const res = await bridge.ollamaRequest({
      host,
      method: "POST",
      path: "/api/pull",
      body: JSON.stringify({ name: ollamaName, stream: false }),
    });
    if (!res.ok) {
      return { ok: false, error: res.text || `pull failed (${res.status})` };
    }
    onProgress?.({ status: "ready", done: true });
    return { ok: true };
  }

  const url = `${host.replace(/\/$/, "")}/api/pull`;
  const canStream =
    typeof ReadableStream !== "undefined" &&
    typeof TextDecoder !== "undefined";

  try {
    onProgress?.({ status: "downloading…" });
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: ollamaName,
        stream: canStream,
      }),
    });

    if (!canStream || !res.body || typeof res.body.getReader !== "function") {
      const text = await res.text();
      if (!res.ok) {
        return { ok: false, error: text || `pull failed (${res.status})` };
      }
      onProgress?.({ status: "ready", done: true });
      return { ok: true };
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: text || `pull failed (${res.status})` };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let lastError: string | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const row = JSON.parse(line) as PullProgress & { error?: string };
          if (row.error) lastError = row.error;
          onProgress?.(row);
        } catch {
          /* skip */
        }
      }
    }

    if (lastError) return { ok: false, error: lastError };
    onProgress?.({ status: "ready", done: true });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "pull failed",
    };
  }
}

/** Default context tokens for local chat (was effectively short via history trim). */
export const DEFAULT_NUM_CTX = 8192;
export const DEFAULT_NUM_PREDICT = 1024;

export async function deleteModel(
  host: string,
  ollamaName: string,
): Promise<{ ok: boolean; error?: string }> {
  // Ollama accepts DELETE /api/delete with model/name depending on version.
  const res = await request(host, "DELETE", "/api/delete", {
    model: ollamaName,
    name: ollamaName,
  });
  if (!res.ok) {
    return {
      ok: false,
      error: res.text || `Could not uninstall ${ollamaName} (${res.status})`,
    };
  }
  return { ok: true };
}

export async function chatCompletion(
  host: string,
  model: string,
  messages: ChatMessage[],
  opts?: { numCtx?: number; numPredict?: number; temperature?: number },
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const res = await request(host, "POST", "/api/chat", {
    model,
    messages,
    stream: false,
    options: {
      temperature: opts?.temperature ?? 0.7,
      num_predict: opts?.numPredict ?? DEFAULT_NUM_PREDICT,
      num_ctx: opts?.numCtx ?? DEFAULT_NUM_CTX,
    },
  });

  if (!res.ok) {
    return {
      ok: false,
      error:
        res.status === 0
          ? "Ollama is offline. Start Ollama, then try again."
          : res.text || `Chat failed (${res.status})`,
    };
  }

  try {
    const json = JSON.parse(res.text) as {
      message?: { content?: string };
      error?: string;
    };
    if (json.error) return { ok: false, error: json.error };
    const text = json.message?.content?.trim();
    if (!text) return { ok: false, error: "Empty reply from model." };
    return { ok: true, text };
  } catch {
    return { ok: false, error: "Could not parse model reply." };
  }
}

export const OLLAMA_INSTALL_URL = "https://ollama.com/download";
