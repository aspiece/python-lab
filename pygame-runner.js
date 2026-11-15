/* A separate, disposable runtime for real SDL/Pygame graphics. */
'use strict';
const canvas=document.getElementById('canvas');
const status=document.getElementById('status');
const origin=location.origin;
let started=false;
const send=(type,extra={})=>parent.postMessage({channel:'python-lab-game',type,...extra},origin);
// The trace guard reads this timestamp. A blocked loop cannot refresh it.
window.gameHeartbeat=performance.now();
const heartbeat=setInterval(()=>{window.gameHeartbeat=performance.now();},100);
const held=new Set();
const codes={ArrowLeft:37,ArrowRight:39,Space:32,KeyR:82};
function key(code,down){
 const key=code==='Space'?' ':code==='KeyR'?'r':code;
 const event=new KeyboardEvent(down?'keydown':'keyup',{key,code,keyCode:codes[code],which:codes[code],bubbles:true,cancelable:true});
 canvas.dispatchEvent(event);
 if(down)held.add(code);else held.delete(code);
}
for(const button of document.querySelectorAll('[data-key]')){
 button.addEventListener('pointerdown',e=>{e.preventDefault();canvas.focus();button.setPointerCapture(e.pointerId);key(button.dataset.key,true);});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,()=>{if(held.has(button.dataset.key))key(button.dataset.key,false);});
 // Keyboard activation of an accessible button also generates a key pair.
 button.addEventListener('click',e=>{if(e.detail===0){key(button.dataset.key,true);setTimeout(()=>key(button.dataset.key,false),40);}});
}
canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code))e.preventDefault();});
window.addEventListener('blur',()=>{for(const code of [...held])key(code,false);});
const safePath=p=>typeof p==='string'&&p.split('/').every(x=>x&&!['.','..'].includes(x)&&/^[\w. -]+$/.test(x));
window.addEventListener('message',async event=>{
 if(event.source!==parent||event.origin!==origin||event.data?.type!=='startGame'||started)return;
 started=true;
 const run=event.data.run;
 try{
  if(typeof loadPyodide!=='function')throw Error('Game runtime could not load. Check the CDN connection and try again.');
  const py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'});
  py.setStdout({batched:text=>send('output',{text:text+'\n'})});
  py.setStderr({batched:text=>send('output',{text:text+'\n',error:true})});
  status.textContent='Loading Pygame CE…';
  await py.loadPackage('pygame-ce');
  py.canvas.setCanvas2D(canvas);
  py._api._skip_unwind_fatal_error=true;
  if(run.mode==='pgzero'){
   status.textContent='Loading Pygame Zero…';
   await py.loadPackage(['micropip','numpy']);
   py.globals.set('__pgzero_wheel',new URL('assets/vendor/pgzero-1.2.1-py3-none-any.whl',location.href).href);
   await py.runPythonAsync('import micropip\nawait micropip.install(__pgzero_wheel, deps=False)');
  }
  const base='/home/pyodide';
  for(const [path,content] of Object.entries(run.files||{})){
   if(!safePath(path)||typeof content!=='string')continue;
   if(path.includes('/'))py.FS.mkdirTree(base+'/'+path.slice(0,path.lastIndexOf('/')));
   py.FS.writeFile(base+'/'+path,content,{encoding:'utf8'});
  }
  for(const dir of run.dirs||[])if(safePath(dir))py.FS.mkdirTree(base+'/'+dir);
  const cwd=run.cwd&&safePath(run.cwd)?run.cwd:'';
  py.FS.chdir(base+(cwd?'/'+cwd:''));
  py.globals.set('__game_code',run.code);
  py.globals.set('__game_filename',base+'/'+run.filename);
  py.globals.set('__game_mode',run.mode);
  py.globals.set('__game_args',run.args||[]);
  const response=await fetch('pygame-support.py?v=1');
  if(!response.ok)throw Error('Could not load the browser game runner.');
  status.textContent=run.mode==='pgzero'?'Pygame Zero · click the game for keyboard controls':'Pygame CE · click the game for keyboard controls';
  canvas.focus();
  send('started');
  window.gameHeartbeat=performance.now();
  await py.runPythonAsync(await response.text());
  send('done');
 }catch(error){status.textContent='Game stopped. See the Terminal for details.';send('output',{text:String(error)+'\n',error:true});send('done');}
 finally{clearInterval(heartbeat);}
});
send('ready');
