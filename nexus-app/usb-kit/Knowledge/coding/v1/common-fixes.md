# Common fixes (small-model agent)

**SyntaxError / unmatched `(`** — count brackets; rewrite the whole function, not one line.

**ModuleNotFoundError** — stick to stdlib on USB/Pi unless the user installed the package.

**FileNotFoundError** — use paths relative to the project folder; create parent dirs with `Path.mkdir(parents=True)`.

**JSONDecodeError** — validate with `json.loads` before saving; write pretty JSON with `indent=2`.

**HTML blank page** — check script `src` path, console errors, and that the server cwd is the project root.

**Permission / sandbox** — Tri-Cass Agent only writes under the project/workspace; never `../` escapes.

**Stuck loop** — after the same error three times, roll back the checkpoint and change approach (smaller edit).
