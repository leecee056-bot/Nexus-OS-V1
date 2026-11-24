# Python stdlib HTTP server

Serve a folder (good for html-app scaffolds):

```python
#!/usr/bin/env python3
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
PORT = 8765
ThreadingHTTPServer(("127.0.0.1", PORT), SimpleHTTPRequestHandler).serve_forever()
```

Or one-liner from the project folder:

`python3 -m http.server 8765 --bind 127.0.0.1`

Open `http://127.0.0.1:8765/`. Stop with Ctrl+C.
