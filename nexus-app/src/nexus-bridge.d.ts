export {};

type OllamaRequestFn = (args: {
  host: string;
  method: string;
  path: string;
  body?: string | null;
}) => Promise<{ ok: boolean; status: number; text: string }>;

type NexusBridge = {
  ollamaRequest?: OllamaRequestFn;
  platform?: string;
};

declare global {
  interface Window {
    nexus?: NexusBridge;
  }

  // eslint-disable-next-line no-var
  var nexus: NexusBridge | undefined;
}
