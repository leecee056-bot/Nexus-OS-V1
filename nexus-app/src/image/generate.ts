/**
 * Local image generation via Ollama (experimental / version-dependent).
 * Tries native generate + OpenAI-compatible images endpoints.
 */

import type { ImageModel } from "./models";

type NexusBridge = {
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

function extractBase64(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const row = payload as Record<string, unknown>;

  if (Array.isArray(row.images) && typeof row.images[0] === "string") {
    return row.images[0];
  }

  if (Array.isArray(row.data)) {
    const first = row.data[0] as Record<string, unknown> | undefined;
    if (first && typeof first.b64_json === "string") return first.b64_json;
  }

  if (typeof row.image === "string") return row.image;
  return null;
}

export type GenerateResult =
  | { ok: true; base64: string; mime: string }
  | { ok: false; error: string; unsupported?: boolean };

/**
 * Generate one image locally. Returns PNG/JPEG base64 without data-URL prefix.
 */
export async function generateImage(
  host: string,
  model: ImageModel,
  prompt: string,
): Promise<GenerateResult> {
  const cleaned = prompt.trim();
  if (!cleaned) return { ok: false, error: "Enter a prompt first." };

  // 1) Native Ollama generate (image models return `images: [b64]`)
  const gen = await request(host, "POST", "/api/generate", {
    model: model.ollama,
    prompt: cleaned,
    stream: false,
    options: {
      width: model.width,
      height: model.height,
    },
  });

  if (gen.ok) {
    try {
      const json = JSON.parse(gen.text) as unknown;
      const b64 = extractBase64(json);
      if (b64) {
        return { ok: true, base64: stripDataUrl(b64), mime: "image/png" };
      }
      const err = (json as { error?: string }).error;
      if (err) return { ok: false, error: err };
    } catch {
      /* fall through */
    }
  }

  // 2) OpenAI-compatible images API (present on some Ollama builds)
  const openai = await request(host, "POST", "/v1/images/generations", {
    model: model.ollama,
    prompt: cleaned,
    size: `${model.width}x${model.height}`,
    n: 1,
    response_format: "b64_json",
  });

  if (openai.ok) {
    try {
      const json = JSON.parse(openai.text) as unknown;
      const b64 = extractBase64(json);
      if (b64) {
        return { ok: true, base64: stripDataUrl(b64), mime: "image/png" };
      }
    } catch {
      /* fall through */
    }
  }

  if (gen.status === 404 || openai.status === 404) {
    return {
      ok: false,
      unsupported: true,
      error:
        "This Ollama build does not expose image generation. Use a build that includes image models (or pin 0.32.5), pull a listed model, then try again — or use ComfyUI from Check for updates.",
    };
  }

  if (gen.status === 0 && openai.status === 0) {
    return {
      ok: false,
      error: "Ollama is offline. Start it, then generate again.",
    };
  }

  const detail =
    safeSnippet(gen.text) ||
    safeSnippet(openai.text) ||
    `Generate failed (${gen.status || openai.status})`;
  return { ok: false, error: detail };
}

function stripDataUrl(s: string): string {
  const i = s.indexOf("base64,");
  return i >= 0 ? s.slice(i + 7) : s;
}

function safeSnippet(text: string): string {
  const t = text.trim();
  if (!t) return "";
  if (t.length > 220) return `${t.slice(0, 220)}…`;
  return t;
}

export async function saveGeneratedImage(
  base64: string,
  filename: string,
): Promise<{ ok: boolean; path?: string; error?: string }> {
  const bridge = getBridge();
  if (bridge?.saveImage) {
    return bridge.saveImage({ base64, filename });
  }
  return {
    ok: false,
    error: "Save to disk is available in the Windows / Mac desktop app.",
  };
}

export function toDataUrl(base64: string, mime = "image/png"): string {
  return `data:${mime};base64,${base64}`;
}
