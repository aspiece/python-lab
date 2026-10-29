/* Loaded on both GitHub Pages and localhost. Activates only with localhost API. */
(async () => {
 if (!['localhost','127.0.0.1'].includes(location.hostname) || location.port !== '8000') return;
 try {const r=await fetch('/api/terminal-config');if(!r.ok||!(await r.json()).terminal)return;}catch{return;}
 const panel=document.querySelector('.console-main'), run=document.getElementById('runBtn'),stop=document.getElementById('stopBtn');
 if(!panel)return;
 const heading=document.querySelector('.panel-header span');
 if(heading)heading.textContent='LOCAL TERMINAL';
 panel.innerHTML='<div id="localTerminal" style="height:100%;min-height:130px"></div>';
 document.getElementById('terminalPrompt')?.remove();
 const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css';document.head.append(stylesheet);
 await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.js';s.onload=resolve;s.onerror=reject;document.head.append(s)});
 const term=new Terminal({cursorBlink:true,convertEol:true,fontSize:13,theme:{background:'#111821',foreground:'#dbe5f2'}});
 term.open(document.getElementById('localTerminal'));term.write('Connecting to local Python terminal...\r\n');
 let socket,connected=false;
 const url=(location.protocol==='https:'?'wss:':'ws:')+'//'+location.host+'/api/terminal';
 function connect(){socket=new WebSocket(url);socket.onopen=()=>{connected=true;term.clear();term.focus();document.getElementById('runtimeStatus').textContent='Local terminal ready';};socket.onmessage=e=>{let m=JSON.parse(e.data);if(m.type==='output')term.write(m.data);};socket.onclose=()=>{connected=false;term.write('\r\n[Terminal disconnected; reload to reconnect]\r\n');};}
 connect();
 term.onData(data=>{if(connected)socket.send(JSON.stringify({type:'input',data}))});
 const sync=()=>{const workspace=window.pythonLabWorkspace?.();return {name:workspace?.filename||'main.py',files:workspace?.files||{}};};
 // Capture clicks before the legacy browser worker. Real shell runs current editor file.
 run.addEventListener('click',event=>{if(!connected)return;event.stopImmediatePropagation();event.preventDefault();const {name,files}=sync();socket.send(JSON.stringify({type:'files',files}));socket.send(JSON.stringify({type:'input',data:'python "'+name.replace(/["\\]/g,'')+'"\r'}));term.focus();},true);
 stop.addEventListener('click',event=>{if(!connected)return;event.stopImmediatePropagation();event.preventDefault();socket.send(JSON.stringify({type:'input',data:'\x03'}));term.focus();},true);
 // The CLI is primary. Disable the legacy worker controls only while local terminal is active.
 const buttons=document.querySelector('.actions');const note=document.createElement('span');note.textContent='Terminal: type commands below';note.style='font-size:11px;color:#95b4d7';buttons?.prepend(note);
 const prompt=document.querySelector('.input-pane');if(prompt)prompt.hidden=true;
 const resize=new ResizeObserver(()=>{term.resize(Math.max(30,Math.floor(panel.clientWidth/8.2)),Math.max(5,Math.floor(panel.clientHeight/17)));if(connected)socket.send(JSON.stringify({type:'resize',cols:term.cols,rows:term.rows}));});resize.observe(panel);
})();
