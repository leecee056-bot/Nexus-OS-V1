# Python CLI (stdlib)

Minimal argparse script that runs offline:

```python
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
```

Run: `python3 app.py world -n 2`

Tips for tiny models: one file, no third-party imports, print errors clearly.
