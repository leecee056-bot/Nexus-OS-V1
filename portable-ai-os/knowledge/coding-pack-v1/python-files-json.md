# Python files + JSON

Read / write text and JSON safely:

```python
from pathlib import Path
import json

p = Path("data.json")
data = {"ok": True, "items": [1, 2, 3]}
p.write_text(json.dumps(data, indent=2), encoding="utf-8")

loaded = json.loads(p.read_text(encoding="utf-8"))
print(loaded["items"])
```

Append a line to a log:

```python
from pathlib import Path
Path("run.log").open("a", encoding="utf-8").write("tick\n")
```

Prefer `pathlib.Path` over string paths. Catch `FileNotFoundError` / `json.JSONDecodeError`.
