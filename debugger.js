/* Python Lab recorded-trace debugger.
   Execution happens once in a temporary Pyodide workspace, then steps replay snapshots.
   Breakpoints are navigation markers, not live pauses in Python execution. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const state={editor:null,monaco:null,models:null,activeFile:null,openFile:null,getFiles:null,requestTrace:null,getArguments:null,reveal:null,persist:null,breakpoints:{},frames:[],position:0,error:'',truncated:false,running:false,output:'',source:{}};
 const marks=new Map();
 let traceHighlight=null;
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
 function renderVars(vars){
  const list=$('traceVariables');if(!list)return;
  list.textContent='';
  const entries=Object.entries(vars||{}).sort((a,b)=>a[0].localeCompare(b[0]));
  if(!entries.length){const p=document.createElement('p');p.textContent='No local variables at this line.';p.className='analysis-empty';list.append(p);return;}
  for(const [name,value] of entries){
   const row=document.createElement('div');row.className='trace-variable';
   const key=document.createElement('strong');key.textContent=name;
   const val=document.createElement('code');val.textContent=String(value);
   row.append(key,val);list.append(row);
  }
 }
 function clearHighlight(){
  if(!traceHighlight)return;
  const {model,ids}=traceHighlight;
  try{model.deltaDecorations(ids,[]);}catch{}
  traceHighlight=null;
 }
 function render(){
  const info=$('traceFrameInfo'),status=$('traceSummary'),hint=$('traceHint'),out=$('traceOutput');
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
  if(status)status.textContent=state.running?'Collecting up to 450 Python line events…':state.error||'Breakpoints move between matching recorded lines; they do not pause a live process.';
  if(hint)hint.textContent=state.truncated?'The trace reached its step limit. Long loops may require a smaller example.':'Variables shown are values before the highlighted line executes.';
  clearHighlight();
  const frame=state.frames[state.position];
  if(frame){
   renderVars(frame.locals);if(out)out.textContent=frame.output||'(no output yet)';
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
  }else{
   renderVars({});if(out)out.textContent=state.output||'(run a trace to inspect program output)';
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
 window.pythonLabDebug={attach,begin,request,onResult,abort,onOpened,serialize,toggleBreakpoint,toggleAtCursor,setPosition,stepOver,continueToBreakpoint,next:()=>setPosition(state.position+1)};
})();
