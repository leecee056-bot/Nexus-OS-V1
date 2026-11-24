/**
 * Curated offline coding pack v1 (HAP-116).
 * Seeded into Vault as pack-coding-v1-* for search_coding_packs / search_knowledge.
 */

import type { VaultNote } from "../vault/store";

const NOW = Date.now();

/** Stable ids — re-seed only when missing (never overwrite user edits). */
export const CODING_PACK_V1: VaultNote[] = [
  {
    id: "pack-coding-v1-python-cli",
    title: "Coding pack · Python CLI",
    body: `# Python CLI (stdlib)

Minimal argparse script that runs offline:

\`\`\`python
#!/usr/bin/env python3
import argparse

def main():
    p = argparse.ArgumentParser(description="Demo CLI")
    p.add_argument("name", help="Name to greet")
    p.add_argument("-n", "--times", type=int, default=1)
    args = p.parse_args()
    for _ in range(args.times):
        print(f"Hello, {args.name}!")

if __name__ == "__main__":
    main()
\`\`\`

Run: python3 app.py world -n 2
Tips: one file, no third-party imports.`,
    updatedAt: NOW,
  },
  {
    id: "pack-coding-v1-python-http",
    title: "Coding pack · Python HTTP server",
    body: `# Python stdlib HTTP server

Serve a folder:
\`\`\`python
#!/usr/bin/env python3
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os
ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
ThreadingHTTPServer(("127.0.0.1", 8765), SimpleHTTPRequestHandler).serve_forever()
\`\`\`

Or: python3 -m http.server 8765 --bind 127.0.0.1
Open http://127.0.0.1:8765/`,
    updatedAt: NOW,
  },
  {
    id: "pack-coding-v1-python-json",
    title: "Coding pack · Python files + JSON",
    body: `# Python files + JSON

\`\`\`python
from pathlib import Path
import json
p = Path("data.json")
p.write_text(json.dumps({"ok": True, "items": [1, 2, 3]}, indent=2), encoding="utf-8")
loaded = json.loads(p.read_text(encoding="utf-8"))
\`\`\`

Catch FileNotFoundError / json.JSONDecodeError. Prefer pathlib.`,
    updatedAt: NOW,
  },
  {
    id: "pack-coding-v1-html-js",
    title: "Coding pack · HTML CSS JS",
    body: `# HTML + CSS + JS starter

index.html links styles.css + app.js. Keep JS small; no build step.
\`\`\`javascript
document.getElementById("btn")?.addEventListener("click", () => {
  document.getElementById("title").textContent = "Clicked — still offline";
});
\`\`\`
Serve with python3 -m http.server from the project folder.`,
    updatedAt: NOW,
  },
  {
    id: "pack-coding-v1-flask",
    title: "Coding pack · Flask mini",
    body: `# Tiny Flask app (optional)

\`\`\`python
from flask import Flask, jsonify
app = Flask(__name__)
@app.get("/")
def home():
    return "<h1>Tri-Cass local</h1>"
@app.get("/api/ping")
def ping():
    return jsonify({"ok": True})
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
\`\`\`

Without Flask, use stdlib http.server instead.`,
    updatedAt: NOW,
  },
  {
    id: "pack-coding-v1-fixes",
    title: "Coding pack · Common fixes",
    body: `# Common fixes

SyntaxError — rewrite the whole function; count brackets.
ModuleNotFoundError — prefer stdlib on USB/Pi.
FileNotFoundError — relative paths; Path.mkdir(parents=True).
JSONDecodeError — validate before save.
HTML blank — check script src and server cwd.
Stuck ×3 same error — rollback checkpoint; smaller edit.`,
    updatedAt: NOW,
  },
];

export function mergeCodingPackV1(notes: VaultNote[]): {
  notes: VaultNote[];
  added: number;
} {
  const have = new Set(notes.map((n) => n.id));
  const extra = CODING_PACK_V1.filter((n) => !have.has(n.id));
  if (extra.length === 0) return { notes, added: 0 };
  return { notes: [...notes, ...extra], added: extra.length };
}
