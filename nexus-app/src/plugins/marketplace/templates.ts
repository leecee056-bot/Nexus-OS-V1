/** Compact single-file HTML mini-apps installed into Files on one tap. */

function shell(title: string, accent: string, body: string, script = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title} · NEXUS</title>
<style>
  :root { --accent:${accent}; --bg:#0b0d12; --fg:#eef2ff; --dim:#9aa3c7; --card:#141824; }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; font:15px/1.45 system-ui,sans-serif; background:radial-gradient(800px 400px at 10% -10%, color-mix(in srgb,var(--accent) 28%, transparent), transparent), var(--bg); color:var(--fg); padding:24px; }
  h1 { margin:0 0 8px; font-size:1.35rem; letter-spacing:.02em; }
  p.sub { color:var(--dim); margin:0 0 20px; }
  .card { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:18px; padding:18px; backdrop-filter:blur(16px); max-width:520px; }
  button, .btn { cursor:pointer; border:1px solid color-mix(in srgb,var(--accent) 55%, transparent); background:color-mix(in srgb,var(--accent) 18%, transparent); color:var(--fg); border-radius:12px; padding:10px 14px; font-weight:700; }
  input, textarea, select { width:100%; border-radius:12px; border:1px solid rgba(255,255,255,.14); background:rgba(0,0,0,.28); color:var(--fg); padding:10px 12px; margin:6px 0 12px; }
  .row { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  .big { font-size:2.4rem; font-variant-numeric:tabular-nums; letter-spacing:.04em; }
  pre, code { white-space:pre-wrap; word-break:break-word; }
  .grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
  .grid button { padding:16px 0; font-size:1.1rem; }
</style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p class="sub">Installed from NEXUS Add-ons · works offline in Files</p>
    ${body}
  </div>
  <script>${script}</script>
</body>
</html>`;
}

export const MINI_APP_BUILDERS: Record<string, () => string> = {
  clock: () =>
    shell(
      "Clock",
      "#9ec5ff",
      `<div class="big" id="t">--:--:--</div><p class="sub" id="d"></p>`,
      `function tick(){const n=new Date();t.textContent=n.toLocaleTimeString();d.textContent=n.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});}tick();setInterval(tick,1000);`,
    ),
  calculator: () =>
    shell(
      "Calculator",
      "#5eead4",
      `<input id="out" readonly value="0" style="font-size:1.4rem;text-align:right" /><div class="grid" id="pad"></div>`,
      `const keys=['C','÷','×','⌫','7','8','9','-','4','5','6','+','1','2','3','=','0','.'];let expr='';const pad=document.getElementById('pad');keys.forEach(k=>{const b=document.createElement('button');b.textContent=k;b.onclick=()=>{if(k==='C')expr='';else if(k==='⌫')expr=expr.slice(0,-1);else if(k==='='){try{expr=String(Function('return '+expr.replace(/÷/g,'/').replace(/×/g,'*'))());}catch{expr='Err'}}else expr+=k;out.value=expr||'0'};pad.appendChild(b);});`,
    ),
  timer: () =>
    shell(
      "Timer",
      "#c4b5fd",
      `<div class="row"><input id="m" type="number" min="0" value="5" style="width:80px" /> min <input id="s" type="number" min="0" max="59" value="0" style="width:80px" /> sec</div><div class="big" id="disp">05:00</div><div class="row"><button id="start">Start</button><button id="reset">Reset</button></div>`,
      `let left=300,id=null;function show(){disp.textContent=String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0')}start.onclick=()=>{if(id)return;left=(+m.value||0)*60+(+s.value||0);show();id=setInterval(()=>{left--;show();if(left<=0){clearInterval(id);id=null;alert('Done')}},1000)};reset.onclick=()=>{clearInterval(id);id=null;left=(+m.value||0)*60+(+s.value||0);show()};show();`,
    ),
  stopwatch: () =>
    shell(
      "Stopwatch",
      "#fb7185",
      `<div class="big" id="disp">00:00.00</div><div class="row"><button id="start">Start</button><button id="lap">Lap</button><button id="reset">Reset</button></div><pre id="laps"></pre>`,
      `let t0=0,acc=0,id=null,laps=[];function fmt(ms){const m=Math.floor(ms/60000),s=Math.floor((ms%60000)/1000),c=Math.floor((ms%1000)/10);return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(c).padStart(2,'0')}function tick(){disp.textContent=fmt(acc+(id?Date.now()-t0:0))}start.onclick=()=>{if(id){acc+=Date.now()-t0;clearInterval(id);id=null;start.textContent='Start'}else{t0=Date.now();id=setInterval(tick,31);start.textContent='Pause'}};lap.onclick=()=>{laps.unshift(fmt(acc+(id?Date.now()-t0:0)));lapsEl=document.getElementById('laps');lapsEl.textContent=laps.map((x,i)=>'#'+(laps.length-i)+'  '+x).join('\\n')};reset.onclick=()=>{clearInterval(id);id=null;acc=0;laps=[];disp.textContent=fmt(0);document.getElementById('laps').textContent='';start.textContent='Start'};`,
    ),
  notes: () =>
    shell(
      "Sticky notes",
      "#f5c542",
      `<textarea id="n" rows="10" placeholder="Jot something…"></textarea><button id="save">Save on this device</button><p class="sub" id="st"></p>`,
      `const k='nexus.sticky';n.value=localStorage.getItem(k)||'';save.onclick=()=>{localStorage.setItem(k,n.value);st.textContent='Saved '+new Date().toLocaleTimeString()};`,
    ),
  units: () =>
    shell(
      "Unit converter",
      "#7dd3fc",
      `<select id="mode"><option value="len">Length (m ↔ ft)</option><option value="temp">Temp (°C ↔ °F)</option><option value="mass">Mass (kg ↔ lb)</option></select><input id="v" type="number" value="1" /><div class="big" id="out">—</div>`,
      `function run(){const x=+v.value;const m=mode.value;if(m==='len')out.textContent=(x*3.28084).toFixed(3)+' ft · '+(x/3.28084).toFixed(3)+' m from ft';if(m==='temp')out.textContent=((x*9/5)+32).toFixed(1)+' °F · '+((x-32)*5/9).toFixed(1)+' °C from °F';if(m==='mass')out.textContent=(x*2.20462).toFixed(3)+' lb · '+(x/2.20462).toFixed(3)+' kg from lb'}mode.onchange=v.oninput=run;run();`,
    ),
  tip: () =>
    shell(
      "Tip calculator",
      "#34d399",
      `<label>Bill</label><input id="bill" type="number" value="40" /><label>Tip %</label><input id="pct" type="number" value="15" /><label>People</label><input id="ppl" type="number" value="2" /><div class="big" id="out">—</div>`,
      `function run(){const b=+bill.value||0,p=+pct.value||0,n=Math.max(1,+ppl.value||1);const tip=b*p/100;out.textContent='Tip '+tip.toFixed(2)+' · Total '+(b+tip).toFixed(2)+' · Each '+((b+tip)/n).toFixed(2)}bill.oninput=pct.oninput=ppl.oninput=run;run();`,
    ),
  password: () =>
    shell(
      "Password generator",
      "#a78bfa",
      `<label>Length</label><input id="len" type="number" min="6" max="64" value="16" /><div class="row"><button id="go">Generate</button><button id="copy">Copy</button></div><pre class="big" id="out" style="font-size:1.1rem"></pre>`,
      `const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';go.onclick=()=>{let s='';const n=Math.min(64,Math.max(6,+len.value||16));for(let i=0;i<n;i++)s+=chars[Math.floor(Math.random()*chars.length)];out.textContent=s};copy.onclick=()=>navigator.clipboard?.writeText(out.textContent);go.onclick();`,
    ),
  colors: () =>
    shell(
      "Color picker",
      "#f472b6",
      `<input id="c" type="color" value="#9ec5ff" style="width:100%;height:64px;padding:0;border:none" /><pre id="out"></pre>`,
      `function run(){const v=c.value;out.textContent=v+'\\nrgb '+parseInt(v.slice(1,3),16)+', '+parseInt(v.slice(3,5),16)+', '+parseInt(v.slice(5,7),16)}c.oninput=run;run();`,
    ),
  checklist: () =>
    shell(
      "Checklist",
      "#38bdf8",
      `<div class="row"><input id="item" placeholder="Add item" /><button id="add">Add</button></div><div id="list"></div>`,
      `const k='nexus.check';let items=JSON.parse(localStorage.getItem(k)||'[]');function save(){localStorage.setItem(k,JSON.stringify(items));render()}function render(){list.innerHTML='';items.forEach((it,i)=>{const row=document.createElement('div');row.className='row';row.style.margin='6px 0';row.innerHTML='<label style="flex:1"><input type="checkbox" '+(it.done?'checked':'')+'/> '+it.text+'</label>';row.querySelector('input').onchange=e=>{items[i].done=e.target.checked;save()};const del=document.createElement('button');del.textContent='✕';del.onclick=()=>{items.splice(i,1);save()};row.appendChild(del);list.appendChild(row)})}add.onclick=()=>{if(!item.value.trim())return;items.push({text:item.value.trim(),done:false});item.value='';save()};render();`,
    ),
  worldclock: () =>
    shell(
      "World clocks",
      "#818cf8",
      `<div id="list"></div>`,
      `const zones=['UTC','America/New_York','Europe/London','Europe/Paris','Asia/Tokyo','Australia/Sydney'];function tick(){list.innerHTML=zones.map(z=>{try{return '<div class="row" style="justify-content:space-between;margin:8px 0"><span>'+z+'</span><strong>'+new Date().toLocaleTimeString(undefined,{timeZone:z})+'</strong></div>'}catch{return ''}}).join('')}tick();setInterval(tick,1000);`,
    ),
  pomodoro: () =>
    shell(
      "Pomodoro",
      "#fb923c",
      `<div class="big" id="disp">25:00</div><div class="row"><button id="focus">Focus 25</button><button id="break">Break 5</button><button id="stop">Stop</button></div>`,
      `let left=25*60,id=null;function show(){disp.textContent=String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0')}function start(sec){clearInterval(id);left=sec;show();id=setInterval(()=>{left--;show();if(left<=0){clearInterval(id);alert('Session done')}},1000)}focus.onclick=()=>start(25*60);break.onclick=()=>start(5*60);stop.onclick=()=>{clearInterval(id);left=25*60;show()};show();`,
    ),

  jsonfmt: () =>
    shell(
      "JSON formatter",
      "#22d3ee",
      `<textarea id="src" rows="8" placeholder='{"hello":"world"}'></textarea><div class="row"><button id="fmt">Format</button><button id="min">Minify</button></div><pre id="out"></pre>`,
      `fmt.onclick=()=>{try{out.textContent=JSON.stringify(JSON.parse(src.value),null,2)}catch(e){out.textContent=String(e)}};min.onclick=()=>{try{out.textContent=JSON.stringify(JSON.parse(src.value))}catch(e){out.textContent=String(e)}};`,
    ),
  regex: () =>
    shell(
      "Regex tester",
      "#e879f9",
      `<input id="re" placeholder="pattern" value="\\\\w+" /><input id="flags" placeholder="flags" value="g" /><textarea id="src" rows="5">hello world_42</textarea><pre id="out"></pre>`,
      `function run(){try{const r=new RegExp(re.value,flags.value);out.textContent=JSON.stringify(src.value.match(r),null,2)}catch(e){out.textContent=String(e)}}re.oninput=flags.oninput=src.oninput=run;run();`,
    ),
  base64: () =>
    shell(
      "Base64",
      "#67e8f9",
      `<textarea id="src" rows="4">NEXUS</textarea><div class="row"><button id="enc">Encode</button><button id="dec">Decode</button></div><pre id="out"></pre>`,
      `enc.onclick=()=>{out.textContent=btoa(unescape(encodeURIComponent(src.value)))};dec.onclick=()=>{try{out.textContent=decodeURIComponent(escape(atob(src.value)))}catch(e){out.textContent=String(e)}};`,
    ),
  uuid: () =>
    shell(
      "UUID generator",
      "#a3e635",
      `<button id="go">New UUID</button><pre class="big" id="out" style="font-size:1rem;margin-top:12px"></pre>`,
      `go.onclick=()=>{out.textContent=crypto.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return (c==='x'?r:(r&0x3|0x8)).toString(16)})};go.onclick();`,
    ),
  markdown: () =>
    shell(
      "Markdown preview",
      "#94a3b8",
      `<textarea id="src" rows="8"># Hello\\n\\n**NEXUS** mini markdown.</textarea><div id="out"></div>`,
      `function esc(s){return s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])}function md(t){return esc(t).replace(/^### (.*)$/gm,'<h3>$1</h3>').replace(/^## (.*)$/gm,'<h2>$1</h2>').replace(/^# (.*)$/gm,'<h1>$1</h1>').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>').replace(/\\*(.+?)\\*/g,'<em>$1</em>').replace(/\\n/g,'<br/>')}src.oninput=()=>out.innerHTML=md(src.value);src.oninput();`,
    ),
  htmlpad: () =>
    shell(
      "HTML sandbox",
      "#fbbf24",
      `<textarea id="src" rows="8"><h1 style="color:teal">Hello</h1></textarea><button id="run">Run</button><iframe id="fr" style="width:100%;height:220px;margin-top:12px;border:1px solid #333;border-radius:12px;background:#fff"></iframe>`,
      `run.onclick=()=>{fr.srcdoc=src.value};run.onclick();`,
    ),
  hash: () =>
    shell(
      "SHA-256 hash",
      "#2dd4bf",
      `<textarea id="src" rows="4">NEXUS</textarea><button id="go">Hash</button><pre id="out"></pre>`,
      `go.onclick=async()=>{const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(src.value));out.textContent=[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('')};`,
    ),
  diff: () =>
    shell(
      "Text diff (simple)",
      "#f87171",
      `<textarea id="a" rows="4" placeholder="A"></textarea><textarea id="b" rows="4" placeholder="B"></textarea><button id="go">Compare</button><pre id="out"></pre>`,
      `go.onclick=()=>{const A=a.value.split('\\n'),B=b.value.split('\\n');const n=Math.max(A.length,B.length);let s='';for(let i=0;i<n;i++){if(A[i]===B[i])s+='  '+(A[i]??'')+'\\n';else{if(A[i]!=null)s+='- '+A[i]+'\\n';if(B[i]!=null)s+='+ '+B[i]+'\\n'}}out.textContent=s||'(identical)'};`,
    ),
  jwt: () =>
    shell(
      "JWT decode",
      "#c084fc",
      `<textarea id="src" rows="4" placeholder="header.payload.sig"></textarea><button id="go">Decode</button><pre id="out"></pre>`,
      `function b64(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return decodeURIComponent(escape(atob(s)))}go.onclick=()=>{try{const p=src.value.trim().split('.');out.textContent=JSON.stringify({header:JSON.parse(b64(p[0])),payload:JSON.parse(b64(p[1]))},null,2)}catch(e){out.textContent=String(e)}};`,
    ),
  cron: () =>
    shell(
      "Cron cheat sheet",
      "#4ade80",
      `<pre style="line-height:1.6">* * * * *\\n│ │ │ │ │\\n│ │ │ │ └── weekday (0-7)\\n│ │ │ └──── month (1-12)\\n│ │ └────── day (1-31)\\n│ └──────── hour (0-23)\\n└────────── minute (0-59)\\n\\nExamples\\n0 9 * * 1-5   weekdays 09:00\\n*/15 * * * *  every 15 min\\n0 0 1 * *     monthly</pre>`,
    ),
  sqlpad: () =>
    shell(
      "SQL scratch notes",
      "#60a5fa",
      `<textarea id="n" rows="12" placeholder="-- draft queries here"></textarea><button id="save">Save</button>`,
      `const k='nexus.sql';n.value=localStorage.getItem(k)||'SELECT * FROM notes;\\n';save.onclick=()=>localStorage.setItem(k,n.value);`,
    ),
  hex: () =>
    shell(
      "Hex ↔ RGB",
      "#f472b6",
      `<input id="hex" value="#39ff14" /><div class="big" id="sw" style="height:48px;border-radius:12px;margin:12px 0"></div><pre id="out"></pre>`,
      `function run(){let h=hex.value.trim();if(h[0]!=='#')h='#'+h;sw.style.background=h;const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);out.textContent='rgb('+r+', '+g+', '+b+')'}hex.oninput=run;run();`,
    ),

  draw: () =>
    shell(
      "Drawing pad",
      "#fbbf24",
      `<canvas id="c" width="420" height="280" style="width:100%;background:#111;border-radius:12px;touch-action:none"></canvas><div class="row"><button id="clear">Clear</button></div>`,
      `const ctx=c.getContext('2d');ctx.strokeStyle='#9ec5ff';ctx.lineWidth=3;ctx.lineCap='round';let d=false;function pos(e){const r=c.getBoundingClientRect();const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left;const y=(e.touches?e.touches[0].clientY:e.clientY)-r.top;return{x:x*(c.width/r.width),y:y*(c.height/r.height)}}function down(e){d=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);e.preventDefault()}function move(e){if(!d)return;const p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke();e.preventDefault()}function up(){d=false}c.onmousedown=down;c.onmousemove=move;c.onmouseup=up;c.onmouseleave=up;c.ontouchstart=down;c.ontouchmove=move;c.ontouchend=up;clear.onclick=()=>ctx.clearRect(0,0,c.width,c.height);`,
    ),
  metronome: () =>
    shell(
      "Metronome",
      "#fb7185",
      `<label>BPM</label><input id="bpm" type="number" value="100" /><div class="row"><button id="start">Start</button><button id="stop">Stop</button></div><div class="big" id="pulse">●</div>`,
      `let id=null,on=false;const AC=window.AudioContext||window.webkitAudioContext;let ac;function click(){if(!ac)ac=new AC();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=880;g.gain.value=0.1;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+0.05);pulse.style.opacity=on?1:0.3;on=!on}start.onclick=()=>{clearInterval(id);click();id=setInterval(click,60000/Math.max(40,+bpm.value||100))};stop.onclick=()=>clearInterval(id);`,
    ),
  dice: () =>
    shell(
      "Dice",
      "#34d399",
      `<div class="big" id="out">🎲</div><div class="row"><button id="d6">d6</button><button id="d20">d20</button><button id="d100">d100</button></div>`,
      `function roll(n){out.textContent=1+Math.floor(Math.random()*n)}d6.onclick=()=>roll(6);d20.onclick=()=>roll(20);d100.onclick=()=>roll(100);`,
    ),
  typing: () =>
    shell(
      "Typing test",
      "#38bdf8",
      `<p id="prompt">the quick nexus companion types offline with calm focus</p><textarea id="src" rows="3"></textarea><pre id="out"></pre>`,
      `const t0=Date.now();src.oninput=()=>{const a=prompt.textContent.trim().split(/\\s+/);const b=src.value.trim().split(/\\s+/).filter(Boolean);let ok=0;for(let i=0;i<b.length;i++)if(b[i]===a[i])ok++;const mins=(Date.now()-t0)/60000;out.textContent='Words '+b.length+' · Accuracy '+Math.round(100*ok/Math.max(1,b.length))+'% · WPM '+Math.round(b.length/Math.max(0.01,mins))};`,
    ),
  pixel: () =>
    shell(
      "Pixel pad",
      "#a78bfa",
      `<canvas id="c" width="160" height="160" style="image-rendering:pixelated;width:100%;max-width:320px;background:#111;border-radius:8px"></canvas><input id="col" type="color" value="#9ec5ff" />`,
      `const ctx=c.getContext('2d');const N=16;function cell(e){const r=c.getBoundingClientRect();const x=Math.floor(((e.touches?e.touches[0].clientX:e.clientX)-r.left)/(r.width/N));const y=Math.floor(((e.touches?e.touches[0].clientY:e.clientY)-r.top)/(r.height/N));ctx.fillStyle=col.value;ctx.fillRect(x*(c.width/N),y*(c.height/N),c.width/N,c.height/N)}c.onmousedown=c.ontouchstart=e=>{cell(e);e.preventDefault()};c.onmousemove=e=>{if(e.buttons)cell(e)};`,
    ),
  ascii: () =>
    shell(
      "ASCII banner",
      "#94a3b8",
      `<input id="src" value="NEXUS" /><pre id="out" style="font-size:10px;line-height:1.1"></pre>`,
      `const map={A:[' ██ ','█  █','████','█  █','█  █'],N:['█  █','██ █','█ ██','█  █','█  █'],E:['████','█   ','███ ','█   ','████'],X:['█  █',' ██ ','  █ ',' ██ ','█  █'],U:['█  █','█  █','█  █','█  █',' ██ '],S:[' ███','█   ',' ██ ','   █','███ '],' ':['    ','    ','    ','    ','    ']};function run(){const rows=['','','','',''];for(const ch of src.value.toUpperCase()){const g=map[ch]||map[' '];g.forEach((line,i)=>rows[i]+=line+' ')}out.textContent=rows.join('\\n')}src.oninput=run;run();`,
    ),
  flashcards: () =>
    shell(
      "Flashcards",
      "#f472b6",
      `<div class="big" id="card" style="min-height:80px;cursor:pointer">Tap</div><div class="row"><button id="next">Next</button></div>`,
      `const deck=[{q:'HTTP 404',a:'Not Found'},{q:'CSS flex',a:'One-dimensional layout'},{q:'git commit',a:'Snapshot of staged changes'},{q:'Ollama',a:'Local model runner'}];let i=0,show=false;function render(){card.textContent=show?deck[i].a:deck[i].q}card.onclick=()=>{show=!show;render()};next.onclick=()=>{i=(i+1)%deck.length;show=false;render()};render();`,
    ),
  soundboard: () =>
    shell(
      "Tone pad",
      "#f59e0b",
      `<div class="row" id="pad"></div>`,
      `const AC=window.AudioContext||window.webkitAudioContext;let ac;const notes=[262,294,330,349,392,440,494,523];notes.forEach((f,i)=>{const b=document.createElement('button');b.textContent='♪'+(i+1);b.onclick=()=>{if(!ac)ac=new AC();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=0.08;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+0.25)};pad.appendChild(b)});`,
    ),
  particles: () =>
    shell(
      "Particle toy",
      "#67e8f9",
      `<canvas id="c" width="420" height="260" style="width:100%;background:#05070c;border-radius:12px"></canvas>`,
      `const ctx=c.getContext('2d');const P=[];for(let i=0;i<40;i++)P.push({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-0.5)*1.2,vy:(Math.random()-0.5)*1.2});function frame(){ctx.fillStyle='rgba(5,7,12,.25)';ctx.fillRect(0,0,c.width,c.height);for(const p of P){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>c.width)p.vx*=-1;if(p.y<0||p.y>c.height)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,2.5,0,6.28);ctx.fillStyle='#9ec5ff';ctx.fill()}requestAnimationFrame(frame)}frame();`,
    ),
  emoji: () =>
    shell(
      "Emoji board",
      "#facc15",
      `<div class="row" id="pad" style="font-size:1.6rem"></div><pre id="out"></pre>`,
      `'😀😎🤖🚀💡🔥⭐🌈🧠🛠️📦✨'.split('').forEach(e=>{if(!e.trim())return;const b=document.createElement('button');b.textContent=e;b.onclick=()=>{out.textContent+=e;navigator.clipboard?.writeText(out.textContent)};pad.appendChild(b)});`,
    ),

  kanban: () =>
    shell(
      "Kanban lite",
      "#818cf8",
      `<div class="row" id="cols" style="align-items:stretch"></div><div class="row"><input id="item" placeholder="New card" /><button id="add">Add to Todo</button></div>`,
      `const k='nexus.kanban';let data=JSON.parse(localStorage.getItem(k)||'{"Todo":["Plan"],"Doing":[],"Done":[]}');function save(){localStorage.setItem(k,JSON.stringify(data));render()}function render(){cols.innerHTML='';Object.keys(data).forEach(col=>{const box=document.createElement('div');box.style.flex='1';box.style.minWidth='120px';box.innerHTML='<strong>'+col+'</strong>';data[col].forEach((t,i)=>{const card=document.createElement('div');card.style.cssText='margin:8px 0;padding:8px;border-radius:10px;background:rgba(255,255,255,.08);cursor:pointer';card.textContent=t;card.onclick=()=>{const keys=Object.keys(data);const n=(keys.indexOf(col)+1)%keys.length;data[col].splice(i,1);data[keys[n]].push(t);save()};box.appendChild(card)});cols.appendChild(box)})}add.onclick=()=>{if(!item.value.trim())return;data.Todo.push(item.value.trim());item.value='';save()};render();`,
    ),
  csv: () =>
    shell(
      "CSV viewer",
      "#4ade80",
      `<textarea id="src" rows="6">name,score\\nAda,12\\nLin,9</textarea><button id="go">Table</button><div id="out"></div>`,
      `go.onclick=()=>{const rows=src.value.trim().split(/\\n/).map(r=>r.split(','));let h='<table style="width:100%;border-collapse:collapse">';rows.forEach((r,i)=>{h+='<tr>'+r.map(c=>'<td style="border:1px solid #333;padding:6px">'+(i===0?'<strong>'+c+'</strong>':c)+'</td>').join('')+'</tr>'});out.innerHTML=h+'</table>'};go.onclick();`,
    ),
  glossary: () =>
    shell(
      "Glossary",
      "#c4b5fd",
      `<input id="q" placeholder="Search" /><div id="list"></div>`,
      `const terms=[{t:'Vault',d:'Searchable notes on device'},{t:'Agent',d:'Chat mode with local tools'},{t:'Ollama',d:'Local model host'},{t:'Spatial',d:'Open floating glass theme'},{t:'Browse',d:'Themed desktop web window'}];function render(){const s=q.value.toLowerCase();list.innerHTML=terms.filter(x=>!s||x.t.toLowerCase().includes(s)||x.d.toLowerCase().includes(s)).map(x=>'<div style="margin:10px 0"><strong>'+x.t+'</strong><div class="sub">'+x.d+'</div></div>').join('')}q.oninput=render;render();`,
    ),
  meeting: () =>
    shell(
      "Meeting notes",
      "#fb923c",
      `<textarea id="n" rows="12" placeholder="Agenda / notes / actions"></textarea><button id="save">Save</button>`,
      `const k='nexus.meeting';n.value=localStorage.getItem(k)||'# Meeting\\n\\n- Attendees:\\n- Notes:\\n- Actions:\\n';save.onclick=()=>localStorage.setItem(k,n.value);`,
    ),
  resume: () =>
    shell(
      "Resume outline",
      "#38bdf8",
      `<textarea id="n" rows="14"></textarea><button id="save">Save</button>`,
      `const k='nexus.resume';n.value=localStorage.getItem(k)||'# Name\\n\\n## Summary\\n\\n## Experience\\n- Role — Company\\n\\n## Skills\\n- \\n';save.onclick=()=>localStorage.setItem(k,n.value);`,
    ),
  mindmap: () =>
    shell(
      "Mind map list",
      "#f472b6",
      `<input id="root" value="Idea" /><textarea id="n" rows="10" placeholder="branch lines…"></textarea><pre id="out"></pre>`,
      `function run(){const lines=n.value.split(/\\n/).filter(Boolean);out.textContent=root.value+'\\n'+lines.map(l=>'  ├─ '+l).join('\\n')}root.oninput=n.oninput=run;n.value='Research\\nBuild\\nShare';run();`,
    ),
  readtimer: () =>
    shell(
      "Reading timer",
      "#2dd4bf",
      `<label>Pages</label><input id="pages" type="number" value="20" /><label>Min / page</label><input id="mpm" type="number" step="0.1" value="1.5" /><div class="big" id="out">—</div>`,
      `function run(){const m=(+pages.value||0)*(+mpm.value||0);out.textContent=Math.floor(m)+' min  '+Math.round((m%1)*60)+' sec'}pages.oninput=mpm.oninput=run;run();`,
    ),
  cite: () =>
    shell(
      "Citation helper",
      "#a3e635",
      `<input id="author" placeholder="Author" /><input id="title" placeholder="Title" /><input id="year" placeholder="Year" /><pre id="out"></pre>`,
      `function run(){out.textContent=author.value+' ('+year.value+'). '+title.value+'.'}author.oninput=title.oninput=year.oninput=run;`,
    ),
  drill: () =>
    shell(
      "Quick drill",
      "#f87171",
      `<div class="big" id="q">?</div><input id="a" placeholder="Answer" /><div class="row"><button id="check">Check</button><button id="next">Next</button></div><pre id="st"></pre>`,
      `const deck=[{q:'2+2',a:'4'},{q:'HTTP secure port',a:'443'},{q:'CSS box model',a:'content padding border margin'}];let i=0,score=0;function show(){q.textContent=deck[i].q;a.value='';st.textContent='Score '+score}check.onclick=()=>{if(a.value.trim()===deck[i].a){score++;st.textContent='Correct · '+score}else st.textContent='Answer: '+deck[i].a};next.onclick=()=>{i=(i+1)%deck.length;show()};show();`,
    ),
  sheet: () =>
    shell(
      "Mini sheet",
      "#4ade80",
      `<div id="grid"></div><pre id="sum"></pre>`,
      `const cells=[];const grid=document.getElementById('grid');grid.style.display='grid';grid.style.gridTemplateColumns='repeat(3,1fr)';grid.style.gap='6px';for(let i=0;i<9;i++){const inp=document.createElement('input');inp.type='number';inp.value=i<3?String((i+1)*2):'';inp.oninput=()=>{const vals=cells.map(c=>+c.value||0);sum.textContent='Sum '+vals.reduce((a,b)=>a+b,0)+' · Avg '+(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)};cells.push(inp);grid.appendChild(inp)}cells[0].oninput();`,
    ),
};

export function buildMiniAppHtml(id: string): string | null {
  const fn = MINI_APP_BUILDERS[id];
  return fn ? fn() : null;
}
