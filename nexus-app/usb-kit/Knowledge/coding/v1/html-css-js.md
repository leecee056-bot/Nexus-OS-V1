# HTML + CSS + JS starter

`index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Local app</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main>
    <h1 id="title">Hello</h1>
    <button id="btn" type="button">Click</button>
  </main>
  <script src="app.js"></script>
</body>
</html>
```

`app.js`:

```javascript
const btn = document.getElementById("btn");
const title = document.getElementById("title");
btn.addEventListener("click", () => {
  title.textContent = "Clicked — still offline";
});
```

Keep JS small; no build step. Serve with `python3 -m http.server`.
