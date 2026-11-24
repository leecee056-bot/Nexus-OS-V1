# Tiny Flask-style app (optional dependency)

If Flask is installed:

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/")
def home():
    return "<h1>Tri-Cass local</h1>"

@app.get("/api/ping")
def ping():
    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
```

Without Flask, prefer stdlib `http.server` or `http.server` + custom handler.
Pocket Agent `flask-app` template may include a requirements note — keep deps optional on Pi.
