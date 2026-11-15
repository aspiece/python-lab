/* Routes game programs to a disposable iframe; normal Python keeps its worker. */
(() => {
 'use strict';
 let frame=null, callbacks=null, timer=null;
 function modeFor(code,files,choice='auto'){
  if(choice!=='auto')return choice;
  // Search the entry and local imports, not unrelated files in the project.
  const seen=new Set();
  function scan(source){
   let result='python';
   for(const match of source.matchAll(/^\s*(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/gm)){
    const name=(match[1]||match[2]).split('.')[0];
    if(name==='pgzero'||name==='pgzrun')return 'pgzero';
    if(name==='pygame')result='pygame';
    for(const path of Object.keys(files||{}).filter(p=>p===name+'.py'||p.endsWith('/'+name+'.py'))){
     if(seen.has(path))continue;seen.add(path);
     const nested=scan(files[path]);if(nested==='pgzero')return nested;if(nested==='pygame')result=nested;
    }
   }
   return result;
  }
  return scan(code);
 }
 function stop(){
  clearTimeout(timer);timer=null;
  if(frame){frame.remove();frame=null;}
  document.getElementById('pygamePanel').hidden=true;
  callbacks=null;
 }
 function start(run,handlers){
  stop();callbacks=handlers;
  const panel=document.getElementById('pygamePanel');panel.hidden=false;
  frame=document.createElement('iframe');frame.title=run.mode==='pgzero'?'Pygame Zero game':'Pygame CE game';
  frame.src='pygame-runner.html?v=3';
  document.getElementById('pygameFrameHost').replaceChildren(frame);
  // Only the current frame may start execution or report results.
  frame._run=run;
  timer=setTimeout(()=>{if(callbacks){callbacks.output('The game runtime did not finish loading. Check your connection and press Run to retry.\n',true);callbacks.done();}},90000);
 }
 window.addEventListener('message',event=>{
  if(!frame||event.source!==frame.contentWindow||event.origin!==location.origin||event.data?.channel!=='python-lab-game')return;
  const data=event.data;
  if(data.type==='ready'){frame.contentWindow.postMessage({type:'startGame',run:frame._run},location.origin);}
  if(data.type==='output')callbacks?.output(String(data.text||''),Boolean(data.error));
  if(data.type==='started'){clearTimeout(timer);timer=null;}
  if(data.type==='done'){clearTimeout(timer);callbacks?.done();}
 });
 document.getElementById('closePygameBtn').addEventListener('click',()=>document.getElementById('stopBtn').click());
 window.pythonLabGameRunner={modeFor,start,stop};
})();
