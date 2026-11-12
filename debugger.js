/* Python Lab recorded-trace debugger.
   Execution happens once in a temporary Pyodide workspace, then steps replay snapshots.
   Breakpoints are navigation markers, not live pauses in Python execution. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const state={editor:null,monaco:null,models:null,activeFile:null,openFile:null,getFiles:null,requestTrace:null,getArguments:null,reveal:null,persist:null,breakpoints:{},frames:[],position:0,error:'',truncated:false,running:false,output:'',source:{}};
 const marks=new Map();
 let traceHighlight=null;
 let tableFrames=null,tableRows=[],lastActiveRow=null;
 function serialize(){
  const result={};
  for(const [file,lines] of Object.entries(state.breakpoints)){
   if(lines.size)result[file]=[...lines].sort((a,b)=>a-b);
  }
  return result;
 }
 function getLines(path){return state.breakpoints[path]||(state.breakpoints[path]=new Set());}
 function updateDecorations(){
  if(!state.models||!state.monaco)return;
  for(const [file,model] of state.models){
   const list=[...getLines(file)].map(line=>({
    range:new state.monaco.Range(line,1,line,1),
    options:{isWholeLine:true,glyphMarginClassName:'pl-breakpoint-glyph',
     glyphMarginHoverMessage:{value:'Breakpoint at line '+line+' (recorded trace)'}}
   }));
   const id=marks.get(file)||[];
   marks.set(file,model.deltaDecorations(id,list));
  }
 }
 function toggleBreakpoint(path,line){
  if(!path||line<1)return;
  const lines=getLines(path);
  if(lines.has(line))lines.delete(line);else lines.add(line);
  updateDecorations();state.persist?.();render();
 }
 function toggleAtCursor(){const line=state.editor?.getPosition?.()?.lineNumber||1;toggleBreakpoint(state.activeFile?.(),line);}
 function bindEditor(){
  if(!state.editor||!state.monaco)return;
  state.editor.onMouseDown(event=>{
   const kind=event?.target?.type;
   const m=state.monaco.editor.MouseTargetType;
   if(kind!==m.GUTTER_GLYPH_MARGIN && kind!==m.GUTTER_LINE_NUMBERS)return;
   const line=event.target.position?.lineNumber;
   if(line)toggleBreakpoint(state.activeFile?.(),line);
  });
  updateDecorations();
 }
 function switchPanel(){
  state.reveal?.();
  const panel=$('consoleLayout');
  panel?.classList.add('show-debug');
  panel?.classList.remove('show-problems','show-tests');
  for(const id of ['terminalPanelBtn','problemsPanelBtn','testsPanelBtn']){
   $(id)?.classList.remove('active');$(id)?.setAttribute('aria-pressed','false');
  }
  const tab=$('debugPanelBtn');tab?.classList.add('active');tab?.setAttribute('aria-pressed','true');
 }
 function shortValue(value,max=110){
  const normalized=String(value??'').replace(/\r/g,'').replace(/\n/g,' ↵ ');
  return normalized.length>max?normalized.slice(0,max-1)+'…':normalized;
 }
 function traceRowCode(frame){
  const code=state.source?.[frame.file]||state.getFiles?.()?.[frame.file]||'';
  const lineNumber=Number(frame.line)||0;
  return code.split('\n')[lineNumber-1]?.trim()||(frame.function==='<completed>'?'[Program complete]':'—');
 }
 function renderTable(){
  const tbody=$('traceTableBody'),thead=$('traceTableHead');if(!tbody)return;
  if(tableFrames!==state.frames){
   tableFrames=state.frames;tableRows=[];lastActiveRow=null;tbody.textContent='';
   // Variables are separate columns. The union stays fixed across the recorded trace.
   const variables=[...new Set(state.frames.flatMap(frame=>Object.keys(frame.locals||{})))].sort((a,b)=>a.localeCompare(b));
   if(thead){
    thead.textContent='';
    const headings=['Step','Line','Code to run',...variables,'Output so far'];
    for(const [index,name] of headings.entries()){
     const th=document.createElement('th');th.scope='col';th.textContent=name;
     if(index>=3&&index<headings.length-1)th.className='trace-variable-heading';
     if(index===headings.length-1)th.className='trace-output-heading';
     thead.append(th);
    }
   }
   if(!state.frames.length){
    const row=document.createElement('tr'),cell=document.createElement('td');
    cell.colSpan=4+variables.length;cell.textContent=state.running?'Recording trace…':'Record a trace to see each step.';
    row.append(cell);tbody.append(row);
   }
   state.frames.forEach((frame,index)=>{
    const row=document.createElement('tr');row.className='trace-data-row';row.tabIndex=0;
    row.setAttribute('aria-label','Step '+(index+1)+' at line '+frame.line);
    const values=[String(index+1),frame.file+':'+String(frame.line||'—'),traceRowCode(frame),
     ...variables.map(name=>Object.hasOwn(frame.locals||{},name)?String(frame.locals[name]):'—'),
     String(frame.output||'')||'—'];
    for(let column=0;column<values.length;column++){
     const cell=document.createElement('td');
     const isVariable=column>=3&&column<values.length-1;
     const isOutput=column===values.length-1;
     if(isVariable)cell.className='trace-variable-cell';
     if(isOutput)cell.className='trace-output-cell';
     cell.textContent=shortValue(values[column],isVariable?95:isOutput?110:130);
     if(column>=2)cell.title=values[column];
     row.append(cell);
    }
    row.onclick=()=>setPosition(index);
    row.onkeydown=event=>{
     if(event.key==='Enter'||event.key===' '){event.preventDefault();setPosition(index);}
    };
    tableRows.push(row);tbody.append(row);
   });
  }
  tableRows.forEach((row,index)=>{
   const selected=index===state.position;
   row.classList.toggle('trace-row-active',selected);
   row.setAttribute('aria-selected',String(selected));
  });
  const current=tableRows[state.position];
  if(current&&current!==lastActiveRow){
   current.scrollIntoView?.({block:'nearest',inline:'nearest'});
   lastActiveRow=current;
  }
 }
 function clearHighlight(){
  if(!traceHighlight)return;
  const {model,ids}=traceHighlight;
  try{model.deltaDecorations(ids,[]);}catch{}
  traceHighlight=null;
 }
 function render(){
  const info=$('traceFrameInfo'),status=$('traceSummary'),hint=$('traceHint');
  const has=state.frames.length>0;
  for(const id of ['traceBack','traceNext','traceStepOver','traceContinue','traceRestart']){
   const b=$(id);if(b)b.disabled=!has||state.running;
  }
  if($('traceBack'))$('traceBack').disabled=!has||state.position===0||state.running;
  if($('traceNext'))$('traceNext').disabled=!has||state.position>=state.frames.length-1||state.running;
  if($('traceStepOver'))$('traceStepOver').disabled=!has||state.position>=state.frames.length-1||state.running;
  if($('traceContinue'))$('traceContinue').disabled=!has||state.position>=state.frames.length-1||state.running;
  if($('startTraceBtn'))$('startTraceBtn').disabled=state.running;
  if($('traceRunBtn'))$('traceRunBtn').disabled=state.running;
  if(info)info.textContent=state.running?'Recording execution…':has?'Step '+(state.position+1)+' of '+state.frames.length+(state.frames[state.position]?.function==='<completed>'?' · Program complete':''):'No trace recorded';
  if(status)status.textContent=state.running?'Recording up to 450 steps…':state.error||'Select any row to inspect that step. Values are shown before the line runs.';
  if(hint){hint.hidden=!state.truncated;hint.textContent=state.truncated?'Trace reached the 450-step limit. Try a shorter loop.':'';}
  clearHighlight();
  const frame=state.frames[state.position];
  renderTable();
  const changes=$('traceChanges');
  if(changes){
   const previous=state.frames[state.position-1]?.locals||{};
   const current=frame?.locals||{};
   const keys=Object.keys(current).filter(key=>!Object.hasOwn(previous,key)||String(previous[key])!==String(current[key]));
   changes.textContent=!frame?'Record a trace, then compare variable values between steps.':state.position===0?'First step: predict what this line will do.':keys.length?'Changed since previous step: '+keys.slice(0,8).map(key=>key+' = '+String(current[key])).join('; '):'No local variable changes since the previous step.';
  }
  if(frame){

   if(state.openFile&&state.getFiles?.()[frame.file]!==undefined){
    state.openFile(frame.file);
    if(state.editor&&state.monaco){
     const pos={lineNumber:frame.line,column:1};
     state.editor.revealLineInCenter(frame.line);state.editor.setPosition(pos);
     const model=state.models?.get(frame.file);
     if(model){
      const ids=model.deltaDecorations([], [{
       range:new state.monaco.Range(frame.line,1,frame.line,1),
       options:{isWholeLine:true,className:'pl-current-trace-line',linesDecorationsClassName:'pl-trace-line-margin'}
      }]);
      traceHighlight={model,ids};
     }
    }
   }
  }
 }
 function setPosition(index){
  if(!state.frames.length)return;
  state.position=Math.max(0,Math.min(index,state.frames.length-1));switchPanel();render();
 }
 function stepOver(){
  const current=state.frames[state.position];if(!current)return;
  let index=state.position+1;
  while(index<state.frames.length&&state.frames[index].depth>current.depth)index++;
  setPosition(index);
 }
 function continueToBreakpoint(){
  for(let index=state.position+1;index<state.frames.length;index++){
   const f=state.frames[index];
   if(getLines(f.file).has(f.line)){setPosition(index);return;}
  }
  setPosition(state.frames.length-1);
 }
 function begin(){
  if(state.running)return;
  const file=state.activeFile?.();
  if(!file?.endsWith('.py')){state.error='Select a .py file before tracing.';switchPanel();render();return;}
  const dialog=$('traceInputsDialog');
  if(dialog?.showModal){dialog.showModal();$('traceInputs')?.focus();}
  else request();
 }
 function request(){
  $('traceInputsDialog')?.close?.();
  if(state.running||!state.requestTrace)return;
  state.frames=[];state.position=0;state.error='';state.output='';state.truncated=false;state.running=true;
  const value=$('traceInputs')?.value||'';
  const inputs=value===''?[]:value.replace(/\r\n/g,'\n').split('\n');
  state.source=state.getFiles?.()||{};
  switchPanel();render();
  state.requestTrace({filename:state.activeFile?.(),files:state.source,inputs,args:state.getArguments?.()||[]});
 }
 function onResult(data){
  if(data.type!=='traceResults')return;
  state.running=false;state.frames=Array.isArray(data.frames)?data.frames:[];state.position=0;
  state.error=String(data.error||'');state.output=String(data.output||'');state.truncated=!!data.truncated;
  switchPanel();render();
 }
 function abort(){
  if(state.running){state.running=false;state.error='Trace was interrupted.';render();}
 }
 function attach(options){
  Object.assign(state,options);
  state.breakpoints={};
  for(const [name,lines] of Object.entries(options.breakpoints||{})){
   if(Array.isArray(lines))state.breakpoints[name]=new Set(lines.filter(x=>Number.isInteger(x)&&x>0));
  }
  bindEditor();render();
 }
 function loadProjectBreakpoints(data){
  clearHighlight();
  for(const [name,ids] of marks){
   const model=state.models?.get(name);
   if(model)try{model.deltaDecorations(ids,[]);}catch{}
  }
  marks.clear();
  state.breakpoints={};
  for(const [file,lines] of Object.entries(data||{})){
   if(Array.isArray(lines))state.breakpoints[file]=new Set(lines.filter(n=>Number.isInteger(n)&&n>0));
  }
  state.frames=[];state.position=0;state.error='';state.output='';state.running=false;state.truncated=false;
  updateDecorations();render();
 }
 function onOpened(){updateDecorations();}
 $('startTraceBtn')?.addEventListener('click',begin);
 $('traceRunBtn')?.addEventListener('click',begin);
 $('traceConfirm')?.addEventListener('click',request);
 $('traceCancel')?.addEventListener('click',()=> $('traceInputsDialog')?.close?.());
 $('traceBack')?.addEventListener('click',()=>setPosition(state.position-1));
 $('traceNext')?.addEventListener('click',()=>setPosition(state.position+1));
 $('traceStepOver')?.addEventListener('click',stepOver);
 $('traceContinue')?.addEventListener('click',continueToBreakpoint);
 $('traceRestart')?.addEventListener('click',()=>setPosition(0));
 $('toggleBreakpointBtn')?.addEventListener('click',toggleAtCursor);
 $('debugPanelBtn')?.addEventListener('click',()=>{switchPanel();render();});
 window.pythonLabDebug={attach,begin,request,onResult,abort,onOpened,loadProjectBreakpoints,serialize,toggleBreakpoint,toggleAtCursor,setPosition,stepOver,continueToBreakpoint,next:()=>setPosition(state.position+1)};
})();
