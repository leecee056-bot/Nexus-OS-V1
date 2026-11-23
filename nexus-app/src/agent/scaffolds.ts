/**
 * Pocket Agent scaffolds — mirror portable-ai-os/projects/templates for Companion.
 * Writes under Files workspace (projects/<name>/).
 */

export type ScaffoldKind = "html-app" | "timer-app" | "python-cli" | "flask-app";

export function guessScaffold(userMessage: string): { kind: ScaffoldKind; name: string } | null {
  const q = userMessage.toLowerCase();
  const nameMatch = q.match(/(?:called|named|as)\s+([a-z0-9_-]+)/i);
  const name = (nameMatch?.[1] || "my-app").replace(/[^a-z0-9_-]/gi, "-").slice(0, 48);
  if (/timer|countdown|pomodoro/.test(q)) return { kind: "timer-app", name };
  if (/flask|http server|local server/.test(q)) return { kind: "flask-app", name };
  if (/cli|command line|python script/.test(q)) return { kind: "python-cli", name };
  if (
    /(?:make|create|build|scaffold)\s+(?:me\s+)?(?:a\s+|an\s+)?(?:simple\s+|small\s+|basic\s+)?(?:app|tool|html|web app)/i.test(
      userMessage,
    ) || /\b(html app|offline app)\b/i.test(userMessage)
  ) {
    return { kind: "html-app", name };
  }
  return null;
}

export function scaffoldFiles(
  kind: ScaffoldKind,
  name: string,
  topic?: string,
): { path: string; content: string }[] {
  const title = topic || name;
  const base = `projects/${name}`;
  if (kind === "timer-app") {
    return [
      {
        path: `${base}/index.html`,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Timer — ${title}</title>
  <style>
    *{box-sizing:border-box}
    body{font-family:ui-sans-serif,system-ui,sans-serif;background:radial-gradient(1200px 600px at 10% -10%,#163220,#040804 55%);color:#c8ffd0;margin:0;min-height:100vh;padding:2.5rem}
    header{color:#39ff14;letter-spacing:.18em;text-transform:uppercase;font-size:.85rem;margin-bottom:2rem}
    .display{font-size:2.8rem;font-variant-numeric:tabular-nums;margin:1rem 0;color:#39ff14}
    .row{display:flex;flex-wrap:wrap;gap:.5rem}
    .btn{background:rgba(57,255,20,.12);border:1px solid rgba(57,255,20,.35);color:#eaffea;padding:.55rem 1rem;cursor:pointer;font:inherit}
  </style>
</head>
<body>
  <header><strong>Tri-Cass</strong> · Timer</header>
  <main>
    <div class="display" id="clock">05:00</div>
    <div class="row">
      <button class="btn" type="button" data-m="1">1 min</button>
      <button class="btn" type="button" data-m="5">5 min</button>
      <button class="btn" type="button" data-m="25">25 min</button>
      <button class="btn" type="button" id="start">Start</button>
      <button class="btn" type="button" id="reset">Reset</button>
    </div>
    <p id="status">Offline timer — built by Companion Agent.</p>
  </main>
  <script>
    let left=300,timer=null;
    const clock=document.getElementById("clock"),status=document.getElementById("status");
    function paint(){const m=String(Math.floor(left/60)).padStart(2,"0");const s=String(left%60).padStart(2,"0");clock.textContent=m+":"+s;}
    document.querySelectorAll("[data-m]").forEach(b=>{b.onclick=()=>{left=Number(b.dataset.m)*60;paint();status.textContent="Ready";};});
    document.getElementById("start").onclick=()=>{if(timer)return;status.textContent="Running…";timer=setInterval(()=>{left-=1;paint();if(left<=0){clearInterval(timer);timer=null;status.textContent="Done";left=0;paint();}},1000);};
    document.getElementById("reset").onclick=()=>{if(timer)clearInterval(timer);timer=null;left=300;paint();status.textContent="Reset";};
    paint();
  </script>
</body>
</html>`,
      },
      {
        path: `${base}/README.txt`,
        content: `${title} timer\n\nOpen index.html in a browser.\nEdit from Companion → Files → projects/${name}/\n`,
      },
    ];
  }
  if (kind === "python-cli") {
    return [
      {
        path: `${base}/main.py`,
        content: `#!/usr/bin/env python3
"""${title} — Tri-Cass Pocket Agent CLI starter."""
import argparse


def main() -> None:
    p = argparse.ArgumentParser(description="${title}")
    p.add_argument("words", nargs="*", help="optional words")
    args = p.parse_args()
    print("Hello from", "${name}", "—", " ".join(args.words) or "ready")


if __name__ == "__main__":
    main()
`,
      },
      {
        path: `${base}/README.txt`,
        content: `Run: python3 main.py\nOffline CLI scaffold from Tri-Cass Companion.\n`,
      },
    ];
  }
  if (kind === "flask-app") {
    return [
      {
        path: `${base}/app.py`,
        content: `"""${title} — tiny Flask starter (install flask if needed)."""
from flask import Flask

app = Flask(__name__)


@app.get("/")
def home():
    return "<h1>${title}</h1><p>Local Flask app from Tri-Cass.</p>"


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050, debug=False)
`,
      },
      {
        path: `${base}/README.txt`,
        content: `pip install flask && python3 app.py\nThen open http://127.0.0.1:5050\n`,
      },
    ];
  }
  // html-app
  return [
    {
      path: `${base}/index.html`,
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header><strong>Tri-Cass</strong> · ${title}</header>
  <main>
    <h1>${title}</h1>
    <p>Built locally by your Tri-Cass Companion agent. Edit these files in Files → projects/${name}/.</p>
    <button class="btn" type="button" id="go">Say hi</button>
    <p class="status" id="status"></p>
  </main>
  <script src="app.js"></script>
</body>
</html>`,
    },
    {
      path: `${base}/styles.css`,
      content: `*{box-sizing:border-box}
body{font-family:ui-sans-serif,system-ui,sans-serif;background:radial-gradient(1200px 600px at 10% -10%,#163220,#040804 55%);color:#c8ffd0;margin:0;min-height:100vh;padding:2.5rem}
header{color:#39ff14;letter-spacing:.18em;text-transform:uppercase;font-size:.85rem;margin-bottom:2rem}
main{max-width:40rem}
h1{font-size:clamp(1.8rem,4vw,2.6rem);margin:0 0 .75rem;color:#eaffea}
.btn{background:rgba(57,255,20,.12);border:1px solid rgba(57,255,20,.35);color:#eaffea;padding:.55rem 1rem;cursor:pointer;font:inherit}
.status{opacity:.75;margin-top:1rem}`,
    },
    {
      path: `${base}/app.js`,
      content: `document.getElementById("go")?.addEventListener("click", () => {
  const s = document.getElementById("status");
  if (s) s.textContent = "Hello from ${name} — offline.";
});
`,
    },
    {
      path: `${base}/README.txt`,
      content: `${title}\n\nOpen index.html in a browser.\nIcons: copy from Tri-Cass ui-kit (Lucide MIT / Twemoji CC-BY).\n`,
    },
  ];
}
