/* Canvas output for the bundled lab_graphics Python module. */
(() => {
 'use strict';
 const panel=document.getElementById('gamePanel');
 const canvas=document.getElementById('gameCanvas');
 const ctx=canvas.getContext('2d');
 let getWorker=()=>null;
 const held=new Set();
 const allowed=new Set(['ArrowLeft','ArrowRight','Space','r']);
 const publish=()=>getWorker()?.postMessage({type:'graphicsInput',keys:[...held]});
 const release=()=>{held.clear();publish();};
 function close(){panel.hidden=true;release();}
 function draw(commands){
  if(panel.hidden){panel.hidden=false;canvas.focus();}
  for(const c of commands.slice(0,2000)){
   ctx.beginPath();
   if(c[0]==='clear'){ctx.fillStyle=c[1];ctx.fillRect(0,0,640,480);}
   if(c[0]==='rect'){ctx.fillStyle=c[5];ctx.fillRect(c[1],c[2],c[3],c[4]);}
   if(c[0]==='circle'){ctx.fillStyle=c[4];ctx.arc(c[1],c[2],Math.max(0,c[3]),0,Math.PI*2);ctx.fill();}
   if(c[0]==='text'){ctx.fillStyle=c[4];ctx.font=Math.max(8,Math.min(72,c[5]))+'px sans-serif';ctx.fillText(String(c[1]),c[2],c[3]);}
  }
 }
 canvas.addEventListener('keydown',event=>{const key=event.code==='Space'?'Space':event.key.toLowerCase()==='r'?'r':event.key;if(allowed.has(key)){event.preventDefault();held.add(key);publish();}});
 canvas.addEventListener('keyup',event=>{const key=event.code==='Space'?'Space':event.key.toLowerCase()==='r'?'r':event.key;held.delete(key);publish();});
 canvas.addEventListener('blur',release);
 window.addEventListener('blur',release);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
 for(const button of panel.querySelectorAll('[data-game-key]')){
  button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);held.add(button.dataset.gameKey);publish();});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>{held.delete(button.dataset.gameKey);publish();});
 }
 document.getElementById('closeGameBtn').addEventListener('click',()=>{document.getElementById('stopBtn').click();close();});
 window.pythonLabGraphics={draw,close,attach:callback=>{getWorker=callback;}};
})();
