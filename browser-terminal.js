/* Python Lab simulated terminal.
 * Uses a native text editor at the prompt, so selection, paste, undo, cursor
 * movement and assistive text input behave like the workspace editor.
 * Output is read-only. Commands still run through the safe browser simulation.
 */
(() => {
 'use strict';
 if (['localhost','127.0.0.1'].includes(location.hostname) && location.port==='8000')return;
 const host=window.pythonLabTerminalHost,container=document.getElementById('browserTerminal');
 if(!host||!container)return;
 const parent=container.parentElement;
 try{
  const historyEl=document.createElement('div');
  historyEl.className='terminal-history';
  historyEl.setAttribute('role','log');
  historyEl.setAttribute('aria-label','Terminal output history');
  historyEl.setAttribute('aria-live','off');
  historyEl.tabIndex=0;

  const entry=document.createElement('div');
  entry.className='terminal-entry';
  const promptEl=document.createElement('span');
  promptEl.className='terminal-entry-prompt';
  promptEl.setAttribute('aria-hidden','true');
  const input=document.createElement('textarea');
  input.className='terminal-entry-editor';
  input.rows=1;
  input.spellcheck=false;
  input.autocapitalize='off';
  input.autocomplete='off';
  input.setAttribute('aria-label','Terminal command');
  input.setAttribute('aria-multiline','true');
  input.setAttribute('placeholder','Type a command, then press Enter');
  entry.append(promptEl,input);
  container.append(historyEl,entry);
  container.hidden=false;
  parent.classList.add('terminal-enhanced');

  let mode='busy',prompt='',history=[],historyIndex=0,historyDraft='';
  const segments=[];
  const MAX_CHARS=180000,MAX_SEGMENTS=2500;
  function appendText(text,cls=''){
   if(!text)return;
   const last=segments[segments.length-1];
   if(last&&last.cls===cls&&last.text.length<30000)last.text+=text;
   else segments.push({text,cls});
   const span=document.createElement('span');
   span.className=cls;span.textContent=text;
   historyEl.append(span);
   let size=segments.reduce((total,item)=>total+item.text.length,0);
   if(size>MAX_CHARS||segments.length>MAX_SEGMENTS){
    while(segments.length>MAX_SEGMENTS){size-=segments.shift().text.length;}
    while(size>MAX_CHARS&&segments.length){
     const first=segments[0],remove=Math.min(size-MAX_CHARS,first.text.length);
     first.text=first.text.slice(remove);size-=remove;
     if(!first.text)segments.shift();
    }
    renderAll();
   }
   scrollToEnd();
  }
  function renderAll(){
   historyEl.textContent='';
   for(const segment of segments){
    const span=document.createElement('span');
    span.className=segment.cls;span.textContent=segment.text;
    historyEl.append(span);
   }
   scrollToEnd();
  }
  function dropSuffix(suffix){
   if(!suffix)return;
   let remaining=suffix;
   for(let index=segments.length-1;index>=0&&remaining;index--){
    const part=segments[index].text;
    const amount=Math.min(remaining.length,part.length);
    if(part.slice(-amount)!==remaining.slice(-amount))return;
    remaining=remaining.slice(0,-amount);
   }
   if(remaining)return;
   let count=suffix.length;
   while(count>0&&segments.length){
    const last=segments[segments.length-1];
    const amount=Math.min(count,last.text.length);
    last.text=last.text.slice(0,-amount);
    count-=amount;
    if(!last.text)segments.pop();
   }
   renderAll();
  }
  function scrollToEnd(){
   historyEl.scrollTop=historyEl.scrollHeight;
   container.scrollTop=container.scrollHeight;
  }
  function fitInput(){
   input.style.height='auto';
   const height=Math.max(23,Math.min(input.scrollHeight||23,140));
   input.style.height=height+'px';
   scrollToEnd();
  }
  function focus(){if(entry.hidden)return;input.focus();}
  function setLine(value){
   input.value=String(value);
   input.selectionStart=input.selectionEnd=input.value.length;
   fitInput();
  }
  function setMode(next,nextPrompt=''){
   mode=next;
   if(next==='input'){
    prompt=nextPrompt||'';
    dropSuffix(prompt);
   }else if(next==='shell')prompt=nextPrompt||'~/python-lab $ ';
   else prompt='';
   entry.hidden=next!=='shell'&&next!=='input';
   promptEl.textContent=next==='input'?(prompt||'input › '):prompt;
   input.setAttribute('aria-label',next==='input'?'Python program input':'Terminal command');
   input.placeholder=next==='input'?'Enter your answer':'Type a command, then press Enter';
   setLine('');
   historyIndex=history.length;
   if(!entry.hidden)focus();
  }
  function submit(){
   if(mode!=='shell'&&mode!=='input')return;
   const answer=input.value;
   appendText(promptEl.textContent+answer+'\n','terminal-command');
   if(mode==='shell'&&answer.trim()){
    history.push(answer);
    if(history.length>100)history.shift();
   }
   historyIndex=history.length;
   historyDraft='';
   input.value='';
   fitInput();
   host.submit(answer);
  }
  function previousCommand(direction){
   if(!history.length)return;
   if(direction<0&&historyIndex===history.length)historyDraft=input.value;
   historyIndex=Math.max(0,Math.min(history.length,historyIndex+direction));
   setLine(historyIndex===history.length?historyDraft:history[historyIndex]);
  }
  function complete(){
   const head=input.value.slice(0,input.selectionStart);
   const matches=host.complete?.(head)||[];
   if(matches.length===1){
    const rest=input.value.slice(input.selectionEnd);
    const completed=matches[0]+(matches[0].endsWith('/')?'':' ');
    input.value=completed+rest;
    input.selectionStart=input.selectionEnd=completed.length;
    fitInput();
   }else if(matches.length>1){
    appendText(matches.join('    ')+'\n','terminal-hints');
   }
  }
  input.addEventListener('input',fitInput);
  input.addEventListener('keydown',event=>{
   const key=event.key;
   if(event.isComposing)return;
   if(key==='Enter'&&!event.shiftKey){
    event.preventDefault();submit();return;
   }
   if((key==='l'||key==='L')&&(event.ctrlKey||event.metaKey)){
    event.preventDefault();
    if(host.clear)host.clear();else adapter.clear();
    return;
   }
   if((key==='c'||key==='C')&&(event.ctrlKey||event.metaKey)&&!input.value.substring(input.selectionStart,input.selectionEnd)){
    event.preventDefault();
    if(mode==='input'){
     appendText('^C\n','error-line');host.interrupt();
    }else{
     appendText(prompt+input.value+'^C\n','terminal-command');
     setLine('');
    }
    return;
   }
   if(key==='Tab'&&!event.ctrlKey&&!event.altKey&&!event.metaKey){
    event.preventDefault();
    if(mode==='shell')complete();
    else{
     const start=input.selectionStart,end=input.selectionEnd;
     input.setRangeText('    ',start,end,'end');
     fitInput();
    }
    return;
   }
   const multiline=input.value.includes('\n');
   if(mode==='shell'&&!event.ctrlKey&&!event.altKey&&!event.metaKey&&!event.shiftKey){
    if(key==='ArrowUp'&&(!multiline||input.value.lastIndexOf('\n',input.selectionStart-1)<0)){
     event.preventDefault();previousCommand(-1);return;
    }
    if(key==='ArrowDown'&&(!multiline||input.value.indexOf('\n',input.selectionStart)===-1)){
     event.preventDefault();previousCommand(1);return;
    }
   }
  });
  historyEl.addEventListener('click',()=>{
   // Preserve text selection when students copy output.
   const selected=typeof window.getSelection==='function'?String(window.getSelection()):'';
   if(!selected)focus();
  });
  container.addEventListener('click',event=>{
   if(event.target===container||event.target===entry||event.target===promptEl)focus();
  });

  const adapter={
   write(value,cls=''){appendText(String(value),cls);},
   setMode,
   focus,
   clear(){segments.length=0;historyEl.textContent='';},
   setPrompt(value){prompt=String(value);if(mode==='shell')promptEl.textContent=prompt;},
   echoCommand(command){
    appendText((mode==='shell'?prompt:'~/python-lab $ ')+String(command)+'\n','terminal-command');
    setLine('');
   },
   resize:fitInput,
   // Read-only state access is used by regression tests and accessibility checks.
   inputElement:input
  };
  host.attach(adapter);
  fitInput();
 }catch(error){
  console.warn('Editor-style terminal could not initialize; retaining text input fallback.',error);
  container.textContent='';container.hidden=true;
  parent.classList.remove('terminal-enhanced');
 }
})();
