#!/usr/bin/env python3
"""Tiny offline Flask-style app without requiring Flask at import time.

Uses only the stdlib HTTP server so it runs on minimal images.
"""
from __future__ import annotations

from http.server import BaseHTTPRequestHandler, HTTPServer

HTML = """<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Tri-Cass</title>
<style>body{font-family:system-ui;background:#07110a;color:#d6ffd6;padding:2rem}
a,button{color:#39ff14}</style></head>
<body><h1>Tri-Cass local app</h1>
<p>Stdlib HTTP server — swap in Flask later if installed.</p>
</body></html>
"""


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):  # noqa: N802
        body = HTML.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):  # quieter
        return


def main() -> None:
    host, port = "127.0.0.1", 8765
    print(f"Serving http://{host}:{port}  (Ctrl+C to stop)")
    HTTPServer((host, port), Handler).serve_forever()


if __name__ == "__main__":
    main()
