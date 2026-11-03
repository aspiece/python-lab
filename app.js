(() => {
'use strict';
const $=id=>document.getElementById(id),storageKey='python-lab-v1';
const sample='# Welcome to Python Lab!\n# Write Python and click Run.\n\nname = input("What is your name? ")\nprint(f"Hello, {name}!")\n\nfor number in range(1, 6):\n    print(f"Count: {number}")\n';
let initial={};try{initial=JSON.parse(localStorage.getItem(storageKey))||{}}catch{}
let inputHistory=[],activeRun=null,commandHistory=[],historyIndex=0,terminalMode='shell';let filename=initial.filename||'main.py',code=typeof initial.code==='string'?initial.code:sample,editor=null,worker=null,ready=false,running=false,runStart=0,runSerial=0,saveTimer;
const files=(initial.files && typeof initial.files==='object')?initial.files:{};const dirs=new Set(Array.isArray(initial.dirs)?initial.dirs:[]);let cwd=initial.cwd||'';
files[filename]=code;
let openTabs=[...new Set((Array.isArray(initial.openTabs)?initial.openTabs:[filename]).filter(p=>typeof p==='string'&&Object.hasOwn(files,p)))];
if(!openTabs.includes(filename))openTabs.push(filename);
const models=new Map(),viewStates=new Map();
let panelCollapsed=false;
let activeProjectId=null,activeProjectName='My Python Lab',projectReady=false,projectBusy=false;
let enhancedTerminal=null,replayBaseline='',scriptTranscript='',replayWarned=false,lastExecutionFiles={};
function clearTerminal(){
 $('output').textContent='';
 enhancedTerminal?.clear();
}
function receiveWorkerOutput(value,cls=''){
 const prior=scriptTranscript.length;
 scriptTranscript+=value;
 if(!replayBaseline){append(value,cls);return;}
 const prefixLength=Math.min(scriptTranscript.length,replayBaseline.length);
 if(scriptTranscript.slice(0,prefixLength)!==replayBaseline.slice(0,prefixLength)){
  if(!replayWarned){append('\n[Notice: output differed on replay. Browser input() re-executes the script.]\n','error-line');replayWarned=true;}
  append(value,cls);return;
 }
 const skip=Math.max(0,replayBaseline.length-prior);
 if(skip<value.length)append(value.slice(skip),cls);
}
function receiveTerminalLine(line){
 if(terminalMode==='input'&&activeRun){
  inputHistory.push(line);replayBaseline=scriptTranscript;replayWarned=false;
  setStatus('Running…');enhancedTerminal?.setMode('busy');sendExecution();
 }else if(terminalMode==='shell'){
  if(line.trim())commandHistory.push(line);historyIndex=commandHistory.length;
  shellCommand(line,!!enhancedTerminal);
 }
}
window.pythonLabTerminalHost={
 attach(adapter){
  enhancedTerminal=adapter;
  const previous=$('output').textContent;if(previous)adapter.write(previous);
  adapter.setMode(terminalMode==='shell'?'shell':terminalMode==='input'?'input':'busy',terminalMode==='input'?scriptTranscript.slice(scriptTranscript.lastIndexOf('\n')+1):displayPath()+' $ ');
 },
 submit:receiveTerminalLine,
 interrupt:()=>stop(),
 state:()=>({mode:terminalMode,ready,running,cwd}),
 complete(line){
  const parts=line.match(/^(\S*\s+)?([^\s]*)$/);if(!parts)return [];
  const prefix=parts[2]||'',before=parts[1]||'';
  const options=before?[...Object.keys(files),...dirs].map(p=>p.startsWith(cwd+'/')?p.slice(cwd.length+1):p):['python','python3','pytest','ls','pwd','cd','mkdir','touch','cat','echo','clear','help','rm','mv','cp','rmdir','pip','whoami','tree'];
  return [...new Set(options.filter(v=>v.startsWith(prefix)))].map(v=>before+v).sort();
 }
};
function normalize(path,base=cwd){const parts=[];for(const p of (path.startsWith('/')?path:('/'+base+'/'+path)).split('/')){if(!p||p==='.')continue;if(p==='..')parts.pop();else if(/^[\w. -]+$/.test(p))parts.push(p);else throw Error('Invalid path component: '+p);}return parts.join('/');}
function parent(path){return path.includes('/')?path.slice(0,path.lastIndexOf('/')):'';}
function ensureDirs(path){let cur='';for(const p of path.split('/').filter(Boolean)){cur=cur?cur+'/'+p:p;dirs.add(cur);}}
function displayPath(){return '~/python-lab'+(cwd?'/'+cwd:'');}
 const fallback=$('fallbackEditor');fallback.value=code;$('stdin').value=typeof initial.stdin==='string'?initial.stdin:'Alex';
function getCode(){return editor?editor.getValue():fallback.value;}
function workspaceSnapshot(){if(Object.hasOwn(files,filename))files[filename]=getCode();}
window.pythonLabWorkspace=()=>{workspaceSnapshot();return {filename,files:{...files},dirs:[...dirs],cwd};};
function languageFor(path){const ext=path.split('.').pop().toLowerCase();return ({py:'python',json:'json',md:'markdown',html:'html',css:'css',js:'javascript'})[ext]||'plaintext';}
function iconFor(path){const ext=path.split('.').pop().toLowerCase();return ext==='py'?'🐍':ext==='json'?'{}':ext==='csv'?'▦':'📄';}
function modelFor(path){
 if(typeof monaco==='undefined')return null;
 if(models.has(path))return models.get(path);
 const uri=monaco.Uri.parse('file:///python-lab/'+path.split('/').map(encodeURIComponent).join('/'));
 const model=monaco.editor.createModel(files[path]??'',languageFor(path),uri);models.set(path,model);return model;
}
function setCode(value){files[filename]=value;if(editor){if(editor.getValue()!==value)editor.setValue(value);}else fallback.value=value;persist();}
function projectSnapshot(){
 workspaceSnapshot();
 return {
  filename,code:getCode(),stdin:$('stdin').value,args:$('args').value,
  files:{...files},dirs:[...dirs],cwd,expanded:[...expanded],openTabs:[...openTabs],
  debugBreakpoints:window.pythonLabDebug?.serialize()||initial.debugBreakpoints||{}
 };
}
function persist(immediate=false){
 window.pythonLabSmart?.schedule();
 clearTimeout(saveTimer);
 const write=()=>{
  const snapshot=projectSnapshot();
  try{localStorage.setItem(storageKey,JSON.stringify(snapshot));}
  catch{$('saveStatus').textContent='Browser storage limited — export a ZIP';}
  if(!projectReady||!activeProjectId||projectBusy)return Promise.resolve();
  const task=window.pythonLabProjects.save(activeProjectId,snapshot);
  return task.then(()=>{
   const mode=window.pythonLabProjects.state().mode;
   $('saveStatus').textContent=mode==='memory'?'Temporary session only — export ZIP':'Saved on this device';
  }).catch(err=>{
   $('saveStatus').textContent='Save failed — export ZIP';
   console.error('Python Lab local project save failed',err);
  });
 };
 if(immediate)return write();
 $('saveStatus').textContent='Saving…';
 saveTimer=setTimeout(write,280);
}
function setStatus(s,kind=''){$('runtimeStatus').textContent=s;$('runtimeStatus').className='status '+kind;$('footerStatus').textContent=s;}
function append(value,cls=''){const out=$('output');if(out.querySelector('.muted'))out.textContent='';const el=document.createElement('span');el.className=cls;el.textContent=value;out.append(el);out.parentElement.scrollTop=out.parentElement.scrollHeight;enhancedTerminal?.write(value,cls);}
function updateButtons(){$('runBtn').disabled=!ready||running;$('stopBtn').disabled=!running;}
function updateStatusBar(){
 const node=$('cursorStatus');if(!node)return;
 if(editor){const p=editor.getPosition();node.textContent=p?'Ln '+p.lineNumber+', Col '+p.column:'Ln 1, Col 1';}
 else{const pos=fallback.selectionStart||0,parts=fallback.value.slice(0,pos).split('\n');node.textContent='Ln '+parts.length+', Col '+(parts[parts.length-1].length+1);}
 const lang=$('languageStatus');if(lang)lang.textContent=languageFor(filename)==='python'?'Python':languageFor(filename).toUpperCase();
}
function renderTabs(){
 const host=$('openTabs');if(!host)return;
 host.textContent='';openTabs=openTabs.filter(path=>Object.hasOwn(files,path));
 if(!openTabs.includes(filename))openTabs.push(filename);
 for(const path of openTabs){
  const tab=document.createElement('div');tab.className='tab'+(path===filename?' active':'');tab.setAttribute('role','tab');tab.setAttribute('aria-selected',String(path===filename));
  const action=document.createElement('button');action.className='tab-label';action.textContent=iconFor(path)+' '+path.split('/').pop();action.title=path;action.onclick=()=>switchToFile(path);
  const close=document.createElement('button');close.className='tab-close';close.textContent='×';close.title='Close '+path;close.setAttribute('aria-label','Close '+path);close.onclick=()=>closeTab(path);
  tab.append(action,close);host.append(tab);
 }
 updateStatusBar();window.pythonLabSmart?.onOpened();window.pythonLabDebug?.onOpened();
}
function setFilename(value){filename=normalize(value||'main.py','');if(!/\.[^/]+$/.test(filename))filename+='.py';ensureDirs(parent(filename));for(let p=parent(filename);p;p=parent(p))expanded?.add(p);if(!openTabs.includes(filename))openTabs.push(filename);renderTabs();updateStatusBar();persist();}
function switchToFile(next){
 if(!Object.hasOwn(files,next))return;
 if(next===filename){if(!openTabs.includes(next))openTabs.push(next);renderTabs();return;}
 workspaceSnapshot();
 if(editor)viewStates.set(filename,editor.saveViewState());
 filename=next;code=files[next];
 if(!openTabs.includes(next))openTabs.push(next);
 for(let p=parent(next);p;p=parent(p))expanded.add(p);
 if(editor){editor.setModel(modelFor(next));const state=viewStates.get(next);if(state)editor.restoreViewState(state);editor.focus();}
 else fallback.value=code;
 renderTabs();renderFiles();persist();
}
function closeTab(path){
 if(openTabs.length===1){append('Keep at least one file open in the editor.\n');return;}
 const ix=openTabs.indexOf(path);if(ix<0)return;
 workspaceSnapshot();openTabs.splice(ix,1);
 if(path===filename){const next=openTabs[Math.min(ix,openTabs.length-1)];filename=next;if(editor){editor.setModel(modelFor(next));const state=viewStates.get(next);if(state)editor.restoreViewState(state);}else fallback.value=files[next];}
 renderTabs();renderFiles();persist();
}
function chooseFile(next){switchToFile(next);}
function toggleSidebar(){
 const root=$('workspace');if(window.matchMedia('(max-width:850px)').matches){root.classList.toggle('show-sidebar');root.classList.remove('hide-sidebar');}
 else{root.classList.toggle('hide-sidebar');root.classList.remove('show-sidebar');}
}
function togglePanel(){
 panelCollapsed=!panelCollapsed;$('mainPanel').classList.toggle('panel-collapsed',panelCollapsed);
 $('togglePanelBtn').textContent=panelCollapsed?'▴':'▾';
}
function openPalette(mode='file'){
 const dialog=$('commandDialog');dialog.dataset.mode=mode;$('commandQuery').value='';$('commandQuery').placeholder=mode==='file'?'Search files by name…':'Type a command…';
 renderPalette();if(!dialog.open)dialog.showModal();$('commandQuery').focus();
}
function paletteCommands(){
 return [
  ['New File',()=> $('addFileBtn').click()],
  ['New Folder',()=> $('addFolderBtn').click()],
  ['Run Python File',()=>run()],
  ['Run Tests',()=>executeVirtualTest()],
  ['Record Debug Trace',()=>window.pythonLabDebug?.begin()],
  ['Create Starter Project',()=>window.pythonLabTemplates?.show()],
  ['Show Problems',()=>window.pythonLabSmart?.setView('problems')],
  ['Show Test Results',()=>window.pythonLabSmart?.setView('tests')],
  ['Save Locally',()=>persist(true)],
  ['Download Current File',()=>download()],
  ['Export Project ZIP',()=>downloadProject()],
  ['Download Canvas Submission ZIP',()=>downloadProject('submission')],
  ['Manage Saved Projects',()=>openProjectManager()],
  ['Create New Project',()=>createNewProject()],
  ['Import Project ZIP',()=> $('projectInput').click()],
  ['Toggle Explorer',toggleSidebar],
  ['Toggle Terminal Panel',togglePanel],
  ['Focus Terminal',()=>{$('terminalInput')?.focus();}],
  ['Clear Terminal',clearTerminal]
 ];
}
function renderPalette(){
 const mode=$('commandDialog').dataset.mode||'file',q=$('commandQuery').value.trim().toLowerCase(),host=$('commandResults');host.textContent='';
 const entries=mode==='file'?Object.keys(files).sort().map(path=>[iconFor(path)+' '+path,()=>switchToFile(path)]):paletteCommands();
 for(const [label,action] of entries.filter(x=>x[0].toLowerCase().includes(q)).slice(0,30)){
  const item=document.createElement('button');item.className='palette-result';item.textContent=label;item.onclick=()=>{$('commandDialog').close();action();};host.append(item);
 }
 if(!host.children.length){const empty=document.createElement('p');empty.textContent='No matches';host.append(empty);}
}
function modifyEntry(type,oldPath,action){
  if(running){alert('Stop the running program before changing files.');return;}
  workspaceSnapshot();
  if(action==='delete'){
    if(!confirm('Delete '+oldPath+(type==='folder'?' and all files and folders inside it':'')+'? This cannot be undone.'))return;
    if(type==='folder'){for(const p of Object.keys(files))if(p.startsWith(oldPath+'/'))delete files[p];for(const p of [...dirs])if(p===oldPath||p.startsWith(oldPath+'/'))dirs.delete(p);}
    else delete files[oldPath];
    if(type==='folder'&&(cwd===oldPath||cwd.startsWith(oldPath+'/')))cwd='';
    for(const [path,model] of [...models])if(!Object.hasOwn(files,path)){if(editor&&editor.getModel()===model)editor.setModel(null);model.dispose();models.delete(path);viewStates.delete(path);}
    openTabs=openTabs.filter(path=>Object.hasOwn(files,path));
    if(!Object.hasOwn(files,filename)){const next=Object.keys(files).sort()[0]||'main.py';if(!Object.hasOwn(files,next))files[next]='# New Python program\n';filename=next;}
    if(!openTabs.includes(filename))openTabs.push(filename);
    if(editor)editor.setModel(modelFor(filename));else fallback.value=files[filename]??'';
    renderTabs();renderFiles();persist();return;
  }
  const name=prompt(action==='move'?'Move to path (including name):':'Rename (new name or path):',oldPath);
  if(name===null)return;
  let dest;
  try{dest=normalize(name,'');if(!dest||dest===oldPath)return;if(type==='file'&&!/\.(py|txt|csv|json|md|html|css|js|toml|ini)$/i.test(dest))throw Error('Use a supported text file extension (.py, .txt, .csv, .json, .md, etc.)');if(type==='folder'&&dest.startsWith(oldPath+'/'))throw Error('Cannot move a folder inside itself');if(type==='folder'&&Object.keys(files).some(p=>p.startsWith(oldPath+'/')&&Object.hasOwn(files,dest+p.slice(oldPath.length))))throw Error('Destination has conflicting files');if((type==='folder'&&dirs.has(dest))||Object.hasOwn(files,dest)||[...dirs].some(d=>d===dest&&type==='file'))throw Error('Destination already exists');if(parent(dest)&&!dirs.has(parent(dest)))throw Error('Destination folder does not exist');}
  catch(err){alert(err.message);return;}
  if(type==='file'){files[dest]=files[oldPath];delete files[oldPath];if(filename===oldPath)filename=dest;}
  else {
    const movePath=p=>p===oldPath?dest:p.startsWith(oldPath+'/')?dest+p.slice(oldPath.length):p;
    const movedFiles={};for(const [p,code] of Object.entries(files)){const next=movePath(p);if(next in movedFiles)throw Error('Path collision');movedFiles[next]=code;}
    for(const p of Object.keys(files))delete files[p];Object.assign(files,movedFiles);
    const movedDirs=[...dirs].map(movePath);dirs.clear();for(const p of movedDirs)dirs.add(p);
    filename=movePath(filename);cwd=movePath(cwd);
  }
  const mapPath=p=>p===oldPath?dest:type==='folder'&&p.startsWith(oldPath+'/')?dest+p.slice(oldPath.length):p;
  for(const [p,model] of [...models])if(mapPath(p)!==p){if(editor&&editor.getModel()===model)editor.setModel(null);model.dispose();models.delete(p);viewStates.delete(p);}
  openTabs=[...new Set(openTabs.map(mapPath))];
  if(editor)editor.setModel(modelFor(filename));else fallback.value=files[filename]??'';
  renderTabs();renderFiles();persist();
}
function entryMenu(event,type,path){event.preventDefault();const menu=$('fileContextMenu');menu.hidden=false;menu.style.left=Math.min(event.clientX,innerWidth-175)+'px';menu.style.top=Math.min(event.clientY,innerHeight-145)+'px';menu.dataset.type=type;menu.dataset.path=path;}
async function downloadProject(kind='project'){
  workspaceSnapshot();
  if(typeof JSZip==='undefined'){alert('ZIP library unavailable. Check your internet connection.');return;}
  const zip=new JSZip();for(const dir of dirs)zip.folder(dir);for(const [path,content] of Object.entries(files))zip.file(path,content);
  try{const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=(activeProjectName.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50)||'python-lab')+(kind==='submission'?'-submission':'-backup')+'.zip';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
  catch(err){alert('Unable to download ZIP: '+err.message);}
}
const expanded=new Set(Array.isArray(initial.expanded)?initial.expanded:[...dirs]);
function renderFiles(){
 const host=$('fileList');host.textContent='';
 const allFiles=[...new Set([filename,...Object.keys(files)])];
 function children(folder,depth){
  const folders=[...dirs].filter(d=>parent(d)===folder).sort((a,b)=>a.localeCompare(b));
  for(const path of folders){
   const row=document.createElement('button');row.className='file-item folder-item';
   row.style.paddingLeft=(12+depth*16)+'px';row.title=path;
   row.textContent=(expanded.has(path)?'▾ ':'▸ ')+'📁 '+path.split('/').pop();
   row.setAttribute('aria-expanded',String(expanded.has(path)));
   row.addEventListener('contextmenu',e=>entryMenu(e,'folder',path));
   row.onclick=()=>{if(expanded.has(path))expanded.delete(path);else expanded.add(path);cwd=path;renderFiles();updatePrompt();if(enhancedTerminal&&terminalMode==='shell')enhancedTerminal.setPrompt(displayPath()+' $ ');persist();};
   host.append(row);
   if(expanded.has(path))children(path,depth+1);
  }
  for(const path of allFiles.filter(p=>parent(p)===folder).sort()){
   const btn=document.createElement('button');btn.className='file-item'+(path===filename?' active':'');
   btn.style.paddingLeft=(26+depth*16)+'px';btn.textContent=iconFor(path)+' '+path.split('/').pop();btn.title=path;
   btn.addEventListener('contextmenu',e=>entryMenu(e,'file',path));
   btn.onclick=()=>switchToFile(path);
   host.append(btn);
  }
 }
 children('',0);
}
function updatePrompt(){const node=$('terminalChevron');if(node)node.textContent=displayPath()+' $';}
function createWorker(){if(worker)worker.terminate();ready=false;running=false;updateButtons();setStatus('Loading Python…');const serial=++runSerial;worker=new Worker('python-worker.js?v=15');worker.onmessage=({data})=>{if(serial!==runSerial)return;window.pythonLabSmart?.onWorkerMessage(data);if(data.type==='ready'){window.pythonLabSmart?.onWorkerReady();ready=true;setStatus('Python ready','ready');updateButtons();append('✓ Python ready. Type help for supported commands.\n','success-line');showShell();}if(data.type==='output')receiveWorkerOutput(data.text,data.stream==='stderr'?'error-line':'');if(data.type==='needInput'){terminalMode='input';running=true;setStatus('Waiting for input…');$('terminalPrompt').hidden=false;enhancedTerminal?.setMode('input',scriptTranscript.slice(scriptTranscript.lastIndexOf('\n')+1));if(enhancedTerminal)enhancedTerminal.focus();else $('terminalInput').focus();$('output').parentElement.scrollTop=$('output').parentElement.scrollHeight;}if(data.type==='traceResults'){running=false;updateButtons();setStatus('Python ready','ready');window.pythonLabDebug?.onResult(data);showShell();}if(data.type==='done'){terminalMode='shell';activeRun=null;running=false;updateButtons();setStatus('Python ready','ready');append('\n'+(data.success?'✓ Finished':'✕ Finished with errors')+' in '+((performance.now()-runStart)/1000).toFixed(2)+'s\n',data.success?'success-line':'error-line');showShell();}if(data.type==='files'){
  workspaceSnapshot();
  for(const [path,content] of Object.entries(data.files||{})){
   const prior=files[path],model=models.get(path);
   // Do not overwrite changes a student made after pressing Run.
   if(Object.hasOwn(lastExecutionFiles,path)&&prior!==lastExecutionFiles[path])continue;
   if(model&&model.getValue()!==prior)continue;
   files[path]=content;ensureDirs(parent(path));
   if(model&&model.getValue()!==content)model.setValue(content);
  }
  for(const dir of (data.dirs||[]))ensureDirs(dir);
  renderFiles();renderTabs();persist();
 }if(data.type==='fatal'){running=false;ready=false;updateButtons();setStatus('Runtime failed','error');append('Runtime error: '+data.message+'\n','error-line');}};worker.onerror=()=>{if(serial!==runSerial)return;running=false;ready=false;updateButtons();setStatus('Runtime failed','error');append('Could not start Python. Check your connection and reload.\n','error-line');};worker.postMessage({type:'init'});}
function sendExecution(){
 if(!activeRun)return;
 $('terminalPrompt').hidden=true;
 scriptTranscript='';enhancedTerminal?.setMode('busy');
 worker.postMessage({type:'run',...activeRun,stdin:inputHistory.join('\n')});
}
function executePython(name,args=[],command=''){
 workspaceSnapshot();name=(name in files)?name:normalize(name);
 if(!(name in files)){append('python: cannot open file '+name+'\n','error-line');showShell();return;}
 if(!ready||running)return;
 running=true;terminalMode='busy';runStart=performance.now();inputHistory=[];
 replayBaseline='';scriptTranscript='';replayWarned=false;
 updateButtons();setStatus('Running…');
 activeRun={code:files[name],filename:name,files:{...files},dirs:[...dirs],cwd:parent(name),args,command};
 lastExecutionFiles={...activeRun.files};
 if(!command){const label='python '+name+(args.length?' '+args.join(' '):'');if(enhancedTerminal)enhancedTerminal.echoCommand(label);else append(displayPath()+' $ '+label+'\n');}
 sendExecution();persist();
}
function run(){if(!filename.endsWith('.py')){append('Select a .py file to run.\n','error-line');return;}executePython(filename,$('args').value.trim()?$('args').value.trim().split(/\s+/):[]);}

function requestDebugTrace(options){
 if(!ready||running){
  window.pythonLabDebug?.onResult({type:'traceResults',frames:[],error:'Python is busy or not loaded yet. Try again after it becomes ready.',output:''});
  return;
 }
 workspaceSnapshot();
 if(!options.filename?.endsWith('.py')||!Object.hasOwn(files,options.filename)){
  window.pythonLabDebug?.onResult({type:'traceResults',frames:[],error:'Select an existing Python file.',output:''});
  return;
 }
 running=true;terminalMode='busy';updateButtons();setStatus('Recording trace…');
 worker.postMessage({type:'trace',filename:options.filename,files:{...files},dirs:[...dirs],inputs:options.inputs||[],args:options.args||[]});
}
function installTemplate(project){
 if(running){alert('Finish or stop the running program before importing a starter project.');return false;}
 if(!project||!project.id||!project.files)return false;
 workspaceSnapshot();
 const rootName=project.id.replace(/[^a-zA-Z0-9-]/g,'-');
 let root=rootName,index=2;
 while(dirs.has(root)||Object.keys(files).some(path=>path===root||path.startsWith(root+'/')))root=rootName+'-'+index++;
 ensureDirs(root);
 for(const [name,source] of Object.entries(project.files)){
  const path=root+'/'+name;
  if(!/^[\w. -]+$/.test(name)||typeof source!=='string')continue;
  files[path]=source;
 }
 expanded.add(root);
 const main=root+'/main.py';
 if(Object.hasOwn(files,main))switchToFile(main);
 else renderFiles();
 persist(true);
 return true;
}

function stop(){if(!running)return;window.pythonLabDebug?.abort();terminalMode='shell';activeRun=null;inputHistory=[];replayBaseline='';scriptTranscript='';$('terminalPrompt').hidden=true;append('\n^C\n','error-line');createWorker();}
function download(){const url=URL.createObjectURL(new Blob([getCode()],{type:'text/x-python;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function resetFile(){workspaceSnapshot();let name=prompt('New filename',cwd?cwd+'/main.py':'main.py');if(!name)return;try{const stem=normalize(name,'');const path=stem+(/\.[^/]+$/.test(stem)?'':'.py');if(Object.hasOwn(files,path)){switchToFile(path);return;}files[path]=path.endsWith('.py')?'# New Python program\n\n':'';ensureDirs(parent(path));switchToFile(path);$('stdin').value='';persist();}catch(err){alert(err.message);}}
function showShell(){if(!ready||running)return;updatePrompt();terminalMode='shell';$('terminalPrompt').hidden=false;$('terminalInput').placeholder='Type a command';$('terminalInput').value='';if(enhancedTerminal){enhancedTerminal.setMode('shell',displayPath()+' $ ');}else $('terminalInput').focus();}
function shellCommand(line,alreadyEchoed=false){
 try{
  files[filename]=getCode();const args=line.trim().match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)?.map(x=>x.replace(/^["']|["']$/g,''))||[];
  if(!alreadyEchoed)append(displayPath()+' $ '+line+'\n');
  if(!args.length){showShell();return;}
  const cmd=args[0],rest=args.slice(1);
  if(cmd==='clear'||cmd==='cls'){clearTerminal();}
  else if(cmd==='help')append('Commands: python FILE.py [args], python -c CODE, python -m pytest, pytest, ls, tree, pwd, cd, mkdir [-p], rmdir, cat, echo, touch, cp, mv, rm, whoami, clear, help\nNote: This is a safe browser simulation, not a full system shell. pip install and submit50 are not available.\n');
  else if(cmd==='ls'||cmd==='dir'){const target=normalize(rest.find(a=>!a.startsWith('-'))||'.');if(target&&!dirs.has(target))append('No such directory: '+target+'\n','error-line');else append([...dirs].filter(d=>parent(d)===target).map(d=>d.split('/').pop()+'/').concat(Object.keys(files).filter(f=>parent(f)===target).map(f=>f.split('/').pop())).sort().join('    ')+'\n');}
  else if(cmd==='pwd')append('/home/pyodide'+(cwd?'/'+cwd:'')+'\n');
  else if(cmd==='echo')append(rest.join(' ')+'\n');
  else if(cmd==='whoami')append('student (browser simulation)\n');
  else if(cmd==='python'&&['-V','--version'].includes(rest[0]))append('Python (Pyodide browser runtime)\n');
  else if((cmd==='python'||cmd==='python3')&&rest[0]==='-c'&&rest[1]!==undefined){runWorkerCode(rest.slice(1).join(' '),line,true);return;}
  else if(cmd==='tree'){
    const root=normalize(rest[0]||'.');if(root&&!dirs.has(root)){append('tree: no such directory: '+root+'\n','error-line');}
    else{
      const entries=[];
      for(const p of [...dirs,...Object.keys(files)].sort()){
        if(root&&!p.startsWith(root+'/'))continue;
        const rel=root?p.slice(root.length+1):p;
        if(!rel)continue;
        entries.push('  '.repeat(Math.max(0,rel.split('/').length-1))+(dirs.has(p)?'📁 ':'📄 ')+rel.split('/').pop());
      }
      append((root||'.')+'/\n'+(entries.length?entries.join('\n'):'  (empty)')+'\n');
    }
  }
  else if(cmd==='cat'||cmd==='type')append(files[normalize(rest[0]||'')]===undefined?'File not found\n':files[normalize(rest[0])]+'\n');
  else if(cmd==='cp'){
    if(rest.length!==2){append('Usage: cp SOURCE DEST\n','error-line');}
    else{const source=normalize(rest[0]),dest=normalize(rest[1]);
      if(!Object.hasOwn(files,source))append('cp: source file not found\n','error-line');
      else if(Object.hasOwn(files,dest)||dirs.has(dest))append('cp: destination already exists\n','error-line');
      else if(parent(dest)&&!dirs.has(parent(dest)))append('cp: destination folder not found\n','error-line');
      else{files[dest]=files[source];renderFiles();persist();}
    }
  }
  else if(cmd==='rm'){
    if(!rest[0])append('Usage: rm FILE\n','error-line');
    else{const path=normalize(rest[0]);
      if(!Object.hasOwn(files,path))append('rm: file not found\n','error-line');
      else if(Object.keys(files).length===1)append('rm: cannot remove the last project file\n','error-line');
      else if(running)append('rm: stop the running program first\n','error-line');
      else{
        delete files[path];openTabs=openTabs.filter(p=>p!==path);
        const m=models.get(path);if(m){if(editor?.getModel()===m)editor.setModel(null);m.dispose();models.delete(path);}
        viewStates.delete(path);
        if(filename===path){filename=Object.keys(files).sort()[0];if(editor)editor.setModel(modelFor(filename));else fallback.value=files[filename];}
        if(!openTabs.includes(filename))openTabs.push(filename);
        renderFiles();renderTabs();persist();
      }
    }
  }
  else if(cmd==='mv'){
    if(rest.length!==2)append('Usage: mv SOURCE DEST\n','error-line');
    else{
      const source=normalize(rest[0]),dest=normalize(rest[1]);
      if(!Object.hasOwn(files,source))append('mv: source must be a file (move folders in Explorer)\n','error-line');
      else if(Object.hasOwn(files,dest)||dirs.has(dest))append('mv: destination already exists\n','error-line');
      else if(parent(dest)&&!dirs.has(parent(dest)))append('mv: destination folder not found\n','error-line');
      else{
        files[dest]=files[source];delete files[source];
        const previous=models.get(source);
        if(previous){if(editor?.getModel()===previous)editor.setModel(null);previous.dispose();models.delete(source);}
        viewStates.delete(source);
        openTabs=openTabs.map(p=>p===source?dest:p);
        if(filename===source){filename=dest;if(editor)editor.setModel(modelFor(dest));else fallback.value=files[dest];}
        renderTabs();renderFiles();persist();
      }
    }
  }
  else if(cmd==='rmdir'){
    if(!rest[0])append('Usage: rmdir EMPTY_DIRECTORY\n','error-line');
    else{const dir=normalize(rest[0]);
      if(!dirs.has(dir))append('rmdir: directory not found\n','error-line');
      else if([...dirs].some(p=>p.startsWith(dir+'/'))||Object.keys(files).some(p=>p.startsWith(dir+'/')))append('rmdir: directory is not empty\n','error-line');
      else{dirs.delete(dir);expanded.delete(dir);if(cwd===dir)cwd=parent(dir);renderFiles();persist();}
    }
  }
  else if(cmd==='touch'){if(!rest[0])append('Usage: touch FILE\n');else{const p=normalize(rest[0]);if(!dirs.has(parent(p))&&parent(p))append('No such directory\n','error-line');else {files[p]??='';renderFiles();persist();}}}
  else if(cmd==='mkdir'){if(!rest[0])append('Usage: mkdir [-p] DIRECTORY\n');else{const recursive=rest[0]==='-p';const target=normalize(rest[recursive?1:0]||'');if(!target)append('Invalid directory\n','error-line');else if(dirs.has(target))append('Directory already exists\n');else if(!recursive&&parent(target)&&!dirs.has(parent(target)))append('Parent directory does not exist (try mkdir -p)\n','error-line');else{ensureDirs(target);expanded.add(target);renderFiles();persist();}}}
  else if(cmd==='cd'){const target=rest.length?normalize(rest[0]):'';if(!target||dirs.has(target)){cwd=target;persist();}else append('cd: no such directory: '+rest[0]+'\n','error-line');}
else if(cmd==='pip'&&rest[0]==='list')append('Full pip listing is unavailable in the simulated browser shell. Some compatible packages load automatically when imported.\n');
  else if(((cmd==='python'||cmd==='python3')&&rest[0]==='-m'&&rest[1]==='pytest')||cmd==='pytest'){executeVirtualTest(true);return;}
  else if((cmd==='python'||cmd==='python3')&&rest[0]?.endsWith('.py')){executePython(rest[0],rest.slice(1),line);return;}
  else if(cmd==='pip'&&rest[0]==='install'&&rest[1]){append('Automatic package installation is available when a supported package is imported in Python. Direct pip install is not yet supported here.\n','error-line');}
  else append(cmd+': command not supported in the browser terminal\n','error-line');
  showShell();
 }catch(err){append('Command error: '+err.message+'\n','error-line');showShell();}
}
function runWorkerCode(code,command,alreadyEchoed=false,purpose='script'){
 if(!ready||running)return;workspaceSnapshot();
 running=true;terminalMode='busy';runStart=performance.now();updateButtons();
 activeRun={code,filename:'__command__.py',files:{...files},dirs:[...dirs],cwd,args:[],command,purpose};
 inputHistory=[];replayBaseline='';scriptTranscript='';replayWarned=false;
 lastExecutionFiles={...activeRun.files};
 if(command&&!alreadyEchoed){if(enhancedTerminal)enhancedTerminal.echoCommand(command);else append(displayPath()+' $ '+command+'\n');}
 sendExecution();
}
function executeVirtualTest(alreadyEchoed=false){
 if(!ready||running)return;
 files[filename]=getCode();
 window.pythonLabSmart?.beginTests();
 if(!Object.keys(files).some(n=>/(^|\/)test_[^/]*\.py$/.test(n))){
  append('No test_*.py files found\n','error-line');
  window.pythonLabSmart?.onWorkerMessage({type:'testResults',tests:[],exitCode:5});
  showShell();return;
 }
 runWorkerCode('','python -m pytest -q',alreadyEchoed,'tests');
}
$('downloadProjectBtn').addEventListener('click',()=>downloadProject());
$('downloadSubmissionBtn').addEventListener('click',()=>downloadProject('submission'));
$('projectManagerBtn').addEventListener('click',openProjectManager);
$('projectManagerClose').addEventListener('click',()=> $('projectsDialog').close());
$('createProjectBtn').addEventListener('click',createNewProject);
$('importProjectBtn').addEventListener('click',()=> $('projectInput').click());
$('projectInput').addEventListener('change',async e=>{
 const archive=e.target.files?.[0];e.target.value='';if(!archive)return;
 if(typeof JSZip==='undefined'){alert('ZIP library is unavailable.');return;}
 if(!confirm('Replace the current project with the contents of this ZIP? Export a backup first if needed.'))return;
 try{
  const zip=await JSZip.loadAsync(archive),newFiles={},newDirs=new Set();let count=0;
  for(const [raw,entry] of Object.entries(zip.files)){
   const clean=raw.replace(/\/$/,'');
   if(!clean||clean.startsWith('/')||clean.split('/').some(p=>p==='..'||p==='.'||!p||!/^[\w. -]+$/.test(p)))continue;
   if(entry.dir){newDirs.add(clean);continue;}
   if(!/\.(py|txt|csv|json|md|html|css|js|toml|ini)$/i.test(clean))continue;
   if(++count>150)throw Error('Project exceeds 150 text files.');
   const content=await entry.async('string');if(content.length>1024*1024)throw Error('File too large: '+clean);
   newFiles[clean]=content;let p=parent(clean);while(p){newDirs.add(p);p=parent(p);}
  }
  if(!Object.keys(newFiles).length)throw Error('No supported text files were found.');
  if(editor)editor.setModel(null);
  for(const m of models.values())m.dispose();models.clear();viewStates.clear();
  for(const p of Object.keys(files))delete files[p];Object.assign(files,newFiles);
  dirs.clear();for(const p of newDirs)dirs.add(p);
  cwd='';filename=Object.hasOwn(files,'main.py')?'main.py':Object.keys(files).sort()[0];
  openTabs=[filename];expanded.clear();for(const p of dirs)expanded.add(p);
  if(editor)editor.setModel(modelFor(filename));else fallback.value=files[filename];
  renderTabs();renderFiles();updatePrompt();if(enhancedTerminal&&terminalMode==='shell')enhancedTerminal.setPrompt(displayPath()+' $ ');persist(true);
  append('Imported '+count+' files from ZIP.\n','success-line');
 }catch(err){alert('Project import failed: '+err.message);}
});
$('fileContextMenu').addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(!button)return;const menu=$('fileContextMenu');menu.hidden=true;modifyEntry(menu.dataset.type,menu.dataset.path,button.dataset.action);});
document.addEventListener('click',e=>{if(!e.target.closest('#fileContextMenu'))$('fileContextMenu').hidden=true;});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('fileContextMenu').hidden=true;});
$('newBtn').addEventListener('click',()=>{const d=$('confirmDialog');if(d.showModal)d.showModal();else if(confirm('Create a new file?'))resetFile();});
$('confirmDialog').addEventListener('close',()=>{if($('confirmDialog').returnValue==='confirm')resetFile();});
$('openBtn').addEventListener('click',()=> $('fileInput').click());
$('saveBtn').addEventListener('click',download);
$('runBtn').addEventListener('click',run);
$('stopBtn').addEventListener('click',stop);
$('clearBtn').addEventListener('click',clearTerminal);
$('terminalInput').addEventListener('keydown',e=>{
 if(e.key==='ArrowUp'&&terminalMode==='shell'){e.preventDefault();historyIndex=Math.max(0,historyIndex-1);e.currentTarget.value=commandHistory[historyIndex]||'';}
 else if(e.key==='ArrowDown'&&terminalMode==='shell'){e.preventDefault();historyIndex=Math.min(commandHistory.length,historyIndex+1);e.currentTarget.value=commandHistory[historyIndex]||'';}
 else if(e.key==='Enter'){e.preventDefault();const answer=e.currentTarget.value;e.currentTarget.value='';if(terminalMode==='input'&&activeRun)append(answer+'\n');receiveTerminalLine(answer);}
});
$('stdin').addEventListener('input',persist);$('args').value=initial.args||'';$('args').addEventListener('input',persist);
$('addFolderBtn').addEventListener('click',()=>{
 const input=prompt('Folder path',cwd?cwd+'/week0':'week0');if(!input)return;
 try{const path=normalize(input,'');if(!path||dirs.has(path))return;ensureDirs(path);expanded.add(path);renderFiles();persist();}catch(err){append(err.message+'\n','error-line');}
});
$('addFileBtn').addEventListener('click',()=>{
 const name=prompt('New file path',cwd?cwd+'/test_main.py':'test_main.py');if(!name)return;
 try{const stem=normalize(name,'');const path=stem+(/\.[^/]+$/.test(stem)?'':'.py');if(!path)return;if(Object.hasOwn(files,path)){switchToFile(path);return;}
  if(dirs.has(path))throw Error('A folder already uses that name.');if(parent(path)&&!dirs.has(parent(path)))throw Error('Create the parent folder first.');
  workspaceSnapshot();files[path]=path.endsWith('.py')?'# '+path+'\n':'';switchToFile(path);
 }catch(err){alert(err.message);}
});
$('testBtn').addEventListener('click',()=>executeVirtualTest());
fallback.addEventListener('input',persist);fallback.addEventListener('click',updateStatusBar);fallback.addEventListener('keyup',updateStatusBar);
$('fileInput').addEventListener('change',async e=>{
 const f=e.target.files?.[0];e.target.value='';if(!f)return;
 try{if(f.size>1048576)throw Error('File must be under 1 MB');workspaceSnapshot();const path=normalize(cwd?cwd+'/'+f.name:f.name,'');if(parent(path)&&!dirs.has(parent(path)))ensureDirs(parent(path));files[path]=await f.text();if(models.has(path)&&models.get(path).getValue()!==files[path])models.get(path).setValue(files[path]);if(path===filename){setCode(files[path]);renderFiles();}else switchToFile(path);}
 catch(err){append('Open failed: '+err.message+'\n','error-line');}
});
$('explorerToggle').addEventListener('click',toggleSidebar);
$('paletteBtn').addEventListener('click',()=>openPalette('command'));
$('togglePanelBtn').addEventListener('click',togglePanel);
$('commandQuery').addEventListener('input',renderPalette);
$('commandQuery').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('commandResults').querySelector('button')?.click();}});
const splitter=$('panelSplitter'),consoleLayout=$('consoleLayout');
splitter.addEventListener('pointerdown',event=>{
 if(panelCollapsed)return;event.preventDefault();splitter.setPointerCapture(event.pointerId);
 const initialY=event.clientY,initialHeight=consoleLayout.getBoundingClientRect().height;
 const move=e=>{const max=Math.max(130,$('mainPanel').clientHeight-200);consoleLayout.style.height=Math.max(110,Math.min(max,initialHeight+initialY-e.clientY))+'px';editor?.layout();};
 const end=()=>{splitter.removeEventListener('pointermove',move);splitter.removeEventListener('pointerup',end);splitter.removeEventListener('pointercancel',end);};
 splitter.addEventListener('pointermove',move);splitter.addEventListener('pointerup',end);splitter.addEventListener('pointercancel',end);
});
window.addEventListener('keydown',e=>{
 if(e.key==='F9'){e.preventDefault();window.pythonLabDebug?.toggleAtCursor();return;}
 if(e.key==='F10'){e.preventDefault();window.pythonLabDebug?.stepOver();return;}
 if(e.key==='F11'&&!e.shiftKey){e.preventDefault();window.pythonLabDebug?.next();return;}
 if(!(e.ctrlKey||e.metaKey)||e.altKey)return;
 const key=e.key.toLowerCase();
 if(key==='enter'){e.preventDefault();run();}
 else if(key==='s'&&e.shiftKey){e.preventDefault();download();}
 else if(key==='s'){e.preventDefault();persist(true);}
 else if(key==='b'){e.preventDefault();toggleSidebar();}
 else if(key==='p'){e.preventDefault();openPalette(e.shiftKey?'command':'file');}
 else if(e.code==='Backquote'){e.preventDefault();if(panelCollapsed)togglePanel();if(enhancedTerminal)enhancedTerminal.focus();else $('terminalInput')?.focus();}
 else if(key==='w'){e.preventDefault();closeTab(filename);}
 else if(key==='tab'){e.preventDefault();const index=openTabs.indexOf(filename);switchToFile(openTabs[(index+1)%openTabs.length]);}
},true);
setFilename(filename);renderFiles();updatePrompt();window.pythonLabTemplates?.attach(installTemplate);createWorker();
function attachDebugEditor(){
 window.pythonLabDebug?.attach({
  editor,monaco:typeof monaco!=='undefined'?monaco:null,models,
  breakpoints:initial.debugBreakpoints||{},
  activeFile:()=>filename,openFile:switchToFile,
  getFiles:()=>{workspaceSnapshot();return {...files}},
  getArguments:()=>$('args').value.trim()?$('args').value.trim().split(/\s+/):[],
  requestTrace:requestDebugTrace,
  persist:()=>persist(true),
  reveal:()=>{if(panelCollapsed)togglePanel();}
 });
}
function attachSmartEditor(){
 window.pythonLabSmart?.attach({
  editor,monaco:typeof monaco!=='undefined'?monaco:null,models,
  getFiles:()=>{workspaceSnapshot();return {...files}},
  getWorker:()=>worker,isReady:()=>ready,isBusy:()=>running,
  activeFile:()=>filename,openFile:switchToFile,
  reveal:()=>{if(panelCollapsed)togglePanel();}
 });
}
function enableFallback(){fallback.hidden=false;$('editor').style.display='none';attachSmartEditor();attachDebugEditor();}
if(typeof window.require==='function'){
 try{
  const base='https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/';
  window.MonacoEnvironment={getWorkerUrl:()=> 'data:text/javascript;charset=utf-8,'+encodeURIComponent("self.MonacoEnvironment={baseUrl:'"+base+"'};importScripts('"+base+"vs/base/worker/workerMain.js');")};
  window.require.config({paths:{vs:base+'vs'}});
  window.require(['vs/editor/editor.main'],()=>{
   try{
    editor=monaco.editor.create($('editor'),{
     model:modelFor(filename),theme:'vs-dark',fontSize:14,lineHeight:23,
     minimap:{enabled:false},automaticLayout:true,scrollBeyondLastLine:false,tabSize:4,
     insertSpaces:true,fontFamily:'Consolas, monospace',padding:{top:18},wordWrap:'on',
     bracketPairColorization:{enabled:true},guides:{indentation:true,bracketPairs:true},
     renderWhitespace:'selection',stickyScroll:{enabled:false}
    });
    editor.onDidChangeModelContent(()=>persist());
    editor.onDidChangeCursorPosition(updateStatusBar);
    fallback.hidden=true;renderTabs();updateStatusBar();attachSmartEditor();attachDebugEditor();
   }catch(err){console.warn('Monaco failed',err);enableFallback();}
  },enableFallback);
 }catch{enableFallback();}
}else enableFallback();
})();