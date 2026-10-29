(() => {
'use strict';
const $=id=>document.getElementById(id),storageKey='python-lab-v1';
const sample='# Welcome to Python Lab!\n# Write Python and click Run.\n\nname = input("What is your name? ")\nprint(f"Hello, {name}!")\n\nfor number in range(1, 6):\n    print(f"Count: {number}")\n';
let initial={};try{initial=JSON.parse(localStorage.getItem(storageKey))||{}}catch{}
let inputHistory=[],activeRun=null,commandHistory=[],historyIndex=0,terminalMode='shell';let filename=initial.filename||'main.py',code=typeof initial.code==='string'?initial.code:sample,editor=null,worker=null,ready=false,running=false,runStart=0,runSerial=0,saveTimer;
const files=(initial.files && typeof initial.files==='object')?initial.files:{};const dirs=new Set(Array.isArray(initial.dirs)?initial.dirs:[]);let cwd=initial.cwd||'';
function normalize(path,base=cwd){const parts=[];for(const p of (path.startsWith('/')?path:('/'+base+'/'+path)).split('/')){if(!p||p==='.')continue;if(p==='..')parts.pop();else if(/^[\w. -]+$/.test(p))parts.push(p);else throw Error('Invalid path component: '+p);}return parts.join('/');}
function parent(path){return path.includes('/')?path.slice(0,path.lastIndexOf('/')):'';}
function ensureDirs(path){let cur='';for(const p of path.split('/').filter(Boolean)){cur=cur?cur+'/'+p:p;dirs.add(cur);}}
function displayPath(){return '~/python-lab'+(cwd?'/'+cwd:'');}
 const fallback=$('fallbackEditor');fallback.value=code;$('stdin').value=typeof initial.stdin==='string'?initial.stdin:'Alex';
function getCode(){return editor?editor.getValue():fallback.value;}window.pythonLabWorkspace=()=>{files[filename]=getCode();return {filename,files:{...files},dirs:[...dirs],cwd};};
function setCode(s){if(editor)editor.setValue(s);else fallback.value=s;persist();}
function persist(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(storageKey,JSON.stringify({filename,code:getCode(),stdin:$('stdin').value,args:$('args').value,files,dirs:[...dirs],cwd,expanded:[...expanded]}));}catch{setStatus('Storage unavailable','error');}},220);}
function setStatus(s,kind=''){$('runtimeStatus').textContent=s;$('runtimeStatus').className='status '+kind;$('footerStatus').textContent=s;}
function append(s,cls=''){const out=$('output');if(out.querySelector('.muted'))out.textContent='';const el=document.createElement('span');el.className=cls;el.textContent=s;out.append(el);out.parentElement.scrollTop=out.parentElement.scrollHeight;}
function updateButtons(){$('runBtn').disabled=!ready||running;$('stopBtn').disabled=!running;}
function setFilename(n){filename=normalize(n||'main.py','');if(!filename.endsWith('.py'))filename+='.py';ensureDirs(parent(filename));$('tabFilename').textContent=filename;const side=$('sideFilename');if(side)side.textContent=filename;persist();}
function workspaceSnapshot(){files[filename]=getCode();}
function chooseFile(next){setFilename(next);setCode(files[next]??'');renderFiles();}
function modifyEntry(type,oldPath,action){
  if(running){alert('Stop the running program before changing files.');return;}
  workspaceSnapshot();
  if(action==='delete'){
    if(!confirm('Delete '+oldPath+(type==='folder'?' and all files and folders inside it':'')+'? This cannot be undone.'))return;
    if(type==='folder'){for(const p of Object.keys(files))if(p.startsWith(oldPath+'/'))delete files[p];for(const p of [...dirs])if(p===oldPath||p.startsWith(oldPath+'/'))dirs.delete(p);}
    else delete files[oldPath];
    if(type==='folder'&&(cwd===oldPath||cwd.startsWith(oldPath+'/')))cwd='';
    if(!(filename in files)){const remaining=Object.keys(files).sort();if(remaining.length)chooseFile(remaining[0]);else{filename='main.py';files[filename]='# New Python program\n';setFilename(filename);setCode(files[filename]);}}
    renderFiles();persist();return;
  }
  const name=prompt(action==='move'?'Move to path (including name):':'Rename (new name or path):',oldPath);
  if(name===null)return;
  let dest;
  try{dest=normalize(name,'');if(!dest||dest===oldPath)return;if(type==='file'&&!dest.endsWith('.py'))throw Error('Python files must end in .py');if(type==='folder'&&dest.startsWith(oldPath+'/'))throw Error('Cannot move a folder inside itself');if(type==='folder'&&Object.keys(files).some(p=>p.startsWith(oldPath+'/')&&Object.hasOwn(files,dest+p.slice(oldPath.length))))throw Error('Destination has conflicting files');if((type==='folder'&&dirs.has(dest))||Object.hasOwn(files,dest)||[...dirs].some(d=>d===dest&&type==='file'))throw Error('Destination already exists');if(parent(dest)&&!dirs.has(parent(dest)))throw Error('Destination folder does not exist');}
  catch(err){alert(err.message);return;}
  if(type==='file'){files[dest]=files[oldPath];delete files[oldPath];if(filename===oldPath)filename=dest;}
  else {
    const movePath=p=>p===oldPath?dest:p.startsWith(oldPath+'/')?dest+p.slice(oldPath.length):p;
    const movedFiles={};for(const [p,code] of Object.entries(files)){const next=movePath(p);if(next in movedFiles)throw Error('Path collision');movedFiles[next]=code;}
    for(const p of Object.keys(files))delete files[p];Object.assign(files,movedFiles);
    const movedDirs=[...dirs].map(movePath);dirs.clear();for(const p of movedDirs)dirs.add(p);
    filename=movePath(filename);cwd=movePath(cwd);
  }
  $('tabFilename').textContent=filename;const side=$('sideFilename');if(side)side.textContent=filename;renderFiles();persist();
}
function entryMenu(event,type,path){event.preventDefault();const menu=$('fileContextMenu');menu.hidden=false;menu.style.left=Math.min(event.clientX,innerWidth-175)+'px';menu.style.top=Math.min(event.clientY,innerHeight-145)+'px';menu.dataset.type=type;menu.dataset.path=path;}
async function downloadProject(){
  workspaceSnapshot();
  if(typeof JSZip==='undefined'){alert('ZIP library unavailable. Check your internet connection.');return;}
  const zip=new JSZip();for(const dir of dirs)zip.folder(dir);for(const [path,content] of Object.entries(files))zip.file(path,content);
  try{const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='python-lab-project.zip';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
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
   row.onclick=()=>{if(expanded.has(path))expanded.delete(path);else expanded.add(path);cwd=path;renderFiles();updatePrompt();persist();};
   host.append(row);
   if(expanded.has(path))children(path,depth+1);
  }
  for(const path of allFiles.filter(p=>parent(p)===folder).sort()){
   const btn=document.createElement('button');btn.className='file-item'+(path===filename?' active':'');
   btn.style.paddingLeft=(26+depth*16)+'px';btn.textContent='🐍 '+path.split('/').pop();btn.title=path;
   btn.addEventListener('contextmenu',e=>entryMenu(e,'file',path));
   btn.onclick=()=>{if(path===filename)return;files[filename]=getCode();setFilename(path);setCode(files[path]??'');renderFiles();};
   host.append(btn);
  }
 }
 children('',0);
}
function updatePrompt(){const node=$('terminalChevron');if(node)node.textContent=displayPath()+' $';}
function createWorker(){if(worker)worker.terminate();ready=false;running=false;updateButtons();setStatus('Loading Python…');const serial=++runSerial;worker=new Worker('python-worker.js?v=11');worker.onmessage=({data})=>{if(serial!==runSerial)return;if(data.type==='ready'){ready=true;setStatus('Python ready','ready');updateButtons();append('✓ Python ready. Type help for supported commands.\n','success-line');showShell();}if(data.type==='output')append(data.text,data.stream==='stderr'?'error-line':'');if(data.type==='needInput'){terminalMode='input';running=true;setStatus('Waiting for input…');$('terminalPrompt').hidden=false;$('terminalInput').focus();$('output').parentElement.scrollTop=$('output').parentElement.scrollHeight;}if(data.type==='done'){terminalMode='shell';activeRun=null;running=false;updateButtons();setStatus('Python ready','ready');append('\n'+(data.success?'✓ Finished':'✕ Finished with errors')+' in '+((performance.now()-runStart)/1000).toFixed(2)+'s\n',data.success?'success-line':'error-line');showShell();}if(data.type==='files'){Object.assign(files,data.files||{});renderFiles();persist();}if(data.type==='fatal'){running=false;ready=false;updateButtons();setStatus('Runtime failed','error');append('Runtime error: '+data.message+'\n','error-line');}};worker.onerror=()=>{if(serial!==runSerial)return;running=false;ready=false;updateButtons();setStatus('Runtime failed','error');append('Could not start Python. Check your connection and reload.\n','error-line');};worker.postMessage({type:'init'});}
function sendExecution(){if(!activeRun)return;$('terminalPrompt').hidden=true;$('output').textContent='';append('$ '+(activeRun.command||('python '+activeRun.filename))+'\n\n');worker.postMessage({type:'run',...activeRun,stdin:inputHistory.join('\n')});}
function executePython(name,args=[],command=''){files[filename]=getCode();name=(name in files)?name:normalize(name);if(!(name in files)){append('python: cannot open file '+name+'\n','error-line');showShell();return;}if(!ready||running)return;running=true;terminalMode='busy';runStart=performance.now();inputHistory=[];updateButtons();setStatus('Running…');activeRun={code:files[name],filename:name,files:{...files},dirs:[...dirs],cwd:parent(name),args,command};sendExecution();persist();}
function run(){executePython(filename,$('args').value.trim()?$('args').value.trim().split(/\s+/):[]);}
function stop(){if(!running)return;terminalMode='shell';activeRun=null;inputHistory=[];$('terminalPrompt').hidden=true;append('\n^C\n','error-line');createWorker();}
function download(){const url=URL.createObjectURL(new Blob([getCode()],{type:'text/x-python;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function resetFile(){files[filename]=getCode();let name=prompt('New Python filename',cwd?cwd+'/main.py':'main.py');if(!name)return;setFilename(name);setCode(files[filename]||'# New Python program\n\n');renderFiles();$('stdin').value='';persist();}
function showShell(){if(!ready||running)return;updatePrompt();terminalMode='shell';$('terminalPrompt').hidden=false;$('terminalInput').placeholder='Type a command';$('terminalInput').value='';$('terminalInput').focus();}
function shellCommand(line){
  files[filename]=getCode();const args=line.trim().match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)?.map(x=>x.replace(/^["']|["']$/g,''))||[];
  append(displayPath()+' $ '+line+'\n');
  if(!args.length){showShell();return;}
  const cmd=args[0],rest=args.slice(1);
  if(cmd==='clear'||cmd==='cls'){$('output').textContent='';}
  else if(cmd==='help')append('Commands: python FILE.py [args], python -m pytest, pytest, ls, dir, pwd, cd DIR, mkdir [-p] DIR, cat FILE, touch FILE, pip list, pip install PACKAGE, clear, help\nNote: A browser simulation, not a system shell.\n');
  else if(cmd==='ls'||cmd==='dir'){const target=normalize(rest[0]||'.');if(target&&!dirs.has(target))append('No such directory: '+target+'\n','error-line');else append([...dirs].filter(d=>parent(d)===target).map(d=>d.split('/').pop()+'/').concat(Object.keys(files).filter(f=>parent(f)===target).map(f=>f.split('/').pop())).sort().join('    ')+'\n');}
  else if(cmd==='pwd')append('/home/pyodide/'+cwd+'\n');
  else if(cmd==='cat'||cmd==='type')append(files[normalize(rest[0]||'')]===undefined?'File not found\n':files[normalize(rest[0])]+'\n');
  else if(cmd==='touch'){if(!rest[0])append('Usage: touch FILE\n');else{const p=normalize(rest[0]);if(!dirs.has(parent(p))&&parent(p))append('No such directory\n','error-line');else {files[p]??='';renderFiles();persist();}}}
  else if(cmd==='mkdir'){if(!rest[0])append('Usage: mkdir [-p] DIRECTORY\n');else{const recursive=rest[0]==='-p';const target=normalize(rest[recursive?1:0]||'');if(!target)append('Invalid directory\n','error-line');else if(dirs.has(target))append('Directory already exists\n');else if(!recursive&&parent(target)&&!dirs.has(parent(target)))append('Parent directory does not exist (try mkdir -p)\n','error-line');else{ensureDirs(target);renderFiles();persist();}}}
  else if(cmd==='cd'){const target=rest.length?normalize(rest[0]):'';if(!target||dirs.has(target)){cwd=target;updatePrompt();persist();}else append('cd: no such directory: '+rest[0]+'\n','error-line');}
else if(cmd==='pip'&&rest[0]==='list')append('Pyodide + installed compatible packages. Try: pip install <package>\n');
  else if(((cmd==='python'||cmd==='python3')&&rest[0]==='-m'&&rest[1]==='pytest')||cmd==='pytest'){executeVirtualTest();return;}
  else if((cmd==='python'||cmd==='python3')&&rest[0]?.endsWith('.py')){executePython(rest[0],rest.slice(1),line);return;}
  else if(cmd==='pip'&&rest[0]==='install'&&rest[1]){append('Automatic package installation is available when a supported package is imported in Python. Direct pip install is not yet supported here.\n','error-line');}
  else append(cmd+': command not supported in the browser terminal\n','error-line');
  showShell();
}
function runWorkerCode(code,command){if(!ready||running)return;running=true;terminalMode='busy';runStart=performance.now();updateButtons();activeRun={code,filename:'__command__.py',files:{...files},dirs:[...dirs],cwd,args:[],command};inputHistory=[];sendExecution();}
function executeVirtualTest(){files[filename]=getCode();if(!Object.keys(files).some(n=>/^test_.*\.py$/.test(n))){append('No test_*.py files found\n','error-line');showShell();return;}runWorkerCode('import pytest\npytest.main(["-q","--tb=short"])','python -m pytest -q');}
$('downloadProjectBtn').addEventListener('click',downloadProject);$('fileContextMenu').addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(!button)return;const menu=$('fileContextMenu');menu.hidden=true;modifyEntry(menu.dataset.type,menu.dataset.path,button.dataset.action);});document.addEventListener('click',e=>{if(!e.target.closest('#fileContextMenu'))$('fileContextMenu').hidden=true;});document.addEventListener('keydown',e=>{if(e.key==='Escape')$('fileContextMenu').hidden=true;});
$('newBtn').addEventListener('click',()=>{const d=$('confirmDialog');if(d.showModal)d.showModal();else if(confirm('Create a new file?'))resetFile();});
$('confirmDialog').addEventListener('close',()=>{if($('confirmDialog').returnValue==='confirm')resetFile();});
$('openBtn').addEventListener('click',()=>$('fileInput').click());$('saveBtn').addEventListener('click',download);$('runBtn').addEventListener('click',run);$('stopBtn').addEventListener('click',stop);$('clearBtn').addEventListener('click',()=>$('output').textContent='');$('terminalInput').addEventListener('keydown',e=>{if(e.key==='ArrowUp'&&terminalMode==='shell'){e.preventDefault();historyIndex=Math.max(0,historyIndex-1);e.currentTarget.value=commandHistory[historyIndex]||'';}else if(e.key==='ArrowDown'&&terminalMode==='shell'){e.preventDefault();historyIndex=Math.min(commandHistory.length,historyIndex+1);e.currentTarget.value=commandHistory[historyIndex]||'';}else if(e.key==='Enter'){e.preventDefault();const answer=e.currentTarget.value;e.currentTarget.value='';if(terminalMode==='input'&&activeRun){inputHistory.push(answer);setStatus('Running…');sendExecution();}else if(terminalMode==='shell'){if(answer.trim())commandHistory.push(answer);historyIndex=commandHistory.length;shellCommand(answer);}}});$('stdin').addEventListener('input',persist);$('args').value=initial.args||'';$('args').addEventListener('input',persist);$('addFolderBtn').addEventListener('click',()=>{const input=prompt('Folder path',cwd?cwd+'/week0':'week0');if(!input)return;try{const path=normalize(input,'');if(!path||dirs.has(path))return;ensureDirs(path);renderFiles();persist();}catch(err){append(err.message+'\n','error-line');}});$('addFileBtn').addEventListener('click',()=>{let name=prompt('Name the new Python file',cwd?cwd+'/test_main.py':'test_main.py');if(!name)return;files[filename]=getCode();setFilename(name);setCode(files[filename]||'# '+filename+'\n');renderFiles();});$('testBtn').addEventListener('click',executeVirtualTest);fallback.addEventListener('input',persist);
$('fileInput').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>1048576)throw Error('File must be under 1 MB');files[filename]=getCode();setFilename(cwd?cwd+'/'+f.name:f.name);setCode(await f.text());renderFiles();}catch(err){append('Open failed: '+err.message+'\n','error-line');}e.target.value='';});
window.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();run();}if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();download();}});
setFilename(filename);renderFiles();updatePrompt();createWorker();
function enableFallback(){fallback.hidden=false;$('editor').style.display='none';}
if(typeof window.require==='function'){try{const base='https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/';window.MonacoEnvironment={getWorkerUrl:()=> 'data:text/javascript;charset=utf-8,'+encodeURIComponent("self.MonacoEnvironment={baseUrl:'"+base+"'};importScripts('"+base+"vs/base/worker/workerMain.js');")};window.require.config({paths:{vs:base+'vs'}});window.require(['vs/editor/editor.main'],()=>{try{editor=monaco.editor.create($('editor'),{value:code,language:'python',theme:'vs-dark',fontSize:14,lineHeight:23,minimap:{enabled:false},automaticLayout:true,scrollBeyondLastLine:false,tabSize:4,insertSpaces:true,fontFamily:'Consolas, monospace',padding:{top:18},wordWrap:'on'});editor.onDidChangeModelContent(persist);fallback.hidden=true;}catch{enableFallback();}},enableFallback);}catch{enableFallback();}}else enableFallback();
})();