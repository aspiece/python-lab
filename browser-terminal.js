/* Python Lab browser terminal: xterm.js display over the existing safe simulated shell.
 * No local subprocesses or server commands are executed on GitHub Pages.
 */
(async () => {
 'use strict';
 if (['localhost','127.0.0.1'].includes(location.hostname) && location.port==='8000') return;
 const host=window.pythonLabTerminalHost,container=document.getElementById('browserTerminal');
 if(!host||!container)return;
 try{
  const css=document.createElement('link');css.rel='stylesheet';
  css.href='https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css';document.head.append(css);
  if(typeof window.Terminal!=='function'){
   await new Promise((resolve,reject)=>{
    const tag=document.createElement('script');
    tag.src='https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.js';
    tag.onload=resolve;tag.onerror=()=>reject(new Error('xterm.js could not load'));
    document.head.append(tag);
   });
  }
  const term=new window.Terminal({
   cursorBlink:true,convertEol:false,fontFamily:'Consolas, Menlo, monospace',
   fontSize:13,lineHeight:1.25,scrollback:3000,allowTransparency:false,
   theme:{background:'#111821',foreground:'#dce6f5',cursor:'#9acaff',selectionBackground:'#4d6987'}
  });
  container.hidden=false;term.open(container);
  const parent=container.parentElement;parent.classList.add('terminal-enhanced');
  let mode='busy',prompt='',line='',cursor=0,history=[],historyIndex=0,historyDraft='';
  const crlf=text=>String(text).replace(/\r?\n/g,'\r\n');
  const safePrompt=()=>{
   // The simulated shell prompt is an ordinary visible string, never executable.
   return '\x1b[1;32m'+prompt+'\x1b[0m';
  };
  function paint(){
   term.write('\r\x1b[2K'+safePrompt()+line);
   if(cursor<line.length)term.write('\x1b['+(line.length-cursor)+'D');
  }
  function setLine(value){line=String(value);cursor=line.length;paint();}
  function setMode(next,nextPrompt){
   mode=next;line='';cursor=0;historyIndex=history.length;
   if(next==='shell'){prompt=nextPrompt||'~/python-lab $ ';term.write(safePrompt());}
   else if(next==='input')prompt=nextPrompt||'';
   else prompt='';
  }
  function submit(){
   const answer=line;term.write('\r\n');line='';cursor=0;
   if(mode==='shell'&&answer.trim()){history.push(answer);if(history.length>100)history.shift();}
   historyIndex=history.length;host.submit(answer);
  }
  function keyInput(data){
   if(mode!=='shell'&&mode!=='input'){
    if(data==='\x03')host.interrupt();
    return;
   }
   if(data==='\r'||data==='\n'){submit();return;}
   if(data==='\x03'){
    if(mode==='input'){term.write('^C\r\n');host.interrupt();}
    else{line='';cursor=0;term.write('^C\r\n');term.write(safePrompt());}
    return;
   }
   if(data==='\x0c'){term.clear();term.write(safePrompt()+line);return;}
   if(data==='\x01'){cursor=0;paint();return;}
   if(data==='\x05'){cursor=line.length;paint();return;}
   if(data==='\x15'){line='';cursor=0;paint();return;}
   if(data==='\x7f'||data==='\b'){if(cursor>0){line=line.slice(0,cursor-1)+line.slice(cursor);cursor--;paint();}return;}
   if(data==='\x1b[3~'){if(cursor<line.length){line=line.slice(0,cursor)+line.slice(cursor+1);paint();}return;}
   if(data==='\x1b[D'){if(cursor>0){cursor--;paint();}return;}
   if(data==='\x1b[C'){if(cursor<line.length){cursor++;paint();}return;}
   if(data==='\x1b[H'||data==='\x1b[1~'){cursor=0;paint();return;}
   if(data==='\x1b[F'||data==='\x1b[4~'){cursor=line.length;paint();return;}
   if(mode==='shell'&&data==='\x1b[A'){
    if(historyIndex===history.length)historyDraft=line;
    if(historyIndex>0){historyIndex--;setLine(history[historyIndex]);}
    return;
   }
   if(mode==='shell'&&data==='\x1b[B'){
    if(historyIndex<history.length){historyIndex++;setLine(historyIndex===history.length?historyDraft:history[historyIndex]);}
    return;
   }
   if(mode==='shell'&&data==='\t'){
    const matches=host.complete(line);
    if(matches.length===1)setLine(matches[0]+(matches[0].endsWith('/')?'':' '));
    else if(matches.length>1){term.write('\r\n'+crlf(matches.join('  '))+'\r\n');paint();}
    return;
   }
   if(data.startsWith('\x1b'))return;
   // Clipboard paste may arrive in one onData chunk; preserve Unicode and embedded spaces.
   for(const char of data){
    if(char==='\r'||char==='\n'){submit();continue;}
    if(char<' '&&char!=='\t')continue;
    line=line.slice(0,cursor)+char+line.slice(cursor);cursor+=char.length;
   }
   paint();
  }
  term.onData(keyInput);
  const adapter={
   write(value,cls=''){
    const text=crlf(value);
    if(cls==='error-line')term.write('\x1b[31m'+text+'\x1b[0m');
    else if(cls==='success-line')term.write('\x1b[32m'+text+'\x1b[0m');
    else term.write(text);
    if(mode==='busy'||mode==='input')term.scrollToBottom();
   },
   setMode,focus:()=>term.focus(),clear:()=>{term.clear();},setPrompt(value){prompt=value; if(mode==='shell')paint();},
   echoCommand(command){if(mode==='shell'){setLine(command);term.write('\r\n');line='';cursor=0;}else term.write('\r\n'+safePrompt()+command+'\r\n');},
   resize:()=>{const width=container.clientWidth,height=container.clientHeight;
    if(width>50&&height>40)term.resize(Math.max(22,Math.floor((width-20)/7.85)),Math.max(4,Math.floor((height-16)/17.2)));
   }
  };
  host.attach(adapter);
  const observer=new ResizeObserver(()=>adapter.resize());observer.observe(container);
  adapter.resize();
  parent.addEventListener('click',()=>term.focus());
  term.focus();
 }catch(err){
  console.warn('Enhanced terminal unavailable; keeping basic terminal.',err);
  container.hidden=true;
  container.parentElement?.classList.remove('terminal-enhanced');
 }
})();
