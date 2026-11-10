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
function latestInputPrompt(){
 const fresh=replayBaseline&&scriptTranscript.startsWith(replayBaseline)?scriptTranscript.slice(replayBaseline.length):scriptTranscript;
 return fresh.slice(fresh.lastIndexOf('\n')+1);
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
  adapter.setMode(terminalMode==='shell'?'shell':terminalMode==='input'?'input':'busy',terminalMode==='input'?latestInputPrompt():displayPath()+' $ ');
 },
 submit:receiveTerminalLine,
 interrupt:()=>stop(),
 state:()=>({mode:terminalMode,ready,running,cwd}),
 clear:clearTerminal,
 complete(line){
  const parts=line.match(/^(\S*\s+)?([^\s]*)$/);if(!parts)return [];
  const prefix=parts[2]||'',before=parts[1]||'';
  const options=before?[...Object.keys(files),...dirs].map(p=>p.startsWith(cwd+'/')?p.slice(cwd.length+1):p):['python','python3','pytest','ls','pwd','cd','mkdir','touch','cat','echo','clear','help','rm','mv','cp','rmdir','pip','whoami','tree'];
  return [...new Set(options.filter(v=>v.startsWith(prefix)))].map(v=>before+v).sort();
 }
};
function normalize(path,base=cwd){
 if(typeof path!=='string')throw Error('A path is required.');
 // Allow terminal paths printed by pwd and the visible ~/python-lab prompt.
 let input=path;
 if(input==='~'||input==='~/python-lab')input='/home/pyodide';
 else if(input.startsWith('~/python-lab/'))input='/home/pyodide/'+input.slice(13);
 if(input==='/home/pyodide')input='/';
 else if(input.startsWith('/home/pyodide/'))input=input.slice('/home/pyodide'.length);
 const parts=[];
 for(const p of (input.startsWith('/')?input:('/'+base+'/'+input)).split('/')){
  if(!p||p==='.')continue;
  if(p==='..')parts.pop();
  else if(/^[\w. -]+$/.test(p))parts.push(p);
  else throw Error('Invalid path component: '+p);
 }
 return parts.join('/');
}
function shellWords(line){
 const words=[];let word='',quote='',started=false;
 for(let i=0;i<line.length;i++){
  const c=line[i];
  if(quote){
   if(c===quote){quote='';continue;}
   if(c==='\\'&&quote==='"'&&i+1<line.length&&['"','\\'].includes(line[i+1])){word+=line[++i];continue;}
   word+=c;continue;
  }
  if(c==='"'||c==="'"){quote=c;started=true;continue;}
  if(/\s/.test(c)){if(started){words.push(word);word='';started=false;}continue;}
  if(c==='\\'&&i+1<line.length&&(/[\s"'\\]/.test(line[i+1]))){word+=line[++i];started=true;continue;}
  word+=c;started=true;
 }
 if(quote)throw Error('Unclosed quote in command.');
 if(started)words.push(word);
 return words;
}
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
function starterGuideParts(source){
 const match=source?.match(/^!\[([^\]\n]+)\]\((assets\/loop-guides\/trace-[a-z-]+\.png)\)$/m);
 if(!match)return null;
 return {alt:match[1],image:match[2],text:source.replace(match[0],'').trim()};
}
function renderStarterGuide(){
 const panel=$('starterGuide');if(!panel)return;
 const folder=parent(filename),readme=folder?folder+'/README.md':'README.md';
 const guide=openTabs.includes(readme)?starterGuideParts(files[readme]):null;
 panel.hidden=!guide;
 panel.textContent='';
 if(!guide)return;
 const heading=document.createElement('h2');heading.textContent='README.md';
 const image=document.createElement('img');image.src=guide.image;image.alt=guide.alt;
 const body=document.createElement('div');body.className='starter-guide-text';
 for(const block of guide.text.split(/\n\s*\n/)){
  const title=block.startsWith('# ');
  const part=document.createElement(title?'h3':'p');
  part.textContent=title?block.slice(2):block;
  body.append(part);
 }
 panel.append(heading,image,body);
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
 renderStarterGuide();updateStatusBar();window.pythonLabSmart?.onOpened();window.pythonLabDebug?.onOpened();
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
  ['Browse Python Starter Templates',()=>window.pythonLabTemplates?.show()],

  ['Show Problems',()=>window.pythonLabSmart?.setView('problems')],
  ['Show Test Results',()=>window.pythonLabSmart?.setView('tests')],
  ['Save Locally',()=>persist(true)],
  ['Download Current File',()=>download()],
  ['Manage Saved Projects',()=>openProjectManager()],
  ['Create New Project',()=>createNewProject()],
  ['Import Project ZIP',()=> $('projectInput').click()],
  ['Toggle Explorer',toggleSidebar],
  ['Toggle Terminal Panel',togglePanel],
  ['Focus Terminal',()=>{if(enhancedTerminal)enhancedTerminal.focus();else $('terminalInput')?.focus();}],
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
  if(action==='download'){
    if(type==='file')try{download(oldPath);}catch(err){alert(err.message);}
    return;
  }
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
function entryMenu(event,type,path){event.preventDefault();const menu=$('fileContextMenu');menu.hidden=false;const downloadOption=$('downloadContextBtn');if(downloadOption)downloadOption.hidden=type!=='file';menu.style.left=Math.max(6,Math.min(event.clientX,innerWidth-190))+'px';menu.style.top=Math.max(6,Math.min(event.clientY,innerHeight-180))+'px';menu.dataset.type=type;menu.dataset.path=path;}
function blankProject(){
 return {filename:'main.py',code:'# New Python Lab project\n\nprint("Hello, Python!")\n',
  files:{'main.py':'# New Python Lab project\n\nprint("Hello, Python!")\n'},
  dirs:[],expanded:[],openTabs:['main.py'],cwd:'',stdin:'',args:'',debugBreakpoints:{}};
}
function loadWorkspace(snapshot){
 clearTimeout(saveTimer);
 const incoming=snapshot&&typeof snapshot==='object'?snapshot:blankProject();
 initial=incoming;
 if(editor)editor.setModel(null);
 window.pythonLabDebug?.loadProjectBreakpoints({});
 for(const m of models.values())m.dispose();
 models.clear();viewStates.clear();
 for(const path of Object.keys(files))delete files[path];
 if(incoming.files&&typeof incoming.files==='object'){
  for(const [path,content] of Object.entries(incoming.files)){
   if(typeof content==='string')files[path]=content;
  }
 }
 if(!Object.keys(files).length)files['main.py']='# New Python program\n';
 dirs.clear();
 for(const dir of (Array.isArray(incoming.dirs)?incoming.dirs:[]))if(typeof dir==='string')dirs.add(dir);
 filename=typeof incoming.filename==='string'&&Object.hasOwn(files,incoming.filename)?
  incoming.filename:Object.keys(files).sort()[0];
 code=files[filename];
 cwd=typeof incoming.cwd==='string'&&dirs.has(incoming.cwd)?incoming.cwd:'';
 expanded.clear();
 for(const dir of (Array.isArray(incoming.expanded)?incoming.expanded:[...dirs]))if(dirs.has(dir))expanded.add(dir);
 openTabs=[...new Set((Array.isArray(incoming.openTabs)?incoming.openTabs:[filename]).filter(p=>Object.hasOwn(files,p)))];
 if(!openTabs.includes(filename))openTabs.push(filename);
 $('stdin').value=typeof incoming.stdin==='string'?incoming.stdin:'';
 $('args').value=typeof incoming.args==='string'?incoming.args:'';
 if(editor)editor.setModel(modelFor(filename));
 else fallback.value=code;
 renderTabs();renderFiles();updatePrompt();
 if(enhancedTerminal&&terminalMode==='shell')enhancedTerminal.setPrompt(displayPath()+' $ ');
 window.pythonLabSmart?.resetProject();
 window.pythonLabDebug?.loadProjectBreakpoints(incoming.debugBreakpoints||{});
}
function displayProjectName(){
 $('currentProjectName').textContent=activeProjectName;
 $('projectTreeLabel').textContent=activeProjectName.toUpperCase();
 document.title=activeProjectName+' — Python Lab';
}
async function openProjectManager(){
 const dialog=$('projectsDialog');
 if(!projectReady){alert('Project storage is still opening. Your current files remain in this browser.');return;}
 await refreshProjectList();
 if(!dialog.open)dialog.showModal();
}
async function refreshProjectList(){
 const host=$('projectList');if(!host||!projectReady)return;
 const projectList=await window.pythonLabProjects.list();
 host.textContent='';
 const storageMode=window.pythonLabProjects.state().mode;
 $('projectStorageStatus').textContent=storageMode==='indexeddb'?
  'Saved in IndexedDB on this browser. Export ZIP backups regularly.' :
  storageMode==='localStorage'?'Using limited browser storage; export your project ZIP regularly.':
  'Temporary session storage only! Export ZIP before closing this tab.';
 for(const project of projectList){
  const row=document.createElement('div');row.className='project-list-row'+(project.id===activeProjectId?' active':'');
  const main=document.createElement('button');main.className='project-list-main';
  const title=document.createElement('strong');title.textContent=project.name;
  const meta=document.createElement('span');
  meta.textContent=(project.id===activeProjectId?'Current project · ':'')+
   'Saved '+new Date(project.updatedAt).toLocaleString()+(project.assignmentKey?' · Assignment':'');
  main.append(title,meta);
  main.onclick=()=>selectProject(project.id).catch(err=>alert(err.message));
  const controls=document.createElement('div');controls.className='project-list-controls';
  const rename=document.createElement('button');rename.textContent='Rename';rename.title='Rename '+project.name;
  rename.onclick=()=>renameProject(project).catch(err=>alert(err.message));
  const remove=document.createElement('button');remove.className='project-delete';remove.textContent='Delete';remove.title='Delete '+project.name;
  remove.disabled=projectList.length<=1;
  remove.onclick=()=>deleteProject(project).catch(err=>alert(err.message));
  controls.append(rename,remove);row.append(main,controls);host.append(row);
 }
}
async function selectProject(id){
 if(!projectReady||projectBusy||running)return;
 if(id===activeProjectId){$('projectsDialog')?.close?.();return;}
 await persist(true);
 projectBusy=true;
 try{
  const next=await window.pythonLabProjects.get(id);
  if(!next)throw Error('The selected project could not be found');
  window.pythonLabProjects.select(next.id);
  activeProjectId=next.id;activeProjectName=next.name;
  loadWorkspace(next.snapshot);
  displayProjectName();
  clearTerminal();
  append('Opened project: '+next.name+'\n','success-line');
  createWorker(); // fresh Pyodide filesystem and imported-module state per project
  $('projectsDialog')?.close?.();
 }finally{projectBusy=false;}
 await persist(true);await refreshProjectList();
}
async function createNewProject(){
 if(!projectReady||projectBusy||running)return;
 const value=prompt('Name your new Python Lab project','Untitled Project');
 if(value===null||!value.trim())return;
 const created=await window.pythonLabProjects.create(value,blankProject());
 await selectProject(created.id);
}
async function renameProject(project){
 if(!projectReady||projectBusy||running)return;
 const name=prompt('Rename project',project.name);
 if(name===null||!name.trim())return;
 const changed=await window.pythonLabProjects.rename(project.id,name);
 if(changed.id===activeProjectId){activeProjectName=changed.name;displayProjectName();}
 await refreshProjectList();
}
async function deleteProject(project){
 if(!projectReady||projectBusy||running)return;
 const records=await window.pythonLabProjects.list();
 if(records.length<=1){alert('Keep at least one project. Create a new one first.');return;}
 if(!confirm('Delete "'+project.name+'" permanently from this browser? Export a ZIP backup first if you need it.'))return;
 if(project.id===activeProjectId){
  const next=records.find(p=>p.id!==project.id);
  await selectProject(next.id);
 }
 await window.pythonLabProjects.remove(project.id);
 await refreshProjectList();
}
async function createProjectFromSnapshot(name,snapshot,assignmentKey=''){
 if(!projectReady)throw Error('Project storage is not ready');
 const created=await window.pythonLabProjects.create(name,snapshot,assignmentKey);
 await selectProject(created.id);
 return created;
}
function openSavedStarterGuide(template){
 const path='README.md',entry=template.entryFile,source=template.files[path];
 const guide=starterGuideParts(source);
 if(!guide||!Object.hasOwn(files,entry))return;
 workspaceSnapshot();
 if(!Object.hasOwn(files,path))files[path]=source;
 else if(!starterGuideParts(files[path])){
  files[path]+='\n\n!['+guide.alt+']('+guide.image+')\n';
  if(editor&&models.has(path))models.get(path).setValue(files[path]);
  else if(filename===path)fallback.value=files[path];
 }
 if(!openTabs.includes(path))openTabs.push(path);
 switchToFile(entry);
 renderFiles();
 persist(true);
}
async function handleAssignmentLink(){
 const search=window.location?.search||'';
 if(!search||!projectReady||!window.pythonLabTemplates?.get)return;
 const params=new URLSearchParams(search);
 const starter=params.get('starter'),key=params.get('assignment');
 if(!starter||!key||!/^[a-z0-9]{6,24}$/i.test(key))return;
 const template=window.pythonLabTemplates.get(starter);
 if(!template)return;
 const existing=(await window.pythonLabProjects.list()).find(p=>p.assignmentKey===key);
 if(existing){
  if(existing.id===activeProjectId){openSavedStarterGuide(template);return;}
  if(confirm('Continue your saved "'+existing.name+'" assignment on this device?')){
   await selectProject(existing.id);
   openSavedStarterGuide(template);
  }
  return;
 }
 if(!confirm('Create a new project for "'+template.title+'"? Your existing projects will stay saved separately.'))return;
 const entry=template.entryFile&&Object.hasOwn(template.files,template.entryFile)?template.entryFile:Object.keys(template.files).find(name=>name.endsWith('.py'));
 if(!entry)return;
 const readme=starterGuideParts(template.files['README.md'])?'README.md':null;
 const workspace={
  filename:entry,code:template.files[entry],
  files:{...template.files},dirs:[],cwd:'',expanded:[],openTabs:readme?[readme,entry]:[entry],
  stdin:'',args:'',debugBreakpoints:{}
 };
 await createProjectFromSnapshot(template.folderName||template.slug||template.title,workspace,key);
}
async function bootstrapProjects(){
 if(!window.pythonLabProjects)return;
 try{
  const opened=await window.pythonLabProjects.init(initial);
  activeProjectId=opened.project.id;activeProjectName=opened.project.name;
  projectBusy=true;loadWorkspace(opened.project.snapshot);
  projectBusy=false;projectReady=true;
  displayProjectName();
  await persist(true);
  await handleAssignmentLink();
 }catch(err){
  projectBusy=false;projectReady=false;
  $('saveStatus').textContent='Project storage unavailable — export ZIP';
  console.error('Unable to initialize project storage',err);
 }
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
function createWorker(){if(worker)worker.terminate();ready=false;running=false;updateButtons();setStatus('Loading Python…');const serial=++runSerial;worker=new Worker('python-worker.js?v=19');worker.onmessage=({data})=>{if(serial!==runSerial)return;window.pythonLabSmart?.onWorkerMessage(data);if(data.type==='packageStatus'&&data.name==='cs50'){

  append(data.success?'✓ CS50 Python library loaded automatically.\n':'CS50 library could not load in this browser (regular Python still works): '+String(data.error||'Unknown error')+'\n',data.success?'success-line':'error-line');
}if(data.type==='ready'){window.pythonLabSmart?.onWorkerReady();ready=true;setStatus('Python ready','ready');updateButtons();append('✓ Python ready. Type help for supported commands.\n','success-line');showShell();}if(data.type==='output')receiveWorkerOutput(data.text,data.stream==='stderr'?'error-line':'');if(data.type==='needInput'){terminalMode='input';running=true;setStatus('Waiting for input…');$('terminalPrompt').hidden=false;enhancedTerminal?.setMode('input',latestInputPrompt());if(enhancedTerminal)enhancedTerminal.focus();else $('terminalInput').focus();$('output').parentElement.scrollTop=$('output').parentElement.scrollHeight;}if(data.type==='traceResults'){running=false;updateButtons();setStatus('Python ready','ready');window.pythonLabDebug?.onResult(data);showShell();}if(data.type==='done'){terminalMode='shell';activeRun=null;running=false;updateButtons();setStatus('Python ready','ready');append('\n'+(data.success?'✓ Finished':'✕ Finished with errors')+' in '+((performance.now()-runStart)/1000).toFixed(2)+'s\n',data.success?'success-line':'error-line');showShell();}if(data.type==='files'){
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
 worker.postMessage({type:'run',...activeRun,stdin:inputHistory});
}
function executePython(name,args=[],command=''){
 workspaceSnapshot();const relative=normalize(name);name=Object.hasOwn(files,relative)?relative:Object.hasOwn(files,name)?name:relative;
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
 const rootName=String(project.folderName||project.slug||project.id).replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,70)||'starter';
 let root=rootName,index=2;
 while(dirs.has(root)||Object.keys(files).some(path=>path===root||path.startsWith(root+'/')))root=rootName+'-'+index++;
 ensureDirs(root);
 for(const [name,source] of Object.entries(project.files)){
  const path=root+'/'+name;
  if(!/^[\w. -]+$/.test(name)||typeof source!=='string')continue;
  files[path]=source;
 }
 expanded.add(root);
 const preferred=project.entryFile&&Object.hasOwn(project.files,project.entryFile)?project.entryFile:
  Object.keys(project.files).find(name=>name.endsWith('.py'));
 const entry=preferred?root+'/'+preferred:'';
 const readme=root+'/README.md';
 if(starterGuideParts(files[readme]))openTabs.push(readme);
 if(entry&&Object.hasOwn(files,entry))switchToFile(entry);
 else renderFiles();
 persist(true);
 return true;
}

function stop(){if(!running)return;window.pythonLabDebug?.abort();terminalMode='shell';activeRun=null;inputHistory=[];replayBaseline='';scriptTranscript='';$('terminalPrompt').hidden=true;append('\n^C\n','error-line');createWorker();}
function download(path=filename){
 workspaceSnapshot();
 if(!Object.hasOwn(files,path))throw Error('File not found: '+path);
 const content=files[path];
 const type=path.endsWith('.py')?'text/x-python;charset=utf-8':'text/plain;charset=utf-8';
 const url=URL.createObjectURL(new Blob([content],{type}));
 const a=document.createElement('a');
 a.href=url;a.download=path.split('/').pop();
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function resetFile(){workspaceSnapshot();let name=prompt('New filename',cwd?cwd+'/main.py':'main.py');if(!name)return;try{const stem=normalize(name,'');const path=stem+(/\.[^/]+$/.test(stem)?'':'.py');if(Object.hasOwn(files,path)){switchToFile(path);return;}files[path]=path.endsWith('.py')?'# New Python program\n\n':'';ensureDirs(parent(path));switchToFile(path);$('stdin').value='';persist();}catch(err){alert(err.message);}}
function showShell(){if(!ready||running)return;updatePrompt();terminalMode='shell';$('terminalPrompt').hidden=false;$('terminalInput').placeholder='Type a command';$('terminalInput').value='';if(enhancedTerminal){enhancedTerminal.setMode('shell',displayPath()+' $ ');}else $('terminalInput').focus();}
function shellCommand(line,alreadyEchoed=false){
 try{
  files[filename]=getCode();const args=shellWords(line.trim());
  if(!alreadyEchoed)append(displayPath()+' $ '+line+'\n');
  if(!args.length){showShell();return;}
  const cmd=args[0],rest=args.slice(1);
  if(cmd==='clear'||cmd==='cls'){clearTerminal();}
  else if(cmd==='help')append('Browser commands: python/python3 FILE.py [args], python -c CODE, pytest [FILE_OR_DIR], python -m pytest [FILE_OR_DIR], ls/dir, tree, pwd, cd, mkdir [-p], rmdir, cat/type, echo, touch, cp, mv, rm, whoami, clear/cls, help, pip list.\nPaths may be relative to the current directory; quoted names with spaces are supported.\nCS50 Python loads automatically. Official submit50/check50 need an authenticated CS50 Codespace; the terminal is a simulation.\n');
  else if(cmd==='ls'||cmd==='dir'){const target=normalize(rest.find(a=>!a.startsWith('-'))||'.');if(target&&!dirs.has(target))append('No such directory: '+target+'\n','error-line');else append([...dirs].filter(d=>parent(d)===target).map(d=>d.split('/').pop()+'/').concat(Object.keys(files).filter(f=>parent(f)===target).map(f=>f.split('/').pop())).sort().join('    ')+'\n');}
  else if(cmd==='pwd')append('/home/pyodide'+(cwd?'/'+cwd:'')+'\n');
  else if(cmd==='echo')append(rest.join(' ')+'\n');
  else if(cmd==='whoami')append('student (browser simulation)\n');
  else if((cmd==='python'||cmd==='python3')&&['-V','--version'].includes(rest[0]))append('Python (Pyodide browser runtime)\n');
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
  else if(cmd==='cat'||cmd==='type'){
    if(!rest.length)append('Usage: cat FILE [FILE ...]\n','error-line');
    else for(const name of rest){
      const path=normalize(name);
      if(!Object.hasOwn(files,path))append('cat: file not found: '+name+'\n','error-line');
      else append(files[path]+(files[path].endsWith('\n')?'':'\n'));
    }
  }
  else if(cmd==='cp'){
    if(rest.length!==2){append('Usage: cp SOURCE DEST\n','error-line');}
    else{const source=normalize(rest[0]),requested=normalize(rest[1]);
      const dest=dirs.has(requested)?requested+'/'+source.split('/').pop():requested;
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
      const source=normalize(rest[0]),requested=normalize(rest[1]);
      const dest=dirs.has(requested)?requested+'/'+source.split('/').pop():requested;
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
  else if(cmd==='touch'){
    if(rest.length!==1)append('Usage: touch FILE\n','error-line');
    else{
      const p=normalize(rest[0]);
      if(!p||dirs.has(p))append('touch: target is a directory\n','error-line');
      else if(parent(p)&&!dirs.has(parent(p)))append('touch: parent directory does not exist\n','error-line');
      else{files[p]??='';renderFiles();persist();}
    }
  }
  else if(cmd==='mkdir'){
    const recursive=rest[0]==='-p',args=recursive?rest.slice(1):rest;
    if(args.length!==1)append('Usage: mkdir [-p] DIRECTORY\n','error-line');
    else{
      const target=normalize(args[0]);
      const components=target.split('/');const conflict=components.some((_,i)=>Object.hasOwn(files,components.slice(0,i+1).join('/')));
      if(!target)append('mkdir: invalid directory\n','error-line');
      else if(conflict)append('mkdir: a file blocks that directory path\n','error-line');
      else if(dirs.has(target)){if(!recursive)append('mkdir: directory already exists\n','error-line');}
      else if(!recursive&&parent(target)&&!dirs.has(parent(target)))append('mkdir: parent directory does not exist (try mkdir -p)\n','error-line');
      else{ensureDirs(target);expanded.add(target);renderFiles();persist();}
    }
  }
  else if(cmd==='cd'){
    if(rest.length>1)append('Usage: cd [DIRECTORY]\n','error-line');
    else{const target=rest.length?normalize(rest[0]):'';
      if(!target||dirs.has(target)){cwd=target;persist();}else append('cd: no such directory: '+rest[0]+'\n','error-line');
    }
  }
else if(cmd==='pip'&&rest[0]==='list')append('Full pip listing is unavailable in the simulated browser shell. Some compatible packages load automatically when imported.\n');
  else if(((cmd==='python'||cmd==='python3')&&rest[0]==='-m'&&rest[1]==='pytest')||cmd==='pytest'){
    executeVirtualTest(true,cmd==='pytest'?rest:rest.slice(2));return;
  }
  else if((cmd==='python'||cmd==='python3')&&rest[0]?.endsWith('.py')){executePython(rest[0],rest.slice(1),line);return;}
  else if(cmd==='python'||cmd==='python3')append('Usage: '+cmd+' FILE.py [args] | -c CODE | -m pytest [FILE_OR_DIR]\n','error-line');
  else if(cmd==='submit50'||cmd==='check50'){
    append('Official '+cmd+' needs GitHub authentication and a real Codespace. This simulated terminal cannot submit or check your code.\n','error-line');

  }
  else if(cmd==='pip'&&rest[0]==='install'&&rest[1]==='cs50'){
    append('CS50 Python library loads automatically when Python Lab starts. No pip command needed.\n');
  }
  else if(cmd==='pip'&&rest[0]==='install'&&rest[1]){append('This is a simulated terminal; package installation commands are not supported. CS50 Python loads automatically.\n','error-line');}
  else append(cmd+': command not supported in the browser terminal\n','error-line');
  showShell();
 }catch(err){append('Command error: '+err.message+'\n','error-line');showShell();}
}
function runWorkerCode(code,command,alreadyEchoed=false,purpose='script',testTargets=[]){
 if(!ready||running)return;workspaceSnapshot();
 running=true;terminalMode='busy';runStart=performance.now();updateButtons();
 activeRun={code,filename:'__command__.py',files:{...files},dirs:[...dirs],cwd,args:[],command,purpose,testTargets};
 inputHistory=[];replayBaseline='';scriptTranscript='';replayWarned=false;
 lastExecutionFiles={...activeRun.files};
 if(command&&!alreadyEchoed){if(enhancedTerminal)enhancedTerminal.echoCommand(command);else append(displayPath()+' $ '+command+'\n');}
 sendExecution();
}
function executeVirtualTest(alreadyEchoed=false,args=[]){
 if(!ready||running)return;
 workspaceSnapshot();
 window.pythonLabSmart?.beginTests();
 const unsupported=args.find(a=>a.startsWith('-')&&!['-q','-v'].includes(a));
 if(unsupported){
  append('pytest: unsupported option '+unsupported+' (supported: -q, -v, FILE or DIRECTORY)\n','error-line');
  showShell();return;
 }
 const tests=Object.keys(files).filter(n=>/(^|\/)test_[^/]*\.py$/.test(n));
 const selections=args.filter(a=>!a.startsWith('-'));
 const targets=[];
 if(selections.length){
  for(const value of selections){
   const path=normalize(value);
   if(Object.hasOwn(files,path)&&path.endsWith('.py'))targets.push(path);
   else if(dirs.has(path)&&tests.some(n=>n.startsWith(path+'/')))targets.push(path);
   else{
    append('pytest: no tests found at '+value+'\n','error-line');
    showShell();return;
   }
  }
 }else{
  const scoped=cwd?tests.filter(n=>n.startsWith(cwd+'/')):tests;
  if(scoped.length)targets.push(...scoped);
 }
 if(!targets.length){
  append('No test_*.py files found'+(cwd?' in '+cwd:'')+'\n','error-line');
  window.pythonLabSmart?.onWorkerMessage({type:'testResults',tests:[],exitCode:5});
  showShell();return;
 }
 runWorkerCode('','python -m pytest '+[...args].join(' '),alreadyEchoed,'tests',targets);
}
$('projectManagerBtn').addEventListener('click',openProjectManager);
$('projectManagerClose').addEventListener('click',()=> $('projectsDialog').close());
$('createProjectBtn').addEventListener('click',createNewProject);
$('importProjectBtn').addEventListener('click',()=> $('projectInput').click());
$('projectInput').addEventListener('change',async e=>{
 const archive=e.target.files?.[0];e.target.value='';if(!archive)return;
 if(typeof JSZip==='undefined'){alert('ZIP library is unavailable.');return;}
 if(!projectReady){alert('Project storage is still loading. Try again shortly.');return;}
 if(running){alert('Stop the running Python program before importing a project.');return;}
 try{
  const zip=await JSZip.loadAsync(archive),newFiles={},newDirs=new Set();let count=0;
  for(const [raw,entry] of Object.entries(zip.files)){
   const clean=raw.replace(/\/$/,'');
   if(!clean||clean.startsWith('/')||clean.split('/').some(p=>p==='..'||p==='.'||!p||!/^[\w. -]+$/.test(p)))continue;
   if(entry.dir){newDirs.add(clean);continue;}
   if(!/\.(py|txt|csv|json|md|html|css|js|toml|ini)$/i.test(clean))continue;
   if(++count>150)throw Error('Project exceeds 150 text files.');
   const content=await entry.async('string');if(content.length>1024*1024)throw Error('File too large: '+clean);
   newFiles[clean]=content;let parentDir=parent(clean);
   while(parentDir){newDirs.add(parentDir);parentDir=parent(parentDir);}
  }
  if(!Object.keys(newFiles).length)throw Error('No supported text files were found.');
  const name=archive.name.replace(/\.zip$/i,'').slice(0,70)||'Imported Project';
  if(!confirm('Import "'+name+'" as a separate project? Your current files will be preserved.'))return;
  const selected=Object.hasOwn(newFiles,'main.py')?'main.py':Object.keys(newFiles).sort()[0];
  const workspace={filename:selected,code:newFiles[selected],files:newFiles,dirs:[...newDirs],
   expanded:[...newDirs],openTabs:[selected],cwd:'',stdin:'',args:'',debugBreakpoints:{}};
  await createProjectFromSnapshot(name,workspace);
  append('Imported '+count+' files into a separate project.\n','success-line');
 }catch(err){alert('Project import failed: '+err.message);}
});
$('fileContextMenu').addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(!button)return;const menu=$('fileContextMenu');menu.hidden=true;modifyEntry(menu.dataset.type,menu.dataset.path,button.dataset.action);});
document.addEventListener('click',e=>{if(!e.target.closest('#fileContextMenu'))$('fileContextMenu').hidden=true;});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('fileContextMenu').hidden=true;});
$('newBtn').addEventListener('click',()=>{const d=$('confirmDialog');if(d.showModal)d.showModal();else if(confirm('Create a new file?'))resetFile();});
$('confirmDialog').addEventListener('close',()=>{if($('confirmDialog').returnValue==='confirm')resetFile();});
$('openBtn').addEventListener('click',()=> $('fileInput').click());
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
setFilename(filename);renderFiles();updatePrompt();window.pythonLabTemplates?.attach(installTemplate);
window.pythonLabAssessment?.attach({install:installTemplate,getFiles:()=>{workspaceSnapshot();return {...files}},activeFile:()=>filename});

if(window.pythonLabProjects){bootstrapProjects().then(()=>{if(!worker)createWorker();});}
else createWorker();
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