"""Shared llama-server helpers for Tri-Cass OS TUI apps."""
from __future__ import annotations

import json
import os
import subprocess
import urllib.request
from pathlib import Path


def load_catalog(path: Path) -> list[dict]:
    with path.open() as f:
        return json.load(f).get("models", [])


def present_models(models_dir: Path, catalog: list[dict]) -> list[dict]:
    out = []
    for m in catalog:
        p = models_dir / m["filename"]
        entry = dict(m)
        entry["present"] = p.is_file() and p.stat().st_size > 1000
        entry["path"] = str(p)
        out.append(entry)
    known = {m["filename"] for m in catalog}
    for p in sorted(Path(models_dir).glob("*.gguf")):
        if p.name in known:
            continue
        out.append(
            {
                "id": p.stem,
                "name": p.name,
                "filename": p.name,
                "license": "unknown",
                "tier_fit": ["?"],
                "approx_size_mb": round(p.stat().st_size / (1024 * 1024)),
                "present": True,
                "path": str(p),
                "role": "local",
            }
        )
    return out


def http_json(url: str, payload: dict | None = None, timeout: float = 120.0):
    data = None
    headers = {"Content-Type": "application/json"}
    if payload is not None:
        data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method="POST" if data else "GET")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        body = r.read().decode()
        return json.loads(body) if body else {}


def server_alive(base: str) -> bool:
    for path in ("/health", "/v1/models"):
        try:
            urllib.request.urlopen(base + path, timeout=1.5)
            return True
        except Exception:
            continue
    return False


def chat_completion(base: str, messages: list[dict], temperature: float = 0.7, max_tokens: int = 256) -> str:
    try:
        resp = http_json(
            f"{base}/v1/chat/completions",
            {
                "messages": messages,
                "temperature": temperature,
                "stream": False,
                "max_tokens": max_tokens,
            },
        )
        return resp["choices"][0]["message"]["content"]
    except Exception:
        prompt = ""
        for m in messages:
            prompt += f"{m['role']}: {m['content']}\n"
        prompt += "assistant:"
        resp = http_json(
            f"{base}/completion",
            {"prompt": prompt, "n_predict": max_tokens, "temperature": temperature, "stream": False},
        )
        return resp.get("content") or resp.get("completion") or str(resp)


def completion_with_grammar(
    base: str,
    messages: list[dict],
    grammar: str | None = None,
    temperature: float = 0.2,
    max_tokens: int = 768,
) -> str:
    """Chat completion; when grammar is set, prefer llama.cpp /completion + GBNF."""
    prompt = ""
    for m in messages:
        prompt += f"{m['role']}: {m['content']}\n"
    prompt += "assistant:"

    if grammar:
        try:
            payload = {
                "prompt": prompt,
                "n_predict": max_tokens,
                "temperature": temperature,
                "stream": False,
                "grammar": grammar,
            }
            resp = http_json(f"{base}/completion", payload, timeout=180.0)
            text = resp.get("content") or resp.get("completion") or ""
            if text:
                return text
        except Exception:
            pass
        # OpenAI-compatible servers sometimes accept grammar on chat
        try:
            resp = http_json(
                f"{base}/v1/chat/completions",
                {
                    "messages": messages,
                    "temperature": temperature,
                    "stream": False,
                    "max_tokens": max_tokens,
                    "grammar": grammar,
                },
                timeout=180.0,
            )
            return resp["choices"][0]["message"]["content"]
        except Exception:
            pass

    return chat_completion(base, messages, temperature=temperature, max_tokens=max_tokens)


def restart_server(model_path: str, ctx: int, root: Path, threads: int = 0) -> None:
    stop = root / "scripts" / "stop-infer.sh"
    start = root / "scripts" / "start-infer.sh"
    subprocess.run(["bash", str(stop)], check=False)
    env = os.environ.copy()
    env["N_CTX"] = str(ctx)
    if threads > 0:
        env["N_THREADS"] = str(threads)
    env.setdefault(
        "PORTABLE_AI_RUNTIME",
        os.environ.get("PORTABLE_AI_RUNTIME", "/opt/portable-ai-os/runtime"),
    )
    subprocess.run(["bash", str(start), model_path], check=True, env=env)
